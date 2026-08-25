const default_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
let squareTo = "";
let lastwidth = 9999;
const swalThemeCSS = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
    :root {
      --olive-vivid:   #7FB04A;
      --olive-bright:  #A8D66D;
      --olive-mid:     #5A8A30;
      --olive-border:  rgba(127,176,74,0.45);
      --bg-panel:      #10150D;
      --bg-deep:       #0B0D09;
      --bg-card:       #172014;
      --bg-hover:      #1C2618;
      --border-strong: #302B1E;
      --danger:        #B84A4A;
      --grey-fish:     #E8E3D4;
      --text-main:     #E8E3D4;
      --text-soft:     #A69F8D;
      --text-dim:      #6E6754;
      --font-mono:     'Space Mono', ui-monospace, monospace;
      --font-body:     'Space Mono', ui-monospace, monospace;
    }
    .swal2-popup.swal-rederic {
      font-family: var(--font-body) !important;
      background: var(--bg-panel) !important;
      background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 3px) !important;
      border: 2px solid var(--olive-mid) !important;
      border-radius: 0 !important;
      padding: 32px 28px 24px !important;
      box-shadow: 6px 6px 0 rgba(0,0,0,0.85), inset 0 0 0 2px var(--bg-deep) !important;
      max-width: 460px !important;
      width: 94% !important;
      position: relative;
    }
    .swal2-popup.swal-rederic::before {
      content: '';
      position: absolute;
      top: -2px; left: -2px; right: -2px;
      height: 4px;
      background: repeating-linear-gradient(90deg, var(--olive-vivid) 0 8px, transparent 8px 12px);
      border-radius: 0;
    }
    .swal2-popup.swal-rederic .swal2-title {
      font-family: var(--font-mono) !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      letter-spacing: 3px !important;
      text-transform: uppercase !important;
      color: var(--text-main) !important;
      text-shadow: 2px 2px 0 var(--bg-deep) !important;
    }
    .swal2-popup.swal-rederic .swal2-html-container {
      color: var(--text-soft) !important;
      font-size: 13px !important;
      line-height: 1.65 !important;
      margin: 0 !important;
    }
    .swal2-popup.swal-rederic .swal2-close {
      color: var(--text-dim) !important;
      font-size: 20px !important;
      border: 2px solid var(--border-strong) !important;
      border-radius: 0 !important;
      background: transparent !important;
      transition: all 0.1s steps(2,end) !important;
    }
    .swal2-popup.swal-rederic .swal2-close:hover {
      color: var(--danger) !important;
      border-color: var(--danger) !important;
      background: var(--bg-hover) !important;
    }
    .swal2-popup.swal-rederic .swal2-confirm,
    .swal2-popup.swal-rederic .swal2-cancel {
      font-family: var(--font-mono) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 1.5px !important;
      text-transform: uppercase !important;
      padding: 10px 24px !important;
      border-radius: 0 !important;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.85) !important;
      transition: all 0.1s steps(2,end) !important;
    }
    .swal2-popup.swal-rederic .swal2-confirm {
      background: var(--bg-card) !important;
      border: 2px solid var(--olive-vivid) !important;
      color: var(--olive-bright) !important;
    }
    .swal2-popup.swal-rederic .swal2-confirm:hover {
      transform: translate(-1px,-1px);
      box-shadow: 4px 4px 0 rgba(0,0,0,0.85) !important;
      background: var(--bg-hover) !important;
      color: #fff !important;
    }
    .swal2-popup.swal-rederic .swal2-confirm:active {
      transform: translate(2px,2px);
      box-shadow: 1px 1px 0 rgba(0,0,0,0.85) !important;
    }
    .swal2-popup.swal-rederic .swal2-cancel {
      background: var(--bg-panel) !important;
      border: 2px solid var(--border-strong) !important;
      color: var(--text-soft) !important;
    }
    .swal2-popup.swal-rederic .swal2-cancel:hover {
      transform: translate(-1px,-1px);
      box-shadow: 4px 4px 0 rgba(0,0,0,0.85) !important;
      background: var(--bg-hover) !important;
      color: var(--text-main) !important;
    }
    .swal2-popup.swal-rederic .swal2-cancel:active {
      transform: translate(2px,2px);
      box-shadow: 1px 1px 0 rgba(0,0,0,0.85) !important;
    }
    .swal2-popup.swal-rederic .swal2-actions {
      margin-top: 18px !important;
      gap: 10px !important;
    }
    .swal2-container.swal2-backdrop-show {
      background: rgba(5,6,4,0.78) !important;
      backdrop-filter: blur(2px) !important;
    }

    .chv3-loading-wrap {
      margin: 18px 0 8px;
    }
    .chv3-loading-label {
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-dim);
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .chv3-bar-track {
      width: 100%;
      height: 10px;
      background: var(--bg-deep);
      border-radius: 0;
      overflow: hidden;
      border: 2px solid var(--border-strong);
    }
    .chv3-bar-fill {
      height: 100%;
      width: 0%;
      background: repeating-linear-gradient(90deg, var(--olive-vivid) 0 8px, var(--olive-mid) 8px 16px);
      border-radius: 0;
      transition: width 0.35s steps(8,end);
    }
    .chv3-game-label {
      font-family: var(--font-mono);
      font-size: 9px;
      color: var(--text-dim);
      margin-top: 7px;
      min-height: 14px;
      text-align: left;
      letter-spacing: 0.5px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .stat-card {
      background: var(--bg-card);
      border: 2px solid var(--border-strong);
      border-radius: 0;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.6);
      padding: 13px 10px;
      text-align: center;
    }
    .stat-card .s-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-dim);
      display: block;
      margin-bottom: 5px;
    }
    .stat-card .s-value {
      font-family: var(--font-mono);
      font-size: 21px;
      font-weight: 700;
      color: var(--text-main);
      text-shadow: 2px 2px 0 var(--bg-deep);
    }
    .stat-card.s-win  .s-value { color: var(--olive-bright); }
    .stat-card.s-lost .s-value { color: var(--danger); }
    .stat-card.s-draw .s-value { color: #D6C85A; }
    .stat-card.s-acc  .s-value { color: var(--olive-vivid); }

    .safety-row {
      background: var(--bg-card);
      border: 2px solid var(--border-strong);
      border-radius: 0;
      box-shadow: 3px 3px 0 rgba(0,0,0,0.6);
      padding: 13px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .safety-row .s-label {
      font-family: var(--font-mono);
      font-size: 8px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-dim);
      display: block;
      margin-bottom: 4px;
    }
    .safety-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 5px 10px;
      border-radius: 0;
      border-width: 2px;
      border-style: solid;
    }
    .badge-legit   { background: rgba(127,176,74,0.15);  color: var(--olive-bright); border-color: var(--olive-mid); }
    .badge-sus     { background: rgba(184,74,74,0.15);   color: #CE7B7B; border-color: var(--danger); }
    .badge-cheater { background: rgba(166,159,141,0.12); color: var(--text-soft); border-color: var(--border-strong); }
    .dot { width: 7px; height: 7px; border-radius: 0; display: inline-block; }
    .dot-legit   { background: var(--olive-vivid); }
    .dot-sus     { background: var(--danger); }
    .dot-cheater { background: var(--text-soft); }

    .swal-footer-note {
      padding: 11px 14px;
      background: var(--bg-deep);
      border: 2px dashed var(--border-strong);
      border-radius: 0;
      font-family: var(--font-mono);
      font-size: 11px;
      line-height: 1.6;
      color: var(--text-soft);
      text-align: left;
      margin-bottom: 14px;
    }
    .swal-footer-note::before { content: '// '; color: var(--olive-vivid); font-weight: 700; }
    .swal-author {
      display: block;
      text-align: right;
      font-family: var(--font-mono);
      font-size: 9px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--text-dim);
    }
  </style>
