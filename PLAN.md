# PGN Analysis Feature - Implementation Plan

## Overview
Add a "PGN Analysis" feature that lets users paste a PGN (or drag-and-drop a `.pgn` file) and get a full game review with classifications, accuracy, voice commentary, eval bar, and an interactive board — all in a dedicated page.

---

## 1. Files to Create

### `pgn/index.html`
New dedicated page. Minimal shell that loads `index.css` and `index.js`.

### `pgn/index.css`
Styles for the PGN analysis page (retro theme matching the extension).

### `pgn/index.js`
Main page logic. Bundled as a self-contained page (no React — vanilla JS to keep it lightweight and consistent with the rest of the extension). Responsibilities:

- **PGN Input UI**: textarea + drag-and-drop zone + "Analyze" button
- **PGN Parsing**: use injected `chess.js` to parse PGN into FEN history + UCI string
- **Engine Analysis**: create a `CoachEngine` (Torch WASM worker) in the page, iterate through every move, call `getChat()` for each position
- **Board Component**: SVG/CSS chessboard with piece rendering, click-to-navigate, move arrows
- **Move List**: scrollable list with classification icons + annotations
- **Accuracy Widget**: CAPS + effective Elo for both sides
- **Summary Panel**: tallies (brilliant, blunder, etc.), result, estimated ratings
- **Audio Playback**: fetch and play voice comments via `chrome.runtime.sendMessage({ type: "FETCH_AUDIO" })`

### `chess-p/` (user-provided assets)
Chess piece PNG images with transparent backgrounds. 12 files total:

| File | Piece |
|------|-------|
| `wK.png` | White King |
| `wQ.png` | White Queen |
| `wR.png` | White Rook |
| `wB.png` | White Bishop |
| `wN.png` | White Knight |
| `wP.png` | White Pawn |
| `bK.png` | Black King |
| `bQ.png` | Black Queen |
| `bR.png` | Black Rook |
| `bB.png` | Black Bishop |
| `bN.png` | Black Knight |
| `bP.png` | Black Pawn |

The board renders pieces as `<img>` tags using `chrome.runtime.getURL("chess-p/<piece>.png")`.

### No new files in `scripts/`
All engine/worker code is reused from existing files. The PGN page loads `chess_min.js`, `komodo.js`, and `torch.js` directly from the extension URL.

---

## 2. Files to Modify

### `manifest.json`
- Add `pgn/*` to `web_accessible_resources.matches` so the page can be opened via `chrome.runtime.getURL("pgn/index.html")`
- Add `chess-p/*` to `web_accessible_resources.matches` so piece PNGs are accessible

### `scripts/core-engine.js`
- Add a new row to `toggleCoachMenu()`: **"PGN Analysis"** button
- On click: `chrome.runtime.sendMessage({ type: "OPEN_PGN_ANALYSIS" })`

### `scripts/background.js`
- Add listener for `OPEN_PGN_ANALYSIS`: opens `pgn/index.html` in a new tab (`chrome.tabs.create`)

---

## 3. Detailed Design

### 3.1 PGN Input (`pgn/index.js`)
```
┌─────────────────────────────────────────────────┐
│  ┌─ DROP ZONE ─────────────────────────────────┐ │
│  │  Drag a .pgn file here or paste PGN below   │ │
│  └──────────────────────────────────────────────┘ │
│  ┌─ TEXTAREA ───────────────────────────────────┐ │
│  │  1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ...          │ │
│  └──────────────────────────────────────────────┘ │
│  [ Analyze Game ]                                 │
└─────────────────────────────────────────────────┘
```

- **File drop**: `FileReader` reads `.pgn` as text, populates textarea
- **Paste**: raw PGN text goes into textarea
- **Analyze button**: triggers parsing → engine loop → results

### 3.2 PGN Parsing
Uses the existing `chess_min.js` (chess.js):
```js
const chess = new Chess();
chess.load_pgn(pgnText);
const history = chess.history({ verbose: true });
// Build FEN array + UCI string for CoachEngine
```

Produces:
- `fenHistory[]` — one FEN per position
- `uciString` — `"position fen <start> moves e2e4 e7e5 ..."`
- `startFEN`, `moveCount`, `result`

