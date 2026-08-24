<p align="center">
  <img src="https://raw.githubusercontent.com/ishatxt/ichess-coach/main/pic/iChess.jpeg" alt="iChess Coach" width="500">
</p>

<h1 align="center">iChess Coach</h1>

<p align="center">
  <img src="https://img.shields.io/badge/version-3-1a1a1a?style=flat-square&labelColor=111&color=fff" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-4a7c1f?style=flat-square&labelColor=111&color=fff" alt="Manifest V3">
  <img src="https://img.shields.io/badge/platform-chrome-4285F4?style=flat-square&labelColor=111&color=fff" alt="Chrome">
  <img src="https://img.shields.io/badge/license-MIT-1a1a1a?style=flat-square&labelColor=111&color=fff" alt="License">
</p>

<p align="center">
  <b>Real-time chess coach</b> with live engine analysis, voice commentary, and move classification<br>
  built into <b>Chess.com</b>, <b>Lichess</b>, and <b>World Chess</b>.
</p>

---

## Features

| ⛧ | Feature | Description |
|---|---------|-------------|
| ⛧  | **Multi-Platform** | Chess.com, Lichess.org, WorldChess.com |
| ⛧  | **AI Coaches** | David, Mae, Dante, Nadia in 12 languages + Celebrity coaches |
| ⛧  | **Engine Analysis** | Komodo & Torch via WebAssembly, running 100% locally |
| ⛧ | **Move Classification** | Brilliant, Great, Best, Book, Inaccuracy, Mistake, Miss, Blunder icons |
| ⛧  | **Accuracy Widget** | Live CAPS accuracy %, estimated Elo, and threat-level dots during review |
| ⛧  | **Voice Coaching** | Coach speaks move explanations in real time |
| ⛧ | **Configurable Depth** | Analysis depth from 1 to 15 |
| ⛧  | **Retro UI** | 1990s chess-computer aesthetic with scanlines, pixel shadows, and stepped animations |

---

## Supported Coaches

<table>
  <tr>
    <td><b>Standard</b></td>
    <td>David, Mae, Dante, Nadia — each available in English, French, Spanish, Arabic, Russian, Portuguese, German, Italian, Turkish, Polish, Korean, and Indonesian</td>
  </tr>
  <tr>
    <td><b>Celebrity</b></td>
    <td>Levy Rozman, Magnus Carlsen, Hikaru Nakamura, Anna Cramling, Canty, Vishy Anand, Tania Sachdev, Danny Rensch, Botez Sisters, Ben Finegold</td>
  </tr>
</table>

---

## Installation

```bash
# 1. Clone the repo
git clone https://github.com/ishatxt/ichess-coach.git

# 2. Open Chrome and navigate to
chrome://extensions/

# 3. Enable Developer Mode (top-right toggle)

# 4. Click "Load unpacked"

# 5. Select the ichess-coach-main folder
```

---

## Usage

1. Go to **Chess.com**, **Lichess**, or **World Chess**
2. Click the extension icon to open the coach menu
3. Pick a **coach** and **language**
4. Adjust settings: depth, voice, move icons, accuracy widget
5. Play or review a game — the coach analyzes in real time

**Hotkeys:**

| Key | Action |
|-----|--------|
| <kbd>=</kbd> | Toggle the coach menu |
| <kbd>Alt+C</kbd> | Toggle icon colors between Retro and Classic palettes |

---

## Move Classification Colors

Icons are tinted per verdict, and <kbd>Alt+C</kbd> swaps the whole set at runtime:

| Verdict | Retro (default) | Classic |
|---------|-----------------|---------|
| Brilliant | `#B404BC` purple | `#26C2A3` teal |
| Great | `#26C2A3` teal | `#749BBF` blue |
| Best / Excellent | `#A8D66D` / `#7FB04A` greens | same |
| Book / Forced | `#D5A47D` / `#96AF8B` | same |
| Inaccuracy | `#D6C85A` gold | same |
| Mistake | `#C98A3C` orange | same |
| Blunder / Miss | `#B84A4A` / `#B85E5E` reds | same |

