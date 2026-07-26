document.addEventListener("DOMContentLoaded", () => {
  chrome?.runtime?.sendMessage({ type: "popupReady" });
});

/* ================= DRAGGABLE ================= */
(() => {
  const handle = document.getElementById("dragHandle");
  if (!handle) return;
  let dragging = false, startX, startY;
  handle.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.screenX;
    startY = e.screenY;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.screenX - startX;
    const dy = e.screenY - startY;
    startX = e.screenX;
    startY = e.screenY;
    chrome?.windows?.getCurrent?.((win) => {
      if (win) chrome.windows.update(win.id, { left: win.left + dx, top: win.top + dy });
    });
  });
  document.addEventListener("mouseup", () => { dragging = false; });
})();

/* ================= TABS ================= */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.onclick = () => {
    document
      .querySelectorAll(".tab, .panel")
      .forEach((e) => e.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.panel).classList.add("active");
  };
});

const coachData = {
  "David":  { pic: "https://assets-coaches.chess.com/image/coachdavid.png" },
  "Mae":    { pic: "https://assets-coaches.chess.com/image/coachmae.png" },
  "Dante":  { pic: "https://assets-coaches.chess.com/image/coachdante.png" },
  "Nadia":  { pic: "https://assets-coaches.chess.com/image/coachnadia.png" },
  "Levy":   { pic: "https://assets-coaches.chess.com/image/coachlevy.png" },
  "Magnus": { pic: "https://assets-coaches.chess.com/image/coachmagnus.png" },
  "Hikaru": { pic: "https://assets-coaches.chess.com/image/coachhikaru.png" },
  "Anna":   { pic: "https://assets-coaches.chess.com/image/coachanna.png" },
  "Canty":  { pic: "https://assets-coaches.chess.com/image/coachcanty.png" },
  "Vishy":  { pic: "https://assets-coaches.chess.com/image/coachvishy.png" },
  "Tania":  { pic: "https://assets-coaches.chess.com/image/coachtania.png" },
  "Danny":  { pic: "https://assets-coaches.chess.com/image/coachdanny.png" },
  "Botez":  { pic: "https://assets-coaches.chess.com/image/coachbotezsisters-icon.png" },
  "Ben":    { pic: "https://assets-coaches.chess.com/image/coachben.png" },
};

const coachLangs = {
  0:"English",1:"Français",2:"Español",3:"عربي",4:"Русский",5:"Português",
  6:"Deutsch",7:"Italiano",8:"Türkçe",9:"Polski",10:"한국어",11:"Indonesia",
  12:"English",13:"Français",14:"Español",15:"عربي",16:"Русский",17:"Português",
  18:"Deutsch",19:"Italiano",20:"Türkçe",21:"Polski",22:"한국어",23:"Indonesia",
  24:"English",25:"Français",26:"Español",27:"عربي",28:"Русский",29:"Português",
  30:"Deutsch",31:"Italiano",32:"Türkçe",33:"Polski",34:"한국어",35:"Indonesia",
  36:"English",37:"Français",38:"Español",39:"عربي",40:"Русский",41:"Português",
  42:"Deutsch",43:"Italiano",44:"Türkçe",45:"Polski",46:"한국어",47:"Indonesia",
  48:"English",49:"English",50:"English",51:"English",52:"English",
  53:"English",54:"English",55:"English",56:"English",57:"English",
};

const coachNames = {
  0:"David",1:"David",2:"David",3:"David",4:"David",5:"David",6:"David",7:"David",8:"David",9:"David",10:"David",11:"David",
  12:"Mae",13:"Mae",14:"Mae",15:"Mae",16:"Mae",17:"Mae",18:"Mae",19:"Mae",20:"Mae",21:"Mae",22:"Mae",23:"Mae",
  24:"Dante",25:"Dante",26:"Dante",27:"Dante",28:"Dante",29:"Dante",30:"Dante",31:"Dante",32:"Dante",33:"Dante",34:"Dante",35:"Dante",
  36:"Nadia",37:"Nadia",38:"Nadia",39:"Nadia",40:"Nadia",41:"Nadia",42:"Nadia",43:"Nadia",44:"Nadia",45:"Nadia",46:"Nadia",47:"Nadia",
  48:"Levy",49:"Magnus",50:"Hikaru",51:"Anna",52:"Canty",53:"Vishy",54:"Tania",55:"Danny",56:"Botez",57:"Ben"
};

