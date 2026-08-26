// ─── iChess Coach – Engine & UI Module ──────────────────────────────────────
// Loaded second. Depends on globals from core.js.
// Provides: toggleCoachMenu, engine, coach, keyMove,
//   createSimpleAccuracyDisplay, CoachEngine, onCoachChanged
function toggleCoachMenu() {
  const existing = document.getElementById("ichess-coach-overlay");
  if (existing) { existing.remove(); return; }

  const S = document.createElement("style");
  S.id = "ichess-coach-styles";
  S.textContent = `
    @keyframes ichessFadeIn { from{opacity:0} to{opacity:1} }
    @keyframes ichessFadeOut { from{opacity:1} to{opacity:0} }
    @keyframes ichessPanelIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ichessPanelOut { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(8px)} }
    @keyframes ichessBlink { 0%,100%{opacity:1} 50%{opacity:.2} }

    #ichess-coach-overlay {
      --bg-overlay:rgba(8,6,3,.8);
      --bg-panel:#1A1308;
      --bg-row:#201710;
      --bg-row-hover:#28200F;
      --bg-input:#0D0A05;
      --bg-badge:#0D0A05;
      --bg-header:linear-gradient(180deg,#201710 0%,transparent 100%);
      --bg-scrollbar:#0D0A05;
      --bg-toggle-off:#0D0A05;
      --bg-toggle-on:#201710;
      --border-main:#8B6914;
      --border-row:#4A3820;
      --border-dashed:#4A3820;
      --border-toggle:#4A3820;
      --border-toggle-active:#C4883B;
      --accent:#C4883B;
      --accent-bright:#D4A76A;
      --accent-hover:#8B6914;
      --text-main:#F0E6D4;
      --text-label:#A89878;
      --text-dim:#7A6B50;
      --text-title:#D4A76A;
      --text-shadow:2px 2px 0 #0D0A05;
      --close-hover:#CE7B7B;
      --close-hover-border:#B84A4A;
      --inset-shadow:inset 0 0 0 2px #0D0A05;
      --panel-shadow:6px 6px 0 rgba(0,0,0,.85);
      --row-shadow:3px 3px 0 rgba(0,0,0,.85);
      --toggle-knob:#A89878;
      --toggle-knob-active:#D4A76A;
      --scanlines:repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px);
      --grid-item-bg:#0D0A05;
      --grid-item-active-bg:#1A1308;
      --grid-item-active-glow:rgba(196,136,59,0.15);
      --reset-hover-bg:#201710;
    }

    #ichess-coach-overlay.light-mode {
      --bg-overlay:rgba(200,190,180,.85);
      --bg-panel:#F6EEE5;
      --bg-row:#F5F1F1;
      --bg-row-hover:#F5A8A5;
      --bg-input:#FFFFFF;
      --bg-badge:#FFFFFF;
      --bg-header:linear-gradient(180deg,#F5A8A5 0%,transparent 100%);
      --bg-scrollbar:#F5F1F1;
      --bg-toggle-off:#D1A8A9;
      --bg-toggle-on:#ED94A4;
      --border-main:#ED94A4;
      --border-row:#D1A8A9;
      --border-dashed:#D1A8A9;
      --border-toggle:#D1A8A9;
      --border-toggle-active:#ED94A4;
      --accent:#ED94A4;
      --accent-bright:#C4707A;
      --accent-hover:#D1A8A9;
      --text-main:#3D2C2E;
      --text-label:#8B6B6E;
      --text-dim:#B09496;
      --text-title:#C4707A;
      --text-shadow:none;
      --close-hover:#D1A8A9;
      --close-hover-border:#ED94A4;
      --inset-shadow:inset 0 0 0 2px #F6EEE5;
      --panel-shadow:6px 6px 0 rgba(0,0,0,.1);
      --row-shadow:3px 3px 0 rgba(0,0,0,.08);
      --toggle-knob:#8B6B6E;
      --toggle-knob-active:#C4707A;
      --scanlines:none;
      --grid-item-bg:#F5F1F1;
      --grid-item-active-bg:#FFFFFF;
      --grid-item-active-glow:rgba(237,148,164,0.2);
      --reset-hover-bg:#F5A8A5;
    }

    #ichess-coach-overlay {
      position:fixed; inset:0; z-index:9999999;
      display:flex; align-items:center; justify-content:center;
      background:var(--bg-overlay);
      animation:ichessFadeIn .15s steps(3,end);
    }
    #ichess-coach-overlay.ichess-closing {
      animation:ichessFadeOut .12s steps(3,end) forwards;
    }

    #ichess-coach-overlay .ichess-panel {
      position:relative;
      width:340px; max-height:82vh; overflow-y:auto;
      background:var(--bg-panel);
      background-image:var(--scanlines);
      border:2px solid var(--border-main);
      border-radius:0;
      padding:0;
      font-family:'Space Mono',monospace; color:var(--text-main);
      animation:ichessPanelIn .16s steps(4,end);
      box-shadow:var(--panel-shadow), var(--inset-shadow);
    }
    #ichess-coach-overlay.ichess-closing .ichess-panel {
      animation:ichessPanelOut .12s steps(3,end) forwards;
    }

    #ichess-coach-overlay .ichess-panel-header {
      position:relative; padding:20px 24px 14px;
      border-bottom:2px dashed var(--border-dashed);
      background:var(--bg-header);
    }
    #ichess-coach-overlay .ichess-panel-title {
      font-size:13px; font-weight:700; letter-spacing:4px; text-transform:uppercase;
      color:var(--text-title); text-align:center;
      text-shadow:var(--text-shadow);
    }
    #ichess-coach-overlay .ichess-panel-title::before,
    #ichess-coach-overlay .ichess-panel-title::after {
      content:''; display:inline-block; width:6px; height:6px;
      background:var(--accent); margin:0 8px;
      vertical-align:middle;
    }
    #ichess-coach-overlay .ichess-status {
      margin-top:9px; text-align:center;
      font-size:8.5px; letter-spacing:1.5px; text-transform:uppercase;
      color:var(--text-label);
    }
    #ichess-coach-overlay .ichess-status .ichess-dot {
      color:var(--accent-bright);
      animation:ichessBlink 1.4s steps(2,start) infinite;
    }
    #ichess-coach-overlay .ichess-close {
      position:absolute; top:14px; right:16px;
      width:28px; height:28px; border-radius:0;
      background:var(--bg-input); border:2px solid var(--border-row);
      color:var(--text-label); font-size:15px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .1s steps(2,end); line-height:1;
    }
    #ichess-coach-overlay .ichess-close:hover {
      color:var(--close-hover); border-color:var(--close-hover-border); background:var(--bg-row);
    }
    #ichess-coach-overlay .ichess-close:active {
      transform:translate(1px,1px);
    }

    #ichess-coach-overlay .ichess-theme-toggle {
      position:absolute; top:14px; left:16px;
      width:28px; height:28px; border-radius:0;
      background:var(--bg-input); border:2px solid var(--border-row);
      color:var(--text-label); font-size:13px; cursor:pointer;
      display:flex; align-items:center; justify-content:center;
      transition:all .1s steps(2,end); line-height:1;
    }
    #ichess-coach-overlay .ichess-theme-toggle:hover {
      border-color:var(--accent); color:var(--text-main); background:var(--bg-row);
    }

    #ichess-coach-overlay .ichess-body { padding:16px 18px 20px; }

    #ichess-coach-overlay .ichess-section-label {
      font-size:9px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase;
      color:var(--text-label); margin:14px 0 8px; display:flex; align-items:center; gap:10px;
    }
    #ichess-coach-overlay .ichess-section-label::before,
    #ichess-coach-overlay .ichess-section-label::after {
      content:''; flex:1; height:2px;
      background:repeating-linear-gradient(90deg,var(--border-row) 0 6px,transparent 6px 10px);
    }

    #ichess-coach-overlay .ichess-row {
      display:flex; align-items:center; justify-content:space-between;
      padding:11px 12px; margin-bottom:3px;
      background:var(--bg-row);
      border:2px solid var(--border-row);
      border-radius:0;
      transition:all .1s steps(2,end); position:relative; overflow:hidden;
    }
    #ichess-coach-overlay .ichess-row::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
      background:var(--accent);
      opacity:0; transition:opacity .1s steps(2,end); border-radius:0;
    }
    #ichess-coach-overlay .ichess-row:hover {
      background:var(--bg-row-hover);
      border-color:var(--accent-hover);
      transform:translate(-1px,-1px);
      box-shadow:var(--row-shadow);
    }
    #ichess-coach-overlay .ichess-row:hover::before { opacity:1; }

    #ichess-coach-overlay .ichess-row span {
      font-size:11px; font-weight:700; color:var(--text-main); letter-spacing:.3px;
    }

    #ichess-coach-overlay .ichess-help {
      font-size:8.5px; color:var(--text-dim); margin:0 0 8px 14px; line-height:1.5; letter-spacing:.5px;
    }

    #ichess-coach-overlay .ichess-toggle { position:relative; width:42px; height:23px; flex-shrink:0; }
    #ichess-coach-overlay .ichess-toggle input { display:none; }
    #ichess-coach-overlay .ichess-toggle .ichess-slider {
      position:absolute; inset:0;
      background:var(--bg-toggle-off); border-radius:0;
      border:2px solid var(--border-toggle);
      cursor:pointer; transition:.12s steps(2,end);
    }
    #ichess-coach-overlay .ichess-toggle .ichess-slider::before {
      content:''; position:absolute; width:15px; height:15px;
      left:2px; top:2px; background:var(--toggle-knob); border-radius:0; transition:.12s steps(2,end);
      box-shadow:2px 2px 0 rgba(0,0,0,.3);
    }
    #ichess-coach-overlay .ichess-toggle input:checked + .ichess-slider {
      background:var(--bg-toggle-on); border-color:var(--border-toggle-active);
      box-shadow:none;
    }
    #ichess-coach-overlay .ichess-toggle input:checked + .ichess-slider::before {
      transform:translateX(19px); background:var(--toggle-knob-active);
      box-shadow:2px 2px 0 rgba(0,0,0,.3);
    }

    #ichess-coach-overlay .ichess-badge {
      display:inline-flex; align-items:center; justify-content:center;
      min-width:30px; padding:2px 8px;
      background:var(--bg-badge); border:2px solid var(--accent-hover);
      border-radius:0; font-size:11px; font-weight:700; color:var(--accent-bright);
    }

    #ichess-coach-overlay .ichess-row input[type="range"] {
      width:42%; height:4px; background:var(--border-row);
      appearance:none; border:none; border-radius:0; outline:none;
    }
    #ichess-coach-overlay .ichess-row input[type="range"]::-webkit-slider-thumb {
      appearance:none; width:14px; height:14px; border-radius:0;
      background:var(--accent-bright); border:2px solid var(--bg-input); cursor:pointer;
      box-shadow:2px 2px 0 rgba(0,0,0,.3);
      transition:all .1s steps(2,end);
    }
    #ichess-coach-overlay .ichess-row input[type="range"]::-webkit-slider-thumb:hover {
      transform:translateY(-1px);
      box-shadow:2px 3px 0 rgba(0,0,0,.3);
    }

    #ichess-coach-overlay .ichess-row select {
      padding:6px 8px; background:var(--bg-panel);
      border:2px solid var(--border-row); border-radius:0;
      color:var(--text-main); font-family:'Space Mono',monospace; font-size:11px;
      cursor:pointer; outline:none; transition:.1s steps(2,end);
    }
    #ichess-coach-overlay .ichess-row select:hover,
    #ichess-coach-overlay .ichess-row select:focus {
      border-color:var(--accent);
    }

    #ichess-coach-grid {
      display:grid; grid-template-columns:repeat(4,1fr); gap:6px;
      padding:4px 0 8px;
    }
    #ichess-coach-grid .ichess-coach-item {
      display:flex; flex-direction:column; align-items:center; gap:3px;
      padding:6px 2px; background:var(--grid-item-bg); border:2px solid var(--border-row);
      cursor:pointer; transition:all .1s steps(2,end);
    }
    #ichess-coach-grid .ichess-coach-item:hover {
      border-color:var(--accent); transform:translateY(-1px);
      box-shadow:2px 3px 0 rgba(0,0,0,.3);
    }
    #ichess-coach-grid .ichess-coach-item.active {
      border-color:var(--accent); background:var(--grid-item-active-bg);
      box-shadow:inset 0 0 12px var(--grid-item-active-glow);
    }
    #ichess-coach-grid .ichess-coach-item img {
      width:42px; height:42px; border-radius:0; object-fit:cover;
      border:1px solid var(--border-row);
    }
    #ichess-coach-grid .ichess-coach-item.active img {
      border-color:var(--accent);
    }
    #ichess-coach-grid .ichess-coach-item span {
      font-size:8px; font-weight:700; letter-spacing:1px;
      text-transform:uppercase; color:var(--text-dim); text-align:center;
    }
    #ichess-coach-grid .ichess-coach-item.active span {
      color:var(--accent-bright);
    }

    #ichess-coach-overlay .ichess-footer {
      padding:14px 20px; border-top:2px dashed var(--border-dashed);
      display:flex; justify-content:center;
    }
    #ichess-coach-overlay .ichess-reset-btn {
      padding:8px 20px; font-family:'Space Mono',monospace; font-size:10px;
      font-weight:700; letter-spacing:2px; text-transform:uppercase;
      border-radius:0; border:2px solid var(--border-row);
      background:var(--bg-input); color:var(--text-label);
      cursor:pointer; transition:all .1s steps(2,end);
      box-shadow:var(--row-shadow);
    }
    #ichess-coach-overlay .ichess-reset-btn:hover {
      transform:translate(-1px,-1px);
      box-shadow:4px 4px 0 rgba(0,0,0,.3);
      background:var(--reset-hover-bg); border-color:var(--accent-hover); color:var(--text-main);
    }
    #ichess-coach-overlay .ichess-reset-btn:active {
      transform:translate(2px,2px);
      box-shadow:1px 1px 0 rgba(0,0,0,.3);
    }

    #ichess-coach-overlay ::-webkit-scrollbar { width:6px; }
    #ichess-coach-overlay ::-webkit-scrollbar-track { background:var(--bg-scrollbar); }
    #ichess-coach-overlay ::-webkit-scrollbar-thumb { background:var(--border-row); border-radius:0; }
    #ichess-coach-overlay ::-webkit-scrollbar-thumb:hover { background:var(--accent-hover); }
  `;
  document.head.appendChild(S);

  const overlay = document.createElement("div");
  overlay.id = "ichess-coach-overlay";

  const panel = document.createElement("div");
  panel.className = "ichess-panel";

  const header = document.createElement("div");
  header.className = "ichess-panel-header";

  const title = document.createElement("div");
  title.className = "ichess-panel-title";
  title.textContent = "iChess";

  const closeBtn = document.createElement("button");
  closeBtn.className = "ichess-close";
  closeBtn.innerHTML = "\u00d7";
  closeBtn.onclick = close;

  const themeToggle = document.createElement("button");
  themeToggle.className = "ichess-theme-toggle";
  themeToggle.innerHTML = config.menuTheme === "light" ? "\u263E" : "\u2600";
  themeToggle.onclick = () => {
    config.menuTheme = config.menuTheme === "dark" ? "light" : "dark";
    chrome.storage.local.set({ config });
    overlay.classList.toggle("light-mode", config.menuTheme === "light");
    themeToggle.innerHTML = config.menuTheme === "light" ? "\u263E" : "\u2600";
  };
  if (config.menuTheme === "light") overlay.classList.add("light-mode");

  header.appendChild(title);
  header.appendChild(themeToggle);

  const statusLine = document.createElement("div");
  statusLine.className = "ichess-status";
  const coachNames = { 999:"NONE", 0:"DAVID", 12:"MAE", 24:"DANTE", 36:"NADIA", 48:"LEVY", 49:"MAGNUS", 50:"HIKARU", 51:"ANNA", 52:"CANTY", 53:"ANAND", 54:"TANIA", 55:"DANNY", 56:"BOTEZ", 57:"BEN", 58:"SLOANE", 59:"RUBEN" };
  statusLine.innerHTML = '<span class="ichess-dot">\u25cf</span> SYSTEM ONLINE \u00b7 ENGINE READY \u00b7 D' + config.depth2 + ' \u00b7 COACH ' + (coachNames[config.coach] || String(config.coach));
  header.appendChild(statusLine);
  header.appendChild(closeBtn);
  panel.appendChild(header);

  const body = document.createElement("div");
  body.className = "ichess-body";
  panel.appendChild(body);

  function close() {
    overlay.classList.add("ichess-closing");
    setTimeout(() => { overlay.remove(); S.remove(); }, 150);
  }

  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", function esc(ev) {
    if (ev.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
  });

  function addSection(label) {
    const s = document.createElement("div");
    s.className = "ichess-section-label";
    s.textContent = label;
    body.appendChild(s);
  }

  function addToggle(label, configKey, helpText) {
    const row = document.createElement("div");
    row.className = "ichess-row";
    const sp = document.createElement("span");
    sp.textContent = label;
    const wrap = document.createElement("label");
    wrap.className = "ichess-toggle";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!config[configKey];
    cb.onchange = () => { config[configKey] = cb.checked; chrome.storage.local.set({ chessConfig: config }); };
    const sl = document.createElement("span");
    sl.className = "ichess-slider";
    wrap.appendChild(cb);
    wrap.appendChild(sl);
    row.appendChild(sp);
    row.appendChild(wrap);
    body.appendChild(row);
    if (helpText) {
      const h = document.createElement("div");
      h.className = "ichess-help";
      h.textContent = helpText;
      body.appendChild(h);
    }
  }

  function addRange(label, configKey, min, max, step, helpText) {
    const row = document.createElement("div");
    row.className = "ichess-row";
    const sp = document.createElement("span");
    sp.textContent = label;
    const badge = document.createElement("span");
    badge.className = "ichess-badge";
    badge.textContent = config[configKey];
    const inp = document.createElement("input");
    inp.type = "range";
    inp.min = min; inp.max = max; inp.step = step; inp.value = config[configKey];
    inp.oninput = () => { config[configKey] = +inp.value; badge.textContent = inp.value; chrome.storage.local.set({ chessConfig: config }); };
    row.appendChild(sp);
    row.appendChild(badge);
    row.appendChild(inp);
    body.appendChild(row);
    if (helpText) {
      const h = document.createElement("div");
      h.className = "ichess-help";
      h.textContent = helpText;
      body.appendChild(h);
    }
  }

  function addSelect(label, configKey, options, helpText) {
    const row = document.createElement("div");
    row.className = "ichess-row";
    const sp = document.createElement("span");
    sp.textContent = label;
    const sel = document.createElement("select");
    options.forEach(([val, txt]) => {
      const o = document.createElement("option");
      o.value = val; o.textContent = txt;
      if (config[configKey] == val) o.selected = true;
      sel.appendChild(o);
    });
    sel.onchange = () => { config[configKey] = sel.value === "999" ? 999 : +sel.value; chrome.storage.local.set({ chessConfig: config }); };
    row.appendChild(sp);
    row.appendChild(sel);
    body.appendChild(row);
    if (helpText) {
      const h = document.createElement("div");
      h.className = "ichess-help";
      h.textContent = helpText;
      body.appendChild(h);
    }
  }

  addSection("Coach");

  (function addCoachGrid() {
    const coachPfpMap = {
      999: null,
      0: "coachdavid.png", 12: null, 24: null, 36: null,
      48: "coachlevy.png", 49: "coachmagnus.png", 50: "coachhikaru.png", 51: "coachanna.png",
      52: "coachcanty.png", 53: "coachvishy.png", 54: "coachtania.png", 55: "coachdanny.png",
      56: "coachbotezsisters.png", 57: "coachben.png", 58: "coachsloane.png", 59: "coachruben.png",
    };
    const coachLabels = {
      999: "None", 0: "David", 12: "Mae", 24: "Dante", 36: "Nadia",
      48: "Levy", 49: "Magnus", 50: "Hikaru", 51: "Anna",
      52: "Canty", 53: "Anand", 54: "Tania", 55: "Danny", 56: "Botez", 57: "Ben",
      58: "Sloane", 59: "Ruben",
    };
    const grid = document.createElement("div");
    grid.id = "ichess-coach-grid";

    Object.entries(coachLabels).forEach(([id, name]) => {
      const numId = +id;
      const item = document.createElement("div");
      item.className = "ichess-coach-item" + (config.coach === numId ? " active" : "");
      const pfp = coachPfpMap[numId];
      if (pfp) {
        const img = document.createElement("img");
        img.src = chrome.runtime.getURL("scripts/coach-assets/coach_pfp/" + pfp);
        img.alt = name;
        item.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.style.cssText = "width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#7A6B50;";
        placeholder.textContent = numId === 999 ? "\u2716" : name[0];
        item.appendChild(placeholder);
      }
      const label = document.createElement("span");
      label.textContent = name;
      item.appendChild(label);
      item.onclick = () => {
        config.coach = numId;
        chrome.storage.local.set({ chessConfig: config });
        grid.querySelectorAll(".ichess-coach-item").forEach(el => el.classList.remove("active"));
        item.classList.add("active");
        const statusCoach = document.querySelector(".ichess-status");
        if (statusCoach) statusCoach.innerHTML = '<span class="ichess-dot">\u25cf</span> SYSTEM ONLINE \u00b7 ENGINE READY \u00b7 D' + config.depth2 + ' \u00b7 COACH ' + (coachNames[config.coach] || String(config.coach));
      };
      grid.appendChild(item);
    });

    body.appendChild(grid);
  })();

  addSection("Analysis");
  addRange("Engine Depth", "depth2", 1, 15, 1, "Higher = more accurate (slower)");

  addSection("Review");
  addToggle("Move Classification", "moveClassification", "Show !! or ?? icons on board");
  addToggle("Coach Voice", "speach", "Coach speaks move explanations");
  addToggle("Coach Subtitles", "showSubtitles", "Show subtitles while coach speaks");
  addToggle("Accuracy Widget", "showAccWidget", "Show accuracy display during review");

  (function addEvalBarToggle() {
    const row = document.createElement("div");
    row.className = "ichess-row";
    const sp = document.createElement("span");
    sp.textContent = "Evaluation Bar";
    const wrap = document.createElement("label");
    wrap.className = "ichess-toggle";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !!config.showEval;
    cb.onchange = () => {
      config.showEval = cb.checked;
      chrome.storage.local.set({ chessConfig: config });
      if (!cb.checked) {
        const el = document.querySelector("#customEval");
        if (el) el.remove();
      } else if (typeof createEvalBar === "function") {
        const board = document.querySelector(".board, cg-board");
        if (!document.querySelector("#customEval") && board) {
          const eb = createEvalBar();
          if (eb) eb.update("0.0", "white");
        }
      }
    };
    const sl = document.createElement("span");
    sl.className = "ichess-slider";
    wrap.appendChild(cb);
    wrap.appendChild(sl);
    row.appendChild(sp);
    row.appendChild(wrap);
    body.appendChild(row);
    const h = document.createElement("div");
    h.className = "ichess-help";
    h.textContent = "Show live evaluation bar on the board";
    body.appendChild(h);
  })();

  const footer = document.createElement("div");
  footer.className = "ichess-footer";
  const resetBtn = document.createElement("button");
  resetBtn.className = "ichess-reset-btn";
  resetBtn.textContent = "Reset Defaults";
  resetBtn.onclick = () => {
    config.coach = 999; config.depth2 = 10;
    config.moveClassification = false; config.speach = false; config.showSubtitles = false; config.showAccWidget = true; config.showEval = false;
    chrome.storage.local.set({ chessConfig: config });
    overlay.remove(); S.remove();
    toggleCoachMenu();
  };
  footer.appendChild(resetBtn);
  panel.appendChild(footer);

  const credits = document.createElement("div");
  credits.style.cssText = "padding:12px 20px 16px;text-align:center;border-top:2px dashed #4A3820;";
  const creditsTitle = document.createElement("div");
  creditsTitle.style.cssText = "font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#A89878;margin-bottom:4px;text-shadow:1px 1px 0 #0D0A05;";
  creditsTitle.textContent = "iChess Coach";
  const creditsSub = document.createElement("div");
  creditsSub.style.cssText = "font-size:9px;color:#7A6B50;line-height:1.5;letter-spacing:.5px;";
  creditsSub.textContent = "Chess.com \u00b7 Lichess.org \u00b7 WorldChess.com";
  credits.appendChild(creditsTitle);
  credits.appendChild(creditsSub);
  panel.appendChild(credits);

  /* -------- Credits Modal -------- */
  const creditsModalStyles = document.createElement("style");
  creditsModalStyles.id = "ichess-credits-modal-styles";
  creditsModalStyles.textContent = `
    #ichess-credits-modal-overlay {
      position:fixed; inset:0; z-index:10000000;
      display:flex; align-items:center; justify-content:center;
      background:rgba(8,6,3,.82);
      animation:ichessFadeIn .15s steps(3,end);
    }
    #ichess-credits-modal-overlay .ichess-credits-content {
      position:relative;
      width:340px; padding:30px 26px;
      background:#1A1308;
      background-image:repeating-linear-gradient(0deg, rgba(0,0,0,.14) 0 1px, transparent 1px 3px);
      border:2px solid #8B6914;
      border-radius:0;
      font-family:'Space Mono',monospace; color:#F0E6D4;
      animation:ichessPanelIn .16s steps(4,end);
      box-shadow:
        6px 6px 0 rgba(0,0,0,.85),
        inset 0 0 0 2px #0D0A05;
    }
    #ichess-credits-modal-overlay .ichess-credits-close {
      position:absolute; top:12px; right:14px;
      width:28px; height:28px;
      display:flex; align-items:center; justify-content:center;
      background:#0D0A05;
      border:2px solid #4A3820;
      border-radius:0; color:#A89878;
      font-size:16px; cursor:pointer;
      transition:all .1s steps(2,end); line-height:1;
    }
    #ichess-credits-modal-overlay .ichess-credits-close:hover {
      background:#201710; border-color:#B84A4A;
      color:#CE7B7B;
    }
    #ichess-credits-modal-overlay .ichess-credits-title {
      text-align:center; margin-bottom:26px;
      font-size:13px; font-weight:700;
      letter-spacing:3px; text-transform:uppercase; color:#D4A76A;
      text-shadow:2px 2px 0 #0D0A05;
    }
    #ichess-credits-modal-overlay .ichess-credits-section { margin-bottom:20px; }
    #ichess-credits-modal-overlay .ichess-credits-label {
      font-size:9px; font-weight:700;
      letter-spacing:2.5px; text-transform:uppercase;
      color:#A89878; margin-bottom:8px;
    }
    #ichess-credits-modal-overlay .ichess-credits-value {
      font-size:13px; font-weight:700; color:#F0E6D4;
      letter-spacing:.5px;
      text-shadow:1px 1px 0 #0D0A05;
    }
    #ichess-credits-modal-overlay .ichess-credits-divider {
      height:2px; margin:4px 0 20px;
      background:repeating-linear-gradient(90deg,#4A3820 0 6px,transparent 6px 10px);
    }
    #ichess-credits-modal-overlay .ichess-credits-link {
      display:inline-block; padding:9px 18px;
      font-family:'Space Mono',monospace; font-size:11px;
      font-weight:700; letter-spacing:2px; text-transform:uppercase;
      border-radius:0; border:2px solid #8B6914;
      background:#201710;
      color:#D4A76A; text-decoration:none; cursor:pointer;
      transition:all .1s steps(2,end);
      box-shadow:3px 3px 0 rgba(0,0,0,.85);
    }
    #ichess-credits-modal-overlay .ichess-credits-link:hover {
      transform:translate(-1px,-1px);
      box-shadow:4px 4px 0 rgba(0,0,0,.85);
      background:#28200F;
      color:#fff;
    }
    #ichess-credits-modal-overlay .ichess-credits-link:active {
      transform:translate(2px,2px);
      box-shadow:1px 1px 0 rgba(0,0,0,.85);
    }
  `;
  document.head.appendChild(creditsModalStyles);

  function openCreditsModal() {
    const mOverlay = document.createElement("div");
    mOverlay.id = "ichess-credits-modal-overlay";

    const mContent = document.createElement("div");
    mContent.className = "ichess-credits-content";

    const mClose = document.createElement("button");
    mClose.className = "ichess-credits-close";
    mClose.innerHTML = "\u00d7";

    const mTitle = document.createElement("div");
    mTitle.className = "ichess-credits-title";
    mTitle.textContent = "iChess Coach";

    const secDev = document.createElement("div");
    secDev.className = "ichess-credits-section";
    const lblDev = document.createElement("div");
    lblDev.className = "ichess-credits-label";
    lblDev.textContent = "Developer";
    const valDev = document.createElement("div");
    valDev.className = "ichess-credits-value";
    valDev.textContent = "(i) ishatxt";
    secDev.appendChild(lblDev);
    secDev.appendChild(valDev);

    const divider = document.createElement("div");
    divider.className = "ichess-credits-divider";

    const secCommunity = document.createElement("div");
    secCommunity.className = "ichess-credits-section";
    const lblCommunity = document.createElement("div");
    lblCommunity.className = "ichess-credits-label";
    lblCommunity.textContent = "Community & Support";
    const linkBtn = document.createElement("a");
    linkBtn.className = "ichess-credits-link";
    linkBtn.href = "https://discord.gg/gVgn5Bn8d5";
    linkBtn.target = "_blank";
    linkBtn.rel = "noopener noreferrer";
    linkBtn.textContent = "Join Discord";
    secCommunity.appendChild(lblCommunity);
    secCommunity.appendChild(linkBtn);

    mContent.appendChild(mClose);
    mContent.appendChild(mTitle);
    mContent.appendChild(secDev);
    mContent.appendChild(divider);
    mContent.appendChild(secCommunity);
    mOverlay.appendChild(mContent);

    function closeModal() {
      mOverlay.classList.add("ichess-closing");
      setTimeout(() => { mOverlay.remove(); }, 150);
    }

    mClose.addEventListener("click", closeModal);
    mOverlay.addEventListener("click", (e) => { if (e.target === mOverlay) closeModal(); });

    document.body.appendChild(mOverlay);
  }

  footer.innerHTML = "";
  const creditsBtnRow = document.createElement("div");
  creditsBtnRow.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;";
  const creditsBtn = document.createElement("button");
  creditsBtn.className = "ichess-reset-btn";
  creditsBtn.textContent = "Credits";
  creditsBtn.onclick = openCreditsModal;
  creditsBtnRow.appendChild(creditsBtn);

  const pgnBtn = document.createElement("button");
  pgnBtn.className = "ichess-reset-btn";
  pgnBtn.textContent = "PGN Analysis";
  pgnBtn.style.cssText = "border-color:#8B6914;color:#D4A76A;";
  pgnBtn.onclick = () => {
    chrome.runtime.sendMessage({ type: "OPEN_PGN_ANALYSIS" });
    close();
  };
  creditsBtnRow.appendChild(pgnBtn);

  creditsBtnRow.appendChild(resetBtn);
  footer.appendChild(creditsBtnRow);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

