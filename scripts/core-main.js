// ─── iChess Coach – Main Site Logic ────────────────────────────────────────
// Loaded last. Depends on globals from core.js and core-engine.js.
// Provides: start(), showUpdateBanner()
    const start = () => {
      if (window.location.host === "www.chess.com") {
        let lastFEN = "";
        let uciHistory = "";
        let fen_ = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let side_index = 1;
        let evalObj = null;
        let chessComFenHistory = [];
        let statObj = null;

        function getElo(side) {
          const players = document.querySelectorAll(".player-playerContent");
          if (players.length < 2) return null;

          const extractElo = (text) => {
            const match = text.match(/\((\d+)\)/);
            return match ? parseInt(match[1], 10) : null;
          };

          const topElo = extractElo(players[0].innerText);
          const bottomElo = extractElo(players[1].innerText);

          if (side.toLowerCase() === "white") {
            return { white: bottomElo, black: topElo };
          } else if (side.toLowerCase() === "black") {
            return { white: topElo, black: bottomElo };
          } else {
            return null;
          }
        }
        // chess.com — design identique à lichess
        function createEvalBar(initialScore = "0.0", initialColor = "white") {
          const boardContainer = document.querySelector(".board");
          let w_ = boardContainer.offsetWidth;

          if (!boardContainer) return console.error("Plateau non trouvé !");

          const evalContainer = document.createElement("div");
          evalContainer.id = "customEval";
          evalContainer.style.zIndex = "9999";
          evalContainer.style.width = `${(w_ * 6) / 100}px`;
          evalContainer.style.height = `${boardContainer.offsetWidth}px`;
          evalContainer.style.background = "#0D0A05";
          evalContainer.style.marginLeft = "12px";
          evalContainer.style.position = "relative";
          evalContainer.style.border = "2px solid #4A3820";
          evalContainer.style.borderRadius = "0";
          evalContainer.style.overflow = "hidden";
          evalContainer.style.boxShadow = "4px 4px 0 rgba(0,0,0,.85)";

          const topBar = document.createElement("div");
          const bottomBar = document.createElement("div");

          [topBar, bottomBar].forEach((bar) => {
            bar.style.width = "100%";
            bar.style.position = "absolute";
            bar.style.transition = "height 0.22s steps(6,end)";
          });

          topBar.style.top = "0";
          bottomBar.style.bottom = "0";

          evalContainer.appendChild(topBar);
          evalContainer.appendChild(bottomBar);
          const scoreText = document.createElement("div");
          scoreText.style.position = "absolute";
          scoreText.style.bottom = "4px";
          scoreText.style.left = "50%";
          scoreText.style.transform = "translateX(-50%)";
          scoreText.style.color = "#F0E6D4";
          scoreText.style.fontWeight = "700";
          scoreText.style.fontSize = "10px";
          scoreText.style.fontFamily = "'Space Mono', monospace";
          scoreText.style.textShadow = "1px 1px 0 #000";
          scoreText.style.pointerEvents = "none";
          const evalTicks = document.createElement("div");
          evalTicks.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(10% - 1px),rgba(13,10,5,.6) calc(10% - 1px),rgba(13,10,5,.6) 10%);";
          evalContainer.appendChild(evalTicks);

          boardContainer.parentNode.style.display = "flex";
          // boardContainer.parentNode.appendChild(evalContainer);
          boardContainer.parentNode.insertBefore(evalContainer, boardContainer);

          function parseScore(scoreStr) {
            if (!scoreStr) {
              return { score: 0, mate: false };
            }

            scoreStr = scoreStr.trim();
            let mate = false;
            let score = 0;

            if (scoreStr.startsWith("#")) {
              mate = true;
              scoreStr = scoreStr.slice(1);
            }

            score = parseFloat(scoreStr.replace("+", "")) || 0;
            return { score, mate };
          }

          function update(scoreStr, color = "white") {
            let { score, mate } = parseScore(scoreStr);

            let percent = 50;

            if (mate) {
              let sign = score > 0 ? "+" : "-";
              scoreText.textContent = "#" + sign + Math.abs(score);
              if (
                (score > 0 && color === "white") ||
                (score < 0 && color === "black")
              ) {
                percent = 100;
              } else {
                percent = 0;
              }
            } else {
              let sign = score > 0 ? "+" : "";
              scoreText.textContent = sign + score.toFixed(1);
              if (color === "black") score = -score;
              if (score >= 7) {
                percent = 90;
              } else if (score <= -7) {
                percent = 10;
              } else {
                percent = 50 + (score / 7) * 40;
              }
            }

            if (color === "white") {
              bottomBar.style.background = "#C4883B";
              topBar.style.background = "#31552A";
            } else {
              bottomBar.style.background = "#31552A";
              topBar.style.background = "#C4883B";
            }

            bottomBar.style.height = percent + "%";
            topBar.style.height = 100 - percent + "%";
          }

          update(initialScore, initialColor);
          return { update };
        }

        function inject() {
          window.addEventListener("message", (event) => {
            if (event.source !== window) return;
            if (event.data && event.data.type === "FEN_RESPONSE") {
              fen_ = event.data.fen;
              uciHistory = event.data.uciHistory;
              side_index = event.data.side_;
              userName = event.data.username;
              chessComFenHistory = event.data.fenHistory;
              const isGameOver = event.data.isGameOver;
            }
          });
        }
        inject();

        function requestFen() {
          window.postMessage({ type: "GET_FEN" }, "*");
        }
                        function squareToIndex(square) {
          const file = square.charCodeAt(0) - 96; // a=1 ... h=8
          const rank = parseInt(square[1], 10); // 1..8
          return file * 10 + rank;
        }

        function getSide() {
          return side_index === 1 ? "white" : "black";
        }

        // key press — toggle menu
        window.onkeyup = (e) => {
          if (e.key === config.key) { toggleCoachMenu(); return; }
          return;
        };

        async function checkAndSendMoves() {
          // fix refresh page

          if (lastUrl !== window.location.pathname) {
            lastUrl = window.location.pathname;
            isGameOverFlag = true;
          }


          requestFen();

          if (!config.showEval && document.querySelector("#customEval")) {
            document.querySelector("#customEval").remove();
            evalObj = null;
          }

          if (!document.querySelector("#customEval") && config.showEval) {
            const boardContainer = document.querySelector(".board");
            if (boardContainer) {
              evalObj = createEvalBar();
            }
          }

          if (config.showAccWidget && config.coach < 998 && !document.querySelector("#acc-widget")) {
            statObj = createSimpleAccuracyDisplay(
              100,
              1500,
              100,
              1500,
              getSide(),
            );
          }

          if (
            (!config.showAccWidget || config.coach === 999) && document.querySelector("#acc-widget")
          ) {
            statObj = null;
            document.querySelector("#acc-widget").remove();
          }

          if (lastFEN !== fen_) {
            //accuracy
            clearHint();
            lastFEN = fen_;

            chessComAudio.pause();
            if (uciHistory) {
              const whiteElo = getElo(getSide())?.white || 3200;
              const blackElo = getElo(getSide())?.black || 3200;

              if (coach) {
                coach
                  .getChat(uciHistory, getSide(), whiteElo, blackElo)
                  .then((result) => {
                    // console.log(result);

                    if (lastFEN === result.fen) {
                      if (config.speach && result.urlAudio) {
                        chessComAudio.src = result.urlAudio;
                        chessComAudio.play();
                      }
                      showSubtitle(result.sentence);

                      if (statObj) {
                        statObj.update({
                          side: getSide(),
                          whiteAcc: result.whiteAccuracy,
                          blackAcc: result.blackAccuracy,

                          whiteElo: result.whiteElo,
                          blackElo: result.blackElo,

                          statW: stat_0_white,
                          statB: stat_0_black,
                          displayMode: 2,
                        });

                        send1(result);
                      }

                      if (config.moveClassification) {
                        const classification_ = result.classificationName;
                        const svg = classificationSVG[classification_];
                        placeSVGOnBoard(
                          getSide(),
                          result.moveLan.slice(2),
                          svg,
                        );
                      }
                    }
                  });
              }
            }
            const whiteElo = getElo(getSide())?.white || null;
            const blackElo = getElo(getSide())?.black || null;

            // fen
            send2(fen_);
            clearHighlightSquares();

            if (
              (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
              (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
            ) {
              engine.getMovesByFen(fen_, getSide()).then((moves) => {
                send4(moves);
                keyMove = moves;
                                if (moves.length > 0 && evalObj) {
                  evalObj.update(moves[0].eval, getSide());
                }
                
              });
            }
          }
        }

        setInterval(checkAndSendMoves, interval);

        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === "local" && changes.chessConfig) {
            const oldConfig = changes.chessConfig.oldValue;
            const newConfig = changes.chessConfig.newValue;

            if (!oldConfig || oldConfig.coach !== newConfig.coach) {
              onCoachChanged(newConfig.coach);
            }

            config = newConfig;
            engine.updateConfig(
              config.lines,
              config.depth,
              config.style,
              config.elo,
            );

            if (!config.showAccWidget && document.querySelector("#acc-widget")) {
              statObj = null;
              document.querySelector("#acc-widget").remove();
            }

            clearHighlightSquares();

            if (
              (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
              (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
            ) {
              engine.getMovesByFen(fen_, getSide()).then((moves) => {
                send4(moves);
                keyMove = moves;

                                if (moves.length > 0 && evalObj) {
                  evalObj.update(moves[0].eval, getSide());
                }
                
              });
            }
          }
        });
      }

      if (window.location.host === "lichess.org") {
        sendDebugger();
        let fen_ = "";
        let evalObj = null;
        let statObj = null;
        let lichessFenHistory = [];

        function getElo(side) {
          const ratings = document.querySelectorAll("rating");
          if (ratings.length < 2) return null;

          const topElo = parseInt(ratings[0].innerText, 10);
          const bottomElo = parseInt(ratings[1].innerText, 10);

          if (side.toLowerCase() === "white") {
            return { white: bottomElo, black: topElo };
          } else if (side.toLowerCase() === "black") {
            return { white: topElo, black: bottomElo };
          } else {
            return null;
          }
        }

        function createEvalBar(initialScore = "0.0", initialColor = "white") {
          const boardContainer = document.querySelector("cg-board");
          let w_ = boardContainer.offsetWidth;

          if (!boardContainer) return console.error("Plateau non trouvé !");

          // Conteneur principal
          const evalContainer = document.createElement("div");
          evalContainer.id = "customEval";
          evalContainer.style.zIndex = "9999";
          evalContainer.style.width = `${(w_ * 6) / 100}px`;
          evalContainer.style.height = `${boardContainer.offsetWidth}px`;
          evalContainer.style.background = "#0D0A05";
          evalContainer.style.marginLeft = "10px";
          evalContainer.style.position = "relative";
          evalContainer.style.left = "-50px";
          evalContainer.style.border = "2px solid #4A3820";
          evalContainer.style.borderRadius = "0";
          evalContainer.style.overflow = "hidden";
          evalContainer.style.boxShadow = "4px 4px 0 rgba(0,0,0,.85)";

          const topBar = document.createElement("div");
          const bottomBar = document.createElement("div");

          [topBar, bottomBar].forEach((bar) => {
            bar.style.width = "100%";
            bar.style.position = "absolute";
            bar.style.transition = "height 0.22s steps(6,end)";
          });

          topBar.style.top = "0";
          bottomBar.style.bottom = "0";

          evalContainer.appendChild(topBar);
          evalContainer.appendChild(bottomBar);

          // Texte en bas
          const scoreText = document.createElement("div");
          scoreText.style.position = "absolute";
          scoreText.style.bottom = "0";
          scoreText.style.left = "50%";
          scoreText.style.transform = "translateX(-50%)";
          scoreText.style.color = "#F0E6D4";
          scoreText.style.fontWeight = "bold";
          scoreText.style.fontSize = "11px";
          scoreText.style.fontFamily = "'Space Mono', monospace";
          scoreText.style.textShadow = "1px 1px 0 #000";
          scoreText.style.pointerEvents = "none";
          const evalTicks = document.createElement("div");
          evalTicks.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(10% - 1px),rgba(13,10,5,.6) calc(10% - 1px),rgba(13,10,5,.6) 10%);";
          evalContainer.appendChild(evalTicks);

          boardContainer.parentNode.style.display = "flex";
          // boardContainer.parentNode.appendChild(evalContainer);
          boardContainer.parentNode.insertBefore(evalContainer, boardContainer);

          function parseScore(scoreStr) {
            if (!scoreStr) {
              return { score: 0, mate: false };
            }

            scoreStr = scoreStr.trim();
            let mate = false;
            let score = 0;

            if (scoreStr.startsWith("#")) {
              mate = true;
              scoreStr = scoreStr.slice(1);
            }

            score = parseFloat(scoreStr.replace("+", "")) || 0;
            return { score, mate };
          }

          function update(scoreStr, color = "white") {
            let { score, mate } = parseScore(scoreStr);
            let percent = 50;

            if (mate) {
              let sign = score > 0 ? "+" : "-";
              scoreText.textContent = "#" + sign + Math.abs(score);
              if (
                (score > 0 && color === "white") ||
                (score < 0 && color === "black")
              ) {
                percent = 100;
              } else {
                percent = 0;
              }
            } else {
              let sign = score > 0 ? "+" : "";
              scoreText.textContent = sign + score.toFixed(1);
              if (color === "black") score = -score;
              if (score >= 7) {
                percent = 90;
              } else if (score <= -7) {
                percent = 10;
              } else {
                percent = 50 + (score / 7) * 40;
              }
            }

            if (color === "white") {
              bottomBar.style.background = "#C4883B";
              topBar.style.background = "#31552A";
            } else {
              bottomBar.style.background = "#31552A";
              topBar.style.background = "#C4883B";
            }

            bottomBar.style.height = percent + "%";
            topBar.style.height = 100 - percent + "%";
          }

          update(initialScore, initialColor);
          return { update };
        }

                function getSide() {
          const board = document.querySelector(".cg-wrap");
          if (!board) return "white"; // si le plateau n'est pas trouvé

          if (board.classList.contains("orientation-black")) {
            return "black";
          } else if (board.classList.contains("orientation-white")) {
            return "white";
          } else {
            return "white";
          }
        }

        function requestFen() {
          window.postMessage({ type: "FEN" }, "*");
        }

                window.onkeyup = async (e) => {
          if (e.key === config.key) { toggleCoachMenu(); return; }
        };

        /////////////////////////////////////////////   calculation /////////////////////////////////////////////
        function inject() {
          window.addEventListener("message", (event) => {
            if (config.showAccWidget && config.coach < 998 && !document.querySelector("#acc-widget")) {
              statObj = createSimpleAccuracyDisplay(
                100,
                1500,
                100,
                1500,
                getSide(),
              );
            }

            if (
              (!config.showAccWidget || config.coach === 999) && document.querySelector("#acc-widget")
            ) {
              statObj = null;
              document.querySelector("#acc-widget").remove();
            }

            if (event.source !== window) return;
            if (event.data && event.data.type === "FEN_RESPONSE") {
              let fenTemp = event.data.fen;

              if (lichessFenHistory.length > 0) {
                fenTemp = lichessFenHistory.at(-1);
                window.postMessage({ type: "stop" }, "*");
              }

              if (fenTemp !== fen_) {
                fen_ = fenTemp;
                // chrome.runtime.sendMessage({ type: "FROM_CONTENT", fen: fen_ });
                send2(fen_);

                clearHighlightSquares();

                if (
                  (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
                  (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
                ) {
                  engine.getMovesByFen(fen_, getSide()).then(async (moves) => {
                    
                    keyMove = moves;
                    if (moves.length > 0 && evalObj) {
                      evalObj.update(moves[0].eval, getSide());
                    }

                                        // chrome.runtime.sendMessage({
                    //   type: "FROM_CONTENT",
                    //   data: moves,
                    // });
                    send3(moves);
                  });
                }
              }
            }
          });
        }

        inject();

        setInterval(() => {
          if (document.querySelector("#user_tag")) {
            userName = document.querySelector("#user_tag").innerText;
          }

          if (!config.showEval && document.querySelector("#customEval")) {
            document.querySelector("#customEval").remove();
            // customEval = null;
            evalObj = null;
          }

          if (!document.querySelector("#customEval") && config.showEval) {
            const boardContainer = document.querySelector("cg-container");
            if (boardContainer) {
              evalObj = createEvalBar();
            }
          }


          requestFen();
        }, interval);

        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === "local" && changes.chessConfig) {
            const oldConfig = changes.chessConfig.oldValue;
            const newConfig = changes.chessConfig.newValue;

            if (!oldConfig || oldConfig.coach !== newConfig.coach) {
              onCoachChanged(newConfig.coach);
            }

            config = newConfig;
            engine.updateConfig(
              config.lines,
              config.depth,
              config.style,
              config.elo,
            );

            if (!config.showAccWidget && document.querySelector("#acc-widget")) {
              statObj = null;
              document.querySelector("#acc-widget").remove();
            }

            clearHighlightSquares();
            if (
              (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
              (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
            ) {
              engine.getMovesByFen(fen_, getSide()).then(async (moves) => {
                
                keyMove = moves;
                if (moves.length > 0 && evalObj) {
                  evalObj.update(moves[0].eval, getSide());
                }

                                send3(moves);
              });
            }
          }
        });

        chrome.runtime.onMessage.addListener(async (message, sender) => {
          if (message.type === "history") {
            lichessFenHistory = message.data;
            let uciH_ = message.uci;
            let last = message.last;

            clearHint();

            const whiteElo_ = getElo(getSide())?.white || 3200;
            const blackElo_ = getElo(getSide())?.black || 3200;

            if (coach) {
              coach
                .getChat(uciH_, getSide(), whiteElo_, blackElo_)
                .then((result) => {
                  // console.log(result);
                  const urlAudio_ = result.urlAudio;

                  if (config.speach && result.urlAudio) {
                    playAudio(result.urlAudio);
                  }
                  showSubtitle(result.sentence);

                  if (statObj) {
                    statObj.update({
                      side: getSide(),
                      whiteAcc: result.whiteAccuracy,
                      blackAcc: result.blackAccuracy,

                      whiteElo: result.whiteElo,
                      blackElo: result.blackElo,

                      statW: stat_0_white,
                      statB: stat_0_black,
                      displayMode: 2,
                    });

                    send1(result);
                  }

                  if (config.moveClassification) {
                    const classification_ = result.classificationName;

                    const svg = classificationSVG[classification_];

                    placeSVGOnBoard(getSide(), result.moveLan.slice(2), svg);
                  }
                });
            }
          }
        });
      }

      if (window.location.host === "worldchess.com") {
        sendDebugger();
        let fen_ = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
        let currentFen = "";
        let evalObj = null;
        let statObj = null;

        function getElo(side) {
          const allPlayerInfo = document.querySelectorAll(
            '[data-component="GamePlayerInfo"]',
          );
          if (allPlayerInfo.length < 2) return null;

          const extractElo = (text) => {
            const match = text.match(/\n(\d+)$/);
            return match ? parseInt(match[1], 10) : null;
          };

          const topElo = extractElo(allPlayerInfo[0].innerText);
          const bottomElo = extractElo(allPlayerInfo[1].innerText);

          if (side.toLowerCase() === "white") {
            return { white: bottomElo, black: topElo };
          } else if (side.toLowerCase() === "black") {
            return { white: topElo, black: bottomElo };
          } else {
            return null;
          }
        }

        function getSide() {
          const cgBoard = document.querySelector("cg-board");
          let side = "white";

          if (cgBoard) {
            const indicator = cgBoard.style.transform; // "rotate(180)"
            if (indicator === "rotate(180deg)") {
              side = "black";
            }
            if (indicator === "rotate(0deg)") {
              side = "white";
            }
          }

          return side;
        }

                function createEvalBar(initialScore = "0.0", initialColor = "white") {
          const boardContainer = document.querySelector("cg-board");

          if (!boardContainer) return console.error("Plateau non trouvé !");
          let w_ = boardContainer.offsetWidth;
          const evalContainer = document.createElement("div");
          evalContainer.id = "customEval";
          evalContainer.style.zIndex = "9999";
          evalContainer.style.width = `${(w_ * 6) / 100}px`;
          evalContainer.style.height = `${boardContainer.offsetWidth}px`;
          evalContainer.style.background = "#0D0A05";
          evalContainer.style.marginLeft = "12px";
          evalContainer.style.position = "relative";
          evalContainer.style.left = "-10px";
          evalContainer.style.border = "2px solid #4A3820";
          evalContainer.style.borderRadius = "0";
          evalContainer.style.overflow = "hidden";
          evalContainer.style.boxShadow = "4px 4px 0 rgba(0,0,0,.85)";

          const topBar = document.createElement("div");
          const bottomBar = document.createElement("div");

          [topBar, bottomBar].forEach((bar) => {
            bar.style.width = "100%";
            bar.style.position = "absolute";
            bar.style.transition = "height 0.22s steps(6,end)";
          });

          topBar.style.top = "0";
          bottomBar.style.bottom = "0";

          evalContainer.appendChild(topBar);
          evalContainer.appendChild(bottomBar);

          const scoreText = document.createElement("div");
          scoreText.style.position = "absolute";
          scoreText.style.bottom = "4px";
          scoreText.style.left = "50%";
          scoreText.style.transform = "translateX(-50%)";
          scoreText.style.color = "#F0E6D4";
          scoreText.style.fontWeight = "700";
          scoreText.style.fontSize = "10px";
          scoreText.style.fontFamily = "'Space Mono', monospace";
          scoreText.style.textShadow = "1px 1px 0 #000";
          scoreText.style.pointerEvents = "none";
          const evalTicks = document.createElement("div");
          evalTicks.style.cssText = "position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(10% - 1px),rgba(13,10,5,.6) calc(10% - 1px),rgba(13,10,5,.6) 10%);";
          evalContainer.appendChild(evalTicks);

          boardContainer.parentNode.style.display = "flex";
          boardContainer.parentNode.insertBefore(evalContainer, boardContainer);

          function parseScore(scoreStr) {
            if (!scoreStr) {
              return { score: 0, mate: false };
            }

            scoreStr = scoreStr.trim();
            let mate = false;
            let score = 0;

            if (scoreStr.startsWith("#")) {
              mate = true;
              scoreStr = scoreStr.slice(1);
            }

            score = parseFloat(scoreStr.replace("+", "")) || 0;
            return { score, mate };
          }

          function update(scoreStr, color = "white") {
            let { score, mate } = parseScore(scoreStr);
            let percent = 50;

            if (mate) {
              let sign = score > 0 ? "+" : "-";
              scoreText.textContent = "#" + sign + Math.abs(score);
              if (
                (score > 0 && color === "white") ||
                (score < 0 && color === "black")
              ) {
                percent = 100;
              } else {
                percent = 0;
              }
            } else {
              let sign = score > 0 ? "+" : "";
              scoreText.textContent = sign + score.toFixed(1);
              if (color === "black") score = -score;
              if (score >= 7) {
                percent = 90;
              } else if (score <= -7) {
                percent = 10;
              } else {
                percent = 50 + (score / 7) * 40;
              }
            }

            if (color === "white") {
              bottomBar.style.background = "#C4883B";
              topBar.style.background = "#31552A";
            } else {
              bottomBar.style.background = "#31552A";
              topBar.style.background = "#C4883B";
            }

            bottomBar.style.height = percent + "%";
            topBar.style.height = 100 - percent + "%";
          }

          update(initialScore, initialColor);
          return { update };
        }

                window.onkeyup = async (e) => {
          if (e.key === config.key) { toggleCoachMenu(); return; }
        };

        setInterval(async () => {
          if (config.showAccWidget && config.coach < 998 && !document.querySelector("#acc-widget")) {
            statObj = createSimpleAccuracyDisplay(
              100,
              1500,
              100,
              1500,
              getSide(),
            );
          }

          if (
            (!config.showAccWidget || config.coach === 999) && document.querySelector("#acc-widget")
          ) {
            statObj = null;
            document.querySelector("#acc-widget").remove();
          }

          if (!document.querySelector("#customEval") && config.showEval) {
            const boardContainer = document.querySelector("cg-board");
            if (boardContainer) {
              evalObj = createEvalBar();
            }
          }


          if (fen_ && fen_ !== currentFen) {
            currentFen = fen_;
            send2(fen_);

            clearHighlightSquares();

            if (!config.showEval && document.querySelector("#customEval")) {
              document.querySelector("#customEval").remove();
              evalObj = null;
            }

            if (
              (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
              (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
            ) {
              engine.getMovesByFen(fen_, getSide()).then((moves) => {
                keyMove = moves;

                send3(moves);
                if (moves.length > 0 && evalObj) {
                  evalObj.update(moves[0].eval, getSide());
                }

                              });
            }
          }
        }, interval);

        chrome.storage.onChanged.addListener((changes, area) => {
          if (area === "local" && changes.chessConfig) {
            const oldConfig = changes.chessConfig.oldValue;
            const newConfig = changes.chessConfig.newValue;

            if (!oldConfig || oldConfig.coach !== newConfig.coach) {
              onCoachChanged(newConfig.coach);
            }

            config = newConfig;
            engine.updateConfig(
              config.lines,
              config.depth,
              config.style,
              config.elo,
            );

            if (!config.showAccWidget && document.querySelector("#acc-widget")) {
              statObj = null;
              document.querySelector("#acc-widget").remove();
            }

            clearHighlightSquares();
            if (
              (getSide()[0] === "w" && fen_.split(" ")[1] === "w") ||
              (getSide()[0] === "b" && fen_.split(" ")[1] === "b")
            ) {
              engine.getMovesByFen(fen_, getSide()).then((moves) => {
                keyMove = moves;
                // chrome.runtime.sendMessage({
                //   type: "FROM_CONTENT",
                //   data: moves,
                // });
                send3(moves);
                if (moves.length > 0 && evalObj) {
                  evalObj.update(moves[0].eval, getSide());
                }

                              });
            }
          }
        });

        chrome.runtime.onMessage.addListener(async (message, sender) => {
          if (message.type === "history") {
            clearHint();
            const whiteElo = getElo(getSide())?.white || null;
            const blackElo = getElo(getSide())?.black || null;

            const whiteElo_ = getElo(getSide())?.white || 3200;
            const blackElo_ = getElo(getSide())?.black || 3200;

            const uci__ = message.uci;

            if (coach) {
              coach
                .getChat(uci__, getSide(), whiteElo, blackElo)
                .then((result) => {
                  if (config.speach && result.urlAudio) {
                    chessComAudio.src = result.urlAudio;
                    chessComAudio.play();
                  }
                  showSubtitle(result.sentence);

                  if (statObj) {
                    statObj.update({
                      side: getSide(),
                      whiteAcc: result.whiteAccuracy,
                      blackAcc: result.blackAccuracy,

                      whiteElo: result.whiteElo,
                      blackElo: result.blackElo,

                      statW: stat_0_white,
                      statB: stat_0_black,
                      displayMode: 2,
                    });
                    send1(result);
                  }

                  if (config.moveClassification) {
                    const classification_ = result.classificationName;
                    const svg = classificationSVG[classification_];
                    placeSVGOnBoard(getSide(), result.moveLan.slice(2), svg);
                  }
                });
            }

            let fenHistory = message.data;
            if (fenHistory.length > 0) {
              fen_ = fenHistory.at(-1);
            }
          }
        });
      }
    };

    start();

(function showUpdateBanner() {
  if (document.getElementById("ichess-update-banner")) return;

  chrome.storage.local.get(["updateAvailable", "latestVersion"], (result) => {
    if (!result.updateAvailable) return;

    const version = result.latestVersion || "?";

    const S = document.createElement("style");
    S.id = "ichess-update-banner-styles";
    S.textContent = `
      @keyframes ichessBannerIn { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ichessBannerOut { from{opacity:1} to{opacity:0;transform:translateY(-10px)} }

      #ichess-update-banner {
        position:fixed; top:12px; right:12px; z-index:999999;
        max-width:380px; width:auto;
        background:#1A1308;
        background-image:repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px);
        border:2px solid #8B6914;
        border-radius:0;
        padding:14px 38px 14px 16px;
        font-family:'Space Mono',monospace; color:#F0E6D4;
        animation:ichessBannerIn .18s steps(4,end);
        box-shadow:
          4px 4px 0 rgba(0,0,0,.85),
          inset 0 0 0 2px #0D0A05;
      }
      #ichess-update-banner.ichess-banner-closing {
        animation:ichessBannerOut .12s steps(3,end) forwards;
      }

      #ichess-update-banner .ichess-banner-close {
        position:absolute; top:10px; right:12px;
        width:24px; height:24px; border-radius:0;
        background:#0D0A05; border:2px solid #4A3820;
        color:#A89878; font-size:13px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        transition:all .1s steps(2,end); line-height:1;
      }
      #ichess-update-banner .ichess-banner-close:hover {
        background:#201710; color:#CE7B7B;
        border-color:#B84A4A;
      }

      #ichess-update-banner .ichess-banner-text {
        font-size:10.5px; line-height:1.6; color:#A89878;
        margin-bottom:12px;
      }
      #ichess-update-banner .ichess-banner-text strong {
        color:#D4A76A; font-weight:700;
        text-shadow:1px 1px 0 #0D0A05;
      }

      #ichess-update-banner .ichess-banner-btn {
        display:inline-block;
        padding:7px 14px; border-radius:0;
        background:#201710; border:2px solid #8B6914;
        font-family:'Space Mono',monospace; font-size:10px; font-weight:700;
        letter-spacing:1.5px; text-transform:uppercase;
        color:#D4A76A; text-decoration:none; cursor:pointer;
        transition:all .1s steps(2,end);
        box-shadow:3px 3px 0 rgba(0,0,0,.85);
      }
      #ichess-update-banner .ichess-banner-btn:hover {
        transform:translate(-1px,-1px);
        box-shadow:4px 4px 0 rgba(0,0,0,.85);
        background:#28200F; color:#fff;
      }
      #ichess-update-banner .ichess-banner-btn:active {
        transform:translate(2px,2px);
        box-shadow:1px 1px 0 rgba(0,0,0,.85);
      }
    `;
    document.head.appendChild(S);

    const banner = document.createElement("div");
    banner.id = "ichess-update-banner";

    const closeBtn = document.createElement("button");
    closeBtn.className = "ichess-banner-close";
    closeBtn.innerHTML = "\u00d7";
    closeBtn.onclick = () => {
      banner.classList.add("ichess-banner-closing");
      setTimeout(() => { banner.remove(); S.remove(); }, 150);
    };

    const text = document.createElement("div");
    text.className = "ichess-banner-text";
    text.innerHTML = "iChess-Coach updated to <strong>v" + version + "</strong>! Join our Discord for the latest features & updates.";

    const btn = document.createElement("a");
    btn.className = "ichess-banner-btn";
    btn.href = "https://discord.gg/gVgn5Bn8d5";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.textContent = "Join Discord";

    banner.appendChild(closeBtn);
    banner.appendChild(text);
    banner.appendChild(btn);
    document.body.appendChild(banner);
  });
})();