### 3.3 Engine Analysis Loop
```js
const coachEngine = new CoachEngine();  // Torch WASM worker
for (let i = 0; i < moveCount; i++) {
  const partialUci = uciString up to move i;
  const result = await coachEngine.getChat(partialUci, side, whiteElo, blackElo);
  // result = { classificationName, fen, urlAudio, sentence, moveLan,
  //            whiteAccuracy, blackAccuracy, whiteElo, blackElo }
  results.push(result);
}
```

After all moves: compile tallies, final CAPS, effective Elo.

### 3.4 Board Component
Pure SVG/CSS chessboard rendered in vanilla JS:

- **Board rendering**: 8×8 grid of `<div>` squares, each square contains an `<img>` for the piece (from `chess-p/` PNGs via `chrome.runtime.getURL()`)
- **Piece loading**: `<img src="chrome-extension://<id>/chess-p/wK.png">` — pieces set up as `web_accessible_resources`
- **Navigation**: click squares or use ←/→ arrow keys to step through moves
- **Last-move highlight**: colored overlay on from/to squares
- **Classification icon**: place the SVG icon on the destination square (reuse `classificationSVG` map)
- **Eval bar**: small eval bar beside the board (reuse eval bar logic from `core-main.js`)
- **Move arrows**: optional — draw arrow from engine's best move suggestion

### 3.5 Move List Panel
```
 1. e4  e5  [Book]        ●
 2. Nf3 Nc6 [Best]        ●
 3. Bb5 a6  [Excellent]   ●
 4. Ba4  Nf6 [Great]      !! ← click to jump to this position
 ...
```
- Each row: move pair + classification icon + color-coded badge
- Click any row → board jumps to that position
- Scrollable, auto-follows current position

### 3.6 Accuracy + Summary
```
┌───────────────┬───────────────┐
│   WHITE       │    BLACK      │
│  Accuracy: 91%│  Accuracy: 84%│
│  Rating: 1712 │  Rating: 1488 │
│  ● safe       │  ● safe       │
└───────────────┴───────────────┘

Tallies: ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●
 Best: 12  Great: 2  Brilliant: 1  Book: 8  Excellent: 3
 Inaccuracy: 1  Mistake: 1  Blunder: 0  Miss: 0
```

### 3.7 Coach Menu Button
In `toggleCoachMenu()` (core-engine.js), add after existing rows:
```
[ Coach ]
  Coach: [David ▼]
[ Analysis ]
  Engine Depth: [====●====] 10
[ Review ]
  Move Classification: [toggle]
  Coach Voice: [toggle]
  Coach Subtitles: [toggle]
  Accuracy Widget: [toggle]
  Evaluation Bar: [toggle]
  ────────────────────────
  [ PGN Analysis ]        ← NEW BUTTON
  ────────────────────────
  [ Credits ]
  [ Reset Defaults ]
```

---

## 4. Implementation Order

1. **Create `pgn/index.html`** — minimal HTML shell
2. **Create `pgn/index.css`** — retro-themed styles
3. **Create `pgn/index.js`** — all page logic:
   - PGN input (textarea + file drop)
   - PGN parsing (chess.js)
   - Board component (SVG chessboard)
   - Engine analysis loop (CoachEngine)
   - Move list with classifications
   - Accuracy widget + summary
   - Audio playback
   - Keyboard navigation
4. **Update `manifest.json`** — add `pgn/*` to web_accessible_resources
5. **Update `scripts/background.js`** — add `OPEN_PGN_ANALYSIS` listener
6. **Update `scripts/core-engine.js`** — add PGN Analysis button to coach menu
7. **Test** — load extension, paste PGN, verify board + classifications + accuracy

---

## 5. Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Vanilla JS | Consistent with rest of extension, no build step |
| Board rendering | CSS grid + `<img>` PNG pieces | User-provided assets in `chess-p/`, high quality |
| Engine in page | Torch WASM via blob-URL Worker | Same pattern as core-engine.js |
| PGN parsing | chess.js from `engine/chess_min.js` | Already bundled, tested |
| Audio | `FETCH_AUDIO` message to background | CORS bypass |
| Styles | CSS in page, retro theme | Match extension aesthetic |

---

## 6. Estimated Size

- `pgn/index.html`: ~20 lines
- `pgn/index.css`: ~400 lines
- `pgn/index.js`: ~800-1000 lines
- `manifest.json`: +1 line
- `background.js`: +10 lines
- `core-engine.js`: +15 lines

**Total new code: ~1250-1450 lines**
