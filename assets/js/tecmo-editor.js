const PALETTE = [
  [247, 247, 239, 255],
  [102, 143, 186, 255],
  [190, 88, 75, 255],
  [32, 36, 38, 255],
];

const HAS_LOCAL_PROXY = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const MADDEN_FALLBACK_URL = window.MADDEN_FALLBACK_URL || "./data.csv";

const els = {
  subtitle: document.querySelector("#rom-subtitle"),
  loadBundled: document.querySelector("#load-bundled"),
  file: document.querySelector("#rom-file"),
  exportRom: document.querySelector("#export-rom"),
  revertRom: document.querySelector("#revert-rom"),
  summary: document.querySelector("#summary"),
  vectors: document.querySelector("#vectors"),
  tileInfo: document.querySelector("#tile-info"),
  paletteRow: document.querySelector("#palette-row"),
  tileEditor: document.querySelector("#tile-editor"),
  chrCanvas: document.querySelector("#chr-canvas"),
  chrBank: document.querySelector("#chr-bank"),
  prgBank: document.querySelector("#prg-bank"),
  zoom: document.querySelector("#zoom"),
  dirtyState: document.querySelector("#dirty-state"),
  prgMap: document.querySelector("#prg-map"),
  chrMap: document.querySelector("#chr-map"),
  hexView: document.querySelector("#hex-view"),
  scanStrings: document.querySelector("#scan-strings"),
  stringsTable: document.querySelector("#strings-table"),
  clearTile: document.querySelector("#clear-tile"),
  copyTile: document.querySelector("#copy-tile"),
  pasteTile: document.querySelector("#paste-tile"),
  hackFilter: document.querySelector("#hack-filter"),
  hackControls: document.querySelector("#hack-controls"),
  hackDetail: document.querySelector("#hack-detail"),
  applyHack: document.querySelector("#apply-hack"),
  copySet: document.querySelector("#copy-set"),
  setInput: document.querySelector("#set-input"),
  previewSet: document.querySelector("#preview-set"),
  applySet: document.querySelector("#apply-set"),
  setStatus: document.querySelector("#set-status"),
  teamSelect: document.querySelector("#team-select"),
  draftUserTeam: document.querySelector("#draft-user-team"),
  draftSeed: document.querySelector("#draft-seed"),
  startDraft: document.querySelector("#start-draft"),
  autoDraft: document.querySelector("#auto-draft"),
  draftForMe: document.querySelector("#draft-for-me"),
  applyDraft: document.querySelector("#apply-draft"),
  resetDraft: document.querySelector("#reset-draft"),
  draftSearch: document.querySelector("#draft-search"),
  draftPositionFilter: document.querySelector("#draft-position-filter"),
  draftStatus: document.querySelector("#draft-status"),
  draftBoard: document.querySelector("#draft-board"),
  draftPickSummary: document.querySelector("#draft-pick-summary"),
  draftNeeds: document.querySelector("#draft-needs"),
  draftLog: document.querySelector("#draft-log"),
  identityTeamSelect: document.querySelector("#identity-team-select"),
  teamIdentityHeading: document.querySelector("#team-identity-heading"),
  teamIdentityStatus: document.querySelector("#team-identity-status"),
  teamIdentityEditor: document.querySelector("#team-identity-editor"),
  teamNameDiff: document.querySelector("#team-name-diff"),
  updateTeamNames: document.querySelector("#update-team-names"),
  applyTeamChanges: document.querySelector("#apply-team-changes"),
  colorTeamSelect: document.querySelector("#color-team-select"),
  colorStatus: document.querySelector("#color-status"),
  colorEditor: document.querySelector("#color-editor"),
  colorDiff: document.querySelector("#color-diff"),
  applyColorChanges: document.querySelector("#apply-color-changes"),
  rosterHeading: document.querySelector("#roster-heading"),
  maddenHeading: document.querySelector("#madden-heading"),
  playerStatus: document.querySelector("#player-status"),
  playerTable: document.querySelector("#player-table"),
  playerDiff: document.querySelector("#player-diff"),
  attributeStatus: document.querySelector("#attribute-status"),
  attributeEditor: document.querySelector("#attribute-editor"),
  applyPlayerNames: document.querySelector("#apply-player-names"),
  importMadden: document.querySelector("#import-madden"),
  maddenStatus: document.querySelector("#madden-status"),
  maddenTeamSelect: document.querySelector("#madden-team-select"),
  applyMaddenTeam: document.querySelector("#apply-madden-team"),
  applyMaddenAll: document.querySelector("#apply-madden-all"),
  maddenPaste: document.querySelector("#madden-paste"),
  parseMaddenPaste: document.querySelector("#parse-madden-paste"),
  maddenPreview: document.querySelector("#madden-preview"),
  workOverlay: document.querySelector("#work-overlay"),
  workTitle: document.querySelector("#work-title"),
  workDetail: document.querySelector("#work-detail"),
  workProgress: document.querySelector("#work-progress"),
  workCount: document.querySelector("#work-count"),
};

let rom = null;
let originalRom = null;
let meta = null;
let romName = "edited.nes";
let selectedChrBank = 0;
let selectedTile = 0;
let selectedColor = 3;
let dirty = false;
let copiedTile = null;
let selectedPatch = null;
let playerTable = null;
let playerAttributeTable = null;
let teamStringTable = null;
let selectedPlayerSlot = 0;
let pendingNameEdits = new Map();
let pendingNumberEdits = new Map();
let pendingTeamEdits = new Map();
let pendingColorEdits = new Map();
let maddenPlayers = [];
let draftState = null;

const NES_COLORS = [
  "#626262", "#002A88", "#1412A7", "#3B00A4", "#5C007E", "#6E0040", "#6C0600", "#561D00",
  "#333500", "#0B4800", "#005200", "#004F08", "#00404D", "#000000", "#000000", "#000000",
  "#ABABAB", "#155FD9", "#4240FF", "#7527FE", "#A01ACC", "#B71E7B", "#B53120", "#994E00",
  "#6B6D00", "#388700", "#0C9300", "#008F32", "#007C8D", "#000000", "#000000", "#000000",
  "#FFFFFF", "#64B0FF", "#9290FF", "#C676FF", "#F36AFF", "#FE6ECC", "#FE8170", "#EA9E22",
  "#BCBE00", "#88D800", "#5CE430", "#45E082", "#48CDDE", "#4F4F4F", "#000000", "#000000",
  "#FFFFFF", "#C0DFFF", "#D3D2FF", "#E8C8FF", "#FAC2FF", "#FEC4EA", "#FECCC5", "#F7D8A5",
  "#E4E594", "#CFEE96", "#BDF4AB", "#B3F3CC", "#B5EBF2", "#B8B8B8", "#000000", "#000000",
];

const DEFAULT_TEAM_NAMES_12 = [
  "IND", "MIA", "CLE", "DEN", "SEA", "RAI", "WAS", "SF", "DAL", "NYG", "CHI", "MIN",
];

const TSB_TEAM_NAMES_28 = [
  "BUF", "IND", "MIA", "NE", "NYJ", "CIN", "CLE", "HOU", "PIT", "DEN", "KC", "RAI", "SD", "SEA",
  "WAS", "NYG", "PHI", "PHX", "DAL", "CHI", "DET", "GB", "MIN", "TB", "SF", "RAM", "NO", "ATL",
];

const TEAM_COLOR_BASE = 0x31140;
const SHARED_TEAM_COLOR_OFFSETS = [
  { label: "Team Screen Shared 1", offset: 0x31E89 },
  { label: "Team Screen Shared 2", offset: 0x31E8A },
  { label: "Team Screen Shared 3", offset: 0x31E8B },
  { label: "Team Screen Shared 4", offset: 0x31E8C },
];
const MENU_COLOR_OFFSETS = [
  { label: "Main Menu Background 1", offset: 0x1A850 },
  { label: "Main Menu Background 2", offset: 0x1A854 },
  { label: "Main Menu Background 3", offset: 0x1A858 },
  { label: "Main Menu Background 4", offset: 0x1A859 },
  { label: "Schedule Background", offset: 0x1A860 },
];
const PRO_BOWL_COLOR_OFFSETS = Array.from({ length: 16 }, (_, index) => ({
  label: `Pro Bowl Uniform ${index + 1}`,
  offset: 0x2C3FC + index,
}));

const TECMO_TO_MADDEN_TEAMS = {
  BUF: "Buffalo Bills", IND: "Indianapolis Colts", MIA: "Miami Dolphins", NE: "New England Patriots", NYJ: "New York Jets",
  CIN: "Cincinnati Bengals", CLE: "Cleveland Browns", HOU: "Tennessee Titans", PIT: "Pittsburgh Steelers",
  DEN: "Denver Broncos", KC: "Kansas City Chiefs", RAI: "Las Vegas Raiders", SD: "Los Angeles Chargers", SEA: "Seattle Seahawks",
  DAL: "Dallas Cowboys", NYG: "New York Giants", PHI: "Philadelphia Eagles", PHX: "Arizona Cardinals", WAS: "Washington Commanders",
  CHI: "Chicago Bears", DET: "Detroit Lions", GB: "Green Bay Packers", MIN: "Minnesota Vikings",
  ATL: "Atlanta Falcons", RAM: "Los Angeles Rams", NO: "New Orleans Saints", SF: "San Francisco 49ers", TB: "Tampa Bay Buccaneers",
};

const MODERN_TEAM_IDENTITIES = [
  ["BUF.", "BUFFALO", "BILLS"],
  ["IND.", "INDIANAPOLIS", "COLTS"],
  ["MIA.", "MIAMI", "DOLPHINS"],
  ["N.E.", "NEW ENGLAND", "PATRIOTS"],
  ["JETS", "NEW YORK", "JETS"],
  ["CIN.", "CINCINNATI", "BENGALS"],
  ["CLE.", "CLEVELAND", "BROWNS"],
  ["TEN.", "TENNESSEE", "TITANS"],
  ["PIT.", "PITTSBURGH", "STEELERS"],
  ["DEN.", "DENVER", "BRONCOS"],
  ["K.C.", "KANSAS CITY", "CHIEFS"],
  ["L.V.", "LAS VEGAS", "RAIDERS"],
  ["LAC.", "LOS ANGELES", "CHARGERS"],
  ["SEA.", "SEATTLE", "SEAHAWKS"],
  ["WAS.", "WASHINGTON", "COMMANDERS"],
  ["GIA.", "NEW YORK", "GIANTS"],
  ["PHI.", "PHILADELPHIA", "EAGLES"],
  ["ARI.", "ARIZONA", "CARDINALS"],
  ["DAL.", "DALLAS", "COWBOYS"],
  ["CHI.", "CHICAGO", "BEARS"],
  ["DET.", "DETROIT", "LIONS"],
  ["G.B.", "GREEN BAY", "PACKERS"],
  ["MIN.", "MINNESOTA", "VIKINGS"],
  ["T.B.", "TAMPA BAY", "BUCCANEERS"],
  ["S.F.", "SAN FRANCISCO", "49ERS"],
  ["LAR.", "LOS ANGELES", "RAMS"],
  ["N.O.", "NEW ORLEANS", "SAINTS"],
  ["ATL.", "ATLANTA", "FALCONS"],
];

const TSB_POSITIONS_30 = [
  "QB1", "QB2", "RB1", "RB2", "RB3", "RB4", "WR1", "WR2", "WR3", "WR4", "TE1", "TE2",
  "C", "LG", "RG", "LT", "RT", "RE", "NT", "LE", "ROLB", "RILB", "LILB", "LOLB", "RCB", "LCB",
  "FS", "SS", "K", "P",
];

const MADDEN_TEAM_ALIASES = {
  BUF: ["Buffalo Bills", "Bills", "BUF"],
  IND: ["Indianapolis Colts", "Colts", "IND"],
  MIA: ["Miami Dolphins", "Dolphins", "MIA"],
  NE: ["New England Patriots", "Patriots", "NE", "NEP"],
  NYJ: ["New York Jets", "NY Jets", "Jets", "NYJ"],
  CIN: ["Cincinnati Bengals", "Bengals", "CIN"],
  CLE: ["Cleveland Browns", "Browns", "CLE"],
  HOU: ["Tennessee Titans", "Titans", "TEN", "Houston Oilers", "Oilers", "HOU"],
  PIT: ["Pittsburgh Steelers", "Steelers", "PIT"],
  DEN: ["Denver Broncos", "Broncos", "DEN"],
  KC: ["Kansas City Chiefs", "Chiefs", "KC", "KCC"],
  SEA: ["Seattle Seahawks", "Seahawks", "SEA"],
  RAI: ["Las Vegas Raiders", "Raiders", "LV", "LVR", "OAK", "Los Angeles Raiders"],
  SD: ["Los Angeles Chargers", "Chargers", "LAC", "San Diego Chargers", "SD"],
  WAS: ["Washington Commanders", "Commanders", "WAS", "WSH", "Washington"],
  SF: ["San Francisco 49ers", "49ers", "SF", "SFO"],
  DAL: ["Dallas Cowboys", "Cowboys", "DAL"],
  NYG: ["New York Giants", "NY Giants", "Giants", "NYG"],
  PHI: ["Philadelphia Eagles", "Eagles", "PHI"],
  PHX: ["Arizona Cardinals", "Cardinals", "ARI", "Phoenix Cardinals", "PHX"],
  CHI: ["Chicago Bears", "Bears", "CHI"],
  DET: ["Detroit Lions", "Lions", "DET"],
  GB: ["Green Bay Packers", "Packers", "GB", "GBP"],
  MIN: ["Minnesota Vikings", "Vikings", "MIN"],
  TB: ["Tampa Bay Buccaneers", "Buccaneers", "Bucs", "TB", "TBB"],
  RAM: ["Los Angeles Rams", "Rams", "LAR", "RAM"],
  NO: ["New Orleans Saints", "Saints", "NO", "NOS"],
  ATL: ["Atlanta Falcons", "Falcons", "ATL"],
};

