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

| | Feature | Description |
|---|---------|-------------|
| :chess_pawn: | **Multi-Platform** | Chess.com, Lichess.org, WorldChess.com |
| :brain: | **AI Coaches** | David, Mae, Dante, Nadia in 12 languages + Celebrity coaches |
| :bar_chart: | **Engine Analysis** | Komodo & Stockfish/Torch via WebAssembly locally |
| :sparkles: | **Move Classification** | Brilliant, Great, Best, Inaccuracy, Mistake, Blunder icons |
| :dart: | **Accuracy Widget** | Live accuracy % and estimated rating during review |
| :studio_microphone: | **Voice Coaching** | Coach speaks move explanations in real time |
| :sliders: | **Configurable Depth** | Analysis depth from 1 to 15 |

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
- Press <kbd>=</kbd> to toggle the coach on/off
- Press <kbd>-</kbd> to switch analysis lines

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
│   ├── background.js          # Service worker (updates, messaging)
│   ├── main.js                # SweetAlert2 (modal UI library)
│   ├── core.js                # Core coaching logic + in-page menu
│   └── sub-main.js            # Site-specific move injection
└── overlay/
    ├── index.html             # Overlay window
    ├── index.css              # Overlay styles
    └── index.js               # Overlay logic
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Platform | Chrome Extension Manifest V3 |
| Language | Vanilla JavaScript |
| Engines | Komodo & Stockfish/Torch via WebAssembly |
| Validation | chess.js |
| UI Modals | SweetAlert2 |
| Site Integration | Chrome Debugger Protocol |
| Persistence | Chrome Storage API |

---

<p align="center">
  <sub>Built with :chess_pawn: by <b>Isha</b></sub>
</p>