`;
const audioLichess = new Audio();

// old code

let stat_0_white = {
  best: 0,
  blunder: 0,
  blunderGP0: 0,
  blunderGP1: 0,
  blunderGP2: 0,
  book: 0,
  brilliant: 0,
  excellent: 0,
  forced: 0,
  good: 1,
  greatFind: 0,
  inaccuracy: 0,
  inaccuracyGP0: 0,
  inaccuracyGP1: 0,
  inaccuracyGP2: 0,
  miss: 0,
  missGP0: 0,
  missGP1: 0,
  missGP2: 0,
  mistake: 0,
  mistakeGP0: 0,
  mistakeGP1: 0,
  mistakeGP2: 0,
};
let stat_0_black = {
  best: 0,
  blunder: 0,
  blunderGP0: 0,
  blunderGP1: 0,
  blunderGP2: 0,
  book: 0,
  brilliant: 0,
  excellent: 0,
  forced: 0,
  good: 1,
  greatFind: 0,
  inaccuracy: 0,
  inaccuracyGP0: 0,
  inaccuracyGP1: 0,
  inaccuracyGP2: 0,
  miss: 0,
  missGP0: 0,
  missGP1: 0,
  missGP2: 0,
  mistake: 0,
  mistakeGP0: 0,
  mistakeGP1: 0,
  mistakeGP2: 0,
};

const BOOKS = [];
let userName = null;
let lastClassification = null;
let moveIndex_ = 999;
let isGameOverFlag = true;
const chessComAudio = new Audio();
let lastFenForAnalyzis =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const coachs = [
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/en-US/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale en-US json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "fr_FR",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/fr-FR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale fr-FR json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "es_ES",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/es-ES/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale es-ES json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "ar_SA",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/ar-SA/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ar-SA json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "ru_RU",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/ru-RU/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ru-RU json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "pt_PT",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/pt-PT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pt-PT json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "de_DE",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/de-DE/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale de-DE json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "it_IT",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/it-IT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale it-IT json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "tr_TR",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/tr-TR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale tr-TR json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "pl_PL",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/pl-PL/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pl-PL json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "ko_KR",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/ko-KR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ko-KR json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "id_ID",
    link: "https://text-and-audio.chess.com/prod/released/David_coach/id-ID/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale id-ID json",
    asset: "coach-assets/David_coach.json",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/en-US/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale en-US json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "fr_FR",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/fr-FR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale fr-FR json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "es_ES",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/es-ES/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale es-ES json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "ar_SA",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/ar-SA/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ar-SA json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "ru_RU",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/ru-RU/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ru-RU json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "pt_PT",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/pt-PT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pt-PT json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "de_DE",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/de-DE/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale de-DE json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "it_IT",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/it-IT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale it-IT json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "tr_TR",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/tr-TR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale tr-TR json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "pl_PL",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/pl-PL/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pl-PL json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "ko_KR",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/ko-KR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ko-KR json",
    asset: "coach-assets/Mae_coach.json",
  },
  {
    lang: "id_ID",
    link: "https://text-and-audio.chess.com/prod/released/Mae_coach/id-ID/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale id-ID json",
    asset: "coach-assets/Mae_coach.json",
  },

  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/en-US/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale en-US json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "fr_FR",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/fr-FR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale fr-FR json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "es_ES",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/es-ES/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale es-ES json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "ar_SA",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/ar-SA/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ar-SA json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "ru_RU",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/ru-RU/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ru-RU json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "pt_PT",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/pt-PT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pt-PT json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "de_DE",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/de-DE/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale de-DE json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "it_IT",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/it-IT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale it-IT json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "tr_TR",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/tr-TR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale tr-TR json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "pl_PL",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/pl-PL/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pl-PL json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "ko_KR",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/ko-KR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ko-KR json",
    asset: "coach-assets/Dante_coach.json",
  },
  {
    lang: "id_ID",
    link: "https://text-and-audio.chess.com/prod/released/Dante_coach/id-ID/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale id-ID json",
    asset: "coach-assets/Dante_coach.json",
  },

  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/en-US/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale en-US json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "fr_FR",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/fr-FR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale fr-FR json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "es_ES",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/es-ES/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale es-ES json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "ar_SA",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/ar-SA/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ar-SA json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "ru_RU",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/ru-RU/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ru-RU json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "pt_PT",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/pt-PT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pt-PT json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "de_DE",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/de-DE/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale de-DE json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "it_IT",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/it-IT/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale it-IT json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "tr_TR",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/tr-TR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale tr-TR json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "pl_PL",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/pl-PL/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale pl-PL json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "ko_KR",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/ko-KR/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale ko-KR json",
    asset: "coach-assets/Nadia_coach.json",
  },
  {
    lang: "id_ID",
    link: "https://text-and-audio.chess.com/prod/released/Nadia_coach/id-ID/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale id-ID json",
    asset: "coach-assets/Nadia_coach.json",
  },

  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Levy_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Levy_coach locale en-US bzp",
    asset: "coach-assets/Levy_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Magnus_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Magnus_coach locale en-US bzp",
    asset: "coach-assets/Magnus_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Hikaru_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Hikaru_coach locale en-US bzp",
    asset: "coach-assets/Hikaru_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Anna_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Anna_coach locale en-US bzp",
    asset: "coach-assets/Anna_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Canty_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Canty_coach locale en-US bzp",
    asset: "coach-assets/Canty_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Anand_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Anand_coach locale en-US bzp",
    asset: "coach-assets/Anand_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Tania_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Tania_coach locale en-US bzp",
    asset: "coach-assets/Tania_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Danny_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Danny_coach locale en-US bzp",
    asset: "coach-assets/Danny_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Botez_coach/en-US/",
    prefix: "load-and-set-coach-asset text_id Generic_coach locale en-US json",
    asset: "coach-assets/Botez_coach.json",
    prefix: "fetch load-and-set-coach-asset text_id Botez_coach locale en-US bzp",
    asset: "coach-assets/Botez_coach.bzp",
  },
  {
    lang: "en_US",
    link: "https://text-and-audio.chess.com/prod/released/Ben_coach/en-US/",
    prefix: "fetch load-and-set-coach-asset text_id Ben_coach locale en-US bzp",
    asset: "coach-assets/Ben_coach.bzp",
  },
];

// Coach command payloads live in coach-assets/*.json|*.bzp and are fetched
// on demand so core.js stays small; promises are cached for the session.
const coachAssetCache = Object.create(null);
async function getCoachCmd(coach) {
  if (!coach.asset) return "";
  let pending = coachAssetCache[coach.asset];
  if (!pending) {
    pending = fetch(chrome.runtime.getURL(coach.asset)).then((r) => {
      if (!r.ok) throw new Error(`coach asset HTTP ${r.status}`);
      return r.text();
    });
    pending.catch(() => delete coachAssetCache[coach.asset]);
    coachAssetCache[coach.asset] = pending;
  }
  return `${coach.prefix} ${await pending}`;
}

const MoveClassification = {
  Brilliant: "brilliant",
  Great: "greatFind",
  Best: "best",
  Excellent: "excellent",
  Good: "good",
  Book: "book",
  Inaccuracy: "inaccuracy",
  Mistake: "mistake",
  Miss: "miss",
  Blunder: "blunder",
  Forced: "forced",
};

let lastUrl = window.location.pathname;

let debugEngine = false;

let url = window.location.href;
const classMoveClassification = "hint-svg";

// ─── Icon colour palettes (toggle with Alt+C) ──────────────────────────────
const CLASSIC_COLORS = { brilliant: "#26c2a3", great: "#749bbf" };
const RETRO_COLORS = { brilliant: "#b404bc", great: "#26c2a3" };
let useRetroIconColors = true;
const activePalette = () => (useRetroIconColors ? RETRO_COLORS : CLASSIC_COLORS);

const BrillantSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
  <path class="icon-shadow" opacity="0.3" d="M 8.966 0.092 C 2.038 0.092 -2.292 7.734 1.172 13.848 C 4.636 19.961 13.296 19.961 16.76 13.848 C 17.55 12.453 17.966 10.872 17.966 9.262 C 17.966 4.198 13.937 0.092 8.966 0.092 Z" style=""/>
  <path class="icon-background" fill="#b404bc" d="M 8.966 0.204 C 2.038 0.204 -2.292 7.704 1.172 13.704 C 3.016 16.898 6.333 18.392 9.555 18.185 C 12.385 18.003 15.14 16.51 16.76 13.704 C 17.55 12.336 17.966 10.784 17.966 9.204 C 17.966 4.233 13.937 0.204 8.966 0.204 Z" style="transform-box: fill-box; transform-origin: 50% 48.867%;"/>
  <g class="icon-component-shadow" opacity="0.2" transform="matrix(1, 0, 0, 1, -2.175313, -0.135957)">
    <path d="M12.57,14.6a.51.51,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0h-2l-.13,0L10,14.84A.41.41,0,0,1,10,14.6V12.7a.32.32,0,0,1,.09-.23.39.39,0,0,1,.1-.08l.13,0h2a.31.31,0,0,1,.24.1.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13Zm-.12-3.93a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H10.35a.31.31,0,0,1-.34-.31L9.86,3.9A.36.36,0,0,1,10,3.66a.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0H12.3a.32.32,0,0,1,.25.1.36.36,0,0,1,.09.24Z"/>
    <path d="M8.07,14.6a.51.51,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0h-2l-.13,0-.11-.08a.41.41,0,0,1-.08-.24V12.7a.27.27,0,0,1,0-.13.36.36,0,0,1,.07-.1.39.39,0,0,1,.1-.08l.13,0h2a.31.31,0,0,1,.24.1.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13ZM8,10.67a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H5.85a.31.31,0,0,1-.34-.31L5.36,3.9a.36.36,0,0,1,.09-.24.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0H7.8a.35.35,0,0,1,.25.1.36.36,0,0,1,.09.24Z"/>
  </g>
  <path class="icon-component" fill="#fff" d="M 5.975 14.373 C 5.981 14.416 5.981 14.46 5.975 14.503 C 5.955 14.544 5.928 14.581 5.895 14.613 L 5.785 14.693 L 5.655 14.693 L 3.655 14.693 L 3.525 14.693 L 3.405 14.613 C 3.381 14.535 3.381 14.451 3.405 14.373 L 3.405 12.473 C 3.384 12.408 3.384 12.338 3.405 12.273 C 3.434 12.241 3.468 12.214 3.505 12.193 L 3.635 12.193 L 5.635 12.193 C 5.726 12.19 5.814 12.226 5.875 12.293 C 5.907 12.322 5.934 12.356 5.955 12.393 C 5.961 12.436 5.961 12.48 5.955 12.523 L 5.975 14.373 Z M 5.855 10.443 C 5.87 10.482 5.87 10.524 5.855 10.563 C 5.838 10.603 5.814 10.64 5.785 10.673 C 5.719 10.723 5.638 10.751 5.555 10.753 L 3.755 10.753 C 3.573 10.771 3.414 10.627 3.415 10.443 L 3.265 3.673 C 3.278 3.578 3.328 3.491 3.405 3.433 C 3.433 3.396 3.471 3.368 3.515 3.353 C 3.558 3.342 3.603 3.342 3.645 3.353 L 5.705 3.353 C 5.799 3.348 5.891 3.385 5.955 3.453 C 6.014 3.519 6.046 3.605 6.045 3.693 L 5.855 10.443 Z" style="stroke-width: 1; transform-box: fill-box; transform-origin: 233.785% -29.0706%;"/>
  <path class="icon-component" fill="#fff" d="M 10.416 14.339 C 10.421 14.382 10.421 14.426 10.416 14.469 C 10.395 14.51 10.368 14.547 10.336 14.579 L 10.226 14.659 L 10.096 14.659 L 8.096 14.659 L 7.966 14.659 L 7.856 14.579 C 7.804 14.509 7.776 14.425 7.776 14.339 L 7.776 12.439 C 7.765 12.396 7.765 12.352 7.776 12.309 C 7.793 12.272 7.817 12.238 7.846 12.209 C 7.874 12.177 7.908 12.15 7.946 12.129 L 8.076 12.129 L 10.076 12.129 C 10.178 12.118 10.28 12.16 10.346 12.239 C 10.378 12.268 10.405 12.302 10.426 12.339 C 10.431 12.382 10.431 12.426 10.426 12.469 L 10.416 14.339 Z M 10.346 10.409 C 10.36 10.448 10.36 10.49 10.346 10.529 C 10.328 10.569 10.305 10.606 10.276 10.639 C 10.209 10.689 10.129 10.717 10.046 10.719 L 8.196 10.719 C 8.013 10.737 7.855 10.593 7.856 10.409 L 7.706 3.639 C 7.705 3.551 7.737 3.465 7.796 3.399 C 7.823 3.362 7.862 3.334 7.906 3.319 C 7.948 3.308 7.993 3.308 8.036 3.319 L 10.146 3.319 C 10.239 3.318 10.329 3.354 10.396 3.419 C 10.454 3.485 10.486 3.571 10.486 3.659 L 10.346 10.409 Z" style="stroke-width: 1; transform-box: fill-box; transform-origin: 429.863% -28.771%;"/>
  <path class="icon-component" fill="#fff" d="M 14.677 14.475 C 14.682 14.518 14.682 14.562 14.677 14.605 C 14.656 14.646 14.629 14.683 14.597 14.715 L 14.487 14.795 L 14.357 14.795 L 12.357 14.795 L 12.227 14.795 L 12.107 14.715 C 12.083 14.637 12.083 14.553 12.107 14.475 L 12.107 12.575 C 12.085 12.51 12.085 12.44 12.107 12.375 C 12.136 12.343 12.169 12.316 12.207 12.295 L 12.337 12.295 L 14.337 12.295 C 14.428 12.292 14.515 12.328 14.577 12.395 C 14.609 12.424 14.636 12.457 14.657 12.495 C 14.662 12.538 14.662 12.582 14.657 12.625 L 14.677 14.475 Z M 14.557 10.545 C 14.571 10.584 14.571 10.626 14.557 10.665 C 14.54 10.705 14.516 10.742 14.487 10.775 C 14.42 10.825 14.34 10.853 14.257 10.855 L 12.457 10.855 C 12.274 10.873 12.116 10.729 12.117 10.545 L 11.967 3.775 C 11.98 3.679 12.03 3.593 12.107 3.535 C 12.135 3.498 12.173 3.47 12.217 3.455 C 12.26 3.444 12.304 3.444 12.347 3.455 L 14.407 3.455 C 14.501 3.45 14.592 3.486 14.657 3.555 C 14.715 3.621 14.747 3.707 14.747 3.795 L 14.557 10.545 Z" style="stroke-width: 1; transform-box: fill-box; transform-origin: 61.3767% -31.767%;"/>
</svg>`;

const forcedSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="forced">
    <g id="fast_win">
      <g>
        <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
        <path class="icon-background" fill="#96af8b" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
      </g>
    </g>
    <g class="icon-component-shadow" opacity="0.2">
      <path d="M14.39,9.07,9,4.31a.31.31,0,0,0-.3,0,.32.32,0,0,0-.13.1.29.29,0,0,0,0,.16V7.42H3.9a.58.58,0,0,0-.19,0,.5.5,0,0,0-.17.11.91.91,0,0,0-.11.16.63.63,0,0,0,0,.19v3.41a.58.58,0,0,0,0,.19.64.64,0,0,0,.11.16.39.39,0,0,0,.17.11.41.41,0,0,0,.19,0H8.5v2.74a.26.26,0,0,0,.16.26.3.3,0,0,0,.16,0A.34.34,0,0,0,9,14.79L14.39,10a.69.69,0,0,0,.16-.22.7.7,0,0,0,0-.52A.69.69,0,0,0,14.39,9.07Z"></path>
    </g>
    <path class="icon-component" fill="#fff" d="M14.39,8.57,9,3.81a.31.31,0,0,0-.3,0,.32.32,0,0,0-.13.1A.29.29,0,0,0,8.5,4V6.92H3.9a.58.58,0,0,0-.19,0,.5.5,0,0,0-.17.11.91.91,0,0,0-.11.16.63.63,0,0,0,0,.19v3.41a.58.58,0,0,0,0,.19.64.64,0,0,0,.11.16.39.39,0,0,0,.17.11.41.41,0,0,0,.19,0H8.5v2.74a.26.26,0,0,0,.16.26.3.3,0,0,0,.16,0A.34.34,0,0,0,9,14.29l5.42-4.76a.69.69,0,0,0,.16-.22.7.7,0,0,0,0-.52A.69.69,0,0,0,14.39,8.57Z"></path>
  </g>
    </svg>`;

const greatMoveSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="great_find">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#26C2A3" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g>
      <g class="icon-component-shadow" opacity="0.2">
        <path d="M10.32,14.6a.27.27,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0H8l-.13,0-.11-.08a.41.41,0,0,1-.08-.24V12.7a.27.27,0,0,1,0-.13.36.36,0,0,1,.07-.1.39.39,0,0,1,.1-.08l.13,0h2a.31.31,0,0,1,.24.1.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13Zm-.12-3.93a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H8.1a.31.31,0,0,1-.34-.31L7.61,3.9a.36.36,0,0,1,.09-.24.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0h2.11a.32.32,0,0,1,.25.1.36.36,0,0,1,.09.24Z"></path>
      </g>
      <path class="icon-component" fill="#fff" d="M10.32,14.1a.27.27,0,0,1,0,.13.44.44,0,0,1-.08.11l-.11.08-.13,0H8l-.13,0-.11-.08a.41.41,0,0,1-.08-.24V12.2a.27.27,0,0,1,0-.13.36.36,0,0,1,.07-.1.39.39,0,0,1,.1-.08l.13,0h2a.31.31,0,0,1,.24.1.39.39,0,0,1,.08.1.51.51,0,0,1,0,.13Zm-.12-3.93a.17.17,0,0,1,0,.12.41.41,0,0,1-.07.11.4.4,0,0,1-.23.08H8.1a.31.31,0,0,1-.34-.31L7.61,3.4a.36.36,0,0,1,.09-.24.23.23,0,0,1,.11-.08.27.27,0,0,1,.13,0h2.11a.32.32,0,0,1,.25.1.36.36,0,0,1,.09.24Z"></path>
    </g>
  </g>
    </svg>`;

const bookSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="book">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#D5A47D" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g>
      <path class="icon-component-shadow" opacity="0.3" isolation="isolate" d="M8.45,5.9c-1-.75-2.51-1.09-4.83-1.09H2.54v8.71H3.62a8.16,8.16,0,0,1,4.83,1.17Z"></path>
      <path class="icon-component-shadow" opacity="0.3" isolation="isolate" d="M9.54,14.69a8.14,8.14,0,0,1,4.84-1.17h1.08V4.81H14.38c-2.31,0-3.81.34-4.84,1.09Z"></path>
      <path class="icon-component" fill="#fff" d="M8.45,5.4c-1-.75-2.51-1.09-4.83-1.09H3V13h.58a8.09,8.09,0,0,1,4.83,1.17Z"></path>
      <path class="icon-component" fill="#fff" d="M9.54,14.19A8.14,8.14,0,0,1,14.38,13H15V4.31h-.58c-2.31,0-3.81.34-4.84,1.09Z"></path>
    </g>
  </g>
    </svg>`;

const bestMoveSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="best">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#81B64C" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <path class="icon-component-shadow" opacity="0.2" d="M9,3.43a.5.5,0,0,0-.27.08.46.46,0,0,0-.17.22L7.24,7.17l-3.68.19a.52.52,0,0,0-.26.1.53.53,0,0,0-.16.23.45.45,0,0,0,0,.28.44.44,0,0,0,.15.23l2.86,2.32-1,3.56a.45.45,0,0,0,0,.28.46.46,0,0,0,.17.22.41.41,0,0,0,.26.09.43.43,0,0,0,.27-.08l3.09-2,3.09,2a.46.46,0,0,0,.53,0,.46.46,0,0,0,.17-.22.53.53,0,0,0,0-.28l-1-3.56L14.71,8.2A.44.44,0,0,0,14.86,8a.45.45,0,0,0,0-.28.53.53,0,0,0-.16-.23.52.52,0,0,0-.26-.1l-3.68-.2L9.44,3.73a.46.46,0,0,0-.17-.22A.5.5,0,0,0,9,3.43Z"></path>
    <path class="icon-component" fill="#fff" d="M9,2.93A.5.5,0,0,0,8.73,3a.46.46,0,0,0-.17.22L7.24,6.67l-3.68.19A.52.52,0,0,0,3.3,7a.53.53,0,0,0-.16.23.45.45,0,0,0,0,.28.44.44,0,0,0,.15.23L6.15,10l-1,3.56a.45.45,0,0,0,0,.28.46.46,0,0,0,.17.22.41.41,0,0,0,.26.09.43.43,0,0,0,.27-.08l3.09-2,3.09,2a.46.46,0,0,0,.53,0,.46.46,0,0,0,.17-.22.53.53,0,0,0,0-.28l-1-3.56L14.71,7.7a.44.44,0,0,0,.15-.23.45.45,0,0,0,0-.28A.53.53,0,0,0,14.7,7a.52.52,0,0,0-.26-.1l-3.68-.2L9.44,3.23A.46.46,0,0,0,9.27,3,.5.5,0,0,0,9,2.93Z"></path>
  </g>
    </svg>`;

const excellentMoveSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="excellent">
    <g>
      <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
      <path class="icon-background" fill="#81B64C" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    </g>
    <g class="icon-component-shadow" opacity="0.2">
      <path d="M13.79,11.34c0-.2.4-.53.4-.94S14,9.72,14,9.58a2.06,2.06,0,0,0,.18-.83,1,1,0,0,0-.3-.69,1.13,1.13,0,0,0-.55-.2,10.29,10.29,0,0,1-2.07,0c-.37-.23,0-1.18.18-1.7S11.9,4,10.62,3.7c-.69-.17-.66.37-.78.9-.05.21-.09.43-.13.57A5,5,0,0,1,7.05,8.23a1.57,1.57,0,0,1-.42.18v4.94A7.23,7.23,0,0,1,8,13.53c.52.12.91.25,1.44.33A11.11,11.11,0,0,0,11,14a6.65,6.65,0,0,0,1.18,0,1.09,1.09,0,0,0,1-.59.66.66,0,0,0,.06-.2,1.63,1.63,0,0,1,.07-.3c.13-.28.37-.3.5-.68S13.74,11.53,13.79,11.34Z"></path>
      <path d="M5.49,8.09H4.31a.5.5,0,0,0-.5.5v4.56a.5.5,0,0,0,.5.5H5.49a.5.5,0,0,0,.5-.5V8.59A.5.5,0,0,0,5.49,8.09Z"></path>
    </g>
    <g>
      <path class="icon-component" fill="#fff" d="M13.79,10.84c0-.2.4-.53.4-.94S14,9.22,14,9.08a2.06,2.06,0,0,0,.18-.83,1,1,0,0,0-.3-.69,1.13,1.13,0,0,0-.55-.2,10.29,10.29,0,0,1-2.07,0c-.37-.23,0-1.18.18-1.7s.51-2.12-.77-2.43c-.69-.17-.66.37-.78.9-.05.21-.09.43-.13.57A5,5,0,0,1,7.05,7.73a1.57,1.57,0,0,1-.42.18v4.94A7.23,7.23,0,0,1,8,13c.52.12.91.25,1.44.33a11.11,11.11,0,0,0,1.62.16,6.65,6.65,0,0,0,1.18,0,1.09,1.09,0,0,0,1-.59.66.66,0,0,0,.06-.2,1.63,1.63,0,0,1,.07-.3c.13-.28.37-.3.5-.68S13.74,11,13.79,10.84Z"></path>
      <path class="icon-component" fill="#fff" d="M5.49,7.59H4.31a.5.5,0,0,0-.5.5v4.56a.5.5,0,0,0,.5.5H5.49a.5.5,0,0,0,.5-.5V8.09A.5.5,0,0,0,5.49,7.59Z"></path>
    </g>
  </g>
    </svg>`;

const goodMoveSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="good">
    <g>
      <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
      <path class="icon-background" fill="#95b776" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    </g>
    <g>
      <path class="icon-component-shadow" opacity="0.2" d="M15.11,6.81,9.45,12.47,7.79,14.13a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.78a.39.39,0,0,1-.11-.28.39.39,0,0,1,.11-.27L4.28,7.85a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09l2.69,2.68,5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.81Z"></path>
      <path class="icon-component" fill="#fff" d="M15.11,6.31,9.45,12,7.79,13.63a.39.39,0,0,1-.28.11.39.39,0,0,1-.27-.11L2.89,9.28A.39.39,0,0,1,2.78,9a.39.39,0,0,1,.11-.27L4.28,7.35a.34.34,0,0,1,.12-.09l.15,0a.37.37,0,0,1,.15,0,.38.38,0,0,1,.13.09L7.52,10l5.65-5.65a.38.38,0,0,1,.13-.09.37.37,0,0,1,.15,0,.4.4,0,0,1,.15,0,.34.34,0,0,1,.12.09l1.39,1.38a.41.41,0,0,1,.08.13.33.33,0,0,1,0,.15.4.4,0,0,1,0,.15A.5.5,0,0,1,15.11,6.31Z"></path>
    </g>
  </g>
    </svg>`;

const inaccuracyMoveSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="inaccuracy">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#F7C631" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g class="icon-component-shadow" opacity="0.2">
      <path d="M13.66,14.8a.28.28,0,0,1,0,.13.23.23,0,0,1-.08.11.28.28,0,0,1-.11.08l-.12,0h-2l-.13,0a.27.27,0,0,1-.1-.08A.36.36,0,0,1,11,14.8V12.9a.59.59,0,0,1,0-.13.36.36,0,0,1,.07-.1l.1-.08.13,0h2a.33.33,0,0,1,.23.1.39.39,0,0,1,.08.1.28.28,0,0,1,0,.13Zm-.12-3.93a.31.31,0,0,1,0,.13.3.3,0,0,1-.07.1.3.3,0,0,1-.23.08H11.43a.31.31,0,0,1-.34-.31L10.94,4.1A.5.5,0,0,1,11,3.86l.11-.08.13,0h2.11a.35.35,0,0,1,.26.1.41.41,0,0,1,.08.24Z"></path>
      <path d="M7.65,14.82a.27.27,0,0,1,0,.12.26.26,0,0,1-.07.11l-.1.07-.13,0H5.43a.25.25,0,0,1-.12,0,.27.27,0,0,1-.1-.08.31.31,0,0,1-.09-.22V13a.36.36,0,0,1,.09-.23l.1-.07.12,0H7.32a.32.32,0,0,1,.23.09.3.3,0,0,1,.07.1.28.28,0,0,1,0,.13Zm2.2-7.17a3.1,3.1,0,0,1-.36.73A5.58,5.58,0,0,1,9,9a4.85,4.85,0,0,1-.52.49,8,8,0,0,0-.65.63,1,1,0,0,0-.27.7V11a.21.21,0,0,1,0,.12.17.17,0,0,1-.06.1.23.23,0,0,1-.1.07l-.12,0H5.53a.21.21,0,0,1-.12,0,.18.18,0,0,1-.1-.07.2.2,0,0,1-.08-.1.37.37,0,0,1,0-.12v-.35a2.68,2.68,0,0,1,.13-.84,2.91,2.91,0,0,1,.33-.66,3.38,3.38,0,0,1,.45-.55c.16-.15.33-.29.49-.42a7.84,7.84,0,0,0,.65-.64,1,1,0,0,0,.25-.67.77.77,0,0,0-.07-.34.67.67,0,0,0-.23-.27A1.16,1.16,0,0,0,6.49,6,1.61,1.61,0,0,0,6,6.11a3,3,0,0,0-.41.18,1.75,1.75,0,0,0-.29.18l-.11.09A.5.5,0,0,1,5,6.62a.31.31,0,0,1-.21-.13l-1-1.21a.3.3,0,0,1,0-.4A1.36,1.36,0,0,1,4,4.68a3.07,3.07,0,0,1,.56-.38,5.49,5.49,0,0,1,.9-.37,3.69,3.69,0,0,1,1.19-.17,3.92,3.92,0,0,1,2.3.75,2.85,2.85,0,0,1,.77.92A2.82,2.82,0,0,1,10,6.71,3,3,0,0,1,9.85,7.65Z"></path>
    </g>
    <g>
      <path class="icon-component" fill="#fff" d="M13.66,14.3a.28.28,0,0,1,0,.13.23.23,0,0,1-.08.11.28.28,0,0,1-.11.08l-.12,0h-2l-.13,0a.27.27,0,0,1-.1-.08A.36.36,0,0,1,11,14.3V12.4a.59.59,0,0,1,0-.13.36.36,0,0,1,.07-.1l.1-.08.13,0h2a.33.33,0,0,1,.23.1.39.39,0,0,1,.08.1.28.28,0,0,1,0,.13Zm-.12-3.93a.31.31,0,0,1,0,.13.3.3,0,0,1-.07.1.3.3,0,0,1-.23.08H11.43a.31.31,0,0,1-.34-.31L10.94,3.6A.5.5,0,0,1,11,3.36l.11-.08.13,0h2.11a.35.35,0,0,1,.26.1.41.41,0,0,1,.08.24Z"></path>
      <path class="icon-component" fill="#fff" d="M7.65,14.32a.27.27,0,0,1,0,.12.26.26,0,0,1-.07.11l-.1.07-.13,0H5.43a.25.25,0,0,1-.12,0,.27.27,0,0,1-.1-.08.31.31,0,0,1-.09-.22V12.49a.36.36,0,0,1,.09-.23l.1-.07.12,0H7.32a.32.32,0,0,1,.23.09.3.3,0,0,1,.07.1.28.28,0,0,1,0,.13Zm2.2-7.17a3.1,3.1,0,0,1-.36.73,5.58,5.58,0,0,1-.49.6A4.85,4.85,0,0,1,8.48,9a8,8,0,0,0-.65.63,1,1,0,0,0-.27.7v.22a.21.21,0,0,1,0,.12.17.17,0,0,1-.06.1.23.23,0,0,1-.1.07l-.12,0H5.53a.21.21,0,0,1-.12,0,.18.18,0,0,1-.1-.07.2.2,0,0,1-.08-.1.37.37,0,0,1,0-.12v-.35a2.68,2.68,0,0,1,.13-.84,2.91,2.91,0,0,1,.33-.66,3.38,3.38,0,0,1,.45-.55c.16-.15.33-.29.49-.42a7.84,7.84,0,0,0,.65-.64,1,1,0,0,0,.25-.67.77.77,0,0,0-.07-.34.67.67,0,0,0-.23-.27,1.16,1.16,0,0,0-.72-.24A1.61,1.61,0,0,0,6,5.61a3,3,0,0,0-.41.18A1.75,1.75,0,0,0,5.3,6l-.11.09A.5.5,0,0,1,5,6.12.31.31,0,0,1,4.74,6l-1-1.21a.3.3,0,0,1,0-.4A1.36,1.36,0,0,1,4,4.18a3.07,3.07,0,0,1,.56-.38,5.49,5.49,0,0,1,.9-.37,3.69,3.69,0,0,1,1.19-.17A3.92,3.92,0,0,1,8.93,4a2.85,2.85,0,0,1,.77.92A2.82,2.82,0,0,1,10,6.21,3,3,0,0,1,9.85,7.15Z"></path>
    </g>
  </g>
    </svg>`;

const mistakeSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="mistake">
    <g>
      <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
      <path class="icon-background" fill="#FFA459" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    </g>
    <g>
      <g class="icon-component-shadow" opacity="0.2">
        <path d="M9.92,15a.27.27,0,0,1,0,.12.41.41,0,0,1-.07.11.32.32,0,0,1-.23.09H7.7a.25.25,0,0,1-.12,0,.27.27,0,0,1-.1-.08A.31.31,0,0,1,7.39,15V13.19A.32.32,0,0,1,7.48,13l.1-.07.12,0H9.59a.32.32,0,0,1,.23.09.61.61,0,0,1,.07.1.28.28,0,0,1,0,.13Zm2.2-7.17a3.1,3.1,0,0,1-.36.73,5.58,5.58,0,0,1-.49.6,6,6,0,0,1-.52.49,8,8,0,0,0-.65.63,1,1,0,0,0-.27.7v.22a.24.24,0,0,1,0,.12.17.17,0,0,1-.06.1.3.3,0,0,1-.1.07l-.12,0H7.79l-.12,0a.3.3,0,0,1-.1-.07.26.26,0,0,1-.07-.1.37.37,0,0,1,0-.12v-.35A2.42,2.42,0,0,1,7.61,10a2.55,2.55,0,0,1,.33-.66,3.38,3.38,0,0,1,.45-.55c.16-.15.33-.29.49-.42a7.73,7.73,0,0,0,.64-.64,1,1,0,0,0,.26-.67.77.77,0,0,0-.07-.34.75.75,0,0,0-.23-.27,1.16,1.16,0,0,0-.72-.24,1.61,1.61,0,0,0-.49.07,3,3,0,0,0-.41.18,1.41,1.41,0,0,0-.29.18l-.11.09a.5.5,0,0,1-.24.06A.31.31,0,0,1,7,6.69L6,5.48a.29.29,0,0,1,0-.4,1.36,1.36,0,0,1,.21-.2,3.07,3.07,0,0,1,.56-.38,5.38,5.38,0,0,1,.89-.37A3.75,3.75,0,0,1,8.9,4a4.07,4.07,0,0,1,1.2.19,4,4,0,0,1,1.09.56,2.76,2.76,0,0,1,.78.92,2.82,2.82,0,0,1,.28,1.28A3,3,0,0,1,12.12,7.85Z"></path>
      </g>
      <path class="icon-component" fill="#fff" d="M9.92,14.52a.27.27,0,0,1,0,.12.41.41,0,0,1-.07.11.32.32,0,0,1-.23.09H7.7a.25.25,0,0,1-.12,0,.27.27,0,0,1-.1-.08.31.31,0,0,1-.09-.22V12.69a.32.32,0,0,1,.09-.23l.1-.07.12,0H9.59a.32.32,0,0,1,.23.09.61.61,0,0,1,.07.1.28.28,0,0,1,0,.13Zm2.2-7.17a3.1,3.1,0,0,1-.36.73,5.58,5.58,0,0,1-.49.6,6,6,0,0,1-.52.49,8,8,0,0,0-.65.63,1,1,0,0,0-.27.7v.22a.24.24,0,0,1,0,.12.17.17,0,0,1-.06.1.3.3,0,0,1-.1.07l-.12,0H7.79l-.12,0a.3.3,0,0,1-.1-.07.26.26,0,0,1-.07-.1.37.37,0,0,1,0-.12v-.35a2.42,2.42,0,0,1,.13-.84,2.55,2.55,0,0,1,.33-.66,3.38,3.38,0,0,1,.45-.55c.16-.15.33-.29.49-.42a7.73,7.73,0,0,0,.64-.64,1,1,0,0,0,.26-.67.77.77,0,0,0-.07-.34A.75.75,0,0,0,9.48,6a1.16,1.16,0,0,0-.72-.24,1.61,1.61,0,0,0-.49.07A3,3,0,0,0,7.86,6a1.41,1.41,0,0,0-.29.18l-.11.09a.5.5,0,0,1-.24.06A.31.31,0,0,1,7,6.19L6,5a.29.29,0,0,1,0-.4,1.36,1.36,0,0,1,.21-.2A3.07,3.07,0,0,1,6.81,4a5.38,5.38,0,0,1,.89-.37,3.75,3.75,0,0,1,1.2-.17,4.07,4.07,0,0,1,1.2.19,4,4,0,0,1,1.09.56,2.76,2.76,0,0,1,.78.92,2.82,2.82,0,0,1,.28,1.28A3,3,0,0,1,12.12,7.35Z"></path>
    </g>
  </g>
    </svg>`;

const missSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
  <path class="icon-background" fill="#FF7769" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
      <defs><style>.cls-1{fill:#f1f2f2;}.cls-2{fill:#FF7769;}.cls-3{opacity:.2;}.cls-4{opacity:.3;}</style></defs><g id="incorrect"><path class="cls-4" d="M9,.5C4.03,.5,0,4.53,0,9.5s4.03,9,9,9,9-4.03,9-9S13.97,.5,9,.5Z"></path><path class="cls-2" d="M9,0C4.03,0,0,4.03,0,9s4.03,9,9,9,9-4.03,9-9S13.97,0,9,0Z"></path><g class="cls-3"><path d="M13.99,12.51s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"></path></g><path class="cls-1" d="M13.99,12.01s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-1.37,1.37s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-3.06-3.06-3.06,3.06s-.08,.06-.13,.08c-.05,.02-.1,.03-.15,.03s-.1-.01-.15-.03c-.05-.02-.09-.05-.13-.08l-1.37-1.37c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l3.06-3.06-3.06-3.06c-.07-.07-.11-.17-.11-.28s.04-.2,.11-.28l1.37-1.37c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l3.06,3.06,3.06-3.06c.07-.07,.17-.11,.28-.11s.2,.04,.28,.11l1.37,1.37s.06,.08,.08,.13c.02,.05,.03,.1,.03,.15s-.01,.1-.03,.15c-.02,.05-.05,.09-.08,.13l-3.06,3.06,3.06,3.06Z"></path></g>
    </svg>`;

const blunderSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="${classMoveClassification}" width="24" height="24" viewBox="0 0 18 19">
      <g id="blunder">
    <path class="icon-shadow" opacity="0.3" d="M9,.5a9,9,0,1,0,9,9A9,9,0,0,0,9,.5Z"></path>
    <path class="icon-background" fill="#FA412D" d="M9,0a9,9,0,1,0,9,9A9,9,0,0,0,9,0Z"></path>
    <g class="icon-component-shadow" opacity="0.2">
      <path d="M14.74,5.45A2.58,2.58,0,0,0,14,4.54,3.76,3.76,0,0,0,12.89,4a4.07,4.07,0,0,0-1.2-.19A3.92,3.92,0,0,0,10.51,4a5.87,5.87,0,0,0-.9.37,3,3,0,0,0-.32.2,3.46,3.46,0,0,1,.42.63,3.29,3.29,0,0,1,.36,1.47.31.31,0,0,0,.19-.06l.11-.08a2.9,2.9,0,0,1,.29-.19,3.89,3.89,0,0,1,.41-.17,1.55,1.55,0,0,1,.48-.07,1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26.8.8,0,0,1,.07.34,1,1,0,0,1-.25.67,7.71,7.71,0,0,1-.65.63,6.2,6.2,0,0,0-.48.43,2.93,2.93,0,0,0-.45.54,2.55,2.55,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83V11a.24.24,0,0,0,0,.12.35.35,0,0,0,.17.17l.12,0h1.71l.12,0a.23.23,0,0,0,.1-.07.21.21,0,0,0,.06-.1.27.27,0,0,0,0-.12V10.8a1,1,0,0,1,.26-.7q.27-.28.66-.63A5.79,5.79,0,0,0,14.05,9a4.51,4.51,0,0,0,.48-.6,2.56,2.56,0,0,0,.36-.72,2.81,2.81,0,0,0,.14-1A2.66,2.66,0,0,0,14.74,5.45Z"></path>
      <path d="M12.38,12.65H10.5l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0h1.88a.24.24,0,0,0,.12,0,.26.26,0,0,0,.11-.07.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V13a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,12.38,12.65Z"></path>
      <path d="M6.79,12.65H4.91l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0H6.79a.24.24,0,0,0,.12,0A.26.26,0,0,0,7,15a.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V13a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,6.79,12.65Z"></path>
      <path d="M8.39,4.54A3.76,3.76,0,0,0,7.3,4a4.07,4.07,0,0,0-1.2-.19A3.92,3.92,0,0,0,4.92,4a5.87,5.87,0,0,0-.9.37,3.37,3.37,0,0,0-.55.38l-.21.19a.32.32,0,0,0,0,.41l1,1.2a.26.26,0,0,0,.2.12.48.48,0,0,0,.24-.06l.11-.08a2.9,2.9,0,0,1,.29-.19l.4-.17A1.66,1.66,0,0,1,6,6.06a1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26A.77.77,0,0,1,7,6.9a1,1,0,0,1-.26.67,7.6,7.6,0,0,1-.64.63,6.28,6.28,0,0,0-.49.43,2.93,2.93,0,0,0-.45.54,2.72,2.72,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83V11a.43.43,0,0,0,0,.12.39.39,0,0,0,.08.1.18.18,0,0,0,.1.07.21.21,0,0,0,.12,0H6.72l.12,0a.23.23,0,0,0,.1-.07.36.36,0,0,0,.07-.1A.5.5,0,0,0,7,11V10.8a1,1,0,0,1,.27-.7A8,8,0,0,1,8,9.47c.18-.15.35-.31.52-.48A7,7,0,0,0,9,8.39a3.23,3.23,0,0,0,.36-.72,3.07,3.07,0,0,0,.13-1,2.66,2.66,0,0,0-.29-1.27A2.58,2.58,0,0,0,8.39,4.54Z"></path>
    </g>
    <g>
      <path class="icon-component" fill="#fff" d="M14.74,5A2.58,2.58,0,0,0,14,4a3.76,3.76,0,0,0-1.09-.56,4.07,4.07,0,0,0-1.2-.19,3.92,3.92,0,0,0-1.18.17,5.87,5.87,0,0,0-.9.37,3,3,0,0,0-.32.2,3.46,3.46,0,0,1,.42.63,3.29,3.29,0,0,1,.36,1.47.31.31,0,0,0,.19-.06L10.37,6a2.9,2.9,0,0,1,.29-.19,3.89,3.89,0,0,1,.41-.17,1.55,1.55,0,0,1,.48-.07,1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26.8.8,0,0,1,.07.34,1,1,0,0,1-.25.67,7.71,7.71,0,0,1-.65.63,6.2,6.2,0,0,0-.48.43,2.93,2.93,0,0,0-.45.54,2.55,2.55,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83v.35a.24.24,0,0,0,0,.12.35.35,0,0,0,.17.17l.12,0h1.71l.12,0a.23.23,0,0,0,.1-.07.21.21,0,0,0,.06-.1.27.27,0,0,0,0-.12V10.3a1,1,0,0,1,.26-.7q.27-.28.66-.63a5.79,5.79,0,0,0,.51-.48,4.51,4.51,0,0,0,.48-.6,2.56,2.56,0,0,0,.36-.72,2.81,2.81,0,0,0,.14-1A2.66,2.66,0,0,0,14.74,5Z"></path>
      <path class="icon-component" fill="#fff" d="M12.38,12.15H10.5l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0h1.88a.24.24,0,0,0,.12,0,.26.26,0,0,0,.11-.07.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V12.46a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,12.38,12.15Z"></path>
      <path class="icon-component" fill="#fff" d="M6.79,12.15H4.91l-.12,0a.34.34,0,0,0-.18.29v1.82a.36.36,0,0,0,.08.23.23.23,0,0,0,.1.07l.12,0H6.79a.24.24,0,0,0,.12,0A.26.26,0,0,0,7,14.51a.36.36,0,0,0,.07-.1.28.28,0,0,0,0-.13V12.46a.27.27,0,0,0,0-.12.61.61,0,0,0-.07-.1A.32.32,0,0,0,6.79,12.15Z"></path>
      <path class="icon-component" fill="#fff" d="M8.39,4A3.76,3.76,0,0,0,7.3,3.48a4.07,4.07,0,0,0-1.2-.19,3.92,3.92,0,0,0-1.18.17,5.87,5.87,0,0,0-.9.37,3.37,3.37,0,0,0-.55.38l-.21.19a.32.32,0,0,0,0,.41l1,1.2a.26.26,0,0,0,.2.12.48.48,0,0,0,.24-.06L4.78,6a2.9,2.9,0,0,1,.29-.19l.4-.17A1.66,1.66,0,0,1,6,5.56a1.1,1.1,0,0,1,.72.24.72.72,0,0,1,.23.26A.77.77,0,0,1,7,6.4a1,1,0,0,1-.26.67,7.6,7.6,0,0,1-.64.63,6.28,6.28,0,0,0-.49.43,2.93,2.93,0,0,0-.45.54,2.72,2.72,0,0,0-.33.66,2.62,2.62,0,0,0-.13.83v.35a.43.43,0,0,0,0,.12.39.39,0,0,0,.08.1.18.18,0,0,0,.1.07.21.21,0,0,0,.12,0H6.72l.12,0a.23.23,0,0,0,.1-.07.36.36,0,0,0,.07-.1.5.5,0,0,0,0-.12V10.3a1,1,0,0,1,.27-.7A8,8,0,0,1,8,9c.18-.15.35-.31.52-.48A7,7,0,0,0,9,7.89a3.23,3.23,0,0,0,.36-.72,3.07,3.07,0,0,0,.13-1A2.66,2.66,0,0,0,9.15,5,2.58,2.58,0,0,0,8.39,4Z"></path>
    </g>
  </g>
    </svg>`;

const classificationSVG = {
  [MoveClassification.Best]: bestMoveSVG,
  [MoveClassification.Blunder]: blunderSVG,
  [MoveClassification.Book]: bookSVG,
  [MoveClassification.Brilliant]: BrillantSVG,
  [MoveClassification.Excellent]: excellentMoveSVG,
  [MoveClassification.Forced]: forcedSVG,
  [MoveClassification.Good]: goodMoveSVG,
  [MoveClassification.Great]: greatMoveSVG,
  [MoveClassification.Inaccuracy]: inaccuracyMoveSVG,
  [MoveClassification.Miss]: missSVG,
  [MoveClassification.Mistake]: mistakeSVG,
};

function applyIconPalette() {
  const p = activePalette();
  const swap = (svgStr, hex) =>
    svgStr.replace(/(<path class="icon-background" fill=")[^"]*(")/, `$1${hex}$2`);
  classificationSVG[MoveClassification.Brilliant] = swap(BrillantSVG, p.brilliant);
  classificationSVG[MoveClassification.Great] = swap(greatMoveSVG, p.great);
}
applyIconPalette();

window.addEventListener("keydown", (e) => {
  if (!e.altKey || e.code !== "KeyC") return;
  const t = e.target;
  if (
    t &&
    (t.tagName === "INPUT" ||
      t.tagName === "TEXTAREA" ||
      t.isContentEditable)
  ) {
    return;
  }
  useRetroIconColors = !useRetroIconColors;
  applyIconPalette();

  const toast = document.createElement("div");
  toast.textContent = useRetroIconColors ? "RETRO COLORS ON" : "CLASSIC COLORS";
  toast.style.cssText =
    "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);" +
    "z-index:2147483647;padding:8px 18px;background:#10150D;color:#A8D66D;" +
    "border:2px solid #5A8A30;box-shadow:4px 4px 0 rgba(0,0,0,.85);" +
    'font-family:"Space Mono",monospace;font-size:11px;letter-spacing:2px;';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1400);
});

const classificationColor = {
  [MoveClassification.Best]: "#A8D66D",
  [MoveClassification.Excellent]: "#7FB04A",
  [MoveClassification.Good]: "#95B776",
  [MoveClassification.Great]: "#26C2A3",
  [MoveClassification.Brilliant]: "#B404BC",
  [MoveClassification.Book]: "#D5A47D",
  [MoveClassification.Forced]: "#96AF8B",

  [MoveClassification.Inaccuracy]: "#D6C85A",
  [MoveClassification.Mistake]: "#C98A3C",
  [MoveClassification.Blunder]: "#B84A4A",
  [MoveClassification.Miss]: "#B85E5E",
};

const chess2 = new Chess();

function getMoveFromFEN(fenBefore, fenAfter) {
  chess2.load(fenBefore);
  const moves = chess2.moves({ verbose: true });
  for (const move of moves) {
    chess2.move(move);
    if (chess2.fen() === fenAfter) {
      chess2.load(fenBefore);
      return move;
    }
    chess2.undo();
  }
  return null;
}

function placeSVGOnBoard(side, square, svgCode) {
  const board =
    document.querySelector("wc-chess-board") ||
    document.querySelector("cg-board").parentElement;

  if (!board) {
    console.log("no board");
    return;
  }

  const wrapperTmp = document.createElement("div");
  wrapperTmp.innerHTML = svgCode;

  let detectedColor = null;

  const bg = wrapperTmp.querySelector(".icon-background");
  if (bg) {
    detectedColor = bg.getAttribute("fill");
  }

  if (!detectedColor) {
    const anyFill = wrapperTmp.querySelector("[fill]");
    detectedColor = anyFill?.getAttribute("fill") || "#000";
  }

  const rect = board.getBoundingClientRect();
  const boardSize = rect.width;
  const squareSize = boardSize / 8;

  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]);

  let x, y;

  if (side === "white") {
    x = file * squareSize;
    y = (8 - rank) * squareSize;
  } else {
    x = (7 - file) * squareSize;
    y = (rank - 1) * squareSize;
  }

  const squareContainer = document.createElement("div");
  squareContainer.style.position = "absolute";
  squareContainer.style.left = rect.left + x + squareSize + "px";
  squareContainer.style.top = rect.top + y + "px";
  squareContainer.style.pointerEvents = "none";

  const wrapper = document.createElement("div");
  wrapper.innerHTML = svgCode;

  const svg = wrapper.querySelector("svg");
  svg.style.position = "absolute";
  svg.style.zIndex = "9999";
  svg.style.borderRadius = "50%";
  svg.style.overflow = "visible";

  squareContainer.appendChild(svg);
  document.body.appendChild(squareContainer);

  requestAnimationFrame(() => {
    const box = svg.getBBox();
    const svgW = box.width;
    const svgH = box.height;
    svg.style.left = -svgW / 2 + "px";
    svg.style.top = -svgH / 2 + "px";

    const isBrilliant =
      detectedColor?.toLowerCase() === activePalette().brilliant;
    const isGreatFind =
      detectedColor?.toLowerCase() === activePalette().great;
    const isBlunder = detectedColor?.toLowerCase() === "#fa412d";

    // ─── BRILLIANT : double pulse inversé ────────────────────────────────────
    if (isBrilliant) {
      svg.animate(
        [
          { transform: "scale(1)", offset: 0 },
          { transform: "scale(1.45)", offset: 0.35, easing: "ease-out" },
          { transform: "scale(0.82)", offset: 0.65, easing: "ease-in-out" },
          { transform: "scale(1.1)", offset: 0.82, easing: "ease-out" },
          { transform: "scale(1)", offset: 1 },
        ],
        {
          duration: 700,
          easing: "ease-in",
          fill: "forwards",
        },
      );
    }

    // ─── GREAT FIND : respiration douce ──────────────────────────────────────
    if (isGreatFind) {
      svg.animate(
        [
          { transform: "scale(1)", offset: 0 },
          { transform: "scale(1.1)", offset: 0.2, easing: "ease-in-out" },
          { transform: "scale(1)", offset: 0.4, easing: "ease-in-out" },
          { transform: "scale(1.08)", offset: 0.6, easing: "ease-in-out" },
          { transform: "scale(1)", offset: 0.8, easing: "ease-in-out" },
          { transform: "scale(1.05)", offset: 0.9, easing: "ease-in-out" },
          { transform: "scale(1)", offset: 1 },
        ],
        {
          duration: 2800,
          easing: "ease-in-out",
          fill: "forwards",
        },
      );
    }

    // ─── BLUNDER : chute / bâtiment qui tombe ────────────────────────────────
    if (isBlunder) {
      svg.style.transformOrigin = "bottom center";

      svg.animate(
        [
          { transform: "rotate(0deg)", offset: 0 },
          { transform: "rotate(3deg)", offset: 0.3, easing: "ease-in" },
          { transform: "rotate(7deg)", offset: 0.6, easing: "ease-in" },
          { transform: "rotate(12deg)", offset: 0.8, easing: "ease-out" },
          { transform: "rotate(15deg)", offset: 0.92, easing: "ease-out" },
          { transform: "rotate(16deg)", offset: 1 },
        ],
        {
          duration: 1200,
          easing: "ease-in",
          fill: "forwards",
        },
      );
    }
  });

  if (window.location.host === "www.chess.com") {
    document.querySelectorAll('.highlight[class*="square-"]').forEach((el) => {
      el.style.backgroundColor = detectedColor;
      el.style.opacity = "0.6";
    });
  }

  if (window.location.host === "lichess.org") {
    document.querySelectorAll(".last-move").forEach((el) => {
      el.style.setProperty("background-color", detectedColor, "important");
      el.style.setProperty("opacity", "0.6", "important");
    });
  }
}