// ─── Engine Workers & Classes ──────────────────────────────────────────────
    async function createWorkerKomodo() {
      const url = `${chrome.runtime.getURL("engine/komodo.js")}`;
      const blob = new Blob([`importScripts("${url}");`], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);

      return new Worker(blobUrl);
    }

    async function createWorkerTorch() {
      const url = `${chrome.runtime.getURL("engine/torch.js")}`;
      const blob = new Blob([`importScripts("${url}");`], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);
      return new Worker(blobUrl);
    }

    class komodo {
      constructor({
        elo = config.elo,
        depth = config.depth,
        multipv = config.lines,
        threads = 2,
        hash = 128,
        personality = config.style,
      }) {
        this.elo = elo;
        this.depth = depth;
        this.multipv = multipv;
        this.threads = threads;
        this.hash = hash;
        this.personality = personality;
        this.ready = this.init();
      }

      async init() {
        this.worker = await createWorkerKomodo();
        this.worker.postMessage("uci");
        this.setOptions();
      }

      hardStop() {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      }
      quit() {
        this.hardStop();
        this.worker.postMessage("quit");
      }

      async restartWorker() {
        this.hardStop();
        this.worker = await createWorkerKomodo();
        this.worker.postMessage("uci");
        this.setOptions();
      }

      setOptions() {
        this.worker.postMessage(
          `setoption name Personality value ${this.personality}`,
        );
        this.worker.postMessage("setoption name UCI LimitStrength value true");
        this.worker.postMessage(`setoption name UCI Elo value ${this.elo}`);
        this.worker.postMessage(`setoption name MultiPV value ${this.multipv}`);
      }

      updateConfig(lines, depth, style, elo) {
        this.depth = depth;
        this.elo = elo;
        this.personality = style;
        this.multipv = lines;
        this.worker.postMessage(
          `setoption name Personality value ${this.personality}`,
        );
        this.worker.postMessage(`setoption name UCI Elo value ${this.elo}`);
        this.worker.postMessage(`setoption name MultiPV value ${this.multipv}`);
      }

      async getMovesByFen(fen, side) {
        this.worker.postMessage(
          `setoption name Personality value ${this.personality}`,
        );
        this.worker.postMessage(`setoption name UCI Elo value ${config.elo}`);
        this.worker.postMessage(`setoption name MultiPV value ${this.multipv}`);

        const results = [];
        const seenMoves = new Set();
        const infoLines = [];
        let lastDepth = 0;
        const sideToMove = fen.split(" ")[1];

        return new Promise((resolve) => {
          const onMessage = (event) => {
            const line = event.data;
            if (debugEngine) {
              console.log(line);
            }
            if (typeof line !== "string") return;

            if (line.startsWith("bestmove")) {
              const parts = line.split(" ");

              if (line.split("ponder")[1] === " ") {
                const from = line.split(" ")[1].slice(0, 2);
                const to = line.split(" ")[1].slice(2);
                results.push({
                  from: from,
                  to: to,
                  eval: "book",
                  fen: fen,
                  side: side,
                });

                this.worker.removeEventListener("message", onMessage);
                resolve(results);
                return;
              }
            }

            if (line.startsWith("info")) {
              infoLines.push(line);

              const parts = line.split(" ");
              const depthIndex = parts.indexOf("depth");
              if (depthIndex !== -1 && depthIndex + 1 < parts.length) {
                const d = parseInt(parts[depthIndex + 1], 10);
                if (!isNaN(d)) lastDepth = d;
              }
              return;
            }

            if (line.startsWith("bestmove")) {
              this.worker.removeEventListener("message", onMessage);

              for (const infoLine of infoLines) {
                if (!infoLine.includes("multipv") || !infoLine.includes(" pv "))
                  continue;
                if (!infoLine.includes(`depth ${lastDepth} `)) continue;

                const parts = infoLine.split(" ");

                const mpvIndex = parts.indexOf("multipv");
                const mpv = mpvIndex !== -1 ? parseInt(parts[mpvIndex + 1], 10) : 1;
                if (mpv > this.multipv) continue;

                let evalScore = null;
                const scoreIndex = parts.indexOf("score");
                if (scoreIndex !== -1 && scoreIndex + 2 < parts.length) {
                  const type = parts[scoreIndex + 1];
                  let value = parseInt(parts[scoreIndex + 2], 10);

                  if (!isNaN(value)) {
                    if (sideToMove === "b") value = -value;

                    if (type === "cp") {
                      const v = (value / 100).toFixed(2);
                      evalScore = value >= 0 ? `+${v}` : `${v}`;
                    } else if (type === "mate") {
                      evalScore = `#${value}`;
                    }
                  }
                }

                const pvIndex = parts.indexOf("pv");
                if (pvIndex !== -1 && pvIndex + 1 < parts.length) {
                  const move = parts[pvIndex + 1];
                  if (move.length >= 4 && !seenMoves.has(move)) {
                    results.push({
                      from: move.slice(0, 2),
                      to: move.slice(2, 4),
                      eval: evalScore,
                      fen: fen,
                      side: side,
                    });
                    seenMoves.add(move);
                  }
                }
              }

              resolve(results);
            }
          };

          this.worker.addEventListener("message", onMessage);

          this.worker.postMessage(`stop`);
          this.worker.postMessage(`position fen ${fen}`);
          this.worker.postMessage(`go depth ${this.depth}`);
        });
      }
    }

    // Lazily booted Komodo wrapper: the WASM worker (2 threads / 128 MB
    // hash) only starts on first real use instead of every page load.
    const engine = new Proxy(
      {},
      {
        get(target, prop) {
          if (!target._instance) {
            target._instance = new komodo({
              elo: config.elo,
              depth: config.depth,
              multipv: config.lines,
              threads: 2,
              hash: 128,
              personality: config.style,
            });
          }
          const value = target._instance[prop];
          return typeof value === "function"
            ? value.bind(target._instance)
            : value;
        },
      },
    );

