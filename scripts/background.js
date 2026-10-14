importScripts("../engine/chess_min.js")

function getStartFEN(fen) {
  const board = fen.split(" ")[0];
  const rows = board.split("/");

  const blackBackRank = rows[0];
  const whiteBackRank = blackBackRank.toUpperCase();

  return `${blackBackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBackRank} w KQkq - 0 1`;
}

const game = Chess();

function pgnToFenArray(pgn) {
  const fenTag = pgn.match(/\[FEN\s+"([^"]+)"\]/);
  const initialFen = fenTag ? fenTag[1] : undefined;

  game.reset();
  if (initialFen) game.load(initialFen);

  const success = game.load_pgn(pgn);
  if (!success) {
    throw new Error("PGN invalide");
  }

  const moves = game.history({ verbose: true });

  game.reset();
  if (initialFen) game.load(initialFen);

  const fenArray = [game.fen()];

  for (let move of moves) {
    game.move(move);
    fenArray.push(game.fen());
  }

  return fenArray;
}

function pgnToUciString(pgn) {
  const fenTag = pgn.match(/\[FEN\s+"([^"]+)"\]/);
  const startFen = fenTag ? fenTag[1] : null;

  const game = new Chess();

  if (startFen) {
    game.load(startFen);
  } else {
    game.reset();
  }

  const success = game.load_pgn(pgn);
  if (!success) {
    throw new Error("PGN invalide");
  }

  const moves = game.history({ verbose: true });

  const uciMoves = moves.map(m => {
    // roque
    if (m.flags.includes("k")) {
      return m.color === "w" ? "e1g1" : "e8g8";
    }
    if (m.flags.includes("q")) {
      return m.color === "w" ? "e1c1" : "e8c8";
    }

    // promotion
    if (m.promotion) {
      return `${m.from}${m.to}${m.promotion}`;
    }

    // normal + en passant inclus automatiquement
    return `${m.from}${m.to}`;
  });

  const positionPart = startFen
    ? `position fen ${startFen}`
    : `position startpos`;

  return `${positionPart} moves ${uciMoves.join(" ")}`;
}

let popupTabs = [];

function sendConfigToSite(type, config, urlPattern) {
  chrome.tabs.query({ url: urlPattern }, (tabs) => {
    for (let tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type, config });
    }
  });
}

function sendMovesToSite(type, moves, urlPattern) {
  chrome.tabs.query({ url: urlPattern }, (tabs) => {
    for (let tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { type, moves });
    }
  });
}