const TECMO_SLOT_ROLES_21 = [
  { label: "REC", groups: ["REC"] },
  { label: "REC/TE", groups: ["REC"] },
  { label: "RB", groups: ["RB"] },
  { label: "QB", groups: ["QB"] },
  { label: "REC", groups: ["REC"] },
  { label: "OL", groups: ["OL"] },
  { label: "OL", groups: ["OL"] },
  { label: "OL", groups: ["OL"] },
  { label: "OL", groups: ["OL"] },
  { label: "RET", groups: ["RB", "REC", "DB"] },
  { label: "K", groups: ["K"] },
  { label: "P", groups: ["P"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
  { label: "DEF", groups: ["DL", "LB", "DB"] },
];

const TSB_SLOT_ROLES_30 = TSB_POSITIONS_30.map((position) => {
  if (position.startsWith("QB")) return { label: position, groups: ["QB"] };
  if (position.startsWith("RB")) return { label: position, groups: ["RB"] };
  if (position.startsWith("WR") || position.startsWith("TE")) return { label: position, groups: ["REC"] };
  if (["C", "LG", "RG", "LT", "RT"].includes(position)) return { label: position, groups: ["OL"] };
  if (position === "K") return { label: position, groups: ["K"] };
  if (position === "P") return { label: position, groups: ["P"] };
  if (["RE", "NT", "LE"].includes(position)) return { label: position, groups: ["DL"] };
  if (position.includes("LB")) return { label: position, groups: ["LB"] };
  return { label: position, groups: ["DB"] };
});

const TSB_ATTRIBUTE_VALUE_STEPS = [6, 13, 19, 25, 31, 38, 44, 50, 56, 63, 69, 75, 81, 88, 94, 100];
const TSB_IMPORT_NAME_LIMIT = 15;
const DRAFT_GROUP_ORDER = ["QB", "RB", "REC", "OL", "DL", "LB", "DB", "K", "P"];

const ATTRIBUTE_LABELS_BY_ROLE = {
  QB: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Passing Speed", "Pass Control", "Passing Accuracy", "Avoid Pass Block"],
  RB: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Ball Control", "Receptions"],
  REC: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Ball Control", "Receptions"],
  OL: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power"],
  K: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Kicking Ability", "Avoid Kick Block"],
  P: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Kicking Ability", "Avoid Kick Block"],
  DEF: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Pass Rush", "Interceptions"],
};

const POSITION_GROUPS = {
  QB: "QB",
  QUARTERBACK: "QB",
  HB: "RB",
  RB: "RB",
  FB: "RB",
  HALFBACK: "RB",
  FULLBACK: "RB",
  WR: "REC",
  TE: "REC",
  "WIDE RECEIVER": "REC",
  "TIGHT END": "REC",
  LT: "OL",
  LG: "OL",
  C: "OL",
  RG: "OL",
  RT: "OL",
  CENTER: "OL",
  "LEFT GUARD": "OL",
  "RIGHT GUARD": "OL",
  "LEFT TACKLE": "OL",
  "RIGHT TACKLE": "OL",
  K: "K",
  P: "P",
  KICKER: "K",
  PUNTER: "P",
  LE: "DL",
  RE: "DL",
  DT: "DL",
  DL: "DL",
  "DEFENSIVE END": "DL",
  "DEFENSIVE TACKLE": "DL",
  "LEFT EDGE": "DL",
  "RIGHT EDGE": "DL",
  LEDG: "DL",
  REDG: "DL",
  LOLB: "LB",
  MLB: "LB",
  ROLB: "LB",
  LB: "LB",
  LINEBACKER: "LB",
  "MIKE BACKER": "LB",
  "SAM BACKER": "LB",
  "WEAK BACKER": "LB",
  "LONG SNAPPER": "OL",
  CB: "DB",
  FS: "DB",
  SS: "DB",
  DB: "DB",
  CORNERBACK: "DB",
  "FREE SAFETY": "DB",
  "STRONG SAFETY": "DB",
};

function hex(value, width = 6) {
  return "0x" + value.toString(16).toUpperCase().padStart(width, "0");
}

function cpuHex(value) {
  return "$" + value.toString(16).toUpperCase().padStart(4, "0");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function byteHex(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function timestampForFilename() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "_",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function showWork(title, detail = "Preparing...", value = 0, max = 100) {
  els.workTitle.textContent = title;
  els.workDetail.textContent = detail;
  els.workProgress.max = Math.max(1, max);
  els.workProgress.value = Math.max(0, Math.min(value, max));
  els.workCount.textContent = `${Math.min(value, max).toLocaleString()} / ${max.toLocaleString()}`;
  els.workOverlay.hidden = false;
}

function updateWork(detail, value, max = Number(els.workProgress.max) || 100) {
  els.workDetail.textContent = detail;
  els.workProgress.max = Math.max(1, max);
  els.workProgress.value = Math.max(0, Math.min(value, max));
  els.workCount.textContent = `${Math.min(value, max).toLocaleString()} / ${max.toLocaleString()}`;
}

function hideWork() {
  els.workOverlay.hidden = true;
}

async function withWork(title, detail, task, max = 100) {
  showWork(title, detail, 0, max);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  try {
    return await task();
  } finally {
    hideWork();
  }
}

function parseRom(bytes) {
  if (bytes.length < 16 || bytes[0] !== 0x4E || bytes[1] !== 0x45 || bytes[2] !== 0x53 || bytes[3] !== 0x1A) {
    throw new Error("This does not look like an iNES NES ROM.");
  }

  const prgBanks = bytes[4];
  const chrBanks = bytes[5];
  const flags6 = bytes[6];
  const flags7 = bytes[7];
  const mapper = (flags6 >> 4) | (flags7 & 0xF0);
  const hasTrainer = Boolean(flags6 & 0x04);
  const trainerSize = hasTrainer ? 512 : 0;
  const prgOffset = 16 + trainerSize;
  const prgSize = prgBanks * 0x4000;
  const chrOffset = prgOffset + prgSize;
  const chrSize = chrBanks * 0x2000;
  const endOffset = chrOffset + chrSize;

  if (bytes.length < endOffset) {
    throw new Error("The ROM is shorter than its header says it should be.");
  }

  const vectorBase = prgOffset + prgSize - 6;
  const read16 = (offset) => bytes[offset] | (bytes[offset + 1] << 8);

  return {
    container: (flags7 & 0x0C) === 0x08 ? "NES 2.0" : "iNES",
    prgBanks,
    chrBanks,
    flags6,
    flags7,
    mapper,
    mirroring: (flags6 & 0x08) ? "four-screen" : (flags6 & 0x01) ? "vertical" : "horizontal",
    battery: Boolean(flags6 & 0x02),
    hasTrainer,
    trainerSize,
    prgOffset,
    prgSize,
    chrOffset,
    chrSize,
    endOffset,
    extraSize: bytes.length - endOffset,
    nmi: read16(vectorBase),
    reset: read16(vectorBase + 2),
    irq: read16(vectorBase + 4),
  };
}

function setLoadedRom(bytes, name) {
  rom = new Uint8Array(bytes);
  originalRom = new Uint8Array(bytes);
  meta = parseRom(rom);
  romName = name.replace(/\.nes$/i, "") + ".nes";
  selectedChrBank = 0;
  selectedTile = 0;
  dirty = false;
  copiedTile = null;
  pendingNameEdits = new Map();
  pendingNumberEdits = new Map();
  pendingTeamEdits = new Map();
  pendingColorEdits = new Map();
  selectedPlayerSlot = 0;
  draftState = null;

  fillSelects();
  renderAll();
  enableControls(true);
  renderHackDetail();
}

function enableControls(enabled) {
  [
    els.exportRom,
    els.revertRom,
    els.chrBank,
    els.prgBank,
    els.scanStrings,
    els.clearTile,
    els.copyTile,
    els.pasteTile,
    els.importMadden,
  ].forEach((el) => {
    el.disabled = !enabled || (el === els.pasteTile && !copiedTile);
  });
  els.previewSet.disabled = !enabled || !els.setInput.value.trim();
  els.applySet.disabled = !enabled || !els.setInput.value.trim();
  els.applyHack.disabled = !enabled || !selectedPatch;
  els.copySet.disabled = !selectedPatch;
  els.teamSelect.disabled = !enabled || !playerTable;
  els.identityTeamSelect.disabled = !enabled || !teamStringTable;
  els.updateTeamNames.disabled = !enabled || !teamStringTable;
  els.applyTeamChanges.disabled = !enabled || !pendingTeamEdits.size;
  els.colorTeamSelect.disabled = !enabled || !looksLikeTsbRom();
  els.applyColorChanges.disabled = !enabled || !pendingColorEdits.size;
  els.applyPlayerNames.disabled = !enabled || (!pendingNameEdits.size && !pendingNumberEdits.size);
  els.maddenTeamSelect.disabled = !maddenPlayers.length;
  els.applyMaddenTeam.disabled = !enabled || !playerTable || !maddenPlayers.length;
  els.applyMaddenAll.disabled = !enabled || playerTable?.format !== "tsb-pointer" || !maddenPlayers.length;
}

function fillSelects() {
  els.chrBank.innerHTML = "";
  for (let i = 0; i < meta.chrBanks; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `CHR ${i.toString().padStart(2, "0")}`;
    els.chrBank.append(option);
  }

  els.prgBank.innerHTML = "";
  for (let i = 0; i < meta.prgBanks; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `PRG ${i.toString().padStart(2, "0")}`;
    els.prgBank.append(option);
  }

  playerTable = detectPlayerNameTable();
  playerAttributeTable = detectPlayerAttributeTable();
  teamStringTable = detectTeamStringTable();
  fillTeamSelect();
  renderDraftTeamSelect();
  fillIdentityTeamSelect();
  fillColorTeamSelect();
}

function renderAll() {
  renderSummary();
  renderMaps();
  renderChrBank();
  renderTileEditor();
  renderHex();
  renderHackControls();
  renderPlayers();
  renderDraft();
  renderTeams();
  renderColors();
  updateDirty();
  els.subtitle.textContent = `${romName} loaded`;
}

function renderSummary() {
  const rows = [
    ["File", romName],
    ["Size", `${rom.length.toLocaleString()} bytes`],
    ["Container", meta.container],
    ["Mapper", `${meta.mapper} (${meta.mapper === 1 ? "MMC1" : meta.mapper === 4 ? "MMC3" : "unknown here"})`],
    ["PRG", `${meta.prgBanks} x 16 KB`],
    ["CHR", `${meta.chrBanks} x 8 KB`],
    ["Mirroring", meta.mirroring],
    ["Battery", meta.battery ? "yes" : "no"],
    ["Trainer", meta.hasTrainer ? "yes" : "no"],
    ["Trailing", `${meta.extraSize} bytes`],
  ];
  els.summary.innerHTML = rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
  els.vectors.innerHTML = [
    ["NMI", cpuHex(meta.nmi)],
    ["Reset", cpuHex(meta.reset)],
    ["IRQ", cpuHex(meta.irq)],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

function renderMaps() {
  els.prgMap.innerHTML = "";
  for (let i = 0; i < meta.prgBanks; i += 1) {
    const start = meta.prgOffset + i * 0x4000;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${i.toString().padStart(2, "0")}</td><td>${hex(start)}-${hex(start + 0x3FFF)}</td><td>${i === meta.prgBanks - 1 ? "$C000-$FFFF fixed" : "$8000-$BFFF switchable"}</td>`;
    els.prgMap.append(row);
  }

  els.chrMap.innerHTML = "";
  for (let i = 0; i < meta.chrBanks; i += 1) {
    const start = meta.chrOffset + i * 0x2000;
    const row = document.createElement("tr");
    row.innerHTML = `<td>${i.toString().padStart(2, "0")}</td><td>${hex(start)}-${hex(start + 0x1FFF)}</td><td>512</td>`;
    els.chrMap.append(row);
  }
}

function getTilePixels(bankIndex, tileIndex) {
  const base = meta.chrOffset + bankIndex * 0x2000 + tileIndex * 16;
  const pixels = new Uint8Array(64);
  for (let y = 0; y < 8; y += 1) {
    const lo = rom[base + y];
    const hi = rom[base + y + 8];
    for (let x = 0; x < 8; x += 1) {
      const bit = 7 - x;
      pixels[y * 8 + x] = ((lo >> bit) & 1) | (((hi >> bit) & 1) << 1);
    }
  }
  return pixels;
}

function setTilePixels(bankIndex, tileIndex, pixels) {
  const base = meta.chrOffset + bankIndex * 0x2000 + tileIndex * 16;
  for (let y = 0; y < 8; y += 1) {
    let lo = 0;
    let hi = 0;
    for (let x = 0; x < 8; x += 1) {
      const bit = 7 - x;
      const value = pixels[y * 8 + x] & 3;
      lo |= (value & 1) << bit;
      hi |= ((value >> 1) & 1) << bit;
    }
    rom[base + y] = lo;
    rom[base + y + 8] = hi;
  }
  dirty = true;
  updateDirty();
}

function drawPixelBlock(ctx, x, y, scale, colorIndex) {
  const color = PALETTE[colorIndex];
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
  ctx.fillRect(x, y, scale, scale);
}

function renderChrBank() {
  if (!meta || !meta.chrBanks) return;
  const zoom = Number(els.zoom.value);
  const tileSize = 8 * zoom;
  const cols = 16;
  const rows = 32;
  const width = cols * tileSize;
  const height = rows * tileSize;
  els.chrCanvas.width = width;
  els.chrCanvas.height = height;
  const ctx = els.chrCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#f7f7ef";
  ctx.fillRect(0, 0, width, height);

  for (let tile = 0; tile < 512; tile += 1) {
    const pixels = getTilePixels(selectedChrBank, tile);
    const ox = (tile % cols) * tileSize;
    const oy = Math.floor(tile / cols) * tileSize;
    for (let y = 0; y < 8; y += 1) {
      for (let x = 0; x < 8; x += 1) {
        drawPixelBlock(ctx, ox + x * zoom, oy + y * zoom, zoom, pixels[y * 8 + x]);
      }
    }
  }

  ctx.strokeStyle = "#d99a2b";
  ctx.lineWidth = Math.max(2, zoom);
  const sx = (selectedTile % cols) * tileSize;
  const sy = Math.floor(selectedTile / cols) * tileSize;
  ctx.strokeRect(sx + 1, sy + 1, tileSize - 2, tileSize - 2);
  renderTileInfo();
}

function renderTileInfo() {
  const offset = meta.chrOffset + selectedChrBank * 0x2000 + selectedTile * 16;
  els.tileInfo.innerHTML = [
    ["Bank", selectedChrBank.toString().padStart(2, "0")],
    ["Tile", selectedTile.toString().padStart(3, "0")],
    ["Offset", hex(offset)],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
}

function renderTileEditor() {
  if (!meta || !meta.chrBanks) return;
  const ctx = els.tileEditor.getContext("2d");
  const size = els.tileEditor.width / 8;
  ctx.imageSmoothingEnabled = false;
  const pixels = getTilePixels(selectedChrBank, selectedTile);
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      drawPixelBlock(ctx, x * size, y * size, size, pixels[y * 8 + x]);
    }
  }
  ctx.strokeStyle = "rgba(0, 0, 0, 0.26)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * size + 0.5, 0);
    ctx.lineTo(i * size + 0.5, els.tileEditor.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * size + 0.5);
    ctx.lineTo(els.tileEditor.width, i * size + 0.5);
    ctx.stroke();
  }
}

function renderPalette() {
  els.paletteRow.innerHTML = "";
  PALETTE.forEach((color, index) => {
    const swatch = document.createElement("button");
    swatch.className = `swatch${index === selectedColor ? " active" : ""}`;
    swatch.type = "button";
    swatch.title = `Paint color ${index}`;
    swatch.style.background = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    swatch.addEventListener("click", () => {
      selectedColor = index;
      renderPalette();
    });
    els.paletteRow.append(swatch);
  });
}

function renderHex() {
  if (!meta) return;
  const bank = Number(els.prgBank.value || 0);
  const start = meta.prgOffset + bank * 0x4000;
  const end = Math.min(start + 0x4000, rom.length);
  const lines = [];
  for (let offset = start; offset < end; offset += 16) {
    const slice = rom.slice(offset, Math.min(offset + 16, end));
    const bytes = Array.from(slice).map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
    const ascii = Array.from(slice).map((b) => b >= 32 && b <= 126 ? String.fromCharCode(b) : ".").join("");
    lines.push(`${hex(offset)}  ${bytes.padEnd(47, " ")}  ${ascii}`);
  }
  els.hexView.textContent = lines.join("\n");
}

function updateDirty() {
  els.dirtyState.textContent = dirty ? "Modified" : "Clean";
  els.dirtyState.classList.toggle("dirty", dirty);
}

function romNameToDisplay(bytes) {
  return Array.from(bytes, (byte) => String.fromCharCode(byte)).join("").trim().replaceAll("[", ".");
}

function displayToRomName(name) {
  const cleaned = String(name)
    .toUpperCase()
    .replace(/[.]/g, "[")
    .replace(/[^ A-Z0-9\[\-&']/g, " ")
    .slice(0, 16);
  return cleaned.padEnd(16, " ");
}

function displayToTsbName(name) {
  const words = String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’.`.-]/g, "")
    .replace(/[^ A-Za-z]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  while (words.length > 1 && /^(JR|SR|II|III|IV|V)$/i.test(words.at(-1))) words.pop();
  if (!words.length) return "playerPLAYER";

  let first = words.length > 1 ? words.slice(0, -1).join(" ").toLowerCase() : "player";
  let last = words.length > 1 ? words.at(-1).toUpperCase() : words[0].toUpperCase();
  if (first.length + last.length > TSB_IMPORT_NAME_LIMIT) {
    first = `${first[0] || "p"}.`;
    last = last.slice(0, TSB_IMPORT_NAME_LIMIT - first.length);
  }
  return `${first}${last}`.slice(0, TSB_IMPORT_NAME_LIMIT);
}

function formatTsbDisplayName(name) {
  const encoded = displayToTsbName(name);
  const lastNameStart = encoded.search(/[A-Z]/);
  if (lastNameStart < 0) return encoded;
  return `${encoded.slice(0, lastNameStart)} ${encoded.slice(lastNameStart)}`.trim();
}

function detectPlayerNameTable() {
  if (!rom) return null;

  const tsbPointerStart = 0x48;
  const tsbCount = 28 * 30;
  const tsbEndPointer = tsbPointerStart + tsbCount * 2;
  const pointerToFileOffset = (pointer) => pointer - 0x8000 + 0x10;
  if (looksLikeTsbRom() && tsbEndPointer + 1 < rom.length) {
    let validRecords = 0;
    let previousOffset = -1;
    for (let i = 0; i < tsbCount; i += 1) {
      const pointerOffset = tsbPointerStart + i * 2;
      const pointer = rom[pointerOffset] | (rom[pointerOffset + 1] << 8);
      const nextPointer = rom[pointerOffset + 2] | (rom[pointerOffset + 3] << 8);
      const start = pointerToFileOffset(pointer);
      const end = pointerToFileOffset(nextPointer);
      const nameBytes = rom.slice(start + 1, end);
      const printableName = nameBytes.length > 0 && nameBytes.length <= 16
        && Array.from(nameBytes).every((byte) => byte === 0x20 || byte === 0x2E || (byte >= 0x41 && byte <= 0x5A) || (byte >= 0x61 && byte <= 0x7A));
      if (start > previousOffset && end > start && printableName) validRecords += 1;
      previousOffset = start;
    }

    if (validRecords >= 800) {
      return {
        kind: "Tecmo Super Bowl 28-team pointer roster",
        format: "tsb-pointer",
        pointerStart: tsbPointerStart,
        endPointerOffset: tsbEndPointer,
        dataStart: pointerToFileOffset(rom[tsbPointerStart] | (rom[tsbPointerStart + 1] << 8)),
        dataLimit: 0x3010,
        count: tsbCount,
        teams: TSB_TEAM_NAMES_28.map((name, index) => ({ name, index, startSlot: index * 30, slots: 30 })),
        positions: TSB_POSITIONS_30,
      };
    }
  }

  const knownTecmoStart = 0x3028;
  const knownTecmoCount = 252;
  const knownTecmoLength = 16;
  const knownEnd = knownTecmoStart + knownTecmoCount * knownTecmoLength;
  if (knownEnd <= rom.length) {
    let plausibleSlots = 0;
    for (let i = 0; i < knownTecmoCount; i += 1) {
      const offset = knownTecmoStart + i * knownTecmoLength;
      const slot = rom.slice(offset, offset + knownTecmoLength);
      const printable = Array.from(slot).every((byte) => byte === 0x20 || byte === 0x5B || byte === 0x2D || byte === 0x26 || byte === 0x27 || (byte >= 0x30 && byte <= 0x39) || (byte >= 0x41 && byte <= 0x5A));
      const hasLetter = Array.from(slot).some((byte) => byte >= 0x41 && byte <= 0x5A);
      if (printable && hasLetter) plausibleSlots += 1;
    }

    if (plausibleSlots >= 180) {
      return {
        kind: "Tecmo Bowl 12-team fixed names",
        format: "fixed",
        start: knownTecmoStart,
        count: knownTecmoCount,
        slotLength: knownTecmoLength,
        teams: DEFAULT_TEAM_NAMES_12.map((name, index) => ({ name, index, startSlot: index * 21, slots: 21 })),
        positions: TECMO_SLOT_ROLES_21.map((role) => role.label),
      };
    }
  }

  return null;
}

function playerPointerToOffset(pointerOffset) {
  const pointer = rom[pointerOffset] | (rom[pointerOffset + 1] << 8);
  return pointer - 0x8000 + 0x10;
}

function detectPlayerAttributeTable() {
  if (!rom || !playerTable) return null;

  const tsbStart = 0x3010;
  const tsbTeamStride = 0x75;
  const tsbAbilityOffsets = [
    0x00, 0x05, 0x0A, 0x0E, 0x12, 0x16, 0x1A, 0x1E, 0x22, 0x26,
    0x2A, 0x2E, 0x32, 0x35, 0x38, 0x3B, 0x3E, 0x41, 0x45, 0x49,
    0x4D, 0x51, 0x55, 0x59, 0x5D, 0x61, 0x65, 0x69, 0x6D, 0x71,
  ];
  const tsbEnd = tsbStart + (28 * tsbTeamStride);

  if (playerTable.count === 28 * 30 && tsbEnd <= rom.length) {
    return {
      kind: "Tecmo Super Bowl 28-team ability table",
      start: tsbStart,
      teamStride: tsbTeamStride,
      offsets: tsbAbilityOffsets,
      slotsPerTeam: 30,
      supported: true,
    };
  }

  return {
    kind: "Unknown attribute table for this ROM",
    supported: false,
    reason: "This loaded ROM uses the 12-team Tecmo Bowl name table at 0x3028. The confirmed attribute map I found is for Tecmo Super Bowl's 28-team roster format, where ability data starts at 0x3010. Those addresses overlap the 12-team name table here, so writing them would corrupt names instead of safely editing Bernie Kosar's ratings.",
  };
}

function detectTeamStringTable() {
  if (!rom || !looksLikeTsbRom()) return null;
  const start = 0x1FC10;
  const count = 119;
  const pointerAdjustment = 0xBC00;
  const pointerEnd = start + (count + 1) * 2;
  const limit = 0x20000;
  if (limit > rom.length || pointerEnd > rom.length) return null;

  const pointers = [];
  for (let index = 0; index <= count; index += 1) {
    const offset = start + index * 2;
    pointers.push(rom[offset] | (rom[offset + 1] << 8));
  }
  const valid = pointers.every((pointer, index) => (
    pointer >= pointerAdjustment
    && start + pointer - pointerAdjustment <= limit
    && (index === 0 || pointer >= pointers[index - 1])
  ));
  if (!valid || start + pointers[0] - pointerAdjustment !== pointerEnd) return null;

  return {
    kind: "Tecmo Super Bowl team string table",
    start,
    count,
    pointerAdjustment,
    dataStart: pointerEnd,
    dataEnd: start + pointers[count] - pointerAdjustment,
    limit,
    teamCount: 28,
  };
}

function teamStringOffset(stringIndex) {
  const pointerOffset = teamStringTable.start + stringIndex * 2;
  const pointer = rom[pointerOffset] | (rom[pointerOffset + 1] << 8);
  return teamStringTable.start + pointer - teamStringTable.pointerAdjustment;
}

function readTeamString(stringIndex) {
  const start = teamStringOffset(stringIndex);
  const end = teamStringOffset(stringIndex + 1);
  return Array.from(rom.slice(start, end), (byte) => String.fromCharCode(byte)).join("");
}

function pendingOrCurrentTeamString(stringIndex) {
  return pendingTeamEdits.get(stringIndex) ?? readTeamString(stringIndex);
}

function teamIdentity(teamIndex) {
  return {
    abbreviation: pendingOrCurrentTeamString(teamIndex),
    city: pendingOrCurrentTeamString(teamIndex + 32),
    nickname: pendingOrCurrentTeamString(teamIndex + 64),
  };
}

function cleanTeamText(value, maxLength = 18) {
  return String(value)
    .toUpperCase()
    .replace(/[^ A-Z0-9.&'-]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function fillTeamSelect() {
  els.teamSelect.innerHTML = "";
  if (!playerTable) return;
  playerTable.teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = String(team.index);
    option.textContent = `${team.name} (${team.slots})`;
    els.teamSelect.append(option);
  });
}

function fillIdentityTeamSelect() {
  const previous = Number(els.identityTeamSelect.value || 0);
  els.identityTeamSelect.innerHTML = "";
  if (!teamStringTable) return;
  for (let index = 0; index < teamStringTable.teamCount; index += 1) {
    const identity = teamIdentity(index);
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${identity.city} ${identity.nickname}`;
    els.identityTeamSelect.append(option);
  }
  els.identityTeamSelect.value = String(Math.min(previous, teamStringTable.teamCount - 1));
}

function fillColorTeamSelect() {
  const previous = Number(els.colorTeamSelect.value || 0);
  els.colorTeamSelect.innerHTML = "";
  TSB_TEAM_NAMES_28.forEach((team, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = team;
    els.colorTeamSelect.append(option);
  });
  els.colorTeamSelect.value = String(Math.min(previous, TSB_TEAM_NAMES_28.length - 1));
}

function colorByteAt(offset) {
  if (!rom || offset < 0 || offset >= rom.length) return null;
  return pendingColorEdits.get(offset) ?? rom[offset];
}

function paletteOption(byte) {
  const value = Number(byte) & 0x3F;
  return `<span class="nes-chip" style="background:${NES_COLORS[value]}"></span>${byteHex(value)}`;
}

function colorSelect(label, offset) {
  const current = colorByteAt(offset);
  const disabled = current === null ? " disabled" : "";
  return `
    <label class="color-field">
      <span>${escapeHtml(label)}</span>
      <select data-color-offset="${offset}"${disabled}>
        ${NES_COLORS.map((color, value) => `
          <option value="${value}"${current === value ? " selected" : ""}>${byteHex(value)}</option>
        `).join("")}
      </select>
      <span class="nes-chip large" style="background:${current === null ? "#000" : NES_COLORS[current & 0x3F]}"></span>
      <code>${hex(offset)}</code>
    </label>
  `;
}

function colorSetDiffs() {
  return Array.from(pendingColorEdits.entries())
    .sort(([a], [b]) => a - b)
    .map(([offset, value]) => ({ offset, hex: byteHex(value & 0x3F) }));
}

function renderColorDiff() {
  const sets = colorSetDiffs();
  if (!sets.length) {
    els.colorDiff.textContent = "Edit a color to preview the ROM byte changes.";
    enableControls(Boolean(rom));
    return;
  }
  els.colorDiff.innerHTML = `
    <h3>${sets.length} pending color byte${sets.length === 1 ? "" : "s"}</h3>
    <p>NES palette values are one byte each, usually in the 00-3F range.</p>
    ${renderSetDiff(sets)}
  `;
  enableControls(Boolean(rom));
}

function renderColors() {
  if (!rom || !looksLikeTsbRom()) {
    els.colorStatus.textContent = "Load the 28-team Tecmo Super Bowl ROM to edit mapped color bytes.";
    els.colorEditor.innerHTML = "";
    els.colorDiff.textContent = "Edit a color to preview the ROM byte changes.";
    enableControls(Boolean(rom));
    return;
  }

  const teamIndex = Number(els.colorTeamSelect.value || 0);
  const teamName = TSB_TEAM_NAMES_28[teamIndex] || "Team";
  const teamOffset = TEAM_COLOR_BASE + teamIndex;
  els.colorStatus.textContent = "These controls edit known palette bytes from the TSB set-command list. Some bytes affect menus or data screens rather than on-field uniforms.";
  els.colorEditor.innerHTML = `
    <section class="color-section">
      <h3>${escapeHtml(teamName)} Team Data Screen</h3>
      ${colorSelect(`${teamName} background`, teamOffset)}
    </section>
    <section class="color-section">
      <h3>Shared Team Data Screen</h3>
      ${SHARED_TEAM_COLOR_OFFSETS.map((item) => colorSelect(item.label, item.offset)).join("")}
    </section>
    <section class="color-section">
      <h3>Menus</h3>
      ${MENU_COLOR_OFFSETS.map((item) => colorSelect(item.label, item.offset)).join("")}
    </section>
    <section class="color-section">
      <h3>Pro Bowl Uniform Bytes</h3>
      <p class="muted">These are the mapped Pro Bowl color bytes at 0x02C3FC-0x02C40B. Labels are generic until we verify each byte in-game.</p>
      ${PRO_BOWL_COLOR_OFFSETS.map((item) => colorSelect(item.label, item.offset)).join("")}
    </section>
  `;
  renderColorDiff();
}

function applyColorEdits() {
  const sets = colorSetDiffs();
  if (!sets.length) return 0;
  const written = applySets(sets);
  pendingColorEdits.clear();
  renderColors();
  return written;
}

function renderTeams() {
  if (!teamStringTable) {
    els.teamIdentityHeading.textContent = "Team Identity";
    els.teamIdentityStatus.textContent = "This ROM does not contain the supported 28-team Tecmo Super Bowl string table.";
    els.teamIdentityEditor.innerHTML = "";
    els.teamNameDiff.textContent = "Load the 28-team Tecmo Super Bowl ROM to edit team names.";
    enableControls(Boolean(rom));
    return;
  }

  const teamIndex = Number(els.identityTeamSelect.value || 0);
  const identity = teamIdentity(teamIndex);
  const used = buildTeamStringTableImage(false).dataEnd - teamStringTable.dataStart;
  const capacity = teamStringTable.limit - teamStringTable.dataStart;
  els.teamIdentityHeading.textContent = `${identity.city} ${identity.nickname}`;
  els.teamIdentityStatus.textContent = `${teamStringTable.kind}. ${used} of ${capacity} string-data bytes used.`;
  els.teamIdentityEditor.innerHTML = `
    <div class="team-name-preview">${escapeHtml(identity.city)} ${escapeHtml(identity.nickname)} <span class="muted">(${escapeHtml(identity.abbreviation)})</span></div>
    <div class="team-field">
      <label for="team-abbreviation">Abbreviation (exactly 4 characters)</label>
      <input id="team-abbreviation" data-team-string-index="${teamIndex}" maxlength="4" value="${escapeHtml(identity.abbreviation)}">
    </div>
    <div class="team-field">
      <label for="team-city">City</label>
      <input id="team-city" data-team-string-index="${teamIndex + 32}" maxlength="18" value="${escapeHtml(identity.city)}">
    </div>
    <div class="team-field">
      <label for="team-nickname">Nickname</label>
      <input id="team-nickname" data-team-string-index="${teamIndex + 64}" maxlength="18" value="${escapeHtml(identity.nickname)}">
    </div>
  `;
  renderTeamDiff();
  enableControls(Boolean(rom));
}

function renderTeamDiff() {
  if (!teamStringTable || !pendingTeamEdits.size) {
    els.teamNameDiff.textContent = "Edit a team or update all team names to preview changes.";
    enableControls(Boolean(rom));
    return;
  }

  const teamIndexes = Array.from(new Set(Array.from(pendingTeamEdits.keys()).map((index) => index % 32)))
    .filter((index) => index < teamStringTable.teamCount)
    .sort((a, b) => a - b);
  const rows = teamIndexes.map((teamIndex) => {
    const before = `${readTeamString(teamIndex + 32)} ${readTeamString(teamIndex + 64)} (${readTeamString(teamIndex)})`;
    const afterIdentity = teamIdentity(teamIndex);
    const after = `${afterIdentity.city} ${afterIdentity.nickname} (${afterIdentity.abbreviation})`;
    return `
      <div class="diff-block">
        <div class="diff-offset">Team ${teamIndex + 1}</div>
        <div class="diff-line"><span class="diff-mark minus">-</span><span class="byte-old">${escapeHtml(before)}</span></div>
        <div class="diff-line"><span class="diff-mark plus">+</span><span class="byte-new">${escapeHtml(after)}</span></div>
      </div>
    `;
  }).join("");
  const image = buildTeamStringTableImage(false);
  els.teamNameDiff.innerHTML = `
    <h3>${teamIndexes.length} team${teamIndexes.length === 1 ? "" : "s"} pending</h3>
    <p>Applying rebuilds the pointer-based string table and preserves its non-team labels.</p>
    <p>${image.dataEnd - teamStringTable.dataStart} of ${teamStringTable.limit - teamStringTable.dataStart} string-data bytes will be used.</p>
    <div class="team-text-diff">${rows}</div>
  `;
  enableControls(Boolean(rom));
}

function buildTeamStringTableImage(validate = true) {
  const strings = [];
  for (let index = 0; index < teamStringTable.count; index += 1) {
    strings.push(pendingTeamEdits.get(index) ?? readTeamString(index));
  }
  if (validate) {
    for (let teamIndex = 0; teamIndex < teamStringTable.teamCount; teamIndex += 1) {
      if (strings[teamIndex].length !== 4) throw new Error(`Team ${teamIndex + 1} abbreviation must contain exactly 4 characters.`);
      if (!strings[teamIndex + 32].trim()) throw new Error(`Team ${teamIndex + 1} city cannot be empty.`);
      if (!strings[teamIndex + 64].trim()) throw new Error(`Team ${teamIndex + 1} nickname cannot be empty.`);
    }
  }

  const pointers = [];
  const encodedStrings = [];
  let dataOffset = teamStringTable.dataStart;
  strings.forEach((value) => {
    pointers.push(teamStringTable.pointerAdjustment + dataOffset - teamStringTable.start);
    const bytes = Array.from(value, (char) => char.charCodeAt(0));
    encodedStrings.push(bytes);
    dataOffset += bytes.length;
  });
  pointers.push(teamStringTable.pointerAdjustment + dataOffset - teamStringTable.start);
  if (dataOffset > teamStringTable.limit) {
    throw new Error(`Team text needs ${dataOffset - teamStringTable.dataStart} bytes, but only ${teamStringTable.limit - teamStringTable.dataStart} are available.`);
  }
  return { pointers, encodedStrings, dataEnd: dataOffset };
}

function applyTeamStringEdits() {
  if (!teamStringTable || !pendingTeamEdits.size) return 0;
  const image = buildTeamStringTableImage();
  image.pointers.forEach((pointer, index) => {
    const offset = teamStringTable.start + index * 2;
    rom[offset] = pointer & 0xFF;
    rom[offset + 1] = (pointer >> 8) & 0xFF;
  });
  rom.fill(0xFF, teamStringTable.dataStart, teamStringTable.limit);
  let offset = teamStringTable.dataStart;
  image.encodedStrings.forEach((bytes) => {
    rom.set(bytes, offset);
    offset += bytes.length;
  });
  const changed = pendingTeamEdits.size;
  pendingTeamEdits.clear();
  dirty = true;
  updateDirty();
  teamStringTable = detectTeamStringTable();
  fillIdentityTeamSelect();
  renderTeams();
  renderHex();
  return changed;
}

function stageModernTeamNames() {
  if (!teamStringTable) return;
  MODERN_TEAM_IDENTITIES.forEach(([abbreviation, city, nickname], teamIndex) => {
    [[teamIndex, abbreviation], [teamIndex + 32, city], [teamIndex + 64, nickname]].forEach(([stringIndex, value]) => {
      if (readTeamString(stringIndex) === value) pendingTeamEdits.delete(stringIndex);
      else pendingTeamEdits.set(stringIndex, value);
    });
  });
  fillIdentityTeamSelect();
  renderTeams();
  els.teamIdentityStatus.textContent = "Modern names staged for all 28 teams. Review the changes, then apply them.";
}

function playerSlotOffset(slotIndex) {
  if (playerTable.format === "tsb-pointer") {
    return playerPointerToOffset(playerTable.pointerStart + slotIndex * 2);
  }
  return playerTable.start + slotIndex * playerTable.slotLength;
}

function slotRoleForTeamSlot(teamSlot) {
  if (playerTable?.format === "tsb-pointer") {
    return TSB_SLOT_ROLES_30[teamSlot] || { label: "ANY", groups: ["QB", "RB", "REC", "OL", "K", "P", "DL", "LB", "DB"] };
  }
  return TECMO_SLOT_ROLES_21[teamSlot] || { label: "ANY", groups: ["QB", "RB", "REC", "OL", "K", "P", "DL", "LB", "DB"] };
}

function attributeRoleKey(roleLabel) {
  if (roleLabel.startsWith("QB")) return "QB";
  if (roleLabel.startsWith("RB") || roleLabel === "RET") return "RB";
  if (roleLabel.startsWith("WR") || roleLabel.startsWith("TE") || roleLabel === "REC" || roleLabel === "REC/TE") return "REC";
  if (["OL", "C", "LG", "RG", "LT", "RT"].includes(roleLabel)) return "OL";
  if (roleLabel === "K") return "K";
  if (roleLabel === "P") return "P";
  return "DEF";
}

function playerPositionGroup(player) {
  const pos = String(player.position || "").toUpperCase().trim();
  return POSITION_GROUPS[pos] || "";
}

function readPlayerName(slotIndex) {
  const offset = playerSlotOffset(slotIndex);
  if (playerTable.format === "tsb-pointer") {
    const nextOffset = playerPointerToOffset(playerTable.pointerStart + (slotIndex + 1) * 2);
    const encoded = Array.from(rom.slice(offset + 1, nextOffset), (byte) => String.fromCharCode(byte)).join("");
    const lastNameStart = encoded.search(/[A-Z]/);
    if (lastNameStart < 0) return encoded;
    const first = encoded.slice(0, lastNameStart);
    const last = encoded.slice(lastNameStart);
    return `${first} ${last}`.trim();
  }
  return romNameToDisplay(rom.slice(offset, offset + playerTable.slotLength));
}

function readPlayerNumber(slotIndex) {
  if (playerTable?.format !== "tsb-pointer") return null;
  if (pendingNumberEdits.has(slotIndex)) return pendingNumberEdits.get(slotIndex);
  return rom[playerSlotOffset(slotIndex)];
}

function readStoredPlayerNumber(slotIndex) {
  if (playerTable?.format !== "tsb-pointer") return null;
  return rom[playerSlotOffset(slotIndex)];
}

function tsbNumberByteToJersey(byte) {
  if (!Number.isInteger(byte)) return "";
  const tens = (byte >> 4) & 0x0F;
  const ones = byte & 0x0F;
  if (tens > 9 || ones > 9) return byteHex(byte);
  return String(tens * 10 + ones);
}

function attributeOffsetForSlot(slotIndex) {
  if (!playerAttributeTable?.supported) return null;
  const teamIndex = Math.floor(slotIndex / playerAttributeTable.slotsPerTeam);
  const teamSlot = slotIndex % playerAttributeTable.slotsPerTeam;
  const slotOffset = playerAttributeTable.offsets[teamSlot];
  if (slotOffset === undefined) return null;
  return playerAttributeTable.start + teamIndex * playerAttributeTable.teamStride + slotOffset;
}

function readPlayerAttributes(slotIndex) {
  const base = attributeOffsetForSlot(slotIndex);
  if (base === null || base + 4 >= rom.length) return null;

  const teamSlot = slotIndex % playerAttributeTable.slotsPerTeam;
  const roleKey = attributeRoleKey(slotRoleForTeamSlot(teamSlot).label);
  const labels = ATTRIBUTE_LABELS_BY_ROLE[roleKey] || ATTRIBUTE_LABELS_BY_ROLE.DEF;
  const b1 = rom[base];
  const b2 = rom[base + 1];
  const b3 = rom[base + 3];
  const b4 = rom[base + 4];
  const values = [
    b1 & 0x0F,
    (b1 >> 4) & 0x0F,
    (b2 >> 4) & 0x0F,
    b2 & 0x0F,
  ];

  if (labels.length >= 6) {
    values.push((b3 >> 4) & 0x0F, b3 & 0x0F);
  }
  if (labels.length >= 8) {
    values.push((b4 >> 4) & 0x0F, b4 & 0x0F);
  }

  return {
    base,
    roleKey,
    labels,
    values,
  };
}

function writePlayerAttribute(slotIndex, attributeIndex, nibbleValue) {
  const base = attributeOffsetForSlot(slotIndex);
  if (base === null || base + 4 >= rom.length) return false;

  const nibble = nibbleValue & 0x0F;
  if (attributeIndex === 0) rom[base] = (rom[base] & 0xF0) | nibble;
  else if (attributeIndex === 1) rom[base] = (rom[base] & 0x0F) | (nibble << 4);
  else if (attributeIndex === 2) rom[base + 1] = (rom[base + 1] & 0x0F) | (nibble << 4);
  else if (attributeIndex === 3) rom[base + 1] = (rom[base + 1] & 0xF0) | nibble;
  else if (attributeIndex === 4) rom[base + 3] = (rom[base + 3] & 0x0F) | (nibble << 4);
  else if (attributeIndex === 5) rom[base + 3] = (rom[base + 3] & 0xF0) | nibble;
  else if (attributeIndex === 6) rom[base + 4] = (rom[base + 4] & 0x0F) | (nibble << 4);
  else if (attributeIndex === 7) rom[base + 4] = (rom[base + 4] & 0xF0) | nibble;
  else return false;

  dirty = true;
  updateDirty();
  return true;
}

function writePlayerAttributeValues(slotIndex, values) {
  const current = readPlayerAttributes(slotIndex);
  if (!current) return;
  const count = Math.min(current.values.length, values.length);
  for (let index = 0; index < count; index += 1) {
    writePlayerAttribute(slotIndex, index, values[index]);
  }
}

function draftRatingFromAttributes(attrs) {
  if (!attrs?.values?.length) return 0;
  const ratings = attrs.values.map((nibble) => TSB_ATTRIBUTE_VALUE_STEPS[nibble] || 0);
  return Math.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length);
}

function seededRandom(seedText) {
  let seed = 2166136261;
  String(seedText || "1991").split("").forEach((char) => {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  });
  return () => {
    seed += 0x6D2B79F5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledIndexes(count, random) {
  const values = Array.from({ length: count }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

function draftGroupForTeamSlot(teamSlot) {
  return slotRoleForTeamSlot(teamSlot).groups[0] || "REC";
}

function draftGroupCounts(roster) {
  const counts = Object.fromEntries(DRAFT_GROUP_ORDER.map((group) => [group, { open: 0, filled: 0 }]));
  roster.forEach((player, teamSlot) => {
    const group = draftGroupForTeamSlot(teamSlot);
    counts[group].open += player ? 0 : 1;
    counts[group].filled += player ? 1 : 0;
  });
  return counts;
}

function draftOpenSlotForPlayer(roster, player) {
  const groups = player.groups?.length ? player.groups : [player.group];
  for (let teamSlot = 0; teamSlot < TSB_POSITIONS_30.length; teamSlot += 1) {
    if (!roster[teamSlot] && groups.includes(draftGroupForTeamSlot(teamSlot))) return teamSlot;
  }
  return -1;
}

function draftEligiblePlayersForTeam(teamIndex) {
  if (!draftState) return [];
  const roster = draftState.rosters[teamIndex];
  return draftState.pool.filter((player) => !player.drafted && draftOpenSlotForPlayer(roster, player) >= 0);
}

function currentDraftTeamIndex() {
  if (!draftState || draftState.pickIndex >= draftState.totalPicks) return -1;
  const round = Math.floor(draftState.pickIndex / draftState.teamCount);
  const pickInRound = draftState.pickIndex % draftState.teamCount;
  const order = round % 2 === 0 ? draftState.order : draftState.order.slice().reverse();
  return order[pickInRound];
}

function draftPickLabel(pickIndex = draftState?.pickIndex || 0) {
  if (!draftState) return "";
  const round = Math.floor(pickIndex / draftState.teamCount) + 1;
  const pick = (pickIndex % draftState.teamCount) + 1;
  return `Round ${round}, Pick ${pick}`;
}

function buildDraftPool() {
  if (!playerTable || playerTable.format !== "tsb-pointer" || !playerAttributeTable?.supported) return [];
  const players = [];
  for (let slotIndex = 0; slotIndex < playerTable.count; slotIndex += 1) {
    const teamIndex = Math.floor(slotIndex / playerTable.teams[0].slots);
    const teamSlot = slotIndex % playerTable.teams[0].slots;
    const role = slotRoleForTeamSlot(teamSlot);
    const attrs = readPlayerAttributes(slotIndex);
    const name = readPlayerName(slotIndex);
    players.push({
      id: slotIndex,
      sourceSlot: slotIndex,
      sourceTeam: playerTable.teams[teamIndex]?.name || `Team ${teamIndex + 1}`,
      sourceTeamIndex: teamIndex,
      sourceTeamSlot: teamSlot,
      sourceRole: role.label,
      group: role.groups[0],
      groups: role.groups,
      name,
      number: readPlayerNumber(slotIndex),
      attributes: attrs?.values?.slice() || [],
      rating: draftRatingFromAttributes(attrs),
      drafted: false,
    });
  }
  return players;
}

function startSmartDraft() {
  if (!playerTable || playerTable.format !== "tsb-pointer" || !playerAttributeTable?.supported) {
    els.draftStatus.textContent = "Load the 28-team Tecmo Super Bowl ROM first. Smart Shuffle uses native TSB names, jerseys, and attributes.";
    return;
  }
  const teamCount = playerTable.teams.length;
  const slotsPerTeam = playerTable.teams[0].slots;
  const random = seededRandom(els.draftSeed.value || "1991");
  draftState = {
    active: true,
    complete: false,
    userTeamIndex: Number(els.draftUserTeam.value || 0),
    random,
    order: shuffledIndexes(teamCount, random),
    pickIndex: 0,
    teamCount,
    slotsPerTeam,
    totalPicks: teamCount * slotsPerTeam,
    pool: buildDraftPool().sort((a, b) => b.rating - a.rating),
    rosters: Array.from({ length: teamCount }, () => Array(slotsPerTeam).fill(null)),
    log: [],
  };
  renderDraft();
}

function draftScorePlayer(teamIndex, player) {
  const roster = draftState.rosters[teamIndex];
  const counts = draftGroupCounts(roster);
  const openInGroup = counts[player.group]?.open || 0;
  const filledInGroup = counts[player.group]?.filled || 0;
  const scarcity = draftState.pool.filter((candidate) => !candidate.drafted && candidate.group === player.group).length;
  const needBonus = openInGroup * 8 - filledInGroup * 1.5;
  const scarcityBonus = scarcity ? Math.max(0, 18 - scarcity / 2) : 0;
  return player.rating + needBonus + scarcityBonus + draftState.random() * 6;
}

function draftSelectAiPlayer(teamIndex) {
  const eligible = draftEligiblePlayersForTeam(teamIndex);
  if (!eligible.length) return null;
  return eligible
    .map((player) => ({ player, score: draftScorePlayer(teamIndex, player) }))
    .sort((a, b) => b.score - a.score)[0].player;
}

function draftPlayerForTeam(teamIndex, player, forced = false) {
  if (!draftState || !player || player.drafted) return false;
  const roster = draftState.rosters[teamIndex];
  const teamSlot = draftOpenSlotForPlayer(roster, player);
  if (teamSlot < 0) return false;
  roster[teamSlot] = player;
  player.drafted = true;
  const teamName = playerTable.teams[teamIndex]?.name || `Team ${teamIndex + 1}`;
  draftState.log.unshift(`${draftPickLabel()}: ${teamName} selected ${player.name} (${player.sourceRole}, ${player.rating})${forced ? " [auto]" : ""}`);
  draftState.pickIndex += 1;
  if (draftState.pickIndex >= draftState.totalPicks) draftState.complete = true;
  return true;
}

function autoDraftOnePick(forUser = false) {
  if (!draftState || draftState.complete) return false;
  const teamIndex = currentDraftTeamIndex();
  if (teamIndex < 0) return false;
  const player = draftSelectAiPlayer(teamIndex);
  if (!player) {
    draftState.pickIndex += 1;
    return false;
  }
  return draftPlayerForTeam(teamIndex, player, forUser);
}

function autoDraftToUserPick() {
  if (!draftState) return;
  while (!draftState.complete && currentDraftTeamIndex() !== draftState.userTeamIndex) {
    autoDraftOnePick(false);
  }
  renderDraft();
}

function applyDraftToRom() {
  if (!draftState?.complete) {
    els.draftStatus.textContent = "Finish the draft before applying it to the ROM.";
    return;
  }
  let changed = 0;
  draftState.rosters.forEach((roster, teamIndex) => {
    const team = playerTable.teams[teamIndex];
    roster.forEach((player, teamSlot) => {
      if (!player) return;
      const slotIndex = team.startSlot + teamSlot;
      pendingNameEdits.set(slotIndex, player.name);
      if (player.number !== null) pendingNumberEdits.set(slotIndex, player.number);
      writePlayerAttributeValues(slotIndex, player.attributes);
      changed += 1;
    });
  });
  renderPlayers();
  renderDraft();
  els.draftStatus.textContent = `Staged ${changed} drafted players. Review the Players tab, then Apply All Changes or Export ROM.`;
}

function resetDraft() {
  draftState = null;
  renderDraft();
}

function renderDraftTeamSelect() {
  const previous = Number(els.draftUserTeam.value || 0);
  els.draftUserTeam.innerHTML = "";
  if (!playerTable) return;
  playerTable.teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = String(team.index);
    option.textContent = team.name;
    els.draftUserTeam.append(option);
  });
  els.draftUserTeam.value = String(Math.min(previous, playerTable.teams.length - 1));
}

function renderDraft() {
  const supported = Boolean(playerTable?.format === "tsb-pointer" && playerAttributeTable?.supported);
  els.startDraft.disabled = !supported;
  els.draftUserTeam.disabled = !supported || Boolean(draftState?.active);
  els.draftSearch.disabled = !draftState;
  els.draftPositionFilter.disabled = !draftState;
  els.autoDraft.disabled = !draftState || draftState.complete || currentDraftTeamIndex() === draftState.userTeamIndex;
  els.draftForMe.disabled = !draftState || draftState.complete || currentDraftTeamIndex() !== draftState.userTeamIndex;
  els.applyDraft.disabled = !draftState?.complete;
  els.resetDraft.disabled = !draftState;

  if (!supported) {
    els.draftStatus.textContent = "Load the 28-team Tecmo Super Bowl ROM to start a native roster shuffle.";
    els.draftPickSummary.textContent = "No draft started.";
    els.draftNeeds.textContent = "Start a draft to see open slots.";
    els.draftBoard.innerHTML = "";
    els.draftLog.innerHTML = "";
    return;
  }

  if (!draftState) {
    els.draftStatus.textContent = "Smart Shuffle drafts from the loaded ROM's original player records. Names, jersey numbers, and attributes move together.";
    els.draftPickSummary.textContent = "No draft started.";
    els.draftNeeds.textContent = "Start a draft to see open slots.";
    els.draftBoard.innerHTML = "";
    els.draftLog.innerHTML = "";
    return;
  }

  const teamIndex = currentDraftTeamIndex();
  const team = playerTable.teams[teamIndex];
  const isUserPick = teamIndex === draftState.userTeamIndex;
  const draftedCount = draftState.pool.filter((player) => player.drafted).length;
  els.draftStatus.textContent = draftState.complete
    ? `Draft complete. ${draftedCount} players selected.`
    : `${draftPickLabel()}: ${team.name} is on the clock.${isUserPick ? " Choose a player below." : " Use Auto Draft To My Pick."}`;
  els.draftPickSummary.innerHTML = draftState.complete
    ? "<strong>Draft complete.</strong>"
    : `<strong>${escapeHtml(team.name)}</strong><br>${escapeHtml(draftPickLabel())}<br>${draftedCount} of ${draftState.totalPicks} players drafted`;

  const roster = draftState.complete ? draftState.rosters[draftState.userTeamIndex] : draftState.rosters[teamIndex];
  const counts = draftGroupCounts(roster);
  els.draftNeeds.innerHTML = DRAFT_GROUP_ORDER.map((group) => `
    <span class="need-pill${counts[group].open ? "" : " filled"}">${group}: ${counts[group].open}</span>
  `).join("");

  const query = els.draftSearch.value.trim().toLowerCase();
  const groupFilter = els.draftPositionFilter.value || "ALL";
  const eligibleTeam = draftState.complete ? draftState.userTeamIndex : teamIndex;
  const rows = draftEligiblePlayersForTeam(eligibleTeam)
    .filter((player) => groupFilter === "ALL" || player.group === groupFilter)
    .filter((player) => !query || player.name.toLowerCase().includes(query) || player.sourceTeam.toLowerCase().includes(query))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 80)
    .map((player) => `
      <tr>
        <td>${player.drafted ? "" : draftOpenSlotForPlayer(draftState.rosters[eligibleTeam], player) >= 0 ? TSB_POSITIONS_30[draftOpenSlotForPlayer(draftState.rosters[eligibleTeam], player)] : ""}</td>
        <td>${escapeHtml(player.name)}</td>
        <td>${player.number === null ? "" : tsbNumberByteToJersey(player.number)}</td>
        <td>${escapeHtml(player.sourceTeam)}</td>
        <td>${escapeHtml(player.sourceRole)}</td>
        <td>${player.rating}</td>
        <td>${!draftState.complete && isUserPick ? `<button type="button" data-draft-player="${player.id}">Draft</button>` : ""}</td>
      </tr>
    `).join("");
  els.draftBoard.innerHTML = rows || "<tr><td colspan=\"7\">No eligible players available for this filter.</td></tr>";
  els.draftLog.innerHTML = draftState.log.slice(0, 160).map((entry) => `<div>${escapeHtml(entry)}</div>`).join("");
}

function swapTsbPlayerSlots(sourceSlot, targetTeamSlot) {
  if (playerTable?.format !== "tsb-pointer") return;
  const team = playerTable.teams[Number(els.teamSelect.value || 0)] || playerTable.teams[0];
  const targetSlot = team.startSlot + targetTeamSlot;
  if (sourceSlot === targetSlot) return;

  const sourceName = pendingNameEdits.get(sourceSlot) ?? readPlayerName(sourceSlot);
  const targetName = pendingNameEdits.get(targetSlot) ?? readPlayerName(targetSlot);
  const sourceNumber = readPlayerNumber(sourceSlot);
  const targetNumber = readPlayerNumber(targetSlot);
  const sourceAttributes = readPlayerAttributes(sourceSlot);
  const targetAttributes = readPlayerAttributes(targetSlot);

  pendingNameEdits.set(sourceSlot, targetName);
  pendingNameEdits.set(targetSlot, sourceName);
  pendingNumberEdits.set(sourceSlot, targetNumber);
  pendingNumberEdits.set(targetSlot, sourceNumber);

  if (sourceAttributes && targetAttributes) {
    writePlayerAttributeValues(sourceSlot, targetAttributes.values);
    writePlayerAttributeValues(targetSlot, sourceAttributes.values);
  }

  selectedPlayerSlot = targetSlot;
  const sourceRole = slotRoleForTeamSlot(sourceSlot - team.startSlot).label;
  const targetRole = slotRoleForTeamSlot(targetTeamSlot).label;
  els.maddenStatus.textContent = `Swapped ${sourceName} (${sourceRole}) with ${targetName} (${targetRole}). Apply All Changes to commit the roster records.`;
  renderPlayers();
}

function renderPlayerAttributes() {
  els.attributeEditor.innerHTML = "";
  if (!playerTable) {
    els.attributeStatus.textContent = "Load a supported roster first.";
    return;
  }

  const name = readPlayerName(selectedPlayerSlot);
  const teamSlot = selectedPlayerSlot % playerTable.teams[0].slots;
  const role = slotRoleForTeamSlot(teamSlot);
  const nameOffset = playerSlotOffset(selectedPlayerSlot);

  if (!playerAttributeTable?.supported) {
    els.attributeStatus.textContent = `${name || "Selected player"} (${role.label})`;
    els.attributeEditor.innerHTML = `
      <div class="attribute-message">
        <p>${escapeHtml(playerAttributeTable?.reason || "No editable attribute map is known for this ROM yet.")}</p>
        <p>For the Bernie Kosar to Deshaun Watson edit, the name can be changed now at ${hex(nameOffset)}. Passing and speed edits need the correct 12-team Tecmo Bowl attribute table before I write bytes.</p>
      </div>
      <table class="attribute-table">
        <thead><tr><th>Attribute</th><th>Status</th></tr></thead>
        <tbody>
          ${(ATTRIBUTE_LABELS_BY_ROLE[attributeRoleKey(role.label)] || ATTRIBUTE_LABELS_BY_ROLE.DEF).map((label) => `
            <tr><td>${escapeHtml(label)}</td><td>Map needed</td></tr>
          `).join("")}
        </tbody>
      </table>
    `;
    return;
  }

  const attrs = readPlayerAttributes(selectedPlayerSlot);
  if (!attrs) {
    els.attributeStatus.textContent = `${name || "Selected player"} (${role.label})`;
    els.attributeEditor.textContent = "This slot does not have a supported attribute entry.";
    return;
  }

  els.attributeStatus.textContent = `${name || "Selected player"} (${role.label}) attributes at ${hex(attrs.base)}.`;
  els.attributeEditor.innerHTML = `
    <table class="attribute-table">
      <thead><tr><th>Attribute</th><th>Rating</th><th>Nibble</th></tr></thead>
      <tbody>
        ${attrs.labels.map((label, index) => `
          <tr>
            <td>${escapeHtml(label)}</td>
            <td>
              <select data-attribute-index="${index}">
                ${TSB_ATTRIBUTE_VALUE_STEPS.map((rating, nibble) => `
                  <option value="${nibble}"${attrs.values[index] === nibble ? " selected" : ""}>${rating}</option>
                `).join("")}
              </select>
            </td>
            <td>${byteHex(attrs.values[index])}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderPlayers() {
  els.playerTable.innerHTML = "";
  if (!playerTable) {
    els.playerStatus.textContent = "No supported fixed-width player-name table detected in this ROM yet.";
    els.playerDiff.textContent = "Open a supported Tecmo/Tecmo Super Bowl ROM or add a table mapping.";
    enableControls(Boolean(rom));
    return;
  }

  const team = playerTable.teams[Number(els.teamSelect.value || 0)] || playerTable.teams[0];
  els.rosterHeading.textContent = `Roster Slots: ${team.name}`;
  els.maddenHeading.textContent = `Madden Import: ${team.name}`;
  els.playerStatus.textContent = playerTable.format === "tsb-pointer"
    ? `${playerTable.kind}: ${playerTable.count} players, pointer table at ${hex(playerTable.pointerStart)}, name data at ${hex(playerTable.dataStart)}.`
    : `${playerTable.kind}: ${playerTable.count} names, ${playerTable.slotLength} bytes each, starting at ${hex(playerTable.start)}.`;

  const rows = [];
  for (let i = 0; i < team.slots; i += 1) {
    const slotIndex = team.startSlot + i;
    const current = readPlayerName(slotIndex);
    const pending = pendingNameEdits.get(slotIndex) ?? current;
    const role = slotRoleForTeamSlot(i);
    rows.push(`
      <tr class="${selectedPlayerSlot === slotIndex ? "selected-row" : ""}" data-player-row="${slotIndex}">
        <td>${playerTable.format === "tsb-pointer"
          ? `<select class="role-select" data-role-slot="${slotIndex}" aria-label="Swap ${escapeHtml(role.label)} with another role">
              ${TSB_SLOT_ROLES_30.map((optionRole, optionIndex) => `<option value="${optionIndex}"${optionIndex === i ? " selected" : ""}>${escapeHtml(optionRole.label)}</option>`).join("")}
            </select>`
          : `<span class="role-pill">${escapeHtml(role.label)}</span>`}</td>
        <td>${playerTable.format === "tsb-pointer"
          ? `<input class="jersey-number-input" data-number-slot="${slotIndex}" type="number" min="0" max="99" value="${escapeHtml(tsbNumberByteToJersey(readPlayerNumber(slotIndex)))}" aria-label="Jersey number for ${escapeHtml(pending)}">`
          : ""}</td>
        <td>${escapeHtml(current)}</td>
        <td><input class="player-name-input ${playerTable.format === "tsb-pointer" ? "tsb-name-input" : ""}" data-player-slot="${slotIndex}" maxlength="${playerTable.format === "tsb-pointer" ? 17 : 16}" value="${escapeHtml(pending)}"></td>
      </tr>
    `);
  }
  els.playerTable.innerHTML = rows.join("");
  renderPlayerDiff();
  renderPlayerAttributes();
  enableControls(Boolean(rom));
}

function pendingNameSets() {
  if (!playerTable) return [];
  if (playerTable.format === "tsb-pointer") {
    const changedSlots = new Set([...pendingNameEdits.keys(), ...pendingNumberEdits.keys()]);
    return Array.from(changedSlots).sort((a, b) => a - b).map((slotIndex) => {
      const name = pendingNameEdits.get(slotIndex) ?? readPlayerName(slotIndex);
      const encoded = displayToTsbName(name);
      const number = readPlayerNumber(slotIndex);
      return {
        offset: playerSlotOffset(slotIndex),
        hex: [number, ...Array.from(encoded, (char) => char.charCodeAt(0))].map((byte) => byteHex(byte)).join(""),
      };
    });
  }
  return Array.from(pendingNameEdits.entries()).map(([slotIndex, name]) => ({
    offset: playerSlotOffset(slotIndex),
    hex: Array.from(displayToRomName(name), (char) => byteHex(char.charCodeAt(0))).join(""),
  }));
}

function renderPlayerDiff() {
  const sets = pendingNameSets();
  if (!sets.length) {
    els.playerDiff.textContent = "Edit a name to preview its bytes.";
    enableControls(Boolean(rom));
    return;
  }
  const formatNote = playerTable.format === "tsb-pointer"
    ? "TSB names and jersey numbers are compact variable-length records. Applying changes rebuilds the roster block and updates every player pointer."
    : "Names are stored as fixed 16-byte uppercase slots. Periods are encoded as [ in this ROM.";
  els.playerDiff.innerHTML = `
    <h3>${sets.length} pending roster change${sets.length === 1 ? "" : "s"}</h3>
    <p>${formatNote}</p>
    ${renderSetDiff(sets)}
  `;
  enableControls(Boolean(rom));
}

function applyPlayerNameEdits() {
  const sets = pendingNameSets();
  if (!sets.length) {
    els.maddenStatus.textContent = dirty ? "All current changes are already applied to the working ROM. Export ROM when ready." : "No changes to apply.";
    return;
  }
  try {
    const written = playerTable.format === "tsb-pointer" ? rebuildTsbNameBlock() : applySets(sets);
    pendingNameEdits.clear();
    pendingNumberEdits.clear();
    renderPlayers();
    els.maddenStatus.textContent = `Applied ${written} roster byte(s).`;
  } catch (error) {
    els.maddenStatus.textContent = `Could not apply roster changes: ${error.message}`;
  }
}

function rebuildTsbNameBlock() {
  const records = [];
  let totalLength = 0;
  for (let slotIndex = 0; slotIndex < playerTable.count; slotIndex += 1) {
    const name = pendingNameEdits.get(slotIndex) ?? readPlayerName(slotIndex);
    const encoded = displayToTsbName(name);
    const record = new Uint8Array(1 + encoded.length);
    record[0] = readPlayerNumber(slotIndex);
    for (let i = 0; i < encoded.length; i += 1) record[i + 1] = encoded.charCodeAt(i);
    records.push(record);
    totalLength += record.length;
  }

  if (playerTable.dataStart + totalLength > playerTable.dataLimit) {
    throw new Error(`The edited TSB names need ${totalLength} bytes, but only ${playerTable.dataLimit - playerTable.dataStart} bytes are available.`);
  }

  rom.fill(0xFF, playerTable.dataStart, playerTable.dataLimit);
  let dataOffset = playerTable.dataStart;
  records.forEach((record, slotIndex) => {
    const pointer = dataOffset - 0x10 + 0x8000;
    const pointerOffset = playerTable.pointerStart + slotIndex * 2;
    rom[pointerOffset] = pointer & 0xFF;
    rom[pointerOffset + 1] = (pointer >> 8) & 0xFF;
    rom.set(record, dataOffset);
    dataOffset += record.length;
  });

  const endPointer = dataOffset - 0x10 + 0x8000;
  rom[playerTable.endPointerOffset] = endPointer & 0xFF;
  rom[playerTable.endPointerOffset + 1] = (endPointer >> 8) & 0xFF;
  dirty = true;
  updateDirty();
  return totalLength;
}

function canonicalRatingKey(label) {
  return String(label).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function ratingValue(player, ...labels) {
  for (const label of labels) {
    const key = canonicalRatingKey(label);
    const value = Number(player.ratings?.[key] ?? player[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function weightedRating(player, items, fallback = 50) {
  let total = 0;
  let weightTotal = 0;
  items.forEach(([labels, weight]) => {
    const value = ratingValue(player, ...labels);
    if (value > 0) {
      total += value * weight;
      weightTotal += weight;
    }
  });
  return weightTotal ? total / weightTotal : ratingValue(player, "OVR", "AWR") || fallback;
}

function toTecmoNibble(value) {
  if (value >= 97) return 14;
  if (value >= 94) return 13;
  if (value >= 90) return 12;
  if (value >= 86) return 11;
  if (value >= 82) return 10;
  if (value >= 78) return 9;
  if (value >= 74) return 8;
  if (value >= 70) return 7;
  if (value >= 66) return 6;
  if (value >= 62) return 5;
  if (value >= 58) return 4;
  if (value >= 54) return 3;
  if (value >= 50) return 2;
  if (value >= 45) return 1;
  return 0;
}

function toTecmoRunningSpeedNibble(value, player, roleLabel) {
  let ratingNibble;
  if (value >= 95) ratingNibble = 6; // 44
  else if (value >= 88) ratingNibble = 5; // 38
  else if (value >= 80) ratingNibble = 4; // 31
  else if (value >= 72) ratingNibble = 3; // 25
  else if (value >= 64) ratingNibble = 2; // 19
  else if (value >= 55) ratingNibble = 1; // 13
  else ratingNibble = 0; // 6, the lowest visible TSB rating

  const position = String(player.position || "").toUpperCase().trim();
  const group = playerPositionGroup(player);
  const isTightEnd = position === "TE" || position === "TIGHT END" || roleLabel.startsWith("TE");
  let capNibble = 6; // 44: QB, RB, WR, CB, S
  if (isTightEnd || group === "LB") capNibble = 5; // 38
  else if (group === "DL" || group === "OL") capNibble = 4; // 31
  return Math.min(ratingNibble, capNibble);
}

function maddenToTecmoAttributes(player, roleLabel) {
  const roleKey = attributeRoleKey(roleLabel);
  const offense = ["QB", "RB", "REC", "OL"].includes(roleKey);
  const runningSpeed = weightedRating(player, [
    [["Acceleration", "ACC"], 0.55],
    [["Agility", "AGI"], 0.25],
    [["Change of Direction", "COD"], 0.20],
  ]);
  const rushingPower = weightedRating(player, [
    [["Acceleration", "ACC"], 0.45],
    [["Break Tackle"], 0.25],
    [["Strength", "STR"], 0.15],
    [["Trucking"], 0.15],
  ], 69);
  const maximumSpeed = ratingValue(player, "Speed", "SPD") || ratingValue(player, "OVR") || 50;
  const hittingPower = offense
    ? weightedRating(player, [
      [["Trucking"], 0.45],
      [["Strength", "STR"], 0.25],
      [["Break Tackle"], 0.20],
      [["Stiff Arm", "Power Moves"], 0.10],
    ])
    : weightedRating(player, [
      [["Hit Power"], 0.45],
      [["Strength", "STR"], 0.25],
      [["Tackle"], 0.20],
      [["Power Moves"], 0.10],
    ]);

  const base = [rushingPower, maximumSpeed, hittingPower];
  if (roleKey === "QB") {
    base.push(
      ratingValue(player, "Throw Power") || ratingValue(player, "OVR"),
      weightedRating(player, [
        [["Throw Accuracy Short"], 0.25],
        [["Throw Accuracy Mid", "Throw Accuracy Medium"], 0.30],
        [["Throw Accuracy Deep"], 0.20],
        [["Throw Under Pressure"], 0.15],
        [["Awareness", "AWR"], 0.10],
      ]),
      weightedRating(player, [
        [["Throw Accuracy Short"], 0.35],
        [["Throw Accuracy Mid", "Throw Accuracy Medium"], 0.35],
        [["Throw Accuracy Deep"], 0.30],
      ]),
      weightedRating(player, [
        [["Break Sack", "Pass Block"], 0.45],
        [["Agility", "AGI", "Pass Block Finesse"], 0.25],
        [["Strength", "STR"], 0.20],
        [["Awareness", "AWR"], 0.10],
      ]),
    );
  } else if (roleKey === "RB" || roleKey === "REC") {
    base.push(
      weightedRating(player, [
        [["Carrying"], 0.65],
        [["BC Vision", "Ball Carrier Vision"], 0.20],
        [["Awareness", "AWR"], 0.15],
      ]),
      weightedRating(player, [
        [["Catching"], 0.45],
        [["Catch In Traffic"], 0.25],
        [["Spectacular Catch"], 0.15],
        [["Short Route Running"], 0.10],
        [["Medium Route Running"], 0.05],
      ]),
    );
  } else if (roleKey === "K" || roleKey === "P") {
    base.push(
      weightedRating(player, [[["Kick Power"], 0.55], [["Kick Accuracy"], 0.45]]),
      weightedRating(player, [[["Awareness", "AWR"], 0.50], [["Agility", "AGI"], 0.30], [["Speed", "SPD"], 0.20]]),
    );
  } else if (roleKey === "DEF") {
    base.push(
      weightedRating(player, [[["Power Moves"], 0.30], [["Finesse Moves"], 0.30], [["Block Shedding"], 0.25], [["Strength", "STR"], 0.15]]),
      weightedRating(player, [[["Man Coverage"], 0.25], [["Zone Coverage"], 0.25], [["Play Recognition"], 0.20], [["Catching"], 0.15], [["Awareness", "AWR"], 0.15]]),
    );
  }
  return [toTecmoRunningSpeedNibble(runningSpeed, player, roleLabel), ...base.map(toTecmoNibble)];
}

function parseMaddenPlayersFromText(text) {
  const rows = [];
  const lines = String(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const cells = line.includes(",") ? line.split(",").map((cell) => cell.trim()) : line.split(/\t+/).map((cell) => cell.trim());
    if (cells.length < 3) continue;
    const header = cells.map((cell) => cell.toLowerCase());
    if (header.includes("player") || header.includes("name")) continue;
    const [name, team, position, ovr, spd, str, agi, awr, jerseyNumber] = cells;
    const parsedJerseyNumber = String(jerseyNumber || "").trim() === "" ? null : Number(jerseyNumber);
    if (!name || !team) continue;
    rows.push({
      name,
      team,
      position: position || "",
      jerseyNumber: Number.isInteger(parsedJerseyNumber) ? parsedJerseyNumber : null,
      ovr: Number(ovr) || 0,
      spd: Number(spd) || 0,
      str: Number(str) || 0,
      agi: Number(agi) || 0,
      awr: Number(awr) || 0,
      ratings: {
        ovr: Number(ovr) || 0,
        spd: Number(spd) || 0,
        str: Number(str) || 0,
        agi: Number(agi) || 0,
        awr: Number(awr) || 0,
      },
    });
  }

  return rows;
}

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === "\"" && quoted && line[index + 1] === "\"") {
      value += "\"";
      index += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  cells.push(value);
  return cells;
}

function parseFallbackMaddenCsv(text) {
  const lines = String(text).split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "").map(canonicalRatingKey);
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""]));
    const ratings = {
      ovr: Number(row.overall) || 0,
      spd: Number(row.spd) || 0,
      acc: Number(row.acc) || 0,
      str: Number(row.str) || 0,
      agi: Number(row.agi) || 0,
      awr: Number(row.awr) || 0,
    };
    const jerseyNumber = String(row.jerseynumber || "").trim() === "" ? null : Number(row.jerseynumber);
    return {
      name: `${row.firstname || ""} ${row.lastname || ""}`.trim(),
      team: row.team || "",
      position: row.position || "",
      jerseyNumber: Number.isInteger(jerseyNumber) ? jerseyNumber : null,
      ratings,
      ovr: ratings.ovr,
      spd: ratings.spd,
      str: ratings.str,
      agi: ratings.agi,
      awr: ratings.awr,
    };
  }).filter((player) => player.name && player.team);
}

function parseEaRatingsHtml(html) {
  const players = [];

  const rows = html.match(/<tr class="Table_row__[\s\S]*?<\/tr>/g) || [];
  rows.forEach((row) => {
    const name = decodeHtml(/Table_profileLabel[^>]*>([^<]+)</.exec(row)?.[1] || "").trim();
    if (!name) return;

    const position = decodeHtml(/positions-ratings[\s\S]*?Table_tag[^>]*>([^<]+)</.exec(row)?.[1] || "").trim();
    const team = decodeHtml(/teams-ratings[\s\S]*?<img alt="([^"]+)"/.exec(row)?.[1] || "Unknown").trim();
    const detailPath = /href="([^"]*\/player-ratings\/[^"]+)"/.exec(row)?.[1] || "";
    const stats = {};
    for (const match of row.matchAll(/data-label="([^"]+)"[\s\S]*?Table_statCellValue[^>]*>(\d+)</g)) {
      const label = match[1].trim();
      const value = Number(match[2]);
      const key = canonicalRatingKey(label);
      if (key && Number.isFinite(value) && stats[key] === undefined) stats[key] = value;
    }

    if (!stats.ovr && !stats.spd) return;
    players.push({
      name,
      position,
      team,
      detailPath,
      ratings: stats,
      ovr: stats.ovr || 0,
      spd: stats.spd || 0,
      str: stats.str || 0,
      agi: stats.agi || 0,
      awr: stats.awr || 0,
    });
  });

  return players;
}

function parseEaPlayerDetailHtml(html) {
  const ratings = {};
  for (const match of html.matchAll(/Stat_label[^>]*>([^<]+)<\/span><span class="Stat_value[^>]*>(\d+)<\/span>/g)) {
    const key = canonicalRatingKey(decodeHtml(match[1]));
    const value = Number(match[2]);
    if (key && Number.isFinite(value)) ratings[key] = value;
  }
  return ratings;
}

async function enrichMaddenPlayer(player) {
  if (player.detailsLoaded || !player.detailPath || !HAS_LOCAL_PROXY) return player;
  const response = await fetch(`/madden-player?path=${encodeURIComponent(player.detailPath)}`);
  if (!response.ok) throw new Error(`detail proxy returned ${response.status}`);
  player.ratings = { ...(player.ratings || {}), ...parseEaPlayerDetailHtml(await response.text()) };
  player.detailsLoaded = true;
  return player;
}

function setMaddenPlayers(players, sourceLabel) {
  maddenPlayers = players.filter((player) => player.name).map((player) => ({
    ...player,
    tsbName: formatTsbDisplayName(player.name),
  }));
  const teams = Array.from(new Set(maddenPlayers.map((player) => player.team).filter(Boolean))).sort();
  els.maddenTeamSelect.innerHTML = teams.map((team) => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join("");
  syncMaddenTeamToSelectedTecmoTeam();
  els.maddenStatus.textContent = `${maddenPlayers.length} Madden player(s) loaded from ${sourceLabel}. TSB imports use first LAST formatting and a ${TSB_IMPORT_NAME_LIMIT}-character encoded-name limit.`;
  renderMaddenPreview();
  enableControls(Boolean(rom));
}

function syncMaddenTeamToSelectedTecmoTeam() {
  if (!playerTable || !maddenPlayers.length) return;
  const team = playerTable.teams[Number(els.teamSelect.value || 0)] || playerTable.teams[0];
  const players = maddenPlayersForTecmoTeam(team.name);
  if (players.length) els.maddenTeamSelect.value = players[0].team;
}

function teamAliasesForCurrentTeam() {
  const team = playerTable?.teams[Number(els.teamSelect.value || 0)]?.name;
  return MADDEN_TEAM_ALIASES[team] || [team];
}

function maddenPlayersForSelection() {
  const selected = els.maddenTeamSelect.value;
  if (selected) {
    return maddenPlayers.filter((player) => player.team === selected);
  }
  const aliases = teamAliasesForCurrentTeam().map((value) => String(value).toLowerCase());
  return maddenPlayers.filter((player) => aliases.some((alias) => String(player.team).toLowerCase().includes(alias)));
}

function maddenPlayersForTecmoTeam(teamName) {
  const preferred = TECMO_TO_MADDEN_TEAMS[teamName];
  const aliases = [preferred, ...(MADDEN_TEAM_ALIASES[teamName] || [])]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
  return maddenPlayers.filter((player) => aliases.includes(String(player.team).toLowerCase()));
}

function renderMaddenPreview() {
  const players = maddenPlayersForSelection().slice().sort((a, b) => (b.ovr || 0) - (a.ovr || 0)).slice(0, 25);
  els.maddenPreview.innerHTML = players.map((player) => `
    <tr>
      <td title="${escapeHtml(player.name)}">${escapeHtml(player.tsbName || formatTsbDisplayName(player.name))}</td>
      <td>${Number.isInteger(player.jerseyNumber) ? player.jerseyNumber : ""}</td>
      <td>${escapeHtml(player.position)}</td>
      <td>${escapeHtml(player.team)}</td>
      <td>${player.ovr || ""}</td>
      <td>${player.spd || ""}</td>
      <td>${player.str || ""}</td>
      <td>${player.agi || ""}</td>
      <td>${player.awr || ""}</td>
    </tr>
  `).join("") || "<tr><td colspan=\"9\">No Madden players available for this team yet.</td></tr>";
}

async function importMaddenRatings() {
  return withWork("Importing Madden Ratings", "Connecting to EA ratings...", async () => {
    els.maddenStatus.textContent = "Fetching Madden ratings...";
    const players = [];
    const seen = new Set();
    try {
      if (!HAS_LOCAL_PROXY) throw new Error("Static hosting uses bundled Madden ratings.");
      for (let page = 1; page <= 22; page += 1) {
        updateWork(`Fetching Madden ratings page ${page} of 22...`, page - 1, 22);
        els.maddenStatus.textContent = `Fetching Madden ratings page ${page}...`;
        const response = await fetch(`/madden-ratings?page=${page}`);
        if (!response.ok) throw new Error(`local proxy returned ${response.status}`);
        const html = await response.text();
        const pagePlayers = parseEaRatingsHtml(html);
        if (!pagePlayers.length) break;
        pagePlayers.forEach((player) => {
          const key = `${player.name}|${player.team}|${player.position}`;
          if (!seen.has(key)) {
            seen.add(key);
            players.push(player);
          }
        });
        updateWork(`Loaded ${players.length.toLocaleString()} Madden players...`, page, 22);
      }
      if (!players.length) throw new Error("Could not parse player rows from EA.");
      setMaddenPlayers(players, "EA ratings via local proxy");
      updateWork(`Loaded ${players.length.toLocaleString()} Madden players.`, 22, 22);
    } catch (error) {
      updateWork("EA is unavailable. Loading fallback Madden roster...", 1, 2);
      try {
        let response = await fetch(MADDEN_FALLBACK_URL);
        let sourceLabel = "bundled Madden ratings data";
        if (!response.ok && HAS_LOCAL_PROXY) {
          response = await fetch("/madden-ratings-fallback");
          sourceLabel = "Madden Ratings Hub fallback";
        }
        if (!response.ok) throw new Error(`fallback ratings returned ${response.status}`);
        const fallbackPlayers = parseFallbackMaddenCsv(await response.text());
        if (!fallbackPlayers.length) throw new Error("fallback roster contained no players");
        setMaddenPlayers(fallbackPlayers, sourceLabel);
        els.maddenStatus.textContent += " EA temporarily blocked detailed ratings, so conversions will use the available bulk ratings.";
        updateWork(`Loaded ${fallbackPlayers.length.toLocaleString()} fallback Madden players.`, 2, 2);
      } catch (fallbackError) {
        els.maddenStatus.textContent = `Madden import failed: ${error.message}. Fallback also failed: ${fallbackError.message}. Paste CSV rows below as a fallback.`;
      }
    }
  }, 22);
}

function buildMaddenAssignments(team, players) {
  const used = new Set();
  const fallback = players.filter((player) => playerPositionGroup(player));
  const assignments = [];
  for (let i = 0; i < team.slots; i += 1) {
    const role = slotRoleForTeamSlot(i);
    let player = players.find((candidate) => {
      if (used.has(candidate)) return false;
      return role.groups.includes(playerPositionGroup(candidate));
    });
    if (!player && role.label === "RET") {
      player = players.find((candidate) => !used.has(candidate) && ["RB", "REC", "DB"].includes(playerPositionGroup(candidate)));
    }
    if (!player) {
      player = fallback.find((candidate) => !used.has(candidate));
    }
    if (!player) break;
    used.add(player);
    assignments.push({ teamSlot: i, slotIndex: team.startSlot + i, player });
  }
  return assignments;
}

async function enrichAssignments(assignments, progress) {
  let detailed = 0;
  let completed = 0;
  const queue = assignments.slice();
  const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      const assignment = queue.shift();
      try {
        await enrichMaddenPlayer(assignment.player);
        if (assignment.player.detailsLoaded) detailed += 1;
      } catch {
        // Bulk ratings still provide useful fallbacks.
      }
      completed += 1;
      progress?.(assignment, completed, assignments.length);
    }
  });
  await Promise.all(workers);
  return detailed;
}

function applyMaddenAssignments(assignments) {
  assignments.forEach(({ teamSlot, slotIndex, player }) => {
    pendingNameEdits.set(slotIndex, player.tsbName || formatTsbDisplayName(player.name));
    const numberByte = maddenJerseyNumberToTsbByte(player.jerseyNumber);
    if (numberByte !== null && playerTable?.format === "tsb-pointer") pendingNumberEdits.set(slotIndex, numberByte);
    const attributes = maddenToTecmoAttributes(player, slotRoleForTeamSlot(teamSlot).label);
    writePlayerAttributeValues(slotIndex, attributes);
  });
}

function maddenJerseyNumberToTsbByte(number) {
  const value = Number(number);
  if (!Number.isInteger(value) || value < 0 || value > 99) return null;
  return (Math.floor(value / 10) << 4) | (value % 10);
}

async function applyMaddenNamesToCurrentTeam() {
  if (!playerTable) return;
  const team = playerTable.teams[Number(els.teamSelect.value || 0)] || playerTable.teams[0];
  const selectedMaddenTeam = els.maddenTeamSelect.value || TECMO_TO_MADDEN_TEAMS[team.name];
  const players = maddenPlayers.filter((player) => player.team === selectedMaddenTeam).slice().sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
  if (!players.length) {
    els.maddenStatus.textContent = `No Madden players found for ${selectedMaddenTeam || team.name}.`;
    return;
  }
  const assignments = buildMaddenAssignments(team, players);
  return withWork(`Filling ${team.name}`, "Preparing selected team...", async () => {
    const detailed = await enrichAssignments(assignments, ({ player }, completed, total) => {
      updateWork(`${team.name}: loading ${player.name}`, completed, total);
    });
    applyMaddenAssignments(assignments);
    renderPlayers();
    els.maddenStatus.textContent = `Filled ${assignments.length} ${team.name} roster slot(s) with formatted names and converted ratings. Loaded detailed ratings for ${detailed}; remaining conversions used bulk-rating fallbacks. Review, then Apply All Changes.`;
  }, assignments.length);
}

async function applyMaddenToAllTeams() {
  if (playerTable?.format !== "tsb-pointer") return;
  const allAssignments = [];
  const missing = [];
  playerTable.teams.forEach((team) => {
    const players = maddenPlayersForTecmoTeam(team.name).slice().sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
    if (!players.length) {
      missing.push(team.name);
      return;
    }
    allAssignments.push(...buildMaddenAssignments(team, players).map((assignment) => ({ ...assignment, tecmoTeam: team.name })));
  });

  return withWork("Filling All Teams", "Preparing all 28 rosters...", async () => {
    const detailed = await enrichAssignments(allAssignments, ({ player, tecmoTeam }, completed, total) => {
      updateWork(`${tecmoTeam}: loading ${player.name}`, completed, total);
    });
    applyMaddenAssignments(allAssignments);
    renderPlayers();
    const unchanged = playerTable.count - allAssignments.length;
    els.maddenStatus.textContent = `Filled ${allAssignments.length} roster slots across ${playerTable.teams.length - missing.length} teams with converted Madden ratings; ${unchanged} slot(s) stayed unchanged because current Madden rosters have fewer than 30 unique rated players. Loaded detailed ratings for ${detailed}.${missing.length ? ` Missing Madden teams: ${missing.join(", ")}.` : ""} Review, then Apply All Changes.`;
  }, allAssignments.length);
}

function looksLikeTsbRom() {
  return Boolean(meta && meta.mapper === 4 && meta.prgBanks >= 16 && meta.chrBanks >= 16);
}

function setLines(sets) {
  return sets.map((set) => `SET(${hex(set.offset)},0x${set.hex.toUpperCase()})`).join("\n");
}

function normalizeHexBytes(value) {
  const cleaned = String(value).replace(/[^0-9a-f]/gi, "");
  if (cleaned.length % 2) {
    throw new Error("Hex byte strings must contain an even number of digits.");
  }
  return cleaned.toUpperCase();
}

function bytesFromHex(value) {
  const cleaned = normalizeHexBytes(value);
  const bytes = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(Number.parseInt(cleaned.slice(i, i + 2), 16));
  }
  return bytes;
}

function formatByteRun(bytes, className) {
  return bytes.map((byte) => `<span class="${className}">${byteHex(byte)}</span>`).join("");
}

function numberOptionToSets(option) {
  const input = document.querySelector(`[data-number-hack="${option.domId}"]`);
  const value = Number(input?.value);
  if (!Number.isInteger(value) || value < option.min || value > option.max) {
    throw new Error(`${option.label} must be between ${option.min} and ${option.max}.`);
  }
  return [{ offset: option.offset, hex: byteHex(value) }];
}

function yearOptionToSets(hack) {
  const option = hack.options[0];
  const value = document.querySelector(`[data-year-hack="${hack.id}"]`)?.value || "";
  if (!/^\d{4}$/.test(value)) throw new Error("Game Year must contain exactly four digits.");
  const encoded = Array.from(value, (char) => byteHex(char.charCodeAt(0))).join("");
  return option.offsets.map((offset) => ({ offset, hex: encoded }));
}

function selectedOptionForHack(hack) {
  if (hack.type === "number") {
    const option = { ...hack.options[0], domId: hack.id };
    return {
      label: `${hack.title}: ${document.querySelector(`[data-number-hack="${hack.id}"]`)?.value}`,
      description: hack.options[0].description,
      sets: numberOptionToSets(option),
    };
  }

  if (hack.type === "year") {
    const value = document.querySelector(`[data-year-hack="${hack.id}"]`)?.value || "";
    return {
      label: value,
      description: hack.options[0].description,
      sets: yearOptionToSets(hack),
    };
  }

  if (hack.type === "toggle") {
    return hack.options[0];
  }

  const select = document.querySelector(`[data-choice-hack="${hack.id}"]`);
  return hack.options[Number(select?.value || 0)];
}

function renderHackCategories() {
  const hacks = window.TSB_HACKS || [];
  const categories = ["All", ...Array.from(new Set(hacks.map((hack) => hack.category)))];
  els.hackFilter.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  renderHackControls();
}

function renderHackControls() {
  const hacks = window.TSB_HACKS || [];
  if (!hacks.length) {
    els.hackControls.innerHTML = "<p class=\"muted\">No TSB hack data file loaded.</p>";
    return;
  }

  const category = els.hackFilter.value || "All";
  const filtered = category === "All" ? hacks : hacks.filter((hack) => hack.category === category);
  els.hackControls.innerHTML = filtered.map((hack) => {
    let control = "";
    if (hack.type === "choice") {
      const options = hack.options.map((option, index) => `<option value="${index}">${escapeHtml(option.label)}</option>`).join("");
      control = `<select data-choice-hack="${escapeHtml(hack.id)}">${options}</select>`;
    } else if (hack.type === "number") {
      const option = hack.options[0];
      const value = meta && rom ? rom[option.offset] : option.defaultValue;
      control = `<input class="byte-input" data-number-hack="${escapeHtml(hack.id)}" type="number" min="${option.min}" max="${option.max}" value="${value}">`;
    } else if (hack.type === "year") {
      const option = hack.options[0];
      const current = meta && rom
        ? Array.from(rom.slice(option.offsets[0], option.offsets[0] + 4), (byte) => String.fromCharCode(byte)).join("")
        : option.defaultValue;
      const value = /^\d{4}$/.test(current) ? current : option.defaultValue;
      control = `<input class="byte-input year-input" data-year-hack="${escapeHtml(hack.id)}" type="text" inputmode="numeric" maxlength="4" value="${escapeHtml(value)}">`;
    } else {
      control = `<span class="muted">${escapeHtml(hack.options[0].label)}</span>`;
    }

    return `
      <article class="hack-card">
        <div>
          <h3>${escapeHtml(hack.title)}</h3>
          <p>${escapeHtml(hack.note || hack.options[0]?.description || "")}</p>
        </div>
        <div class="hack-row">
          ${control}
          <button type="button" data-hack="${escapeHtml(hack.id)}">Inspect</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderHackDetail() {
  if (!selectedPatch) {
    els.hackDetail.textContent = "Choose a patch to inspect its offsets before applying.";
    enableControls(Boolean(rom));
    return;
  }

  const warning = meta && !looksLikeTsbRom()
    ? "<p class=\"warning\">Loaded ROM does not look like a typical NES Tecmo Super Bowl ROM. Open your TSB ROM before applying these offsets.</p>"
    : "";
  els.hackDetail.innerHTML = `
    <h3>${escapeHtml(selectedPatch.title)}</h3>
    <p>${escapeHtml(selectedPatch.description || "")}</p>
    ${warning}
    ${renderSetDiff(selectedPatch.sets)}
    <pre>${escapeHtml(setLines(selectedPatch.sets))}</pre>
  `;
  enableControls(Boolean(rom));
}

function renderSetDiff(sets) {
  if (!rom) return "";
  const rows = sets.map((set) => {
    const after = bytesFromHex(set.hex);
    const before = set.offset + after.length <= rom.length
      ? Array.from(rom.slice(set.offset, set.offset + after.length))
      : null;

    if (!before) {
      return `
        <div class="diff-block">
          <div class="diff-offset">${hex(set.offset)} writes past EOF</div>
          <div class="diff-line diff-error">This patch does not fit in the loaded ROM.</div>
        </div>
      `;
    }

    return `
      <div class="diff-block">
        <div class="diff-offset">${hex(set.offset)} (${after.length} byte${after.length === 1 ? "" : "s"})</div>
        <div class="diff-line"><span class="diff-mark minus">-</span>${formatByteRun(before, "byte-old")}</div>
        <div class="diff-line"><span class="diff-mark plus">+</span>${formatByteRun(after, "byte-new")}</div>
      </div>
    `;
  }).join("");

  return `<div class="set-diff">${rows}</div>`;
}

function applySets(sets) {
  if (!rom) throw new Error("Load a ROM first.");
  let written = 0;
  for (const set of sets) {
    const hexBytes = normalizeHexBytes(set.hex);
    const byteCount = hexBytes.length / 2;
    if (!Number.isInteger(set.offset) || set.offset < 0 || set.offset + byteCount > rom.length) {
      throw new Error(`${hex(set.offset)} writes past the end of this ROM.`);
    }
    for (let i = 0; i < byteCount; i += 1) {
      rom[set.offset + i] = Number.parseInt(hexBytes.slice(i * 2, i * 2 + 2), 16);
    }
    written += byteCount;
  }
  dirty = true;
  updateDirty();
  renderHex();
  renderChrBank();
  renderTileEditor();
  renderPlayers();
  renderColors();
  return written;
}

function parseOffset(value) {
  const cleaned = value.trim();
  if (cleaned.startsWith("$")) return Number.parseInt(cleaned.slice(1), 16);
  if (/^0x/i.test(cleaned)) return Number.parseInt(cleaned, 16);
  return Number.parseInt(cleaned, 10);
}

function parseSetCommands(text) {
  const sets = [];
  const regex = /SET\s*\(\s*(\$[0-9a-f]+|0x[0-9a-f]+|\d+)\s*,\s*(?:0x)?([0-9a-f\s]+)\s*\)/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sets.push({ offset: parseOffset(match[1]), hex: normalizeHexBytes(match[2]) });
  }
  if (!sets.length) throw new Error("No SET(offset, bytes) commands found.");
  return sets;
}

function previewPastedSet() {
  try {
    const sets = parseSetCommands(els.setInput.value);
    const bytes = sets.reduce((sum, set) => sum + set.hex.length / 2, 0);
    els.setStatus.textContent = `${sets.length} command(s), ${bytes} byte(s)`;
    els.hackDetail.innerHTML = `
      <h3>Pasted SET Preview</h3>
      <p>These are the exact byte changes that will be written if you apply the pasted commands.</p>
      ${renderSetDiff(sets)}
      <pre>${escapeHtml(setLines(sets))}</pre>
    `;
  } catch (error) {
    els.setStatus.textContent = error.message;
  }
}

function paintTilePixel(event) {
  if (!meta) return;
  const rect = els.tileEditor.getBoundingClientRect();
  const x = Math.max(0, Math.min(7, Math.floor(((event.clientX - rect.left) / rect.width) * 8)));
  const y = Math.max(0, Math.min(7, Math.floor(((event.clientY - rect.top) / rect.height) * 8)));
  const pixels = getTilePixels(selectedChrBank, selectedTile);
  pixels[y * 8 + x] = selectedColor;
  setTilePixels(selectedChrBank, selectedTile, pixels);
  renderTileEditor();
  renderChrBank();
}

function scanAscii() {
  const rows = [];
  const printable = (b) => b >= 32 && b <= 126;
  for (let bank = 0; bank < meta.prgBanks; bank += 1) {
    const start = meta.prgOffset + bank * 0x4000;
    const end = start + 0x4000;
    let run = "";
    let runStart = 0;
    for (let i = start; i <= end; i += 1) {
      const b = i < end ? rom[i] : 0;
      if (printable(b)) {
        if (!run) runStart = i;
        run += String.fromCharCode(b);
      } else {
        if (run.length >= 4) {
          rows.push({ offset: runStart, bank, text: run });
        }
        run = "";
      }
    }
  }
  els.stringsTable.innerHTML = rows.slice(0, 300).map((row) => {
    const safe = row.text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char]));
    return `<tr><td>${hex(row.offset)}</td><td>${row.bank.toString().padStart(2, "0")}</td><td>${safe}</td></tr>`;
  }).join("") || "<tr><td colspan=\"3\">No printable runs found.</td></tr>";
}

async function exportRom() {
  return withWork("Exporting ROM", "Committing pending changes...", async () => {
    if (pendingNameEdits.size || pendingNumberEdits.size) {
      applyPlayerNameEdits();
      if (pendingNameEdits.size || pendingNumberEdits.size) return;
    }
    if (pendingTeamEdits.size) {
      try {
        applyTeamStringEdits();
      } catch (error) {
        els.teamIdentityStatus.textContent = `Could not export team changes: ${error.message}`;
        return;
      }
    }
    if (pendingColorEdits.size) {
      try {
        applyColorEdits();
      } catch (error) {
        els.colorStatus.textContent = `Could not export color changes: ${error.message}`;
        return;
      }
    }
    updateWork("Creating ROM download...", 2, 3);
    const blob = new Blob([rom], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tsb_${timestampForFilename()}.nes`;
    a.click();
    URL.revokeObjectURL(a.href);
    els.setStatus.textContent = `Exported ${a.download}`;
    updateWork(`Exported ${a.download}`, 3, 3);
  }, 3);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#view-${tab.dataset.view}`).classList.add("active");
  });
});

els.hackFilter.addEventListener("change", () => {
  selectedPatch = null;
  renderHackControls();
  renderHackDetail();
});

els.hackControls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-hack]");
  if (!button) return;
  const hack = (window.TSB_HACKS || []).find((item) => item.id === button.dataset.hack);
  if (!hack) return;

  try {
    const option = selectedOptionForHack(hack);
    selectedPatch = {
      title: `${hack.title}: ${option.label}`,
      description: option.description || hack.note || "",
      sets: option.sets,
    };
    renderHackDetail();
  } catch (error) {
    selectedPatch = null;
    els.hackDetail.textContent = error.message;
    enableControls(Boolean(rom));
  }
});

els.applyHack.addEventListener("click", () => {
  if (!selectedPatch) return;
  try {
    const written = applySets(selectedPatch.sets);
    els.setStatus.textContent = `Applied ${written} byte(s).`;
  } catch (error) {
    alert(error.message);
  }
});

els.copySet.addEventListener("click", async () => {
  if (!selectedPatch) return;
  const text = setLines(selectedPatch.sets);
  try {
    await navigator.clipboard.writeText(text);
    els.setStatus.textContent = "Copied SET command(s).";
  } catch (_) {
    els.setInput.value = text;
    els.setInput.focus();
    els.setInput.select();
    els.setStatus.textContent = "Copied into the SET box.";
  }
});

els.loadBundled.addEventListener("click", async () => {
  if (!window.TECMO_BUNDLED_ROM_BASE64) {
    alert("No bundled ROM data file was found.");
    return;
  }
  await withWork("Loading Bundled ROM", window.TECMO_BUNDLED_ROM_NAME || "tecmo.nes", async () => {
    setLoadedRom(base64ToBytes(window.TECMO_BUNDLED_ROM_BASE64), window.TECMO_BUNDLED_ROM_NAME || "tecmo.nes");
    updateWork("Bundled ROM loaded.", 1, 1);
  }, 1);
});

els.file.addEventListener("change", async () => {
  const file = els.file.files[0];
  if (!file) return;
  await withWork("Opening ROM", file.name, async () => {
    try {
      setLoadedRom(new Uint8Array(await file.arrayBuffer()), file.name);
      updateWork("ROM loaded.", 1, 1);
    } catch (error) {
      alert(error.message);
    }
  }, 1);
});

els.exportRom.addEventListener("click", exportRom);
els.revertRom.addEventListener("click", async () => {
  if (!originalRom) return;
  await withWork("Reverting ROM", "Restoring loaded ROM bytes...", async () => {
    setLoadedRom(originalRom, romName);
    updateWork("ROM restored.", 1, 1);
  }, 1);
});
els.chrBank.addEventListener("change", () => {
  selectedChrBank = Number(els.chrBank.value);
  selectedTile = 0;
  renderChrBank();
  renderTileEditor();
});
els.prgBank.addEventListener("change", renderHex);
els.zoom.addEventListener("input", renderChrBank);
els.chrCanvas.addEventListener("click", (event) => {
  if (!meta) return;
  const rect = els.chrCanvas.getBoundingClientRect();
  const zoom = Number(els.zoom.value);
  const tileSize = 8 * zoom;
  const col = Math.floor((event.clientX - rect.left) / tileSize);
  const row = Math.floor((event.clientY - rect.top) / tileSize);
  selectedTile = Math.max(0, Math.min(511, row * 16 + col));
  renderChrBank();
  renderTileEditor();
});
els.tileEditor.addEventListener("click", paintTilePixel);
els.clearTile.addEventListener("click", () => {
  setTilePixels(selectedChrBank, selectedTile, new Uint8Array(64));
  renderTileEditor();
  renderChrBank();
});
els.copyTile.addEventListener("click", () => {
  copiedTile = getTilePixels(selectedChrBank, selectedTile);
  els.pasteTile.disabled = false;
});
els.pasteTile.addEventListener("click", () => {
  if (!copiedTile) return;
  setTilePixels(selectedChrBank, selectedTile, copiedTile);
  renderTileEditor();
  renderChrBank();
});
els.scanStrings.addEventListener("click", () => withWork("Scanning PRG ASCII", "Searching printable strings...", async () => {
  scanAscii();
  updateWork("String scan complete.", 1, 1);
}, 1));
els.setInput.addEventListener("input", () => {
  enableControls(Boolean(rom));
  if (els.setInput.value.trim()) previewPastedSet();
  else els.setStatus.textContent = "";
});
els.previewSet.addEventListener("click", previewPastedSet);
els.applySet.addEventListener("click", () => {
  try {
    const sets = parseSetCommands(els.setInput.value);
    const written = applySets(sets);
    els.setStatus.textContent = `Applied ${written} byte(s).`;
  } catch (error) {
    els.setStatus.textContent = error.message;
  }
});
els.teamSelect.addEventListener("change", () => {
  const team = playerTable?.teams[Number(els.teamSelect.value || 0)];
  if (team) selectedPlayerSlot = team.startSlot;
  syncMaddenTeamToSelectedTecmoTeam();
  renderPlayers();
  renderMaddenPreview();
});
els.startDraft.addEventListener("click", startSmartDraft);
els.autoDraft.addEventListener("click", () => withWork("Auto Drafting", "Running AI picks until your team is on the clock...", async () => {
  autoDraftToUserPick();
  updateWork("Auto draft stopped.", 1, 1);
}, 1));
els.draftForMe.addEventListener("click", () => {
  autoDraftOnePick(true);
  renderDraft();
});
els.applyDraft.addEventListener("click", () => withWork("Applying Draft", "Staging drafted rosters...", async () => {
  applyDraftToRom();
  updateWork("Draft staged.", 1, 1);
}, 1));
els.resetDraft.addEventListener("click", resetDraft);
els.draftSearch.addEventListener("input", renderDraft);
els.draftPositionFilter.addEventListener("change", renderDraft);
els.draftBoard.addEventListener("click", (event) => {
  const button = event.target.closest("[data-draft-player]");
  if (!button || !draftState) return;
  const teamIndex = currentDraftTeamIndex();
  if (teamIndex !== draftState.userTeamIndex) return;
  const player = draftState.pool.find((candidate) => candidate.id === Number(button.dataset.draftPlayer));
  if (draftPlayerForTeam(teamIndex, player)) renderDraft();
});
els.identityTeamSelect.addEventListener("change", renderTeams);
els.teamIdentityEditor.addEventListener("input", (event) => {
  const input = event.target.closest("[data-team-string-index]");
  if (!input) return;
  const stringIndex = Number(input.dataset.teamStringIndex);
  const isAbbreviation = stringIndex < 32;
  const next = cleanTeamText(input.value, isAbbreviation ? 4 : 18);
  input.value = next;
  if (next === readTeamString(stringIndex)) pendingTeamEdits.delete(stringIndex);
  else pendingTeamEdits.set(stringIndex, next);

  const teamIndex = Number(els.identityTeamSelect.value || 0);
  const identity = teamIdentity(teamIndex);
  els.teamIdentityHeading.textContent = `${identity.city} ${identity.nickname}`;
  const preview = els.teamIdentityEditor.querySelector(".team-name-preview");
  if (preview) preview.innerHTML = `${escapeHtml(identity.city)} ${escapeHtml(identity.nickname)} <span class="muted">(${escapeHtml(identity.abbreviation)})</span>`;
  renderTeamDiff();
});
els.teamIdentityEditor.addEventListener("change", () => {
  fillIdentityTeamSelect();
  renderTeams();
});
els.updateTeamNames.addEventListener("click", () => withWork("Updating Team Names", "Staging modern team identities...", async () => {
  stageModernTeamNames();
  updateWork("Modern team identities staged.", 28, 28);
}, 28));
els.applyTeamChanges.addEventListener("click", () => withWork("Applying Team Changes", "Rebuilding the team string table...", async () => {
  try {
    const changed = applyTeamStringEdits();
    els.teamIdentityStatus.textContent = `Applied ${changed} team text field change${changed === 1 ? "" : "s"} to the working ROM.`;
    updateWork("Team string table rebuilt.", 1, 1);
  } catch (error) {
    els.teamIdentityStatus.textContent = `Could not apply team changes: ${error.message}`;
  }
}, 1));
els.colorTeamSelect.addEventListener("change", renderColors);
els.colorEditor.addEventListener("change", (event) => {
  const input = event.target.closest("[data-color-offset]");
  if (!input) return;
  const offset = Number(input.dataset.colorOffset);
  const value = Number(input.value) & 0x3F;
  if (!rom || !Number.isInteger(offset) || offset < 0 || offset >= rom.length) return;
  if (value === rom[offset]) pendingColorEdits.delete(offset);
  else pendingColorEdits.set(offset, value);
  renderColors();
});
els.applyColorChanges.addEventListener("click", () => withWork("Applying Color Changes", "Writing mapped palette bytes...", async () => {
  try {
    const written = applyColorEdits();
    els.colorStatus.textContent = `Applied ${written} color byte${written === 1 ? "" : "s"} to the working ROM.`;
    updateWork("Color bytes written.", 1, 1);
  } catch (error) {
    els.colorStatus.textContent = `Could not apply color changes: ${error.message}`;
  }
}, 1));
els.playerTable.addEventListener("click", (event) => {
  if (event.target.closest("input, select, button")) return;
  const row = event.target.closest("[data-player-row]");
  if (!row) return;
  const nextSlot = Number(row.dataset.playerRow);
  if (selectedPlayerSlot !== nextSlot) {
    selectedPlayerSlot = nextSlot;
    renderPlayers();
  }
});
els.playerTable.addEventListener("input", (event) => {
  const nameInput = event.target.closest("[data-player-slot]");
  const numberInput = event.target.closest("[data-number-slot]");
  if (!nameInput && !numberInput) return;

  if (nameInput) {
    const slotIndex = Number(nameInput.dataset.playerSlot);
    selectedPlayerSlot = slotIndex;
    const current = readPlayerName(slotIndex);
    const next = playerTable.format === "tsb-pointer" ? nameInput.value : nameInput.value.toUpperCase();
    if (playerTable.format !== "tsb-pointer") nameInput.value = next;
    if (next.trim() === current.trim()) pendingNameEdits.delete(slotIndex);
    else pendingNameEdits.set(slotIndex, next);
  }

  if (numberInput) {
    const slotIndex = Number(numberInput.dataset.numberSlot);
    selectedPlayerSlot = slotIndex;
    const numeric = Math.max(0, Math.min(99, Number(numberInput.value || 0)));
    const nextNumber = maddenJerseyNumberToTsbByte(Math.trunc(numeric));
    if (nextNumber === null) return;
    if (numberInput.value !== "" && Number(numberInput.value) !== numeric) numberInput.value = String(Math.trunc(numeric));
    if (nextNumber === readStoredPlayerNumber(slotIndex)) pendingNumberEdits.delete(slotIndex);
    else pendingNumberEdits.set(slotIndex, nextNumber);
  }

  renderPlayerDiff();
  renderPlayerAttributes();
});
els.playerTable.addEventListener("change", (event) => {
  const roleSelect = event.target.closest("[data-role-slot]");
  if (!roleSelect) return;
  swapTsbPlayerSlots(Number(roleSelect.dataset.roleSlot), Number(roleSelect.value));
});
els.attributeEditor.addEventListener("change", (event) => {
  const input = event.target.closest("[data-attribute-index]");
  if (!input) return;
  const index = Number(input.dataset.attributeIndex);
  const value = Number(input.value);
  if (writePlayerAttribute(selectedPlayerSlot, index, value)) {
    renderPlayerAttributes();
  }
});
els.applyPlayerNames.addEventListener("click", () => withWork("Applying All Changes", "Rebuilding roster data...", async () => {
  applyPlayerNameEdits();
  updateWork("Changes applied.", 1, 1);
}, 1));
els.importMadden.addEventListener("click", importMaddenRatings);
els.maddenTeamSelect.addEventListener("change", renderMaddenPreview);
els.applyMaddenTeam.addEventListener("click", applyMaddenNamesToCurrentTeam);
els.applyMaddenAll.addEventListener("click", applyMaddenToAllTeams);
els.parseMaddenPaste.addEventListener("click", () => {
  const players = parseMaddenPlayersFromText(els.maddenPaste.value);
  if (!players.length) {
    els.maddenStatus.textContent = "No CSV/TSV Madden rows found. Use columns: Name, Team, Position, OVR, SPD, STR, AGI, AWR.";
    return;
  }
  setMaddenPlayers(players, "pasted data");
});

renderPalette();
renderHackCategories();
if (window.TECMO_BUNDLED_ROM_BASE64) {
  setLoadedRom(base64ToBytes(window.TECMO_BUNDLED_ROM_BASE64), window.TECMO_BUNDLED_ROM_NAME || "tecmo.nes");
} else {
  els.loadBundled.hidden = true;
}