// ─── Key Move & Accuracy Widget ───────────────────────────────────────────
    let keyMove = [
      {
        from: "e2",
        to: "e4",
        eval: "+2.83",
        fen: "2rqr1k1/pp4pp/2n1bp2/8/3P4/P4NPP/1B2B1P1/2RQ1RK1 b - - 0 19",
        side: "white",
      },
      {
        from: "e2",
        to: "e3",
        eval: "+3.11",
        fen: "2rqr1k1/pp4pp/2n1bp2/8/3P4/P4NPP/1B2B1P1/2RQ1RK1 b - - 0 19",
        side: "white",
      },
      {
        from: "d2",
        to: "d4",
        eval: "+3.12",
        fen: "2rqr1k1/pp4pp/2n1bp2/8/3P4/P4NPP/1B2B1P1/2RQ1RK1 b - - 0 19",
        side: "white",
      },
      {
        from: "d2",
        to: "d3",
        eval: "+3.14",
        fen: "2rqr1k1/pp4pp/2n1bp2/8/3P4/P4NPP/1B2B1P1/2RQ1RK1 b - - 0 19",
        side: "white",
      },
      {
        from: "c2",
        to: "c4",
        eval: "+3.30",
        fen: "2rqr1k1/pp4pp/2n1bp2/8/3P4/P4NPP/1B2B1P1/2RQ1RK1 b - - 0 19",
        side: "white",
      },
    ];

    function createSimpleAccuracyDisplay(
      initialWhiteAcc = 0,
      initialWhiteElo = 0,
      initialBlackAcc = 0,
      initialBlackElo = 0,
      side = "white",
      statW = null,
      statB = null,
      displayMode = 2,
    ) {
      // ─── Styles ───────────────────────────────────────────────────────────────

      if (!document.getElementById("acc-display-styles")) {
        const style = document.createElement("style");
        style.id = "acc-display-styles";
        style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

      #acc-widget {
        position: fixed;
        z-index: 999999;
        top: 80px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: grab;
        user-select: none;
        touch-action: none;
        font-family: 'Space Mono', ui-monospace, monospace;
        transition: opacity 0.15s steps(3,end);
      }

      #acc-widget.acc-hidden { opacity: 0; pointer-events: none; }
      #acc-widget.dragging   { cursor: grabbing; opacity: 0.8; }

      .acc-row { display: flex; align-items: center; gap: 5px; }

      .acc-card, .acc-segment, .acc-label, .acc-value,
      .acc-side-badge, .acc-threat-dot { pointer-events: none; }

      .acc-side-badge {
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-family: 'Space Mono', ui-monospace, monospace;
        font-size: 5px;
        font-weight: 700;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        padding: 5px 2px;
        border-radius: 0;
        border: 1px solid #4A3820;
        flex-shrink: 0;
        line-height: 1;
        width: 12px;
        text-align: center;
      }
      .acc-side-badge-white        { background: rgba(32,23,16,0.85); color: #A89878; }
      .acc-side-badge-black        { background: rgba(13,10,5,0.85); color: #7A6B50; }
      .acc-side-badge-you-white    { background: #C4883B; color: #2A1C10; border-color: #4A3820; }
      .acc-side-badge-you-black    { background: #201710; color: #F0E6D4; border-color: #8B6914; }

      .acc-mode1 .acc-side-badge { font-size: 4px; padding: 4px 2px; width: 10px; }

      .acc-card {
        width: 180px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        border-radius: 0;
        overflow: hidden;
        border: 2px solid #4A3820;
      }
      .acc-mode1 .acc-card { width: 140px; border-radius: 0; }

      .acc-card-white {
        background-color: #C4883B;
        background-image: repeating-linear-gradient(0deg, rgba(74,56,32,0.08) 0 1px, transparent 1px 3px);
        box-shadow: 3px 3px 0 rgba(0,0,0,0.5);
      }
      .acc-card-black {
        background-color: #201710;
        background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0 1px, transparent 1px 3px);
        box-shadow: 3px 3px 0 rgba(0,0,0,0.75);
      }
      .acc-card-active-white { border-color: #8B6914; }
      .acc-card-active-black { border-color: #C4883B; }

      .acc-segment {
        padding: 7px 10px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .acc-mode1 .acc-segment { padding: 5px 8px; gap: 2px; }

      .acc-segment:first-child { border-right-width: 2px; border-right-style: solid; }
      .acc-card-white .acc-segment:first-child { border-right-color: rgba(74,56,32,0.35); }
      .acc-card-black .acc-segment:first-child { border-right-color: rgba(240,230,212,0.14); }

      .acc-label {
        font-size: 8px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        white-space: nowrap;
      }
      .acc-card-white .acc-label { color: #5A4230; }
      .acc-card-black .acc-label { color: #A89878; }

      .acc-value {
        font-family: 'Space Mono', ui-monospace, 'Courier New', monospace;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
        transition: color 0.15s steps(3,end);
        text-shadow: 1px 1px 0 rgba(13,10,5,0.25);
      }
      .acc-mode1 .acc-value { font-size: 13px; }
      .acc-card-white .acc-value { color: #2A1C10; }
      .acc-card-black .acc-value { color: #F0E6D4; }

      .acc-card-inactive .acc-value      { opacity: 0.25; }
      .acc-card-inactive .acc-label      { opacity: 0.3; }
      .acc-card-inactive .acc-threat-dot { opacity: 0.2; }

      .acc-threat-dot {
        display: inline-block;
        width: 6px; height: 6px;
        border-radius: 0;
        flex-shrink: 0;
        margin-left: 2px;
        position: relative; top: -1px;
        transition: background 0.15s steps(3,end), box-shadow 0.15s steps(3,end);
      }
      .acc-threat-safe   { background: #C4883B; box-shadow: 0 0 0 1px #0D0A05; }
      .acc-threat-warn   { background: #D6C85A; box-shadow: 0 0 0 1px #0D0A05; }
      .acc-threat-sus    { background: #C98A3C; box-shadow: 0 0 0 1px #0D0A05; }
      .acc-threat-cheat  { background: #B84A4A; box-shadow: 0 0 0 1px #0D0A05; }
      .acc-threat-hidden { background: transparent; box-shadow: none; }

      .acc-card-active-white .acc-value-cheat { color: #8F2F2F; }
      .acc-card-active-white .acc-value-sus   { color: #9C5A2A; }
      .acc-card-active-white .acc-value-warn  { color: #6E621E; }
      .acc-card-active-white .acc-value-safe  { color: #44692E; }
      .acc-card-active-black .acc-value-cheat { color: #CE7B7B; }
      .acc-card-active-black .acc-value-sus   { color: #C89A6A; }
      .acc-card-active-black .acc-value-warn  { color: #CBBF6A; }
      .acc-card-active-black .acc-value-safe  { color: #D4A76A; }

      .acc-label-row { display: flex; align-items: center; gap: 4px; }
    `;
        document.head.appendChild(style);
      }

      // ─── Internal state ───────────────────────────────────────────────────────

      let whiteAcc = initialWhiteAcc;
      let whiteElo = initialWhiteElo;
      let blackAcc = initialBlackAcc;
      let blackElo = initialBlackElo;

      // ─── Threat level ─────────────────────────────────────────────────────────

      function threatLevel(acc) {
        const n = parseFloat(acc);
        if (isNaN(n) || n === 0) return null;
        if (n >= 95) return "cheat";
        if (n >= 90) return "sus";
        if (n >= 88) return "warn";
        return "safe";
      }

      // ─── HTML builder ─────────────────────────────────────────────────────────

      function rowHTML(color, isYou) {
        const badgeText = isYou ? "you" : "&nbsp;";
        const badgeClass = isYou
          ? `acc-side-badge acc-side-badge-you-${color}`
          : `acc-side-badge acc-side-badge-${color}`;
        const activeClass = isYou
          ? `acc-card-active-${color}`
          : `acc-card-inactive`;

        return `
      <div class="acc-row">
        <div class="${badgeClass}">${badgeText}</div>
        <div class="acc-card acc-card-${color} ${activeClass}" id="acc-card-${color}">
          <div class="acc-segment">
            <div class="acc-label-row">
              <span class="acc-label">Accuracy</span>
              <span class="acc-threat-dot acc-threat-hidden" id="acc-dot-${color}"></span>
            </div>
            <span class="acc-value" id="acc-val-acc-${color}">—</span>
          </div>
          <div class="acc-segment">
            <span class="acc-label">Rating</span>
            <span class="acc-value" id="acc-val-elo-${color}">—</span>
          </div>
        </div>
      </div>`;
      }

      // ─── Widget mount ─────────────────────────────────────────────────────────

      const widget = document.createElement("div");
      widget.id = "acc-widget";
      document.body.appendChild(widget);

      chrome.storage.local.get("accWidgetPos", (result) => {
        if (result.accWidgetPos) {
          widget.style.left = result.accWidgetPos.left;
          widget.style.top = result.accWidgetPos.top;
        }
      });

      function applyDisplayMode() {
        widget.classList.toggle("acc-hidden", displayMode === 0);
        widget.classList.toggle("acc-mode1", displayMode === 1);
      }

      function render() {
        widget.innerHTML =
          side === "white"
            ? rowHTML("black", false) + rowHTML("white", true)
            : rowHTML("white", false) + rowHTML("black", true);
        applyDisplayMode();
      }

      // ─── Drag — mouse ─────────────────────────────────────────────────────────

      let isDragging = false,
        offsetX = 0,
        offsetY = 0,
        mouseFrame = null,
        lastMouseEvent = null,
        touchFrame = null,
        lastTouchEvent = null;

      widget.addEventListener("mousedown", (e) => {
        if (displayMode === 0) return;
        isDragging = true;
        widget.classList.add("dragging");
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        lastMouseEvent = e;
        if (mouseFrame) return;
        mouseFrame = requestAnimationFrame(() => {
          mouseFrame = null;
          if (!isDragging || !lastMouseEvent) return;
          widget.style.left = `${lastMouseEvent.clientX - offsetX}px`;
          widget.style.top = `${lastMouseEvent.clientY - offsetY}px`;
        });
      });
      document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        if (mouseFrame) {
          cancelAnimationFrame(mouseFrame);
          mouseFrame = null;
        }
        widget.classList.remove("dragging");
        chrome.storage.local.set({
          accWidgetPos: { left: widget.style.left, top: widget.style.top },
        });
      });

      // ─── Drag — touch ─────────────────────────────────────────────────────────

      widget.addEventListener(
        "touchstart",
        (e) => {
          if (displayMode === 0) return;
          const t = e.touches[0];
          isDragging = true;
          widget.classList.add("dragging");
          offsetX = t.clientX - widget.getBoundingClientRect().left;
          offsetY = t.clientY - widget.getBoundingClientRect().top;
          e.preventDefault();
        },
        { passive: false },
      );
      document.addEventListener(
        "touchmove",
        (e) => {
          if (!isDragging) return;
          lastTouchEvent = e.touches[0];
          if (touchFrame) {
            e.preventDefault();
            return;
          }
          touchFrame = requestAnimationFrame(() => {
            touchFrame = null;
            if (!isDragging || !lastTouchEvent) return;
            widget.style.left = `${lastTouchEvent.clientX - offsetX}px`;
            widget.style.top = `${lastTouchEvent.clientY - offsetY}px`;
          });
          e.preventDefault();
        },
        { passive: false },
      );
      document.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;
        if (touchFrame) {
          cancelAnimationFrame(touchFrame);
          touchFrame = null;
        }
        widget.classList.remove("dragging");
        chrome.storage.local.set({
          accWidgetPos: { left: widget.style.left, top: widget.style.top },
        });
      });

      // ─── DOM helpers ──────────────────────────────────────────────────────────

      function setVal(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
      }

      function applyThreat(color, acc) {
        const level = threatLevel(acc);
        const dot = document.getElementById(`acc-dot-${color}`);
        const val = document.getElementById(`acc-val-acc-${color}`);
        if (!dot || !val) return;
        dot.className = "acc-threat-dot";
        val.classList.remove(
          "acc-value-cheat",
          "acc-value-sus",
          "acc-value-warn",
          "acc-value-safe",
        );
        if (!level) {
          dot.classList.add("acc-threat-hidden");
          return;
        }
        dot.classList.add(`acc-threat-${level}`);
        val.classList.add(`acc-value-${level}`);
      }

      function flushDOM() {
        setVal("acc-val-acc-white", whiteAcc ? `${whiteAcc}%` : "—");
        setVal("acc-val-elo-white", whiteElo || "—");
        setVal("acc-val-acc-black", blackAcc ? `${blackAcc}%` : "—");
        setVal("acc-val-elo-black", blackElo || "—");
        applyThreat("white", whiteAcc);
        applyThreat("black", blackAcc);
      }

      // ─── Update ───────────────────────────────────────────────────────────────

      function update(changes = {}) {
        const sideChanged = changes.side !== undefined && changes.side !== side;
        const modeChanged =
          changes.displayMode !== undefined &&
          changes.displayMode !== displayMode;

        if (changes.whiteAcc !== undefined) whiteAcc = changes.whiteAcc;
        if (changes.whiteElo !== undefined) whiteElo = changes.whiteElo;
        if (changes.blackAcc !== undefined) blackAcc = changes.blackAcc;
        if (changes.blackElo !== undefined) blackElo = changes.blackElo;
        if (sideChanged) side = changes.side;
        if (modeChanged) displayMode = changes.displayMode;

        if (sideChanged || modeChanged) {
          render();
        } else {
          applyDisplayMode();
        }

        flushDOM();
      }

      render();
      flushDOM();
      return { update };
    }

// ─── Coach Engine ─────────────────────────────────────────────────────────
    class CoachEngine {
      constructor() {
        this.worker = null;
        this.ready = this.init();
      }

      async init() {
        this.worker = await createWorkerTorch();
        this.setup();
      }

      hardStop() {
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
      }

      async restartWorker() {
        this.hardStop();
        this.worker = await createWorkerTorch();
        this.setup();
      }

      send(cmd) {
        if (this.worker) {
          this.worker.postMessage(cmd);
        }
      }

      async setup() {
        // default setting for analysis
        this.send("setoption name UseDeclarativePositionCommand value true");
        this.send("setoption name BlackElo value 3200");
        this.send("setoption name WhiteElo value 3200");
        this.send("setoption name HandleContinuations value true");
        this.send(
          `setoption name HandleContinuationsDepth value ${config.depth2}`,
        );
        this.send("setoption name UserColor value white");
        this.send("setoption name BotChatPrioritizePlayerMove value true");
        this.send("setoption name SerializeSpeechDetails value true");
        this.send("setoption name AllowBoardEventsWithoutSpeech value true");
        this.send("setoption name ServeCommandV2 value true");
        this.send("setoption name SpeechV3 value true");
        this.send("setoption name ClassificationV3 value true");
        this.send("setoption name UCI_Chess960 value false");
        this.send("setoption name UseRatingRanges value true");
        this.send(`setoption name Language value ${coachs[config.coach].lang}`);
        this.send(await getCoachCmd(coachs[config.coach]));
        this.send(`setoption name Language value ${coachs[config.coach].lang}`);
      }

      async getChat(
        movesString,
        side = "white",
        whiteElo = 3200,
        blackElo = 3200,
      ) {
        if (config.coach === 999) return null;

        await this.ready;
        if (!this.worker) throw new Error("Engine non initialisé");

        return new Promise((resolve) => {
          const onMessage = (e) => {
            let raw = e.data;
            let cleanRaw = raw;

            if (typeof cleanRaw === "string" && cleanRaw.startsWith("json ")) {
              cleanRaw = cleanRaw.slice(5).trim();
            } else if (
              typeof cleanRaw === "string" &&
              cleanRaw.includes("ABORD")
            ) {
              alert("crash");
            }

            try {
              const data = JSON.parse(cleanRaw);
              const last = data?.positions?.[data.positions.length - 1];
              const whiteAccuracy = data?.CAPS.white.all;
              const blackAccuracy = data?.CAPS.black.all;
              const blackElo = data?.reportCard.black.effectiveElo;
              const whiteElo = data?.reportCard.white.effectiveElo;
              stat_0_white = data?.tallies?.white;
              stat_0_black = data?.tallies?.black;

              if (!last) return;

              const classificationName = last.classificationName;
              const fen = last.fen;
              const audioUrlHash = last?.playedMove?.speech?.[0]?.audioUrlHash;
              const sentence = last?.playedMove?.speech?.[0]?.sentence?.[0] || "";
              const moveLan = last?.playedMove?.moveLan;
              if (!audioUrlHash) {
                this.worker.removeEventListener("message", onMessage);
                resolve({ classificationName, fen, urlAudio: null, sentence, moveLan, whiteAccuracy, whiteElo, blackAccuracy, blackElo });
                return;
              }

              const urlAudio = `${coachs[config.coach].link}${audioUrlHash}.mp3`;

              this.worker.removeEventListener("message", onMessage);

              resolve({
                classificationName,
                fen,
                urlAudio,
                sentence,
                moveLan,
                whiteAccuracy,
                whiteElo,
                blackAccuracy,
                blackElo,
              });
            } catch (err) {}
          };

          this.worker.addEventListener("message", onMessage);

          this.send(`setoption name UserColor value ${side}`);
          this.send(
            `setoption name HandleContinuationsDepth value ${config.depth2}`,
          );
          this.send(`setoption name BlackElo value ${blackElo}`);
          this.send(`setoption name WhiteElo value ${whiteElo}`);

          this.send(movesString);
          this.send("fetch analysis");
        });
      }
    }

// ─── Coach Initialization ─────────────────────────────────────────────────
    let coach = null;

    if (config.coach < 988) {
      coach = new CoachEngine();
    }

    function onCoachChanged(newCoach) {
      location.reload(true);
    }