// Stockage global des listeners par tabId
const activeListeners = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab || !sender.tab.id) return;
  const tabId = sender.tab.id;
  if (message.type === "ATTACH_DEBUGGER") {
    chrome.tabs.get(tabId, async (tab) => {
      if (!tab || !tab.url) {
        sendResponse({ success: false, error: "No tab URL" });
        return;
      }

      const urlTab = new URL(tab.url);
      const host = urlTab.hostname;

      const allowedDomains = ["lichess.org", "worldchess.com"];
      if (!allowedDomains.includes(host)) {
        sendResponse({ success: false, error: "Domain not allowed" });
        return;
      }

      let TARGET = "";
      let BREAK_SEARCH = "";

      if (host === "lichess.org") {
        TARGET = "this.onMove=(e,t,s)=>{s||this.enpassant(e,t)";
        BREAK_SEARCH = "s||";
      }

      if (host === "worldchess.com") {
        TARGET =
          'e.on("history",(i,n)=>{if(i.length===n.length){this.clearPremoves();';
        BREAK_SEARCH = "if(i.length===n.length";
      }

      let breakpointId = null;
      const checkedUrls = new Set();

      async function trySetBreakpoint(url) {
        if (breakpointId || checkedUrls.has(url)) return false;
        checkedUrls.add(url);
        try {
          const res = await fetch(url);
          const code = await res.text();

          const index = code.indexOf(TARGET);
          if (index === -1) return false;

          const before = code.slice(0, index);
          const lineNumber = before.split("\n").length - 1;
          const columnNumber =
            before.split("\n").pop().length + TARGET.indexOf(BREAK_SEARCH);

          const bpRes = await new Promise((resolve) => {
            chrome.debugger.sendCommand(
              { tabId },
              "Debugger.setBreakpointByUrl",
              { url, lineNumber, columnNumber },
              resolve,
            );
          });

          if (bpRes && bpRes.breakpointId) {
            breakpointId = bpRes.breakpointId;
            return true;
          }
        } catch (e) {
        }
        return false;
      }

      if (activeListeners[tabId]) {
        chrome.debugger.onEvent.removeListener(
          activeListeners[tabId].scriptParsed,
        );
        chrome.debugger.onEvent.removeListener(
          activeListeners[tabId].debuggerEvent,
        );
        delete activeListeners[tabId];
      }

      chrome.debugger.detach({ tabId }, () => {
        chrome.debugger.attach({ tabId }, "1.3", async () => {
          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          await chrome.debugger.sendCommand({ tabId }, "Debugger.enable");

          let urls = [];
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId },
              func: () =>
                [...document.scripts].map((s) => s.src).filter(Boolean),
            });
            urls = results[0]?.result || [];
          } catch (err) {
            console.error(err);
          }

          let found = false;
          for (const url of urls) {
            if (await trySetBreakpoint(url)) {
              found = true;
              break;
            }
          }

          const scriptParsedListener = async (source, method, params) => {
            if (source.tabId !== tabId) return;
            if (method !== "Debugger.scriptParsed") return;
            if (!params.url || breakpointId) return;

            await trySetBreakpoint(params.url);
          };

          const debuggerEventListener = async (source, method, params) => {
            if (source.tabId !== tabId) return;
            if (method !== "Debugger.paused") return;

            if (
              !params.hitBreakpoints ||
              !breakpointId ||
              !params.hitBreakpoints.includes(breakpointId)
            ) {
              chrome.debugger.sendCommand(source, "Debugger.resume");
              return;
            }

            if (!params.callFrames || params.callFrames.length === 0) {
              chrome.debugger.sendCommand(source, "Debugger.resume");
              return;
            }

            try {
              if (host === "lichess.org") {
                const evalRes = await chrome.debugger.sendCommand(
                  source,
                  "Debugger.evaluateOnCallFrame",
                  {
                    callFrameId: params.callFrames[0].callFrameId,
                    expression: "this.data.steps",
                    returnByValue: true,
                  },
                );

                const evalRes2 = await chrome.debugger.sendCommand(
                  source,
                  "Debugger.evaluateOnCallFrame",
                  {
                    callFrameId: params.callFrames[0].callFrameId,
                    expression: "({ e, t })",
                    returnByValue: true,
                  },
                );

                const { e, t } = evalRes2.result.value;
                const lastMove = e + t;
                const movesHistory = evalRes.result?.value || [];
                let fenhistory = [];

                let uciHistory = `position fen ${movesHistory[0]?.fen ?? ""} moves`;

                

                if (movesHistory.length > 0) {
                  game.load(movesHistory[0].fen);

                  for (let i = 1; i < movesHistory.length; i++) {
                    const move = movesHistory[i].san || movesHistory[i].uci;
                    if (!move) continue;
                    const result = game.move(move, { sloppy: true });
                    if (!result)
                      console.error(
                        "Impossible de jouer le coup:",
                        move,
                        "index",
                        i,
                      );
                  }

                  game.move(lastMove, { sloppy: true });
                  game.header(
                    "Variant",
                    "Chess960",
                    "SetUp",
                    "1",
                    "FEN",
                    movesHistory[0].fen,
                  );

                  fenhistory = pgnToFenArray(game.pgn());
                  uciHistory = pgnToUciString(game.pgn());

                


                  chrome.tabs.query({}, (tabs) => {
                    for (const tab of tabs) {
                      if (tab.url && tab.url.includes("lichess")) {
                        chrome.tabs.sendMessage(tab.id, {
                          type: "history",
                          data: fenhistory,
                          uci: uciHistory,
                          last: lastMove,
                        });
                      }
                    }
                  });
                }
              }

              if (host === "worldchess.com") {
                const evalRes = await chrome.debugger.sendCommand(
                  source,
                  "Debugger.evaluateOnCallFrame",
                  {
                    callFrameId: params.callFrames[0].callFrameId,
                    expression: "i",
                    returnByValue: true,
                  },
                );

                const movesHistory = evalRes.result?.value || [];
                const fenhistory = [];
                const fenInit = movesHistory[0].fen;
                const startFen = getStartFEN(fenInit);

                game.load(startFen);
                fenhistory.push(game.fen());

                movesHistory.forEach((e) => {
                  game.move(e.lan, { sloppy: true });
                  fenhistory.push(game.fen());
                });
                game.header(
                  "Variant",
                  "Chess960",
                  "SetUp",
                  "1",
                  "FEN",
                  startFen,
                );

                let uciHistory = pgnToUciString(game.pgn())

                chrome.tabs.query({}, (tabs) => {
                  for (const tab of tabs) {
                    if (tab.url && tab.url.includes("worldchess")) {
                      chrome.tabs.sendMessage(tab.id, {
                        type: "history",
                        data: fenhistory,
                        uci : uciHistory
                      });
                    }
                  }
                });
              }
            } catch (e) {
              console.error(e);
            } finally {
              chrome.debugger.sendCommand(source, "Debugger.resume");
            }
          };

          activeListeners[tabId] = {
            scriptParsed: scriptParsedListener,
            debuggerEvent: debuggerEventListener,
          };

          chrome.debugger.onEvent.addListener(scriptParsedListener);
          chrome.debugger.onEvent.addListener(debuggerEventListener);

          sendResponse({ success: true });
        });
      });
    });

    return true;
  }

  if (message.type === "DETACH_DEBUGGER") {
    if (activeListeners[tabId]) {
      chrome.debugger.onEvent.removeListener(
        activeListeners[tabId].scriptParsed,
      );
      chrome.debugger.onEvent.removeListener(
        activeListeners[tabId].debuggerEvent,
      );
      delete activeListeners[tabId];
    }

    chrome.debugger.detach({ tabId }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({
          success: false,
          error: chrome.runtime.lastError.message,
        });
        return;
      }

      // console.log("Debugger detached from tab", tabId);
      sendResponse({ success: true });
    });

    return true;
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type !== "DRAG_MOVE") return;

  const { fromX, fromY, toX, toY } = message;

  const tabs = await chrome.tabs.query({});

  const allowedDomains = ["lichess.org", "worldchess.com"];
  const targetTabs = tabs.filter((tab) => {
    if (!tab.url) return false;
    const url = new URL(tab.url);
    return allowedDomains.includes(url.hostname);
  });

  for (const tab of targetTabs) {
    const tabId = tab.id;

    if (!tabId) continue;

    await sendMouseEvent(tabId, {
      type: "mousePressed",
      x: fromX,
      y: fromY,
      button: "left",
      clickCount: 1,
    });

    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const x = fromX + (toX - fromX) * (i / steps);
      const y = fromY + (toY - fromY) * (i / steps);
      await sendMouseEvent(tabId, { type: "mouseMoved", x, y, button: "left" });
    }

    await sendMouseEvent(tabId, {
      type: "mouseReleased",
      x: toX,
      y: toY,
      button: "left",
      clickCount: 1,
    });
  }
});

