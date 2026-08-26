(() => {
  "use strict";

  const EXT_URL = chrome.runtime.getURL;
  const PIECE_MAP = { wK:"wK", wQ:"wQ", wR:"wR", wB:"wB", wN:"wN", wP:"wP",
                      bK:"bK", bQ:"bQ", bR:"bR", bB:"bB", bN:"bN", bP:"bP" };

  const CLASSIFICATION_COLORS = {
    best:       "#81B64C",
    brilliant:  "#b404bc",
    greatFind:  "#26C2A3",
    excellent:  "#81B64C",
    good:       "#95b776",
    book:       "#D5A47D",
    forced:     "#96af8b",
    inaccuracy: "#F7C631",
    mistake:    "#FFA459",
    miss:       "#FF7769",
    blunder:    "#FA412D",
  };

  const CLASSIFICATION_LABELS = {
    best: "Best", brilliant: "Brilliant", greatFind: "Great",
    excellent: "Excellent", good: "Good", book: "Book", forced: "Forced",
    inaccuracy: "Inaccuracy", mistake: "Mistake", miss: "Miss", blunder: "Blunder",
  };

  const CLASSIFICATION_ICONS = {
    best:       `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#81B64C"/><text x="9" y="13" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">★</text></svg>`,
    brilliant:  `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#b404bc"/><text x="9" y="13" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">!!</text></svg>`,
    greatFind:  `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#26C2A3"/><text x="9" y="13" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">!</text></svg>`,
    excellent:  `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#81B64C"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">✓</text></svg>`,
    good:       `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#95b776"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">✓</text></svg>`,
    book:       `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#D5A47D"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">📖</text></svg>`,
    forced:     `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#96af8b"/><text x="9" y="13" text-anchor="middle" font-size="9" font-weight="bold" fill="#fff">→</text></svg>`,
    inaccuracy: `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#F7C631"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">?!</text></svg>`,
    mistake:    `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#FFA459"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">?</text></svg>`,
    miss:       `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#FF7769"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">✗</text></svg>`,
    blunder:    `<svg viewBox="0 0 18 19"><circle cx="9" cy="9" r="9" fill="#FA412D"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="bold" fill="#fff">??</text></svg>`,
  };

  const coachs = [
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/David_coach/en-US/", prefix:"load-and-set-coach-asset text_id Generic_coach locale en-US json", asset:"coach-assets/David_coach.json" },
    { lang:"fr_FR", link:"https://text-and-audio.chess.com/prod/released/David_coach/fr-FR/", prefix:"load-and-set-coach-asset text_id Generic_coach locale fr-FR json", asset:"coach-assets/David_coach.json" },
    { lang:"es_ES", link:"https://text-and-audio.chess.com/prod/released/David_coach/es-ES/", prefix:"load-and-set-coach-asset text_id Generic_coach locale es-ES json", asset:"coach-assets/David_coach.json" },
    { lang:"ar_SA", link:"https://text-and-audio.chess.com/prod/released/David_coach/ar-SA/", prefix:"load-and-set-coach-asset text_id Generic_coach locale ar-SA json", asset:"coach-assets/David_coach.json" },
    { lang:"ru_RU", link:"https://text-and-audio.chess.com/prod/released/David_coach/ru-RU/", prefix:"load-and-set-coach-asset text_id Generic_coach locale ru-RU json", asset:"coach-assets/David_coach.json" },
    { lang:"pt_PT", link:"https://text-and-audio.chess.com/prod/released/David_coach/pt-PT/", prefix:"load-and-set-coach-asset text_id Generic_coach locale pt-PT json", asset:"coach-assets/David_coach.json" },
    { lang:"de_DE", link:"https://text-and-audio.chess.com/prod/released/David_coach/de-DE/", prefix:"load-and-set-coach-asset text_id Generic_coach locale de-DE json", asset:"coach-assets/David_coach.json" },
    { lang:"it_IT", link:"https://text-and-audio.chess.com/prod/released/David_coach/it-IT/", prefix:"load-and-set-coach-asset text_id Generic_coach locale it-IT json", asset:"coach-assets/David_coach.json" },
    { lang:"tr_TR", link:"https://text-and-audio.chess.com/prod/released/David_coach/tr-TR/", prefix:"load-and-set-coach-asset text_id Generic_coach locale tr-TR json", asset:"coach-assets/David_coach.json" },
    { lang:"pl_PL", link:"https://text-and-audio.chess.com/prod/released/David_coach/pl-PL/", prefix:"load-and-set-coach-asset text_id Generic_coach locale pl-PL json", asset:"coach-assets/David_coach.json" },
    { lang:"ko_KR", link:"https://text-and-audio.chess.com/prod/released/David_coach/ko-KR/", prefix:"load-and-set-coach-asset text_id Generic_coach locale ko-KR json", asset:"coach-assets/David_coach.json" },
    { lang:"id_ID", link:"https://text-and-audio.chess.com/prod/released/David_coach/id-ID/", prefix:"load-and-set-coach-asset text_id Generic_coach locale id-ID json", asset:"coach-assets/David_coach.json" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Mae_coach/en-US/", prefix:"load-and-set-coach-asset text_id Generic_coach locale en-US json", asset:"coach-assets/Mae_coach.json" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Dante_coach/en-US/", prefix:"load-and-set-coach-asset text_id Generic_coach locale en-US json", asset:"coach-assets/Dante_coach.json" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Nadia_coach/en-US/", prefix:"load-and-set-coach-asset text_id Generic_coach locale en-US json", asset:"coach-assets/Nadia_coach.json" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Levy_coach/en-US/", prefix:"fetch load-and-set-coach-asset text_id Levy_coach locale en-US bzp", asset:"coach-assets/Levy_coach.bzp" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Magnus_coach/en-US/", prefix:"fetch load-and-set-coach-asset text_id Magnus_coach locale en-US bzp", asset:"coach-assets/Magnus_coach.bzp" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Hikaru_coach/en-US/", prefix:"fetch load-and-set-coach-asset text_id Hikaru_coach locale en-US bzp", asset:"coach-assets/Hikaru_coach.bzp" },
    { lang:"en_US", link:"https://text-and-audio.chess.com/prod/released/Anna_coach/en-US/", prefix:"fetch load-and-set-coach-asset text_id Anna_coach locale en-US bzp", asset:"coach-assets/Anna_coach.bzp" },
  ];

  const coachAssetCache = Object.create(null);
  async function getCoachCmd(coach) {
    if (!coach.asset) return "";
    let pending = coachAssetCache[coach.asset];
    if (!pending) {
      pending = fetch(EXT_URL(coach.asset)).then(r => {
        if (!r.ok) throw new Error(`coach asset HTTP ${r.status}`);
        return r.text();
      });
      pending.catch(() => delete coachAssetCache[coach.asset]);
      coachAssetCache[coach.asset] = pending;
    }
    return `${coach.prefix} ${await pending}`;
  }

  /* ─── Engine wrappers ────────────────────────────────────────────────── */

  async function createWorkerTorch() {
    const url = EXT_URL("engine/torch.js");
    const blob = new Blob([`importScripts("${url}");`], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }

  class EvalEngine {
    constructor() { this.worker = null; this.ready = this.init(); }
    async init() {
      this.worker = await createWorkerTorch();
      this.worker.postMessage("uci");
      this.worker.postMessage("setoption name UCI_AnalyseMode value true");
      this.worker.postMessage("setoption name UCI_LimitStrength value false");
    }
    hardStop() { if (this.worker) { this.worker.terminate(); this.worker = null; } }
    async getEval(fen) {
      await this.ready;
      if (!this.worker) return 0;
      return new Promise(resolve => {
        let bestScore = 0;
        let bestDepth = 0;
        const timeout = setTimeout(() => { this.worker.removeEventListener("message", onMsg); resolve(bestScore); }, 5000);
        const onMsg = (e) => {
          const line = e.data;
          if (typeof line !== "string") return;
          if (line.startsWith("info") && line.includes(" score ")) {
            const parts = line.split(" ");
            const si = parts.indexOf("score");
            const di = parts.indexOf("depth");
            const depth = (di !== -1 && di + 1 < parts.length) ? parseInt(parts[di + 1], 10) : 0;
            if (si !== -1 && si + 2 < parts.length && (!depth || depth >= bestDepth)) {
              const type = parts[si + 1];
              let val = parseInt(parts[si + 2], 10);
              if (!isNaN(val)) {
                const sideToMove = fen.split(" ")[1];
                if (sideToMove === "b") val = -val;
                if (type === "cp") bestScore = val / 100;
                else if (type === "mate") bestScore = val > 0 ? 100 : -100;
                bestDepth = depth || bestDepth;
              }
            }
          }
          if (line.startsWith("bestmove")) {
            clearTimeout(timeout);
            this.worker.removeEventListener("message", onMsg);
            resolve(bestScore);
          }
        };
        this.worker.addEventListener("message", onMsg);
        this.worker.postMessage("stop");
        this.worker.postMessage(`position fen ${fen}`);
        this.worker.postMessage("go depth 10");
      });
    }
  }

  class CoachEngine {
    constructor() { this.worker = null; this.ready = this.init(); }
    async init() { this.worker = await createWorkerTorch(); this.setup(); }
    hardStop() { if (this.worker) { this.worker.terminate(); this.worker = null; } }
    async restartWorker() { this.hardStop(); this.worker = await createWorkerTorch(); this.setup(); }
    send(cmd) { if (this.worker) this.worker.postMessage(cmd); }
    async setup() {
      this.send("setoption name UseDeclarativePositionCommand value true");
      this.send("setoption name BlackElo value 3200");
      this.send("setoption name WhiteElo value 3200");
      this.send("setoption name HandleContinuations value true");
      this.send("setoption name HandleContinuationsDepth value 10");
      this.send("setoption name UserColor value white");
      this.send("setoption name BotChatPrioritizePlayerMove value true");
      this.send("setoption name SerializeSpeechDetails value true");
      this.send("setoption name AllowBoardEventsWithoutSpeech value true");
      this.send("setoption name ServeCommandV2 value true");
      this.send("setoption name SpeechV3 value true");
      this.send("setoption name ClassificationV3 value true");
      this.send("setoption name UCI_Chess960 value false");
      this.send("setoption name UseRatingRanges value true");
      this.send("setoption name Language value en_US");
      this.send(await getCoachCmd(coachs[0]));
      this.send("setoption name Language value en_US");
    }
    async getChat(movesString, side = "white", whiteElo = 3200, blackElo = 3200) {
      await this.ready;
      if (!this.worker) throw new Error("Engine not initialized");
      return new Promise((resolve) => {
        const onMessage = (e) => {
          let raw = e.data;
          let cleanRaw = raw;
          if (typeof cleanRaw === "string" && cleanRaw.startsWith("json ")) {
            cleanRaw = cleanRaw.slice(5).trim();
          }
          try {
            const data = JSON.parse(cleanRaw);
            const last = data?.positions?.[data.positions.length - 1];
            if (!last) return;
            const classificationName = last.classificationName;
            const fen = last.fen;
            const audioUrlHash = last?.playedMove?.speech?.[0]?.audioUrlHash;
            const sentence = last?.playedMove?.speech?.[0]?.sentence?.[0] || "";
            const moveLan = last?.playedMove?.moveLan;
            const whiteAccuracy = data?.CAPS?.white?.all;
            const blackAccuracy = data?.CAPS?.black?.all;
            const effWhiteElo = data?.reportCard?.white?.effectiveElo;
            const effBlackElo = data?.reportCard?.black?.effectiveElo;
            const urlAudio = audioUrlHash ? `${coachs[0].link}${audioUrlHash}.mp3` : null;
            this.worker.removeEventListener("message", onMessage);
            resolve({ classificationName, fen, urlAudio, sentence, moveLan, whiteAccuracy, blackAccuracy, whiteElo: effWhiteElo, blackElo: effBlackElo });
          } catch (err) {}
        };
        this.worker.addEventListener("message", onMessage);
        this.send(`setoption name UserColor value ${side}`);
        this.send(`setoption name HandleContinuationsDepth value 10`);
        this.send(`setoption name BlackElo value ${blackElo}`);
        this.send(`setoption name WhiteElo value ${whiteElo}`);
        this.send(movesString);
        this.send("fetch analysis");
      });
    }
  }

  /* ─── DOM refs ───────────────────────────────────────────────────────── */

  const $ = id => document.getElementById(id);
  const inputScreen   = $("input-screen");
  const analysisScreen = $("analysis-screen");
  const pgnInput      = $("pgn-input");
  const analyzeBtn    = $("analyze-btn");
  const errorMsg      = $("error-msg");
  const dropZone      = $("drop-zone");
  const boardEl       = $("board");
  const moveListEl    = $("move-list");
  const talliesEl     = $("tallies");
  const accWidget     = $("accuracy-widget");
  const progressFill  = $("progress-fill");
  const progressLabel = $("progress-label");
  const progressBar   = $("progress-bar");
  const moveCounter   = $("move-counter");
  const evalFill      = $("eval-fill");
  const evalText      = $("eval-text");
  const backBtn       = $("back-btn");

  let analysisResults = [];
  let evalScores = [];
  let fenHistory = [];
  let sanMoves = [];
  let uciMoves = [];
  let currentPosition = 0;
  let totalMoves = 0;
  let chess = null;
  let storedPgn = "";

  /* ─── File drop ──────────────────────────────────────────────────────── */

  dropZone.addEventListener("click", () => pgnInput.focus());
  dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { pgnInput.value = ev.target.result; };
    reader.readAsText(file);
  });

  /* ─── Analyze ────────────────────────────────────────────────────────── */

  analyzeBtn.addEventListener("click", startAnalysis);
  backBtn.addEventListener("click", () => {
    inputScreen.style.display = "";
    analysisScreen.style.display = "none";
    pgnInput.value = "";
    analysisResults = [];
    evalScores = [];
    errorMsg.textContent = "";
    evalFill.style.height = "50%";
    evalText.textContent = "0.0";
  });

  function startAnalysis() {
    const pgn = pgnInput.value.trim();
    if (!pgn) { errorMsg.textContent = "Please paste a PGN or drop a .pgn file"; return; }
    errorMsg.textContent = "";

    storedPgn = pgn;
    chess = new Chess();
    if (!chess.load_pgn(pgn)) { errorMsg.textContent = "Invalid PGN — could not parse"; return; }

    const history = chess.history({ verbose: true });
    if (history.length === 0) { errorMsg.textContent = "PGN contains no moves"; return; }

    const fenTag = pgn.match(/\[FEN\s+"([^"]+)"\]/);
    const startFen = fenTag ? fenTag[1] : "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

    chess.reset();
    if (fenTag) chess.load(fenTag[1]);
    fenHistory = [chess.fen()];
    sanMoves = [];
    uciMoves = [];

    for (const h of history) {
      chess.move(h);
      fenHistory.push(chess.fen());
      sanMoves.push(h.san);
      if (h.flags.includes("k"))      uciMoves.push(h.color === "w" ? "e1g1" : "e8g8");
      else if (h.flags.includes("q")) uciMoves.push(h.color === "w" ? "e1c1" : "e8c8");
      else if (h.promotion)           uciMoves.push(`${h.from}${h.to}${h.promotion}`);
      else                            uciMoves.push(`${h.from}${h.to}`);
    }

    totalMoves = sanMoves.length;
    analysisResults = new Array(totalMoves).fill(null);
    evalScores = new Array(totalMoves).fill(null);
    currentPosition = 0;

    inputScreen.style.display = "none";
    analysisScreen.style.display = "";
    progressBar.style.display = "";
    progressFill.style.width = "0%";
    progressLabel.textContent = `Analyzing move 0 / ${totalMoves}...`;

    renderBoard(0);
    renderMoveList();
    runEngineAnalysis(startFen, history);
  }

  /* ─── Engine analysis loop ───────────────────────────────────────────── */

  async function runEngineAnalysis(startFen, history) {
    const coachEngine = new CoachEngine();
    await coachEngine.ready;
    const evalEngine = new EvalEngine();
    await evalEngine.ready;

    chess.reset();
    const fenTag = storedPgn.match(/\[FEN\s+"([^"]+)"\]/);
    if (fenTag) chess.load(fenTag[1]);

    const positionPart = fenTag ? `position fen ${fenTag[1]}` : "position startpos";

    for (let i = 0; i < totalMoves; i++) {
      const side = history[i].color;
      const partialUci = `${positionPart} moves ${uciMoves.slice(0, i + 1).join(" ")}`;
      const posFen = fenHistory[i + 1];

      const [result, evScore] = await Promise.all([
        coachEngine.getChat(partialUci, side, 3200, 3200).catch(() => null),
        evalEngine.getEval(posFen).catch(() => 0),
      ]);

      analysisResults[i] = result || { classificationName: "book", fen: posFen };
      evalScores[i] = evScore;

      const pct = Math.round(((i + 1) / totalMoves) * 100);
      progressFill.style.width = pct + "%";
      progressLabel.textContent = `Analyzing move ${i + 1} / ${totalMoves}...`;

      if (i === currentPosition) {
        renderBoard(currentPosition);
        updateEvalBar(currentPosition);
      }
    }

    coachEngine.hardStop();
    evalEngine.hardStop();
    progressBar.style.display = "none";
    updateAccuracyWidget();
    updateTallies();
    renderMoveList();
    updateEvalBar(currentPosition);
  }

  /* ─── Board rendering ────────────────────────────────────────────────── */

  function getPieceAt(fen, square) {
    const parts = fen.split(" ");
    const rows = parts[0].split("/");
    const file = square.charCodeAt(0) - 97;
    const rank = parseInt(square[1]);
    const row = rows[8 - rank];
    let col = 0;
    for (const ch of row) {
      if (ch === "/") continue;
      if (/\d/.test(ch)) { col += parseInt(ch); continue; }
      if (col === file) return ch;
      col++;
    }
    return null;
  }

  function pieceToImg(piece) {
    if (!piece) return "";
    const color = piece === piece.toUpperCase() ? "w" : "b";
    const name = piece.toLowerCase();
    const key = color + name;
    return `<img class="piece-img" src="${EXT_URL("chess-p/" + key + ".png")}" alt="${key}">`;
  }

  function renderBoard(moveIdx) {
    boardEl.innerHTML = "";
    const fen = fenHistory[moveIdx] || fenHistory[0];
    const lastMove = moveIdx > 0 ? analysisResults[moveIdx - 1] : null;

    let fromSquare = null, toSquare = null;
    if (moveIdx > 0) {
      const lan = lastMove?.moveLan || uciMoves[moveIdx - 1];
      if (lan && lan.length >= 4) {
        fromSquare = lan.substring(0, 2);
        toSquare = lan.substring(2, 4);
      }
    }

    for (let r = 8; r >= 1; r--) {
      for (let f = 0; f < 8; f++) {
        const file = String.fromCharCode(97 + f);
        const square = file + r;
        const isLight = (r + f) % 2 === 0;
        const div = document.createElement("div");
        div.className = "board-square " + (isLight ? "light" : "dark");

        if (square === fromSquare) div.classList.add("last-from");
        if (square === toSquare)   div.classList.add("last-to");

        const piece = getPieceAt(fen, square);
        if (piece) div.innerHTML = pieceToImg(piece);

        if (square === toSquare && analysisResults[moveIdx - 1]) {
          const cls = analysisResults[moveIdx - 1].classificationName;
          if (cls && CLASSIFICATION_ICONS[cls]) {
            const icon = document.createElement("div");
            icon.className = "class-icon";
            icon.innerHTML = CLASSIFICATION_ICONS[cls];
            div.appendChild(icon);
          }
        }

        boardEl.appendChild(div);
      }
    }

    updateEvalBar(moveIdx);
    moveCounter.textContent = `${moveIdx} / ${totalMoves}`;
  }

  function updateEvalBar(moveIdx) {
    if (moveIdx === 0) { evalFill.style.height = "50%"; evalText.textContent = "0.0"; return; }
    const score = evalScores[moveIdx - 1];
    if (score === null || score === undefined) return;

    const clamped = Math.max(-10, Math.min(10, score));
    const pct = 50 + (clamped / 10) * 45;
    evalFill.style.height = Math.max(5, Math.min(95, pct)) + "%";
    evalText.textContent = (score >= 0 ? "+" : "") + score.toFixed(1);
  }

  /* ─── Move list ──────────────────────────────────────────────────────── */

  function renderMoveList() {
    moveListEl.innerHTML = "";
    for (let i = 0; i < totalMoves; i++) {
      const moveNum = Math.floor(i / 2) + 1;
      const isWhite = i % 2 === 0;
      const r = analysisResults[i];
      const cls = r?.classificationName || "";
      const color = CLASSIFICATION_COLORS[cls] || "#666";
      const label = CLASSIFICATION_LABELS[cls] || "";

      const row = document.createElement("div");
      row.className = "move-row" + (i === currentPosition ? " active" : "");

      if (isWhite) {
        const numSpan = document.createElement("span");
        numSpan.className = "move-num";
        numSpan.textContent = moveNum + ".";
        row.appendChild(numSpan);
      } else if (i === 1) {
        const numSpan = document.createElement("span");
        numSpan.className = "move-num";
        numSpan.textContent = moveNum + "...";
        row.appendChild(numSpan);
      } else {
        const spacer = document.createElement("span");
        spacer.className = "move-num";
        spacer.textContent = "";
        row.appendChild(spacer);
      }

      const sanSpan = document.createElement("span");
      sanSpan.className = "move-san" + (i === currentPosition ? " active-move" : "");
      sanSpan.textContent = sanMoves[i];
      row.appendChild(sanSpan);

      if (cls) {
        const classDiv = document.createElement("span");
        classDiv.className = "move-class";
        classDiv.innerHTML = CLASSIFICATION_ICONS[cls] || "";
        row.appendChild(classDiv);
      }

      row.addEventListener("click", () => goToMove(i + 1));
      moveListEl.appendChild(row);
    }
  }

  /* ─── Navigation ─────────────────────────────────────────────────────── */

  function goToMove(idx) {
    currentPosition = Math.max(0, Math.min(totalMoves, idx));
    renderBoard(currentPosition);
    updateEvalBar(currentPosition);
    renderMoveList();
    highlightMoveList();
  }

  function highlightMoveList() {
    const rows = moveListEl.querySelectorAll(".move-row");
    rows.forEach((r, i) => {
      r.classList.toggle("active", i === currentPosition);
      const san = r.querySelector(".move-san");
      if (san) san.classList.toggle("active-move", i === currentPosition);
    });
    const activeRow = rows[currentPosition];
    if (activeRow) activeRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  $("btn-start").addEventListener("click", () => goToMove(0));
  $("btn-prev").addEventListener("click", () => goToMove(currentPosition - 1));
  $("btn-next").addEventListener("click", () => goToMove(currentPosition + 1));
  $("btn-end").addEventListener("click", () => goToMove(totalMoves));

  document.addEventListener("keydown", e => {
    if (analysisScreen.style.display === "none") return;
    if (e.key === "ArrowLeft")  { e.preventDefault(); goToMove(currentPosition - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goToMove(currentPosition + 1); }
    if (e.key === "Home")       { e.preventDefault(); goToMove(0); }
    if (e.key === "End")        { e.preventDefault(); goToMove(totalMoves); }
  });

  /* ─── Accuracy widget ────────────────────────────────────────────────── */

  function updateAccuracyWidget() {
    let lastResult = null;
    for (let i = analysisResults.length - 1; i >= 0; i--) {
      if (analysisResults[i] && analysisResults[i].whiteAccuracy) {
        lastResult = analysisResults[i]; break;
      }
    }
    if (!lastResult) return;

    const wAcc = lastResult.whiteAccuracy || "—";
    const bAcc = lastResult.blackAccuracy || "—";
    const wElo = lastResult.whiteElo || "—";
    const bElo = lastResult.blackElo || "—";

    function threatLevel(acc) {
      const n = parseFloat(acc);
      if (isNaN(n) || n === 0) return "";
      if (n >= 95) return "cheat";
      if (n >= 90) return "sus";
      if (n >= 88) return "warn";
      return "safe";
    }

    const wThreat = threatLevel(wAcc);
    const bThreat = threatLevel(bAcc);

    accWidget.innerHTML = `
      <div class="acc-grid">
        <div class="acc-card">
          <div class="acc-side">White</div>
          <div class="acc-val">${wAcc !== "—" ? wAcc + "%" : "—"}</div>
          <div class="acc-sub">${wElo !== "—" ? "Rating: " + wElo : ""}</div>
        </div>
        <div class="acc-card">
          <div class="acc-side">Black</div>
          <div class="acc-val">${bAcc !== "—" ? bAcc + "%" : "—"}</div>
          <div class="acc-sub">${bElo !== "—" ? "Rating: " + bElo : ""}</div>
        </div>
      </div>
    `;
  }

  /* ─── Tallies ────────────────────────────────────────────────────────── */

  function updateTallies() {
    const counts = {};
    for (const cls of Object.keys(CLASSIFICATION_COLORS)) counts[cls] = 0;
    for (const r of analysisResults) {
      if (r && r.classificationName && counts[r.classificationName] !== undefined) {
        counts[r.classificationName]++;
      }
    }

    const total = totalMoves || 1;
    let barHtml = '<div class="tally-bar">';
    const order = ["brilliant","greatFind","best","excellent","good","book","forced","inaccuracy","mistake","miss","blunder"];
    for (const cls of order) {
      const c = counts[cls] || 0;
      if (c > 0) {
        const pct = (c / total * 100).toFixed(1);
        barHtml += `<div class="tally-segment" style="width:${pct}%;background:${CLASSIFICATION_COLORS[cls]}"></div>`;
      }
    }
    barHtml += "</div>";

    let legendHtml = '<div class="tally-legend">';
    for (const cls of order) {
      const c = counts[cls] || 0;
      if (c > 0) {
        legendHtml += `<div class="tally-item"><span class="tally-dot" style="background:${CLASSIFICATION_COLORS[cls]}"></span>${CLASSIFICATION_LABELS[cls]}: ${c}</div>`;
      }
    }
    legendHtml += "</div>";

    talliesEl.innerHTML = `<div class="tally-title">Move Classification</div>${barHtml}${legendHtml}`;
  }

})();
