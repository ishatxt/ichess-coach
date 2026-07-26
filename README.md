<p align="center">
  <img src="https://raw.githubusercontent.com/ishatxt/ichess-coach/main/pic/iChess.jpeg" alt="iChess Coach" width="500">
</p>

# iChess Coach

A Chrome browser extension that acts as a real-time chess coach, injecting live analysis, voice commentary, and move classification into Chess.com, Lichess.org, and WorldChess.com.

## Features

- **Multi-Platform Support** — Works on Chess.com, Lichess.org, and WorldChess.com
- **Multiple Coach Personalities** — Standard coaches (David, Mae, Dante, Nadia) in 12 languages, plus celebrity coaches (Levy, Magnus, Hikaru, Anna, and more) in English
- **Real-Time Engine Analysis** — Runs Komodo and Stockfish/Torch chess engines locally via WebAssembly
- **Move Classification Icons** — Displays Brilliant, Great Find, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder, and Forced icons on the board
- **Live Accuracy Widget** — Tracks accuracy and estimated rating during game review
- **Voice Coaching** — Coach speaks explanations of moves via audio playback
- **Configurable Depth** — Analysis depth from 1 to 15 (default: 10) 

## Installation

1. Open **Google Chrome** and navigate to `chrome://extensions/`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the `ichess-coach` directory
5. The extension icon will appear in your toolbar

## Usage

1. Navigate to [Chess.com](https://www.chess.com), [Lichess.org](https://lichess.org), or [WorldChess.com](https://worldchess.com)
2. Click the extension icon to open the popup settings
3. Select a coach and language
4. Configure analysis depth, voice coaching, move classification icons, and accuracy widget
5. During a game or analysis, the coach provides real-time analysis and commentary

## Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript
- WebAssembly (Komodo, Stockfish/Torch chess engines)
- chess.js for move validation
- SweetAlert2 for modal UI
- Chrome Debugger Protocol for Lichess/WorldChess integration
- Chrome Storage API for configuration persistence