function sendMouseEvent(tabId, params) {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand(
      { tabId },
      "Input.dispatchMouseEvent",
      params,
      (res) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(res);
      },
    );
  });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "stream") {
    chrome.windows.create({
      url: chrome.runtime.getURL("overlay/index.html"),
      type: "popup",
      state: "maximized",
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_PGN_ANALYSIS") {
    chrome.tabs.create({ url: chrome.runtime.getURL("pgn/index.html") });
  }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'FETCH_AUDIO') {
    fetch(msg.url)
      .then(r => r.arrayBuffer())
      .then(buffer => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const CHUNK = 0x8000;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
        }
        sendResponse({ b64: btoa(binary) });
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  const url = tab.url || "";
  const allowedDomains = ["chess.com", "lichess.org", "worldchess.com"];
  const isAllowed = allowedDomains.some(d => url.includes(d));
  if (!isAllowed) return;
  chrome.tabs.sendMessage(tab.id, { type: "OPEN_COACH_MENU" });
});

// ─── Update checker ─────────────────────────────────────────────────────────
// Fetches only version metadata from the official repository over HTTPS.
// Remote code is never downloaded or executed, and no user data is sent.
const UPDATE_URL = "https://raw.githubusercontent.com/ishatxt/ichess-coach/main/manifest.json";
const UPDATE_RELEASES_URL = "https://github.com/ishatxt/ichess-coach/releases/latest";
const UPDATE_ALARM = "checkUpdates";
const UPDATE_PERIOD_MINUTES = 360; // six hours
const UPDATE_FETCH_TIMEOUT_MS = 10000;
const UPDATE_NOTIFICATION_ID = "ichess-update";
const UPDATE_LOG_PREFIX = "[iChess Updater]";