function clickButtonsByText(text) {
  const buttons = Array.from(document.querySelectorAll("button"));
  const targetButtons = buttons.filter((btn) =>
    btn.innerText.trim().includes(text),
  );
  if (targetButtons.length === 0) return;
  targetButtons[0].click();
  targetButtons.shift();
  setTimeout(() => clickButtonsByText(text), 100);
}

function preInjection() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("scripts/sub-main.js");
  (document.head || document.documentElement).appendChild(s);
  s.onload = () => s.remove();
}

preInjection();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countMoves(fenString) {
  const parts = fenString.split("moves");
  if (parts.length < 2) return 0;
  const movesPart = parts[1].trim();
  const movesArray = movesPart.split(/\s+/);
  return movesArray.length;
}

function randomIntBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function clearHighlightSquares() {
  document.querySelectorAll(".customH").forEach((el) => el.remove());
}
function clearHint() {
  const className = "." + classMoveClassification;
  document.querySelectorAll(className).forEach((el) => el.remove());
}

const interval = 100;

let config = {
  elo: 3500,
  coach: 999,
  lines: 5,
  colors: ["#0000ff", "#00ff00", "#FFFF00", "#f97316", "#ff0000"],
  depth: 10,
  depth2: 10,
  delay: 100,
  style: "Default",
  floatingBtn: false,
  speach: false,
  moveClassification: false,
  showAccWidget: true,
  showEval: false,
  onlyShowEval: false,
  key: "=",
  key2: "-",
};

// ─── Initialize after all modules are loaded ────────────────────────────────
// core-engine.js defines: toggleCoachMenu, engine, coach, keyMove,
//   createSimpleAccuracyDisplay, CoachEngine, onCoachChanged
// core-main.js defines: start, showUpdateBanner
chrome.storage.local.get(["chessConfig"], (result) => {
  if (result.chessConfig) {
    config = { ...config, ...result.chessConfig };
  }

  if (config.coach < 988) {
    coach = new CoachEngine();
  }

  start();
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "OPEN_COACH_MENU") {
    toggleCoachMenu();
  }
});