function updateCoachAvatar(coachId) {
  const none = document.getElementById("coachAvatarNone");
  const img  = document.getElementById("coachAvatarImg");
  const badge = document.getElementById("coachBadge");
  const nameEl = document.getElementById("coachDisplayName");
  const langEl = document.getElementById("coachDisplayLang");

  if (coachId === 999) {
    none.style.display = "flex";
    img.style.display  = "none";
    badge.style.display = "none";
    nameEl.className = "coach-name-none";
    nameEl.textContent = "No Coach";
    langEl.textContent = "Select a coach to get started";
    return;
  }

  const name = coachNames[coachId] || "Coach";
  const lang = coachLangs[coachId] || "English";
  const data = coachData[name];

  nameEl.className = "coach-name";
  nameEl.textContent = name;
  langEl.textContent = lang;
  badge.style.display = "flex";

  if (data) {
    img.src = data.pic;
    img.alt = name;
    img.style.display = "block";
    none.style.display = "none";
    img.onerror = () => { img.style.display = "none"; none.style.display = "flex"; };
  } else {
    img.style.display = "none";
    none.style.display = "flex";
  }
}

const el = (id) => document.getElementById(id);

/* ================= CONFIG ================= */
const defaultChessConfig = {
  coach: 999,
  depth2: 10,
  speach: false,
  moveClassification: false,
  showAccWidget: true,
  key: "=",
  key2: "-",
};

let chessConfig = { ...defaultChessConfig };

function loadChessConfig(callback) {
  chrome.storage.local.get(["chessConfig"], function (result) {
    const savedConfig = result.chessConfig;
    chessConfig = savedConfig
      ? { ...defaultChessConfig, ...savedConfig }
      : { ...defaultChessConfig };

    el("coach-container").style.display = chessConfig.coach === 999 ? "none" : "";
    updateChessUI();
    if (callback) callback();
  });
}

function saveChessConfig() {
  chrome.storage.local.set({ chessConfig }, () => {
    console.log("Config saved");
  });
}

function updateChessUI() {
  el("coach").value = chessConfig.coach;
  el("depth2").value = chessConfig.depth2;
  el("depth2Value").textContent = chessConfig.depth2;

  el("moveClassification").checked = chessConfig.moveClassification;
  el("speach").checked = chessConfig.speach;
  el("showAccWidget").checked = chessConfig.showAccWidget;

  el("moveClassificationStartLabel").textContent = 
    `Move Classification Icons (${chessConfig.moveClassification ? "ON" : "OFF"})`;
  
  el("speachStartLabel").textContent = 
    `Coach Voice Explanation (${chessConfig.speach ? "ON" : "OFF"})`;

  el("accWidgetStartLabel").textContent = 
    `Accuracy Widget (${chessConfig.showAccWidget ? "ON" : "OFF"})`;

  el("toggleKey").value = chessConfig.key || "=";
  el("switchKey").value = chessConfig.key2 || "-";

  // Update coach avatar
  updateCoachAvatar(chessConfig.coach);
}

loadChessConfig(updateChessUI);

/* ================= INPUT HANDLERS ================= */
el("depth2").oninput = (e) => {
  chessConfig.depth2 = +e.target.value;
  updateChessUI();
  saveChessConfig();
};

["moveClassification", "speach", "showAccWidget"].forEach((k) => {
  el(k).onchange = (e) => {
    chessConfig[k] = e.target.checked;
    updateChessUI();
    saveChessConfig();
  };
});

el("coach").onchange = (e) => {
  chessConfig.coach = parseInt(e.target.value);
  el("coach-container").style.display = chessConfig.coach === 999 ? "none" : "";
  updateChessUI();
  saveChessConfig();
};

/* ================= KEY INPUT HANDLERS ================= */
el("toggleKey").oninput = (e) => {
  const val = e.target.value.slice(-1) || "=";
  e.target.value = val;
  chessConfig.key = val;
  saveChessConfig();
};

el("switchKey").oninput = (e) => {
  const val = e.target.value.slice(-1) || "-";
  e.target.value = val;
  chessConfig.key2 = val;
  saveChessConfig();
};

/* ================= RESET ================= */
el("reset").onclick = async () => {
  await chrome.storage.local.clear();
  location.reload();
};