function updateLog(...args) {
  console.log(UPDATE_LOG_PREFIX, ...args);
}

function updateWarn(...args) {
  console.warn(UPDATE_LOG_PREFIX, ...args);
}

// Accepts 1 to 4 numeric segments (Chrome manifest rules), rejects anything
// else so a malformed remote value is never used as a version.
function parseVersion(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d+(\.\d+){0,3}$/.test(trimmed)) return null;
  const parts = trimmed.split(".").map(Number);
  if (parts.some((part) => part > 65535)) return null;
  return parts;
}

// Numeric comparison, so 1.10.0 counts as newer than 1.9.0.
// Returns 1 / 0 / -1, or null when either version is missing or malformed.
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return null;
  const length = Math.max(pa.length, pb.length);
  for (let i = 0; i < length; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff > 0) return 1;
    if (diff < 0) return -1;
  }
  return 0;
}

function setUpdateBadge(remoteVersion) {
  const localVersion = chrome.runtime.getManifest().version;
  chrome.action.setBadgeText({ text: "NEW" });
  chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });
  chrome.action.setTitle({
    title: `${chrome.runtime.getManifest().name}: update ${remoteVersion} available (installed ${localVersion})`,
  });
}

function clearUpdateBadge() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: chrome.runtime.getManifest().name });
}

function notifyUpdateAvailable(localVersion, remoteVersion) {
  if (!chrome.notifications || !chrome.notifications.create) {
    updateWarn("notifications API unavailable, keeping the badge only");
    return Promise.resolve(false);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (created) => {
      if (settled) return;
      settled = true;
      resolve(created);
    };
    try {
      chrome.notifications.create(
        UPDATE_NOTIFICATION_ID,
        {
          type: "basic",
          iconUrl: chrome.runtime.getURL("icons/3.png"),
          title: "iChess update available",
          message:
            `Version ${remoteVersion} is available (you have ${localVersion}). ` +
            "Update your source, then reload iChess from chrome://extensions.",
          buttons: [{ title: "View release" }],
          priority: 1,
        },
        () => {
          if (chrome.runtime.lastError) {
            updateWarn("notification failed:", chrome.runtime.lastError.message);
            finish(false);
          } else {
            finish(true);
          }
        },
      );
    } catch (e) {
      updateWarn("notification failed:", e && e.message);
      finish(false);
    }
  });
}

function openUpdateReleasePage() {
  try {
    chrome.tabs.create({ url: UPDATE_RELEASES_URL }, () => {
      if (chrome.runtime.lastError) {
        updateWarn("could not open release page:", chrome.runtime.lastError.message);
      }
    });
  } catch (e) {
    updateWarn("could not open release page:", e && e.message);
  }
}