The toggle rewrites the icon fills in the `classificationSVG` map and keeps the pulse animations in sync (they detect the move type from the injected icon's own background fill).

---

# How the Game Review Works

This section explains the full pipeline — how a move you play on any supported site ends up as a classified icon on the board, a spoken comment, an updated accuracy score, and a moved eval bar.

## The Big Picture

```
┌──────────────────────────── THE PAGE ────────────────────────────┐
│                                                                   │
│  Site JS objects            sub-main.js (MAIN world bridge)       │
│  ┌─────────────────┐        ┌────────────────────────────────┐   │
│  │ chess.com:      │◄──────►│ reads game state               │   │
│  │  window.game    │        │ FEN · move history · UCI ·     │   │
│  │ lichess:        │        │ side · username                │   │
│  │  site.sound     │        │ postMessage GET_FEN / MOVE     │   │
│  │ worldchess:     │        └───────────────▲────────────────┘   │
│  │  history event  │                        │                    │
│  └────────▲────────┘                        │ FEN_RESPONSE       │
│           │ breakpoint hit                  │                    │
│  ┌────────┴────────────────────────────────┴──────────────────┐   │
│  │              core.js (isolated content-script world)        │   │
│  │   polling loop · classification · SVG icons · eval bar      │   │
│  │   accuracy widget · audio playback · coach menu             │   │
│  └───────▲───────────────────────────────▲─────────────────────┘   │
└──────────│───────────────────────────────│──────────────────────────┘
           │ chrome.runtime messages       │ Web Workers (WASM)
┌──────────┴──────────────┐   ┌────────────┴──────────────────────┐
│  background.js          │   │  Komodo worker (coach + analysis) │
│  service worker         │   │  Torch worker (live eval bar)     │
│  chrome.debugger attach │   │  chess.js validation              │
│  breakpoints · resume   │   │  all local, no server             │
│  synthetic mouse drags  │   └───────────────────────────────────┘
│  update checker         │
└─────────────────────────┘
```

Everything runs **locally**: the engines are WebAssembly builds executed in Web Workers inside your browser. No moves or data are sent to any analysis server.

## Step 1 — Reading the Game State (per platform)

The extension needs the current FEN and full move history after every move. Each site exposes its state differently, so there are two acquisition strategies:

### Strategy A — Page-world bridge (Chess.com)

`scripts/sub-main.js` is injected into the page's **main JS world** (content scripts normally run in an isolated world and cannot touch site objects). It listens for `GET_FEN` messages and answers with `FEN_RESPONSE`:

| Data | Source on chess.com |
|------|---------------------|
| Current FEN | `game.getFEN()` |
| Move history (UCI) | `game.getCurrentFullLine()` → `from + to + promotion` per move |
| Start FEN | first entry of `game.getHistoryFENs(1)` |
| Side you're playing | `game.getPlayingAs()` (1 = white) |
| Username | `window.context.user.username` |
| Game over flag | `game.isGameOver()` |

It also implements the reverse direction: a `MOVE` message calls `game.move({...}, userGenerated: true)` so the extension can physically play suggested moves on the board.

### Strategy B — Debugger breakpoints (Lichess & WorldChess)

These sites don't expose their game object conveniently, so iChess attaches the **Chrome Debugger Protocol** to your own tab:

1. The content script sends `ATTACH_DEBUGGER`; `background.js` calls `chrome.debugger.attach(tabId, "1.3")`.
2. It lists every `<script src>` on the page, fetches each bundle, and searches for a tiny known code signature:
   - **Lichess:** `this.onMove=(e,t,s)=>{s||this.enpassant(e,t)`
   - **WorldChess:** `e.on("history",(i,n)=>{if(i.length===n.length){this.clearPremoves();`
3. It computes the exact line/column and plants a breakpoint with `Debugger.setBreakpointByUrl`. A `Debugger.scriptParsed` listener re-arms the breakpoint if the site lazy-loads more bundles.
4. When you make a move, the breakpoint fires while the site is frozen:
   - **Lichess:** evaluates `this.data.steps` (full position history) and `({ e, t })` (the move that triggered it)
   - **WorldChess:** evaluates `i` (the move array with `.lan` entries)
5. The service worker replays those moves through its own **chess.js** copy to produce a validated FEN array and a UCI string (`position fen <start> moves e2e4 e7e5 …`).
6. `Debugger.resume()` unfreezes the page — the player never notices (total pause ≈ milliseconds).

The result is messaged to all matching tabs as `{ type: "history", data: fenHistory, uci, last }`.

> This is why Chrome shows the *"iChess started debugging this browser"* warning on Lichess/WorldChess — it is the intended mechanism, and `DETACH_DEBUGGER` removes everything when the coach stops.

## Step 2 — The Engine Layer

Two WebAssembly engines run as blob-URL Web Workers:

| Worker | Engine | Role |
|--------|--------|------|
| `komodo.js` + `.wasm` | Komodo/Dragon (UCI) | Game review, classification, speech, candidate lines |
| `torch.js` + `.wasm` | Torch/Stockfish derivative | Fast live eval for the eval bar |
| `chess_min.js` | chess.js | Legal-move validation, PGN/FEN/UCI conversion |

### The CoachEngine (review brain)

When a real coach is selected (`config.coach < 988`), core.js boots Komodo with special options that turn it into a *game-report generator*:

```
setoption name SerializeSpeechDetails value true
setoption name ClassificationV3 value true
setoption name SpeechV3 value true
setoption name HandleContinuations value true
setoption name HandleContinuationsDepth value <depth2>
setoption name Language value en_US
load-and-set-coach-asset … {"currentCoach":{"id":"…","name":"David", …}}
```

The `load-and-set-coach-asset` command registers the chosen coach persona (voice + avatar metadata) inside the engine itself.

### Step 3 — Analyzing a Move

Every time the position changes, the pipeline runs `getChat(uciHistory, side, whiteElo, blackElo)`:

```
setoption name UserColor value white          ← which side you are
setoption name HandleContinuationsDepth value N
setoption name BlackElo value 1500            ← estimated ratings
setoption name WhiteElo 1650
position fen <startFEN> moves e2e4 e7e5 …    ← full game so far
fetch analysis                                ← triggers the report
```

The engine replies with a `json {…}` payload — a miniature chess.com-style game report:

```jsonc
{
  "positions": [{
    "classificationName": "brilliant",   // ← the verdict for the last move
    "fen": "…",
    "playedMove": {
      "moveLan": "g1f3",
      "speech": [{ "audioUrlHash": "6547b8d0…" }]  // ← pre-recorded comment
    }
  }],
  "CAPS": { "white": { "all": 91.4 }, "black": { "all": 84.2 } },
  "reportCard": { "white": { "effectiveElo": 1712 }, "black": { "effectiveElo": 1488 } },
  "tallies": { "white": { "best": 12, "mistake": 1, … }, "black": { … } }
}
```

Classifications produced: `brilliant`, `greatFind`, `best`, `book`, `excellent`, `good`, `inaccuracy`, `mistake`, `miss`, `blunder`, `forced`.

### Step 4 — Rendering the Verdict

One JSON report drives four independent UI outputs:

| Output | Mechanism |
|--------|-----------|
| **Board icon** | `classificationSVG[name]` → `placeSVGOnBoard(side, square, svg)` positions an inline SVG (24×24 viewBox 18×19) centered on the square using `getBoundingClientRect()` math, with a CSS pulse animation selected by the icon's fill color (double-pulse for brilliant, breathing for great, etc.) |
| **Voice comment** | `audioUrlHash` → MP3 fetched from `https://text-and-audio.chess.com/prod/released/<Coach>/<locale>/<hash>.mp3` (via the `FETCH_AUDIO` background proxy) and played through a pooled `Audio` element |
| **Accuracy widget** | Draggable floating card showing both sides' CAPS accuracy + effective Elo, plus a threat dot: `≥95%` red (*cheat*), `≥90%` orange (*sus*), `≥88%` gold (*warn*), otherwise green (*safe*); position persists in `chrome.storage.local` |
| **Eval bar** | On Lichess/WorldChess the Torch worker answers each FEN with MultiPV lines; `evalObj.update(eval, side)` animates the segmented meter beside the board |

### Candidate Lines & Hotkeys

In parallel, a plain-Komodo instance (`getMovesByFen`) streams `info depth … multipv k pv …` output into a ranked candidate list (`keyMove[]`, ranked best-first with evals). The infrastructure to play a chosen line also exists — `sub-main.js` accepts `MOVE` messages (chess.com: `game.move()`, lichess: `window.playMove()`), and Strategy B can synthesize piece drags via `Input.dispatchMouseEvent` (press → 10 interpolated moves → release) — but no trigger wires it to the engine today; the lines currently serve as hints and feed the eval bar.

## Message Protocol Summary

| Channel | Message | Direction | Purpose |
|---------|---------|-----------|---------|
| `window.postMessage` | `GET_FEN` / `FEN_RESPONSE` | core ↔ sub-main | Position polling (chess.com) |
| `window.postMessage` | `MOVE` | core → sub-main | Play a move programmatically |
| `chrome.runtime` | `ATTACH_DEBUGGER` / `DETACH_DEBUGGER` | core → bg | Breakpoint lifecycle |
| `chrome.tabs.sendMessage` | `history` | bg → core | FEN history + UCI after each move |
| `chrome.runtime` | `DRAG_MOVE` | core → bg | Synthetic piece dragging |
| `chrome.runtime` | `FETCH_AUDIO` | core → bg | CORS-free audio fetch |
| `chrome.runtime` | `OPEN_COACH_MENU` | bg → core | Toolbar icon click |
| `chrome.runtime` | `stream` | core → bg | Open the overlay popup window |

## Configuration Reference

All settings persist in `chrome.storage.local` under one `chessConfig` object:

```js
{
  elo: 3500,               // engine strength (UCI Elo limit)
  coach: 999,              // coach id (<988 = standard coach, 988+ = special modes, 999 = silent)
  lines: 5,                // MultiPV candidate lines
  depth: 10,               // search depth (1–15)
  depth2: 10,              // continuation depth for the review engine
  style: "Default",        // Komodo personality
  speach: false,           // voice comments on/off
  moveClassification: false,
  showAccWidget: true,
  showEval: false,
  key: "=",                // menu hotkey
}
```

> Legacy keys (`colors`, `delay`, `floatingBtn`, `onlyShowEval`, `key2`) still exist in the defaults but are not referenced anywhere — they are safe to ignore.

## Why a Breakpoint Instead of DOM Scraping?

DOM scraping breaks whenever a site redesigns, misses fast moves, and cannot see premoves or variation trees. Hooking the site's own move handler guarantees byte-perfect state at the exact moment the move becomes official — the same data the site's UI uses. Chess.com already exposes `window.game`, so no debugging is needed there.

---

## Architecture

```
ichess-coach-main/
├── manifest.json              # Manifest V3 config
├── icons/                     # Extension icons
├── engine/
│   ├── chess_min.js           # chess.js (move validation)
│   ├── komodo.js / .wasm      # Komodo engine (WebAssembly)
│   └── torch.js / .wasm       # Torch engine (WebAssembly)
├── scripts/
│   ├── background.js          # Service worker (debugger, updates, messaging)
│   ├── main.js                # SweetAlert2 (modal UI library)
│   ├── core.js                # Core coaching logic + in-page menu
│   ├── sub-main.js            # Page-world bridge (site-specific state access)
│   ├── ui.txt                 # Dev reference: extracted UI sections of core.js
│   ├── ui.html                # Dev reference: browsable viewer for ui.txt
│   └── svg-preview/           # Dev reference: classification icon gallery
└── overlay/
    ├── index.html             # Overlay window
    ├── index.css              # Overlay styles
    └── index.js               # Overlay logic
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Platform | Chrome Extension Manifest V3 |
| Language | Vanilla JavaScript |
| Engines | Komodo & Torch via WebAssembly |
| Validation | chess.js |
| UI Modals | SweetAlert2 |
| Site Integration | Chrome Debugger Protocol |
| Persistence | Chrome Storage API |

---

<p align="center">
  <sub>Built with ⛧  by <b>i+</b></sub>
</p>