if (chrome.notifications) {
  chrome.notifications.onClicked.addListener((id) => {
    if (id === UPDATE_NOTIFICATION_ID) openUpdateReleasePage();
  });
  chrome.notifications.onButtonClicked.addListener((id) => {
    if (id === UPDATE_NOTIFICATION_ID) openUpdateReleasePage();
  });
}

// Re-apply the badge after a browser restart, before the network check runs.
function restoreUpdateBadge() {
  chrome.storage.local
    .get(["updateAvailable", "latestVersion"])
    .then((result) => {
      if (!result.updateAvailable) return;
      const remote = result.latestVersion;
      if (compareVersions(remote, chrome.runtime.getManifest().version) !== 1) return;
      setUpdateBadge(remote);
    })
    .catch((e) => updateWarn("could not restore badge:", e && e.message));
}

async function checkForUpdates() {
  const localVersion = chrome.runtime.getManifest().version;

  let response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPDATE_FETCH_TIMEOUT_MS);
  try {
    response = await fetch(UPDATE_URL + "?t=" + Date.now(), {
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (e) {
    updateWarn(
      "check skipped (network):",
      e && e.name === "AbortError" ? "timeout" : (e && e.message) || e,
    );
    return;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    updateWarn("check skipped: HTTP", response.status);
    return;
  }

  let remote;
  try {
    remote = await response.json();
  } catch (e) {
    updateWarn("check skipped: response is not valid JSON");
    return;
  }

  const remoteVersion =
    remote && typeof remote.version === "string" ? remote.version.trim() : "";
  const order = compareVersions(remoteVersion, localVersion);
  if (order === null) {
    updateWarn(
      "check skipped: remote version missing or invalid:",
      JSON.stringify(remote && remote.version),
    );
    return;
  }

  if (order > 0) {
    chrome.storage.local.set({ updateAvailable: true, latestVersion: remoteVersion });
    setUpdateBadge(remoteVersion);

    let skipNotification = false;
    try {
      const stored = await chrome.storage.local.get("ichessNotifiedVersion");
      skipNotification = stored.ichessNotifiedVersion === remoteVersion;
    } catch (e) {
      skipNotification = true;
      updateWarn("could not read notification state; skipping this notification:", e && e.message);
    }

    if (!skipNotification) {
      // Remember the version only once Chrome confirms the notification was
      // created; a failed attempt must not suppress future attempts.
      const created = await notifyUpdateAvailable(localVersion, remoteVersion);
      if (created) {
        chrome.storage.local.set({ ichessNotifiedVersion: remoteVersion });
      }
    }
    updateLog(`update available: ${localVersion} -> ${remoteVersion}`);
    return;
  }

  if (order < 0) {
    updateLog(`remote ${remoteVersion} is older than installed ${localVersion}; ignoring`);
  }

  chrome.storage.local.set({ updateAvailable: false, latestVersion: remoteVersion });
  clearUpdateBadge();
}

function runUpdateCheck() {
  checkForUpdates().catch((e) => updateWarn("check failed:", e && e.message));
}

// Single named alarm: ensured once per service-worker start by the top-level
// call below, and only created when missing, so restarts never reset the
// six-hour schedule or create duplicates. The immediate check on install/startup
// covers the first run; this alarm only drives the repeats.
function ensureUpdateAlarm() {
  try {
    chrome.alarms.get(UPDATE_ALARM, (alarm) => {
      if (chrome.runtime.lastError) {
        updateWarn("alarm lookup failed:", chrome.runtime.lastError.message);
        return;
      }
      if (alarm) return;
      chrome.alarms.create(UPDATE_ALARM, { periodInMinutes: UPDATE_PERIOD_MINUTES });
      updateLog("periodic check scheduled every 6 hours");
    });
  } catch (e) {
    updateWarn("could not schedule the update check:", e && e.message);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== UPDATE_ALARM) return;
  runUpdateCheck();
});

chrome.runtime.onInstalled.addListener(() => {
  runUpdateCheck();
});

chrome.runtime.onStartup.addListener(() => {
  runUpdateCheck();
});

restoreUpdateBadge();
ensureUpdateAlarm();
