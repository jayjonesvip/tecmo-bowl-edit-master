const PALETTE = [
  [247, 247, 239, 255],
  [102, 143, 186, 255],
  [190, 88, 75, 255],
  [32, 36, 38, 255],
];

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
  zoom: document.querySelector("#zoom"),
  dirtyState: document.querySelector("#dirty-state"),
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
  generateChangelog: document.querySelector("#generate-changelog"),
  downloadChangelog: document.querySelector("#download-changelog"),
  changelogOutput: document.querySelector("#changelog-output"),
  teamSelect: document.querySelector("#team-select"),
  redraftRosters: document.querySelector("#redraft-rosters"),
  revertDraft: document.querySelector("#revert-draft"),
  finalizeDraft: document.querySelector("#finalize-draft"),
  draftSeed: document.querySelector("#draft-seed"),
  randomDraftSeed: document.querySelector("#random-draft-seed"),
  identityTeamSelect: document.querySelector("#identity-team-select"),
  teamIdentityHeading: document.querySelector("#team-identity-heading"),
  teamIdentityStatus: document.querySelector("#team-identity-status"),
  teamIdentityEditor: document.querySelector("#team-identity-editor"),
  teamAiStatus: document.querySelector("#team-ai-status"),
  teamAiEditor: document.querySelector("#team-ai-editor"),
  teamNameDiff: document.querySelector("#team-name-diff"),
  updateTeamNames: document.querySelector("#update-team-names"),
  applyTeamChanges: document.querySelector("#apply-team-changes"),
  colorTeamSelect: document.querySelector("#color-team-select"),
  colorStatus: document.querySelector("#color-status"),
  colorEditor: document.querySelector("#color-editor"),
  colorDiff: document.querySelector("#color-diff"),
  applyColorChanges: document.querySelector("#apply-color-changes"),
  rosterHeading: document.querySelector("#roster-heading"),
  playerStatus: document.querySelector("#player-status"),
  playerTable: document.querySelector("#player-table"),
  playerDiff: document.querySelector("#player-diff"),
  attributeStatus: document.querySelector("#attribute-status"),
  attributeEditor: document.querySelector("#attribute-editor"),
  applyPlayerNames: document.querySelector("#apply-player-names"),
  rosterStatus: document.querySelector("#roster-status"),
  rosterProgress: document.querySelector("#roster-progress"),
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
let pendingPlayerAttributes = new Map();
let pendingPlayerFaces = new Map();
let pendingTeamEdits = new Map();
let pendingTeamAiEdits = new Map();
let pendingColorEdits = new Map();
let draftState = null;
let draftUndoSnapshot = null;
let automaticDraftTimer = null;

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
const TEAM_AI_PREF_START = 0x27526;
const TEAM_SIM_DATA_START = 0x18192;
const TEAM_SIM_DATA_STRIDE = 0x30;
const TEAM_PLAYBOOK_START = 0x1D310;
const TEAM_PLAYBOOK_STRIDE = 4;
const PLAYBOOK_ASSET_PATH = "./assets/playbook";
const TEAM_AI_PREF_OPTIONS = [
  { value: 0, label: "Little More Rushing" },
  { value: 1, label: "Heavy Rushing" },
  { value: 2, label: "Little More Passing" },
  { value: 3, label: "Heavy Passing" },
];
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
const TSB_FACE_IDS = [
  ...Array.from({ length: 0x53 }, (_, index) => index),
  ...Array.from({ length: 0x55 }, (_, index) => 0x80 + index),
];
const TSB_FACE_ID_SET = new Set(TSB_FACE_IDS);
const TSB_FACE_ASSET_PATH = "./assets/faces";
const DRAFT_BACKUP_SLOTS = new Set(["QB2", "RB3", "RB4", "WR3", "WR4", "TE2"]);
const AUTOMATIC_DRAFT_PICK_MS = 40;

const ATTRIBUTE_LABELS_BY_ROLE = {
  QB: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Passing Speed", "Pass Control", "Passing Accuracy", "Avoid Pass Block"],
  RB: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Ball Control", "Receptions"],
  REC: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Ball Control", "Receptions"],
  OL: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power"],
  K: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Kicking Ability", "Avoid Kick Block"],
  P: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Kicking Ability", "Avoid Kick Block"],
  DEF: ["Running Speed", "Rushing Power", "Maximum Speed", "Hitting Power", "Pass Rush", "Interceptions"],
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

function updateRosterProgress(detail, value, max) {
  els.rosterStatus.textContent = detail;
  els.rosterProgress.hidden = false;
  els.rosterProgress.max = Math.max(1, max);
  els.rosterProgress.value = Math.max(0, Math.min(value, max));
}

function finishRosterProgress(detail) {
  els.rosterStatus.textContent = detail;
  els.rosterProgress.value = els.rosterProgress.max || 1;
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

function hasInesHeader(bytes = rom) {
  return Boolean(bytes?.length >= 16 && bytes[0] === 0x4E && bytes[1] === 0x45 && bytes[2] === 0x53 && bytes[3] === 0x1A);
}

function hasPlausibleTsbHeader() {
  return Boolean(hasInesHeader(rom) && meta && meta.mapper === 4 && !meta.hasTrainer && meta.prgBanks >= 16 && meta.chrBanks >= 16 && meta.endOffset <= rom.length);
}

function playerTableLooksLikeTsb(table = playerTable) {
  return Boolean(table?.format === "tsb-pointer"
    && table.count === 28 * 30
    && table.teams?.length === 28
    && table.teams.every((team) => team.slots === 30));
}

function teamStringTableLooksPlausible(table = teamStringTable) {
  return Boolean(table
    && table.teamCount === 28
    && table.count >= 92
    && table.start >= 0
    && table.dataStart > table.start
    && table.dataEnd >= table.dataStart
    && table.limit >= table.dataEnd
    && table.limit <= rom.length);
}

function supportedTsbRomStatus() {
  if (!rom || !meta) return { ok: false, message: "Load a supported NES football ROM before applying game-specific hacks." };
  if (!hasInesHeader(rom)) return { ok: false, message: "This ROM does not appear to be an iNES NES ROM. Game hacks are disabled." };
  if (meta.mapper !== 4) return { ok: false, message: "This ROM does not use MMC3 / mapper 4. Game hacks are disabled." };
  if (meta.hasTrainer) return { ok: false, message: "This ROM has an iNES trainer. Game hacks are disabled." };
  if (meta.prgBanks < 16 || meta.chrBanks < 16 || meta.endOffset > rom.length) {
    return { ok: false, message: "This ROM does not have a plausible supported NES football PRG/CHR layout. Game hacks are disabled." };
  }
  if (!playerTableLooksLikeTsb()) {
    return { ok: false, message: "This ROM does not appear to contain the supported 28-team roster table. Game hacks are disabled." };
  }
  if (!teamStringTableLooksPlausible()) {
    return { ok: false, message: "This ROM does not appear to contain the supported team string table. Game hacks are disabled." };
  }
  return { ok: true, message: "" };
}

function looksLikeTsbRom() {
  return supportedTsbRomStatus().ok;
}

function supportedTsbWarningHtml() {
  const status = supportedTsbRomStatus();
  return rom && !status.ok ? `<p class="warning">${escapeHtml(status.message)}</p>` : "";
}

function requireSupportedTsbForPatches() {
  const status = supportedTsbRomStatus();
  if (!status.ok) throw new Error(status.message);
}

function setLoadedRom(bytes, name) {
  rom = new Uint8Array(bytes);
  document.body.classList.remove("no-rom");
  originalRom = new Uint8Array(bytes);
  meta = parseRom(rom);
  romName = name.replace(/\.nes$/i, "") + ".nes";
  selectedChrBank = 0;
  selectedTile = 0;
  dirty = false;
  copiedTile = null;
  pendingNameEdits = new Map();
  pendingNumberEdits = new Map();
  pendingPlayerAttributes = new Map();
  pendingPlayerFaces = new Map();
  pendingTeamEdits = new Map();
  pendingTeamAiEdits = new Map();
  pendingColorEdits = new Map();
  els.changelogOutput.value = "";
  els.rosterProgress.hidden = true;
  els.rosterProgress.value = 0;
  selectedPlayerSlot = 0;
  draftState = null;
  draftUndoSnapshot = null;
  stopAutomaticDraft();

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
    els.clearTile,
    els.copyTile,
    els.pasteTile,
    els.generateChangelog,
  ].filter(Boolean).forEach((el) => {
    el.disabled = !enabled || (el === els.pasteTile && !copiedTile);
  });
  const supportedTsb = looksLikeTsbRom();
  els.previewSet.disabled = !enabled || !els.setInput.value.trim();
  els.applySet.disabled = !enabled || !els.setInput.value.trim() || !supportedTsb;
  els.applyHack.disabled = !enabled || !selectedPatch || !supportedTsb;
  els.copySet.disabled = !selectedPatch;
  els.teamSelect.disabled = !enabled || !playerTable;
  els.identityTeamSelect.disabled = !enabled || !teamStringTable;
  els.updateTeamNames.disabled = !enabled || !teamStringTable;
  els.applyTeamChanges.disabled = !enabled || (!pendingTeamEdits.size && !pendingTeamAiEdits.size);
  els.colorTeamSelect.disabled = !enabled || !looksLikeTsbRom();
  els.applyColorChanges.disabled = !enabled || !pendingColorEdits.size;
  els.applyPlayerNames.disabled = !enabled || !hasPendingRosterChanges();
  els.redraftRosters.disabled = !enabled || !supportedDraftLoaded();
  els.revertDraft.disabled = !enabled || !draftUndoSnapshot;
  els.finalizeDraft.disabled = !enabled || !hasPendingRosterChanges();
  els.randomDraftSeed.disabled = !enabled || !supportedDraftLoaded();
  els.downloadChangelog.disabled = !enabled || !els.changelogOutput.value.trim();
}

function fillSelects() {
  els.chrBank.innerHTML = "";
  for (let i = 0; i < meta.chrBanks; i += 1) {
    const option = document.createElement("option");
    option.value = String(i);
    option.textContent = `CHR ${i.toString().padStart(2, "0")}`;
    els.chrBank.append(option);
  }

  playerTable = detectPlayerNameTable();
  playerAttributeTable = detectPlayerAttributeTable();
  teamStringTable = detectTeamStringTable();
  fillTeamSelect();
  fillIdentityTeamSelect();
  fillColorTeamSelect();
}

function renderAll() {
  renderSummary();
  renderChrBank();
  renderTileEditor();
  renderHackControls();
  renderPlayers();
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
  if (hasPlausibleTsbHeader() && tsbEndPointer + 1 < rom.length) {
    let validRecords = 0;
    let previousOffset = -1;
    for (let i = 0; i < tsbCount; i += 1) {
      const pointerOffset = tsbPointerStart + i * 2;
      const pointer = rom[pointerOffset] | (rom[pointerOffset + 1] << 8);
      const nextPointer = rom[pointerOffset + 2] | (rom[pointerOffset + 3] << 8);
      const start = pointerToFileOffset(pointer);
      const end = pointerToFileOffset(nextPointer);
      if (start <= previousOffset || start < 0 || end <= start || end > rom.length) {
        previousOffset = start;
        continue;
      }
      const nameBytes = rom.slice(start + 1, end);
      const printableName = nameBytes.length > 0 && nameBytes.length <= 16
        && Array.from(nameBytes).every((byte) => byte === 0x20 || byte === 0x2E || (byte >= 0x41 && byte <= 0x5A) || (byte >= 0x61 && byte <= 0x7A));
      if (printableName) validRecords += 1;
      previousOffset = start;
    }

    if (validRecords >= 800) {
      return {
        kind: "Supported 28-team pointer roster",
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
        kind: "12-team fixed-name roster",
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
      kind: "Supported 28-team ability table",
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
    reason: "This loaded ROM uses a 12-team fixed-name table at 0x3028. The confirmed 28-team attribute map starts at 0x3010, which overlaps that table here, so writing those bytes would corrupt names.",
  };
}

function detectTeamStringTable() {
  if (!rom || !hasPlausibleTsbHeader()) return null;
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
    kind: "Supported team string table",
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

function teamAiOffset(kind, teamIndex) {
  if (kind === "preference") return TEAM_AI_PREF_START + teamIndex;
  if (kind === "sim") return TEAM_SIM_DATA_START + teamIndex * TEAM_SIM_DATA_STRIDE;
  if (kind === "playbook") return TEAM_PLAYBOOK_START + teamIndex * TEAM_PLAYBOOK_STRIDE;
  return null;
}

function pendingOrCurrentByte(offset) {
  if (!rom || offset === null || offset < 0 || offset >= rom.length) return null;
  return pendingTeamAiEdits.get(offset) ?? rom[offset];
}

function playbookByteOffset(teamIndex, slotType, slotIndex) {
  const base = teamAiOffset("playbook", teamIndex);
  if (base === null) return null;
  return base + (slotType === "run" ? 0 : 2) + Math.floor(slotIndex / 2);
}

function readPlaybookSlot(teamIndex, slotType, slotIndex) {
  const offset = playbookByteOffset(teamIndex, slotType, slotIndex);
  const byte = pendingOrCurrentByte(offset);
  if (byte === null) return null;
  return slotIndex % 2 === 0 ? (byte >> 4) & 0x07 : byte & 0x07;
}

function stagePlaybookSlot(teamIndex, slotType, slotIndex, playIndex) {
  const offset = playbookByteOffset(teamIndex, slotType, slotIndex);
  if (offset === null) return;
  const currentByte = pendingOrCurrentByte(offset);
  if (currentByte === null) return;
  const nibble = Math.max(0, Math.min(7, playIndex)) & 0x07;
  const nextByte = slotIndex % 2 === 0
    ? ((nibble << 4) | (currentByte & 0x0F))
    : ((currentByte & 0xF0) | nibble);
  stageTeamAiByte(offset, nextByte);
}

function stageTeamAiByte(offset, value) {
  if (!rom || offset === null || offset < 0 || offset >= rom.length) return;
  const byte = value & 0xFF;
  if (byte === rom[offset]) pendingTeamAiEdits.delete(offset);
  else pendingTeamAiEdits.set(offset, byte);
}

function teamAiSetDiffs() {
  return Array.from(pendingTeamAiEdits.entries())
    .sort(([a], [b]) => a - b)
    .map(([offset, value]) => ({ offset, hex: byteHex(value) }));
}

function playbookImage(slotType, slotIndex, playIndex) {
  const prefix = slotType === "run" ? "R" : "P";
  return `${PLAYBOOK_ASSET_PATH}/${prefix}${slotIndex + 1}-${playIndex}.BMP`;
}

function playbookSlotHtml(teamIndex, slotType, slotIndex) {
  const playIndex = readPlaybookSlot(teamIndex, slotType, slotIndex);
  const prefix = slotType === "run" ? "R" : "P";
  const playLabel = `${prefix}${slotIndex + 1}`;
  return `
    <div class="playbook-card">
      <div class="playbook-card-head">
        <span>${playLabel}</span>
        <select data-playbook-slot="${slotType}:${slotIndex}" aria-label="${playLabel} play">
          ${Array.from({ length: 8 }, (_, index) => `
            <option value="${index}"${playIndex === index ? " selected" : ""}>${index + 1}</option>
          `).join("")}
        </select>
      </div>
      ${playIndex === null ? "" : `<img src="${playbookImage(slotType, slotIndex, playIndex)}" alt="${playLabel}-${playIndex + 1}" loading="lazy">`}
    </div>
  `;
}

function renderTeamAi(teamIndex) {
  if (!rom || !looksLikeTsbRom()) {
    els.teamAiStatus.textContent = "Load a supported 28-team NES football ROM to edit team AI tendencies.";
    els.teamAiEditor.innerHTML = "";
    return;
  }

  const preferenceOffset = teamAiOffset("preference", teamIndex);
  const simOffset = teamAiOffset("sim", teamIndex);
  const playbookOffset = teamAiOffset("playbook", teamIndex);
  const preference = pendingOrCurrentByte(preferenceOffset);
  const simData = pendingOrCurrentByte(simOffset);
  const offense = simData === null ? 0 : (simData >> 4) & 0x0F;
  const defense = simData === null ? 0 : simData & 0x0F;

  els.teamAiStatus.textContent = `AI bytes: tendency ${hex(preferenceOffset)}, sim ${hex(simOffset)}, playbook ${hex(playbookOffset)}-${hex(playbookOffset + 3)}.`;
  els.teamAiEditor.innerHTML = `
    <section class="team-ai-section">
      <h3>CPU Play Calling</h3>
      <label class="team-ai-field">
        <span>Run/Pass Preference</span>
        <select data-team-ai-pref>
          ${TEAM_AI_PREF_OPTIONS.map((option) => `
            <option value="${option.value}"${preference === option.value ? " selected" : ""}>${option.label}</option>
          `).join("")}
        </select>
      </label>
    </section>
    <section class="team-ai-section">
      <h3>Simulation Strength</h3>
      <div class="team-ai-two">
        <label class="team-ai-field">
          <span>Offense <small>0-15</small></span>
          <input data-team-sim-nibble="offense" type="number" min="0" max="15" value="${offense}">
        </label>
        <label class="team-ai-field">
          <span>Defense <small>0-15</small></span>
          <input data-team-sim-nibble="defense" type="number" min="0" max="15" value="${defense}">
        </label>
      </div>
    </section>
    <section class="team-ai-section">
      <h3>Playbook</h3>
      <div class="playbook-grid">
        ${Array.from({ length: 4 }, (_, index) => playbookSlotHtml(teamIndex, "run", index)).join("")}
        ${Array.from({ length: 4 }, (_, index) => playbookSlotHtml(teamIndex, "pass", index)).join("")}
      </div>
    </section>
  `;
}

function fillTeamSelect() {
  const previous = els.teamSelect.value;
  els.teamSelect.innerHTML = "";
  if (!playerTable) return;
  playerTable.teams.forEach((team) => {
    const option = document.createElement("option");
    option.value = String(team.index);
    option.textContent = teamStringTable?.teamCount > team.index
      ? `${teamIdentity(team.index).city} ${teamIdentity(team.index).nickname}`
      : team.name;
    els.teamSelect.append(option);
  });
  if (previous && Array.from(els.teamSelect.options).some((option) => option.value === previous)) {
    els.teamSelect.value = previous;
  }
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
    els.colorStatus.textContent = "Load a supported 28-team NES football ROM to edit mapped color bytes.";
    els.colorEditor.innerHTML = "";
    els.colorDiff.textContent = "Edit a color to preview the ROM byte changes.";
    enableControls(Boolean(rom));
    return;
  }

  const teamIndex = Number(els.colorTeamSelect.value || 0);
  const teamName = TSB_TEAM_NAMES_28[teamIndex] || "Team";
  const teamOffset = TEAM_COLOR_BASE + teamIndex;
  els.colorStatus.textContent = "These controls edit known palette bytes from the SET command list. Some bytes affect menus or data screens rather than on-field uniforms.";
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
    els.teamIdentityStatus.textContent = "This ROM does not contain the supported 28-team team string table.";
    els.teamIdentityEditor.innerHTML = "";
    renderTeamAi(0);
    els.teamNameDiff.textContent = "Load a supported 28-team NES football ROM to edit team names.";
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
  renderTeamAi(teamIndex);
  renderTeamDiff();
  enableControls(Boolean(rom));
}

function renderTeamDiff() {
  const aiSets = teamAiSetDiffs();
  if ((!teamStringTable || !pendingTeamEdits.size) && !aiSets.length) {
    els.teamNameDiff.textContent = "Edit a team or use current team names to preview changes.";
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
  const image = teamStringTable ? buildTeamStringTableImage(false) : null;
  const textSummary = teamIndexes.length
    ? `
      <h3>${teamIndexes.length} team${teamIndexes.length === 1 ? "" : "s"} pending</h3>
      <p>Applying rebuilds the pointer-based string table and preserves its non-team labels.</p>
      <p>${image.dataEnd - teamStringTable.dataStart} of ${teamStringTable.limit - teamStringTable.dataStart} string-data bytes will be used.</p>
      <div class="team-text-diff">${rows}</div>
    `
    : "";
  const aiSummary = aiSets.length
    ? `
      <h3>${aiSets.length} pending AI byte${aiSets.length === 1 ? "" : "s"}</h3>
      ${renderSetDiff(aiSets)}
    `
    : "";
  els.teamNameDiff.innerHTML = `
    ${textSummary}
    ${aiSummary}
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
  fillTeamSelect();
  fillIdentityTeamSelect();
  renderTeams();
  return changed;
}

function applyTeamAiEdits() {
  const sets = teamAiSetDiffs();
  if (!sets.length) return 0;
  const written = applySets(sets);
  pendingTeamAiEdits.clear();
  renderTeams();
  return written;
}

function stageModernTeamNames() {
  if (!teamStringTable) return;
  MODERN_TEAM_IDENTITIES.forEach(([abbreviation, city, nickname], teamIndex) => {
    [[teamIndex, abbreviation], [teamIndex + 32, city], [teamIndex + 64, nickname]].forEach(([stringIndex, value]) => {
      if (readTeamString(stringIndex) === value) pendingTeamEdits.delete(stringIndex);
      else pendingTeamEdits.set(stringIndex, value);
    });
  });
  fillTeamSelect();
  fillIdentityTeamSelect();
  renderTeams();
  els.teamIdentityStatus.textContent = "Current team names staged for all 28 teams. Review the changes, then apply them.";
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

function faceOffsetForSlot(slotIndex) {
  const base = attributeOffsetForSlot(slotIndex);
  return base === null ? null : base + 2;
}

function readPlayerFace(slotIndex) {
  if (pendingPlayerFaces.has(slotIndex)) return pendingPlayerFaces.get(slotIndex);
  return readStoredPlayerFace(slotIndex);
}

function readStoredPlayerFace(slotIndex) {
  const offset = faceOffsetForSlot(slotIndex);
  if (offset === null || offset >= rom.length) return null;
  return rom[offset];
}

function faceAssetName(faceId) {
  if (!Number.isInteger(faceId)) return "NA.BMP";
  return `${faceId.toString(16).toUpperCase().padStart(2, "0")}.BMP`;
}

function facePreviewHtml(faceId, className = "") {
  const valid = TSB_FACE_ID_SET.has(faceId);
  const label = valid ? `Face ${byteHex(faceId)}` : "No face";
  return `
    <span class="face-preview ${className}" title="${escapeHtml(label)}">
      <img src="${TSB_FACE_ASSET_PATH}/${valid ? faceAssetName(faceId) : "NA.BMP"}" alt="${escapeHtml(label)}" loading="lazy">
      <span>${valid ? byteHex(faceId) : "--"}</span>
    </span>
  `;
}

function writePlayerFace(slotIndex, faceId) {
  const offset = faceOffsetForSlot(slotIndex);
  if (offset === null || offset >= rom.length || !TSB_FACE_ID_SET.has(faceId)) return false;
  if (faceId === readStoredPlayerFace(slotIndex)) pendingPlayerFaces.delete(slotIndex);
  else pendingPlayerFaces.set(slotIndex, faceId);
  return true;
}

function readPlayerAttributes(slotIndex) {
  const attrs = readStoredPlayerAttributes(slotIndex);
  if (!attrs) return null;
  if (pendingPlayerAttributes.has(slotIndex)) return { ...attrs, values: pendingPlayerAttributes.get(slotIndex).slice() };
  return attrs;
}

function readStoredPlayerAttributes(slotIndex) {
  const base = attributeOffsetForSlot(slotIndex);
  if (base === null || base + 4 >= rom.length) return null;

  const labels = playerAttributeLabels(slotIndex);
  const roleKey = attributeRoleKey(slotRoleForTeamSlot(slotIndex % playerAttributeTable.slotsPerTeam).label);
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

function playerAttributeLabels(slotIndex) {
  const teamSlot = slotIndex % playerAttributeTable.slotsPerTeam;
  const roleKey = attributeRoleKey(slotRoleForTeamSlot(teamSlot).label);
  return ATTRIBUTE_LABELS_BY_ROLE[roleKey] || ATTRIBUTE_LABELS_BY_ROLE.DEF;
}

function writePlayerAttribute(slotIndex, attributeIndex, nibbleValue) {
  const current = readPlayerAttributes(slotIndex);
  if (!current || attributeIndex < 0 || attributeIndex >= current.values.length) return false;
  const values = current.values.slice();
  values[attributeIndex] = nibbleValue & 0x0F;
  return writePlayerAttributeValues(slotIndex, values);
}

function writePlayerAttributeValues(slotIndex, values) {
  const current = readStoredPlayerAttributes(slotIndex);
  if (!current) return false;
  const count = Math.min(current.values.length, values.length);
  const staged = current.values.slice();
  for (let index = 0; index < count; index += 1) {
    staged[index] = Number(values[index]) & 0x0F;
  }
  if (staged.every((value, index) => value === current.values[index])) pendingPlayerAttributes.delete(slotIndex);
  else pendingPlayerAttributes.set(slotIndex, staged);
  return true;
}

function draftRatingFromAttributes(attrs, roleLabel = "") {
  if (!attrs?.values?.length) return 0;
  const ratings = attrs.values.map((nibble) => TSB_ATTRIBUTE_VALUE_STEPS[nibble] || 0);
  const average = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
  const group = draftGroupForTeamSlot(TSB_POSITIONS_30.indexOf(roleLabel));
  const positionFactor = { QB: 1.08, RB: 1.10, REC: 1.07, DB: 1.02, LB: 1.00, DL: 0.98, OL: 0.92, K: 0.55, P: 0.50 }[group] || 1;
  const starterBonus = DRAFT_BACKUP_SLOTS.has(roleLabel) ? 0 : 4;
  return Math.round((average * positionFactor) + starterBonus);
}

function hashSeed(seedText) {
  const text = String(seedText || "");
  let hash = 0x811C9DC5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createSeededRandom(seedText) {
  let state = hashSeed(seedText) || 0xA5A5A5A5;
  // Mulberry32 is tiny, deterministic, and good enough for reproducible draft order/scoring jitter.
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInt(rng, max) {
  return Math.floor(rng() * max);
}

function shuffledIndexes(count, random) {
  const values = Array.from({ length: count }, (_, index) => index);
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, index + 1);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

function draftGroupForTeamSlot(teamSlot) {
  return slotRoleForTeamSlot(teamSlot).groups[0] || "REC";
}

function draftPhaseForTeamSlot(teamSlot) {
  return DRAFT_BACKUP_SLOTS.has(TSB_POSITIONS_30[teamSlot]) ? 1 : 0;
}

function draftCurrentPhase(roster) {
  for (let phase = 0; phase <= 1; phase += 1) {
    if (roster.some((player, teamSlot) => !player && draftPhaseForTeamSlot(teamSlot) === phase)) return phase;
  }
  return 2;
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
  const phase = draftCurrentPhase(roster);
  for (let teamSlot = 0; teamSlot < TSB_POSITIONS_30.length; teamSlot += 1) {
    if (!roster[teamSlot] && draftPhaseForTeamSlot(teamSlot) === phase && groups.includes(draftGroupForTeamSlot(teamSlot))) return teamSlot;
  }
  return -1;
}

function draftEligiblePlayersForTeam(teamIndex) {
  if (!draftState) return [];
  const roster = draftState.rosters[teamIndex];
  return draftState.pool.filter((player) => !player.drafted && draftOpenSlotForPlayer(roster, player) >= 0);
}

function draftAiPreferenceValue(teamIndex) {
  const offset = teamAiOffset("preference", teamIndex);
  const value = pendingOrCurrentByte(offset);
  return Number.isInteger(value) ? value & 0x03 : 2;
}

function draftAiGroupBonus(teamIndex, group) {
  const preference = draftAiPreferenceValue(teamIndex);
  const bonuses = {
    0: { RB: 8, OL: 6, QB: 3, REC: 3, DL: 2, LB: 2, DB: 2 },
    1: { RB: 18, OL: 14, DL: 4, LB: 3, DB: 3, QB: -4, REC: -5 },
    2: { QB: 8, REC: 8, OL: 5, RB: 3, DB: 2, LB: 2, DL: 2 },
    3: { QB: 18, REC: 16, OL: 8, RB: -4, DL: 2, LB: 2, DB: 2 },
  }[preference] || {};
  return bonuses[group] || 0;
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
      rating: draftRatingFromAttributes(attrs, role.label),
      drafted: false,
    });
  }
  return players;
}

function supportedDraftLoaded() {
  return Boolean(playerTable?.format === "tsb-pointer" && playerAttributeTable?.supported);
}

function createRandomDraftSeed() {
  const bytes = new Uint32Array(2);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Math.floor(Math.random() * 0xFFFFFFFF);
    bytes[1] = Date.now() & 0xFFFFFFFF;
  }
  return `NESFB-${bytes[0].toString(36).toUpperCase()}-${bytes[1].toString(36).toUpperCase()}`;
}

function currentDraftSeed() {
  let seed = els.draftSeed.value.trim();
  if (!seed) {
    seed = createRandomDraftSeed();
    els.draftSeed.value = seed;
  }
  return seed;
}

function createDraftState(mode = "manual", seedText = currentDraftSeed()) {
  if (!playerTable || playerTable.format !== "tsb-pointer" || !playerAttributeTable?.supported) {
    els.rosterStatus.textContent = "Load a supported 28-team NES football ROM first. Re-draft uses native names, jerseys, and attributes.";
    return null;
  }
  const teamCount = playerTable.teams.length;
  const slotsPerTeam = playerTable.teams[0].slots;
  const random = createSeededRandom(seedText);
  return {
    active: true,
    started: false,
    complete: false,
    mode,
    seed: seedText,
    userTeamIndex: 0,
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
}

function draftScorePlayer(teamIndex, player) {
  const roster = draftState.rosters[teamIndex];
  const counts = draftGroupCounts(roster);
  const phase = draftCurrentPhase(roster);
  const openInGroup = roster.filter((slotPlayer, teamSlot) => (
    !slotPlayer
    && draftPhaseForTeamSlot(teamSlot) === phase
    && player.groups.includes(draftGroupForTeamSlot(teamSlot))
  )).length;
  const filledInGroup = counts[player.group]?.filled || 0;
  const scarcity = draftState.pool.filter((candidate) => !candidate.drafted && candidate.group === player.group).length;
  const needBonus = openInGroup * 12 - filledInGroup;
  const scarcityBonus = scarcity ? Math.max(0, 18 - scarcity / 2) : 0;
  const aiBonus = phase === 0 ? draftAiGroupBonus(teamIndex, player.group) : 0;
  return player.rating + needBonus + scarcityBonus + aiBonus + draftState.random() * 6;
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

function stopAutomaticDraft() {
  if (automaticDraftTimer) {
    clearInterval(automaticDraftTimer);
    automaticDraftTimer = null;
  }
}

async function redraftRostersAutomatically() {
  if (!supportedDraftLoaded()) return;
  return withWork("Re-Drafting Rosters", "Running automatic draft...", async () => {
    const seed = currentDraftSeed();
    draftUndoSnapshot = snapshotPendingRosterChanges();
    draftState = createDraftState("automatic", seed);
    if (!draftState) return;
    draftState.started = true;
    updateRosterProgress(`Re-drafting rosters with seed ${seed}...`, 0, draftState.totalPicks);
    while (!draftState.complete) {
      autoDraftOnePick(false);
      updateRosterProgress(`Re-drafting rosters with seed ${seed}... ${draftState.pickIndex} of ${draftState.totalPicks} picks complete.`, draftState.pickIndex, draftState.totalPicks);
      updateWork(`Drafted ${draftState.pickIndex} of ${draftState.totalPicks} players...`, draftState.pickIndex, draftState.totalPicks);
      if (draftState.pickIndex % 30 === 0) await new Promise((resolve) => requestAnimationFrame(resolve));
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
    finishRosterProgress(`Re-draft staged ${changed} roster slot(s) with seed ${seed}. Review the roster, then Finalize Draft.`);
    updateWork("Re-draft staged.", draftState.totalPicks, draftState.totalPicks);
    enableControls(Boolean(rom));
  }, playerTable.count);
}

function undoDraft() {
  if (!draftUndoSnapshot) return;
  restorePendingRosterChanges(draftUndoSnapshot);
  draftUndoSnapshot = null;
  draftState = null;
  stopAutomaticDraft();
  renderPlayers();
  finishRosterProgress("Draft changes reverted. Previous staged roster edits were restored.");
  enableControls(Boolean(rom));
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
  const sourceFace = readPlayerFace(sourceSlot);
  const targetFace = readPlayerFace(targetSlot);

  pendingNameEdits.set(sourceSlot, targetName);
  pendingNameEdits.set(targetSlot, sourceName);
  pendingNumberEdits.set(sourceSlot, targetNumber);
  pendingNumberEdits.set(targetSlot, sourceNumber);

  if (sourceAttributes && targetAttributes) {
    writePlayerAttributeValues(sourceSlot, targetAttributes.values);
    writePlayerAttributeValues(targetSlot, sourceAttributes.values);
  }

  if (sourceFace !== null && targetFace !== null) {
    writePlayerFace(sourceSlot, targetFace);
    writePlayerFace(targetSlot, sourceFace);
  }

  selectedPlayerSlot = targetSlot;
  const sourceRole = slotRoleForTeamSlot(sourceSlot - team.startSlot).label;
  const targetRole = slotRoleForTeamSlot(targetTeamSlot).label;
  els.rosterStatus.textContent = `Swapped ${sourceName} (${sourceRole}) with ${targetName} (${targetRole}). Apply Changes to commit the roster records.`;
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
        <p>The name can be changed now at ${hex(nameOffset)}. Attribute editing needs a confirmed attribute table before writing bytes safely.</p>
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
  const faceId = readPlayerFace(selectedPlayerSlot);
  if (!attrs) {
    els.attributeStatus.textContent = `${name || "Selected player"} (${role.label})`;
    els.attributeEditor.textContent = "This slot does not have a supported attribute entry.";
    return;
  }

  const faceOffset = faceOffsetForSlot(selectedPlayerSlot);
  els.attributeStatus.textContent = `${name || "Selected player"} (${role.label}) attributes at ${hex(attrs.base)}, face at ${hex(faceOffset)}.`;
  els.attributeEditor.innerHTML = `
    <div class="face-editor">
      ${facePreviewHtml(faceId, "large")}
      <label>
        <span>Face</span>
        <select data-face-slot="${selectedPlayerSlot}">
          ${TSB_FACE_IDS.map((id) => `
            <option value="${id}"${faceId === id ? " selected" : ""}>${byteHex(id)}</option>
          `).join("")}
        </select>
      </label>
    </div>
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
    els.playerDiff.textContent = "Open a supported NES football ROM or add a table mapping.";
    enableControls(Boolean(rom));
    return;
  }

  const team = playerTable.teams[Number(els.teamSelect.value || 0)] || playerTable.teams[0];
  els.rosterHeading.textContent = `Roster Slots: ${team.name}`;
  els.playerStatus.textContent = playerTable.format === "tsb-pointer"
    ? `${playerTable.kind}: ${playerTable.count} players, pointer table at ${hex(playerTable.pointerStart)}, name data at ${hex(playerTable.dataStart)}.`
    : `${playerTable.kind}: ${playerTable.count} names, ${playerTable.slotLength} bytes each, starting at ${hex(playerTable.start)}.`;

  const rows = [];
  for (let i = 0; i < team.slots; i += 1) {
    const slotIndex = team.startSlot + i;
    const current = readPlayerName(slotIndex);
    const pending = pendingNameEdits.get(slotIndex) ?? current;
    const role = slotRoleForTeamSlot(i);
    const faceId = readPlayerFace(slotIndex);
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
        <td>${playerTable.format === "tsb-pointer" && playerAttributeTable?.supported ? facePreviewHtml(faceId) : ""}</td>
        <td>${escapeHtml(current)}</td>
        <td><input class="player-name-input ${playerTable.format === "tsb-pointer" ? "compact-name-input" : ""}" data-player-slot="${slotIndex}" maxlength="${playerTable.format === "tsb-pointer" ? 17 : 16}" value="${escapeHtml(pending)}"></td>
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

function writeAttributeValuesToBytes(target, slotIndex, values) {
  const base = attributeOffsetForSlot(slotIndex);
  if (base === null || base + 4 >= target.length) throw new Error(`Player ${slotIndex + 1} attributes are outside the ROM.`);
  const staged = values.map((value) => Number(value) & 0x0F);
  if (staged.length > 0) target[base] = (target[base] & 0xF0) | staged[0];
  if (staged.length > 1) target[base] = (target[base] & 0x0F) | (staged[1] << 4);
  if (staged.length > 2) target[base + 1] = (target[base + 1] & 0x0F) | (staged[2] << 4);
  if (staged.length > 3) target[base + 1] = (target[base + 1] & 0xF0) | staged[3];
  if (staged.length > 4) target[base + 3] = (target[base + 3] & 0x0F) | (staged[4] << 4);
  if (staged.length > 5) target[base + 3] = (target[base + 3] & 0xF0) | staged[5];
  if (staged.length > 6) target[base + 4] = (target[base + 4] & 0x0F) | (staged[6] << 4);
  if (staged.length > 7) target[base + 4] = (target[base + 4] & 0xF0) | staged[7];
}

function writePlayerFaceToBytes(target, slotIndex, faceId) {
  const offset = faceOffsetForSlot(slotIndex);
  if (offset === null || offset >= target.length || !TSB_FACE_ID_SET.has(faceId)) throw new Error(`Player ${slotIndex + 1} face is outside the supported face table.`);
  target[offset] = faceId;
}

function writePendingPlayerAttributesToBytes(target) {
  pendingPlayerAttributes.forEach((values, slotIndex) => writeAttributeValuesToBytes(target, slotIndex, values));
  pendingPlayerFaces.forEach((faceId, slotIndex) => writePlayerFaceToBytes(target, slotIndex, faceId));
}

function pendingPlayerAttributeSets() {
  if (!playerAttributeTable?.supported) return [];
  const slots = new Set([...pendingPlayerAttributes.keys(), ...pendingPlayerFaces.keys()]);
  return Array.from(slots).sort((a, b) => a - b).map((slotIndex) => {
    const base = attributeOffsetForSlot(slotIndex);
    if (base === null || base + 4 >= rom.length) return null;
    const bytes = Array.from(rom.slice(base, base + 5));
    if (pendingPlayerAttributes.has(slotIndex)) {
      const values = pendingPlayerAttributes.get(slotIndex);
      if (values.length > 0) bytes[0] = (bytes[0] & 0xF0) | (values[0] & 0x0F);
      if (values.length > 1) bytes[0] = (bytes[0] & 0x0F) | ((values[1] & 0x0F) << 4);
      if (values.length > 2) bytes[1] = (bytes[1] & 0x0F) | ((values[2] & 0x0F) << 4);
      if (values.length > 3) bytes[1] = (bytes[1] & 0xF0) | (values[3] & 0x0F);
      if (values.length > 4) bytes[3] = (bytes[3] & 0x0F) | ((values[4] & 0x0F) << 4);
      if (values.length > 5) bytes[3] = (bytes[3] & 0xF0) | (values[5] & 0x0F);
      if (values.length > 6) bytes[4] = (bytes[4] & 0x0F) | ((values[6] & 0x0F) << 4);
      if (values.length > 7) bytes[4] = (bytes[4] & 0xF0) | (values[7] & 0x0F);
    }
    if (pendingPlayerFaces.has(slotIndex)) bytes[2] = pendingPlayerFaces.get(slotIndex);
    return { offset: base, hex: bytes.map(byteHex).join("") };
  }).filter(Boolean);
}

function hasPendingRosterChanges() {
  return Boolean(pendingNameEdits.size || pendingNumberEdits.size || pendingPlayerAttributes.size || pendingPlayerFaces.size);
}

function clearPendingRosterChanges() {
  pendingNameEdits.clear();
  pendingNumberEdits.clear();
  pendingPlayerAttributes.clear();
  pendingPlayerFaces.clear();
}

function snapshotPendingRosterChanges() {
  return {
    names: new Map(pendingNameEdits),
    numbers: new Map(pendingNumberEdits),
    attributes: new Map(Array.from(pendingPlayerAttributes.entries(), ([slot, values]) => [slot, values.slice()])),
    faces: new Map(pendingPlayerFaces),
  };
}

function restorePendingRosterChanges(snapshot) {
  if (!snapshot) return;
  pendingNameEdits = new Map(snapshot.names);
  pendingNumberEdits = new Map(snapshot.numbers);
  pendingPlayerAttributes = new Map(Array.from(snapshot.attributes.entries(), ([slot, values]) => [slot, values.slice()]));
  pendingPlayerFaces = new Map(snapshot.faces);
}

function renderPlayerDiff() {
  const sets = [...pendingNameSets(), ...pendingPlayerAttributeSets()];
  if (!sets.length) {
    els.playerDiff.textContent = "Edit a name to preview its bytes.";
    enableControls(Boolean(rom));
    return;
  }
  const formatNote = playerTable.format === "tsb-pointer"
    ? "Roster names, jersey numbers, attributes, and faces stay staged until Apply Changes or Finalize Draft. Names are compact variable-length records, so applying name changes rebuilds the roster block and updates every player pointer."
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
  const attributeSets = pendingPlayerAttributeSets();
  if (!hasPendingRosterChanges()) {
    els.rosterStatus.textContent = dirty ? "All current changes are already applied to the working ROM. Export ROM when ready." : "No changes to apply.";
    return;
  }
  try {
    const validation = new Uint8Array(rom);
    writePendingPlayerNamesToBytes(validation);
    writePendingPlayerAttributesToBytes(validation);
    let written = 0;
    if (sets.length) written += playerTable.format === "tsb-pointer" ? rebuildTsbNameBlock() : applySets(sets);
    written += attributeSets.reduce((sum, set) => sum + set.hex.length / 2, 0);
    writePendingPlayerAttributesToBytes(rom);
    if (attributeSets.length) {
      dirty = true;
      updateDirty();
    }
    clearPendingRosterChanges();
    draftUndoSnapshot = null;
    renderPlayers();
    els.rosterStatus.textContent = `Applied ${written} roster byte(s).`;
  } catch (error) {
    els.rosterStatus.textContent = `Could not apply roster changes: ${error.message}`;
  }
}

function applyPendingRosterChanges() {
  const before = hasPendingRosterChanges();
  applyPlayerNameEdits();
  return !before || !hasPendingRosterChanges();
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
    throw new Error(`The edited names need ${totalLength} bytes, but only ${playerTable.dataLimit - playerTable.dataStart} bytes are available.`);
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

function selectTecmoTeam(teamIndex) {
  const team = playerTable?.teams[Number(teamIndex || 0)];
  if (team) {
    els.teamSelect.value = String(team.index);
    selectedPlayerSlot = team.startSlot;
  }
  renderPlayers();
}

function jerseyNumberToRosterByte(number) {
  const value = Number(number);
  if (!Number.isInteger(value) || value < 0 || value > 99) return null;
  return (Math.floor(value / 10) << 4) | (value % 10);
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
  const hacks = window.ROM_HACKS || [];
  const categories = ["All", ...Array.from(new Set(hacks.map((hack) => hack.category)))];
  els.hackFilter.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
  renderHackControls();
}

function renderHackControls() {
  const hacks = window.ROM_HACKS || [];
  if (!hacks.length) {
    els.hackControls.innerHTML = "<p class=\"muted\">No hack data file loaded.</p>";
    return;
  }

  const category = els.hackFilter.value || "All";
  const filtered = category === "All" ? hacks : hacks.filter((hack) => hack.category === category);
  const warning = supportedTsbWarningHtml();
  els.hackControls.innerHTML = `${warning}${filtered.map((hack) => {
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
  }).join("")}`;
}

function renderHackDetail() {
  if (!selectedPatch) {
    els.hackDetail.innerHTML = `${supportedTsbWarningHtml()}<p>Choose a patch to inspect its offsets before applying.</p>`;
    enableControls(Boolean(rom));
    return;
  }

  els.hackDetail.innerHTML = `
    <h3>${escapeHtml(selectedPatch.title)}</h3>
    <p>${escapeHtml(selectedPatch.description || "")}</p>
    ${supportedTsbWarningHtml()}
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

function applySetsToBytes(target, sets) {
  for (const set of sets) {
    const hexBytes = normalizeHexBytes(set.hex);
    const byteCount = hexBytes.length / 2;
    if (!Number.isInteger(set.offset) || set.offset < 0 || set.offset + byteCount > target.length) {
      throw new Error(`${hex(set.offset)} writes past the end of this ROM.`);
    }
    for (let i = 0; i < byteCount; i += 1) {
      target[set.offset + i] = Number.parseInt(hexBytes.slice(i * 2, i * 2 + 2), 16);
    }
  }
}

function writePendingTeamStringsToBytes(target) {
  if (!teamStringTable || !pendingTeamEdits.size) return;
  const image = buildTeamStringTableImage(false);
  image.pointers.forEach((pointer, index) => {
    const offset = teamStringTable.start + index * 2;
    target[offset] = pointer & 0xFF;
    target[offset + 1] = (pointer >> 8) & 0xFF;
  });
  target.fill(0xFF, teamStringTable.dataStart, teamStringTable.limit);
  let offset = teamStringTable.dataStart;
  image.encodedStrings.forEach((bytes) => {
    target.set(bytes, offset);
    offset += bytes.length;
  });
}

function writePendingPlayerNamesToBytes(target) {
  if (!playerTable || (!pendingNameEdits.size && !pendingNumberEdits.size)) return;
  if (playerTable.format !== "tsb-pointer") {
    applySetsToBytes(target, pendingNameSets());
    return;
  }

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
    throw new Error(`The edited names need ${totalLength} bytes, but only ${playerTable.dataLimit - playerTable.dataStart} bytes are available.`);
  }

  target.fill(0xFF, playerTable.dataStart, playerTable.dataLimit);
  let dataOffset = playerTable.dataStart;
  records.forEach((record, slotIndex) => {
    const pointer = dataOffset - 0x10 + 0x8000;
    const pointerOffset = playerTable.pointerStart + slotIndex * 2;
    target[pointerOffset] = pointer & 0xFF;
    target[pointerOffset + 1] = (pointer >> 8) & 0xFF;
    target.set(record, dataOffset);
    dataOffset += record.length;
  });

  const endPointer = dataOffset - 0x10 + 0x8000;
  target[playerTable.endPointerOffset] = endPointer & 0xFF;
  target[playerTable.endPointerOffset + 1] = (endPointer >> 8) & 0xFF;
}

function romSnapshotWithPendingChanges() {
  if (!rom) throw new Error("Load a ROM first.");
  const snapshot = new Uint8Array(rom);
  writePendingPlayerNamesToBytes(snapshot);
  writePendingPlayerAttributesToBytes(snapshot);
  writePendingTeamStringsToBytes(snapshot);
  applySetsToBytes(snapshot, teamAiSetDiffs());
  applySetsToBytes(snapshot, colorSetDiffs());
  return snapshot;
}

function byteDiffRanges(before, after) {
  const ranges = [];
  const length = Math.min(before.length, after.length);
  let start = null;
  for (let i = 0; i < length; i += 1) {
    if (before[i] !== after[i]) {
      if (start === null) start = i;
    } else if (start !== null) {
      ranges.push({ offset: start, before: Array.from(before.slice(start, i)), after: Array.from(after.slice(start, i)) });
      start = null;
    }
  }
  if (start !== null) ranges.push({ offset: start, before: Array.from(before.slice(start, length)), after: Array.from(after.slice(start, length)) });
  return ranges;
}

function markdownBytePreview(bytes) {
  const shown = bytes.slice(0, 24).map(byteHex).join(" ");
  return bytes.length > 24 ? `${shown} ...` : shown;
}

function markdownEscape(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function playerPointerToOffsetFromBytes(bytes, pointerOffset) {
  if (pointerOffset < 0 || pointerOffset + 1 >= bytes.length) return -1;
  const pointer = bytes[pointerOffset] | (bytes[pointerOffset + 1] << 8);
  return pointer - 0x8000 + 0x10;
}

function rosterSlotsPerTeam() {
  if (Number.isInteger(playerTable?.slotsPerTeam) && playerTable.slotsPerTeam > 0) return playerTable.slotsPerTeam;
  const firstTeamSlots = playerTable?.teams?.[0]?.slots;
  if (Number.isInteger(firstTeamSlots) && firstTeamSlots > 0) return firstTeamSlots;
  if (playerTable?.teams?.length) return Math.floor(playerTable.count / playerTable.teams.length);
  return 0;
}

function playerSlotOffsetFromBytes(bytes, slotIndex) {
  if (playerTable.format === "tsb-pointer") {
    return playerPointerToOffsetFromBytes(bytes, playerTable.pointerStart + slotIndex * 2);
  }
  return playerTable.start + slotIndex * playerTable.slotLength;
}

function readPlayerNameFromBytes(bytes, slotIndex) {
  const offset = playerSlotOffsetFromBytes(bytes, slotIndex);
  if (offset < 0 || offset >= bytes.length) return "";
  if (playerTable.format === "tsb-pointer") {
    const nextOffset = playerPointerToOffsetFromBytes(bytes, playerTable.pointerStart + (slotIndex + 1) * 2);
    if (nextOffset <= offset || nextOffset > bytes.length) return "";
    const encoded = Array.from(bytes.slice(offset + 1, nextOffset), (byte) => String.fromCharCode(byte)).join("");
    const lastNameStart = encoded.search(/[A-Z]/);
    if (lastNameStart < 0) return encoded;
    return `${encoded.slice(0, lastNameStart)} ${encoded.slice(lastNameStart)}`.trim();
  }
  return romNameToDisplay(bytes.slice(offset, offset + playerTable.slotLength));
}

function readPlayerNumberFromBytes(bytes, slotIndex) {
  if (playerTable?.format !== "tsb-pointer") return null;
  const offset = playerSlotOffsetFromBytes(bytes, slotIndex);
  return offset >= 0 && offset < bytes.length ? bytes[offset] : null;
}

function teamStringOffsetFromBytes(bytes, stringIndex) {
  const pointerOffset = teamStringTable.start + stringIndex * 2;
  const pointer = bytes[pointerOffset] | (bytes[pointerOffset + 1] << 8);
  return teamStringTable.start + pointer - teamStringTable.pointerAdjustment;
}

function readTeamStringFromBytes(bytes, stringIndex) {
  const start = teamStringOffsetFromBytes(bytes, stringIndex);
  const end = teamStringOffsetFromBytes(bytes, stringIndex + 1);
  return Array.from(bytes.slice(start, end), (byte) => String.fromCharCode(byte)).join("");
}

function teamIdentityFromBytes(bytes, teamIndex) {
  return {
    abbreviation: readTeamStringFromBytes(bytes, teamIndex),
    city: readTeamStringFromBytes(bytes, teamIndex + 32),
    nickname: readTeamStringFromBytes(bytes, teamIndex + 64),
  };
}

function readPlaybookSlotFromBytes(bytes, teamIndex, slotType, slotIndex) {
  const offset = playbookByteOffset(teamIndex, slotType, slotIndex);
  if (offset === null || offset < 0 || offset >= bytes.length) return null;
  const byte = bytes[offset];
  return slotIndex % 2 === 0 ? (byte >> 4) & 0x07 : byte & 0x07;
}

function teamLabelForMarkdown(bytes, teamIndex) {
  if (teamStringTable) {
    try {
      const identity = teamIdentityFromBytes(bytes, teamIndex);
      return `${identity.city} ${identity.nickname}`.trim() || TSB_TEAM_NAMES_28[teamIndex] || `Team ${teamIndex + 1}`;
    } catch (_) {
      return TSB_TEAM_NAMES_28[teamIndex] || `Team ${teamIndex + 1}`;
    }
  }
  return TSB_TEAM_NAMES_28[teamIndex] || `Team ${teamIndex + 1}`;
}

function preferenceLabel(value) {
  return TEAM_AI_PREF_OPTIONS.find((option) => option.value === value)?.label || `Unknown (${value})`;
}

function rosterMarkdown(beforeBytes, afterBytes) {
  if (!playerTable) return [];
  const slotsPerTeam = rosterSlotsPerTeam();
  if (!slotsPerTeam) return [];
  const rows = [];
  for (let slotIndex = 0; slotIndex < playerTable.count; slotIndex += 1) {
    const beforeName = readPlayerNameFromBytes(beforeBytes, slotIndex);
    const afterName = readPlayerNameFromBytes(afterBytes, slotIndex);
    const beforeNumber = readPlayerNumberFromBytes(beforeBytes, slotIndex);
    const afterNumber = readPlayerNumberFromBytes(afterBytes, slotIndex);
    if (beforeName === afterName && beforeNumber === afterNumber) continue;
    const teamIndex = Math.floor(slotIndex / slotsPerTeam);
    const teamSlot = slotIndex % slotsPerTeam;
    const role = playerTable.positions?.[teamSlot] || TSB_POSITIONS_30[teamSlot] || `Slot ${teamSlot + 1}`;
    const team = playerTable.teams[teamIndex]?.name || teamLabelForMarkdown(afterBytes, teamIndex);
    const jersey = beforeNumber === afterNumber
      ? tsbNumberByteToJersey(afterNumber)
      : `${tsbNumberByteToJersey(beforeNumber)} -> ${tsbNumberByteToJersey(afterNumber)}`;
    rows.push(`| ${markdownEscape(team)} | ${markdownEscape(role)} | ${markdownEscape(beforeName)} -> ${markdownEscape(afterName)} | ${markdownEscape(jersey)} |`);
  }
  return rows.length ? ["## Roster Changes", "", "| Team | Slot | Name | Jersey |", "| --- | --- | --- | --- |", ...rows] : [];
}

function playerAttributesFromBytes(bytes, slotIndex) {
  const base = attributeOffsetForSlot(slotIndex);
  if (base === null || base + 4 >= bytes.length) return null;
  const labels = playerAttributeLabels(slotIndex);
  const b1 = bytes[base];
  const b2 = bytes[base + 1];
  const b3 = bytes[base + 3];
  const b4 = bytes[base + 4];
  const values = [b1 & 0x0F, (b1 >> 4) & 0x0F, (b2 >> 4) & 0x0F, b2 & 0x0F];
  if (labels.length >= 6) values.push((b3 >> 4) & 0x0F, b3 & 0x0F);
  if (labels.length >= 8) values.push((b4 >> 4) & 0x0F, b4 & 0x0F);
  return { base, labels, values, faceId: bytes[base + 2] };
}

function playerAttributeMarkdown(beforeBytes, afterBytes) {
  if (!playerAttributeTable?.supported || !playerTable) return [];
  const rows = [];
  const slotsPerTeam = rosterSlotsPerTeam();
  if (!slotsPerTeam) return [];
  for (let slotIndex = 0; slotIndex < playerTable.count; slotIndex += 1) {
    const before = playerAttributesFromBytes(beforeBytes, slotIndex);
    const after = playerAttributesFromBytes(afterBytes, slotIndex);
    if (!before || !after) continue;
    const teamIndex = Math.floor(slotIndex / slotsPerTeam);
    const teamSlot = slotIndex % slotsPerTeam;
    const team = playerTable.teams[teamIndex]?.name || teamLabelForMarkdown(afterBytes, teamIndex);
    const role = playerTable.positions?.[teamSlot] || TSB_POSITIONS_30[teamSlot] || `Slot ${teamSlot + 1}`;
    before.labels.forEach((label, index) => {
      if (before.values[index] === after.values[index]) return;
      rows.push(`| ${markdownEscape(team)} | ${markdownEscape(role)} | ${markdownEscape(label)} | ${TSB_ATTRIBUTE_VALUE_STEPS[before.values[index]] || 0} | ${TSB_ATTRIBUTE_VALUE_STEPS[after.values[index]] || 0} | ${hex(after.base)} |`);
    });
    if (before.faceId !== after.faceId) {
      rows.push(`| ${markdownEscape(team)} | ${markdownEscape(role)} | Face | ${byteHex(before.faceId)} | ${byteHex(after.faceId)} | ${hex(after.base + 2)} |`);
    }
  }
  return rows.length ? ["## Player Attribute Changes", "", "| Team | Slot | Attribute | Before | After | Offset |", "| --- | --- | --- | ---: | ---: | --- |", ...rows] : [];
}

function teamNameMarkdown(beforeBytes, afterBytes) {
  if (!teamStringTableLooksPlausible()) return [];
  const rows = [];
  for (let teamIndex = 0; teamIndex < teamStringTable.teamCount; teamIndex += 1) {
    const before = teamIdentityFromBytes(beforeBytes, teamIndex);
    const after = teamIdentityFromBytes(afterBytes, teamIndex);
    const beforeText = `${before.city} ${before.nickname} (${before.abbreviation})`;
    const afterText = `${after.city} ${after.nickname} (${after.abbreviation})`;
    if (beforeText !== afterText) rows.push(`| ${teamIndex + 1} | ${markdownEscape(beforeText)} | ${markdownEscape(afterText)} |`);
  }
  return rows.length ? ["## Team Name Changes", "", "| Team | Before | After |", "| --- | --- | --- |", ...rows] : [];
}

function teamAiMarkdown(beforeBytes, afterBytes) {
  if (!looksLikeTsbRom()) return [];
  const rows = [];
  for (let teamIndex = 0; teamIndex < TSB_TEAM_NAMES_28.length; teamIndex += 1) {
    const team = teamLabelForMarkdown(afterBytes, teamIndex);
    const preferenceOffset = teamAiOffset("preference", teamIndex);
    const beforePref = beforeBytes[preferenceOffset];
    const afterPref = afterBytes[preferenceOffset];
    if (beforePref !== afterPref) {
      rows.push(`| ${markdownEscape(team)} | CPU play calling | ${markdownEscape(preferenceLabel(beforePref))} | ${markdownEscape(preferenceLabel(afterPref))} | ${hex(preferenceOffset)} |`);
    }

    const simOffset = teamAiOffset("sim", teamIndex);
    const beforeSim = beforeBytes[simOffset];
    const afterSim = afterBytes[simOffset];
    if (beforeSim !== afterSim) {
      rows.push(`| ${markdownEscape(team)} | Simulation strength | Off ${(beforeSim >> 4) & 0x0F}, Def ${beforeSim & 0x0F} | Off ${(afterSim >> 4) & 0x0F}, Def ${afterSim & 0x0F} | ${hex(simOffset)} |`);
    }

    ["run", "pass"].forEach((slotType) => {
      for (let slotIndex = 0; slotIndex < 4; slotIndex += 1) {
        const beforePlay = readPlaybookSlotFromBytes(beforeBytes, teamIndex, slotType, slotIndex);
        const afterPlay = readPlaybookSlotFromBytes(afterBytes, teamIndex, slotType, slotIndex);
        if (beforePlay === afterPlay) continue;
        const label = `${slotType === "run" ? "Run" : "Pass"} ${slotIndex + 1}`;
        rows.push(`| ${markdownEscape(team)} | ${label} play | ${beforePlay + 1} | ${afterPlay + 1} | ${hex(playbookByteOffset(teamIndex, slotType, slotIndex))} |`);
      }
    });
  }
  return rows.length ? ["## Team AI and Playbook Changes", "", "| Team | Item | Before | After | Offset |", "| --- | --- | --- | --- | --- |", ...rows] : [];
}

function colorOffsetLabels() {
  const labels = new Map();
  TSB_TEAM_NAMES_28.forEach((team, index) => labels.set(TEAM_COLOR_BASE + index, `${team} team data screen color`));
  [
    SHARED_TEAM_COLOR_OFFSETS,
    MENU_COLOR_OFFSETS,
    typeof PRO_BOWL_COLOR_OFFSETS !== "undefined" ? PRO_BOWL_COLOR_OFFSETS : [],
  ].flat().forEach((item) => {
    if (Number.isInteger(item?.offset)) labels.set(item.offset, item.label || hex(item.offset));
  });
  return labels;
}

function colorMarkdown(beforeBytes, afterBytes) {
  const rows = [];
  const labels = colorOffsetLabels();
  const offsets = new Set([...labels.keys(), ...pendingColorEdits.keys()]);
  offsets.forEach((offset) => {
    if (offset < 0 || offset >= beforeBytes.length || beforeBytes[offset] === afterBytes[offset]) return;
    const label = labels.get(offset) || `Color byte ${hex(offset)}`;
    rows.push(`| ${markdownEscape(label)} | ${hex(offset)} | ${byteHex(beforeBytes[offset])} | ${byteHex(afterBytes[offset])} |`);
  });
  return rows.length ? ["## Color Changes", "", "| Item | Offset | Before | After |", "| --- | --- | --- | --- |", ...rows] : [];
}

function regionForOffset(offset) {
  if (playerTable) {
    const pointerEnd = playerTable.pointerStart + (playerTable.count + 1) * 2;
    if (offset >= playerTable.pointerStart && offset < pointerEnd) return "Roster pointer table";
    if (offset >= playerTable.dataStart && offset < playerTable.dataLimit) return "Roster names";
  }
  if (playerAttributeTable && offset >= playerAttributeTable.start && offset < playerAttributeTable.start + playerAttributeTable.teamStride * 28) return "Player attributes";
  if (teamStringTable) {
    if (offset >= teamStringTable.start && offset < teamStringTable.dataStart) return "Team-name pointer table";
    if (offset >= teamStringTable.dataStart && offset < teamStringTable.limit) return "Team names";
  }
  if (offset >= TEAM_AI_PREF_START && offset < TEAM_AI_PREF_START + 28) return "CPU play calling";
  if (offset >= TEAM_SIM_DATA_START && offset < TEAM_SIM_DATA_START + TEAM_SIM_DATA_STRIDE * 28) return "Simulation strength";
  if (offset >= TEAM_PLAYBOOK_START && offset < TEAM_PLAYBOOK_START + TEAM_PLAYBOOK_STRIDE * 28) return "Team playbooks";
  if (colorOffsetLabels().has(offset)) return "Known palette/color byte";
  if (meta && offset >= meta.chrOffset && offset < meta.chrOffset + meta.chrSize) return "CHR graphics";
  if (meta && offset >= meta.prgOffset && offset < meta.prgOffset + meta.prgSize) return "PRG code/data";
  if (offset < 0x10) return "NES header";
  return "Unmapped bytes";
}

function buildChangeLogMarkdown() {
  if (!rom || !originalRom) return "# NES Football ROM Change Log\n\nLoad a ROM before generating a change log.\n";
  const snapshot = romSnapshotWithPendingChanges();
  const ranges = byteDiffRanges(originalRom, snapshot);
  const changedBytes = ranges.reduce((sum, range) => sum + range.before.length, 0);
  const lines = [
    "# NES Football ROM Change Log",
    "",
    `- Source ROM: ${romName}`,
    `- Generated: ${new Date().toLocaleString()}`,
    `- Changed byte ranges: ${ranges.length}`,
    `- Changed bytes: ${changedBytes}`,
    `- Includes staged edits: ${hasPendingRosterChanges() || pendingTeamEdits.size || pendingTeamAiEdits.size || pendingColorEdits.size ? "yes" : "no"}`,
    "",
  ];

  const humanSections = [
    rosterMarkdown(originalRom, snapshot),
    playerAttributeMarkdown(originalRom, snapshot),
    teamNameMarkdown(originalRom, snapshot),
    teamAiMarkdown(originalRom, snapshot),
    colorMarkdown(originalRom, snapshot),
  ];
  const hasHumanSections = humanSections.some((section) => section.length);
  if (!hasHumanSections && ranges.length) {
    lines.push("## Human-Readable Changes", "", "No mapped roster, attribute, team, AI, playbook, or color changes were detected. See the byte audit for raw ROM edits.", "");
  }
  humanSections.forEach((section) => {
    if (section.length) lines.push(...section, "");
  });

  lines.push("## PRG / Hex Byte Audit", "");
  if (!ranges.length) {
    lines.push("No byte changes detected from the original loaded ROM.");
  } else {
    lines.push("| Offset | Region | Length | Original | Edited |", "| --- | --- | ---: | --- | --- |");
    ranges.slice(0, 400).forEach((range) => {
      lines.push(`| ${hex(range.offset)} | ${markdownEscape(regionForOffset(range.offset))} | ${range.before.length} | \`${markdownBytePreview(range.before)}\` | \`${markdownBytePreview(range.after)}\` |`);
    });
    if (ranges.length > 400) {
      lines.push("", `Only the first 400 byte ranges are listed. ${ranges.length - 400} additional range(s) were omitted.`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function generateChangeLog() {
  try {
    els.changelogOutput.value = buildChangeLogMarkdown();
    enableControls(Boolean(rom));
  } catch (error) {
    els.changelogOutput.value = `# NES Football ROM Change Log\n\nCould not generate change log: ${error.message}\n`;
    enableControls(Boolean(rom));
  }
}

function downloadChangeLog() {
  const markdown = els.changelogOutput.value || buildChangeLogMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `README_nes_football_${timestampForFilename()}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
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

function exportGameYear() {
  const value = document.querySelector('[data-year-hack="game_year"]')?.value || "";
  return /^\d{4}$/.test(value) ? value : "";
}

async function exportRom() {
  return withWork("Exporting ROM", "Committing pending changes...", async () => {
    if (pendingTeamEdits.size) {
      try {
        applyTeamStringEdits();
      } catch (error) {
        els.teamIdentityStatus.textContent = `Could not export team changes: ${error.message}`;
        return;
      }
    }
    if (pendingTeamAiEdits.size) {
      try {
        applyTeamAiEdits();
      } catch (error) {
        els.teamAiStatus.textContent = `Could not export team AI changes: ${error.message}`;
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
    if (hasPendingRosterChanges()) {
      els.rosterStatus.textContent = "Roster changes are still staged. Click Apply Changes or Finalize Draft before exporting if you want names, jerseys, attributes, or faces included.";
    }
    updateWork("Creating ROM download...", 2, 3);
    const blob = new Blob([rom], { type: "application/octet-stream" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const year = exportGameYear();
    a.download = `nes_football_${year ? `${year}_` : ""}${timestampForFilename()}.nes`;
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
  const hack = (window.ROM_HACKS || []).find((item) => item.id === button.dataset.hack);
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
    requireSupportedTsbForPatches();
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
els.generateChangelog.addEventListener("click", () => withWork("Generating README", "Comparing current ROM bytes...", async () => {
  generateChangeLog();
  updateWork("README generated.", 1, 1);
}, 1));
els.downloadChangelog.addEventListener("click", downloadChangeLog);
els.changelogOutput.addEventListener("input", () => enableControls(Boolean(rom)));
els.chrBank.addEventListener("change", () => {
  selectedChrBank = Number(els.chrBank.value);
  selectedTile = 0;
  renderChrBank();
  renderTileEditor();
});
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
els.setInput.addEventListener("input", () => {
  enableControls(Boolean(rom));
  if (els.setInput.value.trim()) previewPastedSet();
  else els.setStatus.textContent = "";
});
els.previewSet.addEventListener("click", previewPastedSet);
els.applySet.addEventListener("click", () => {
  try {
    requireSupportedTsbForPatches();
    const sets = parseSetCommands(els.setInput.value);
    const written = applySets(sets);
    els.setStatus.textContent = `Applied ${written} byte(s).`;
  } catch (error) {
    els.setStatus.textContent = error.message;
  }
});
els.teamSelect.addEventListener("change", () => selectTecmoTeam(els.teamSelect.value));
els.randomDraftSeed.addEventListener("click", () => {
  els.draftSeed.value = createRandomDraftSeed();
  els.rosterStatus.textContent = `Draft seed set to ${els.draftSeed.value}.`;
});
els.redraftRosters.addEventListener("click", redraftRostersAutomatically);
els.revertDraft.addEventListener("click", undoDraft);
els.finalizeDraft.addEventListener("click", () => withWork("Finalizing Draft", "Rebuilding roster data...", async () => {
  applyPendingRosterChanges();
  draftUndoSnapshot = null;
  updateWork("Draft finalized.", 1, 1);
  enableControls(Boolean(rom));
}, 1));
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
  fillTeamSelect();
  renderTeamDiff();
});
els.teamIdentityEditor.addEventListener("change", (event) => {
  fillIdentityTeamSelect();
  renderTeams();
});
els.teamAiEditor.addEventListener("change", (event) => {
  const teamIndex = Number(els.identityTeamSelect.value || 0);
  const preference = event.target.closest("[data-team-ai-pref]");
  if (preference) {
    stageTeamAiByte(teamAiOffset("preference", teamIndex), Number(preference.value));
    renderTeams();
    return;
  }

  const simNibble = event.target.closest("[data-team-sim-nibble]");
  if (simNibble) {
    const offset = teamAiOffset("sim", teamIndex);
    const current = pendingOrCurrentByte(offset);
    if (current === null) return;
    const value = Math.max(0, Math.min(15, Number(simNibble.value || 0))) & 0x0F;
    simNibble.value = String(value);
    const next = simNibble.dataset.teamSimNibble === "offense"
      ? ((value << 4) | (current & 0x0F))
      : ((current & 0xF0) | value);
    stageTeamAiByte(offset, next);
    renderTeams();
    return;
  }

  const playbook = event.target.closest("[data-playbook-slot]");
  if (playbook) {
    const [slotType, slotIndex] = playbook.dataset.playbookSlot.split(":");
    stagePlaybookSlot(teamIndex, slotType, Number(slotIndex), Number(playbook.value));
    renderTeams();
  }
});
els.updateTeamNames.addEventListener("click", () => withWork("Using Current Team Names", "Staging current team identities...", async () => {
  stageModernTeamNames();
  updateWork("Current team identities staged.", 28, 28);
}, 28));
els.applyTeamChanges.addEventListener("click", () => withWork("Applying Team Changes", "Writing team edits...", async () => {
  try {
    const textChanged = applyTeamStringEdits();
    const aiChanged = applyTeamAiEdits();
    els.teamIdentityStatus.textContent = `Applied ${textChanged} team text field change${textChanged === 1 ? "" : "s"} and ${aiChanged} AI byte${aiChanged === 1 ? "" : "s"} to the working ROM.`;
    updateWork("Team changes written.", 1, 1);
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
    const nextNumber = jerseyNumberToRosterByte(Math.trunc(numeric));
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
  const faceSelect = event.target.closest("[data-face-slot]");
  if (faceSelect) {
    selectedPlayerSlot = Number(faceSelect.dataset.faceSlot);
    if (writePlayerFace(selectedPlayerSlot, Number(faceSelect.value))) {
      renderPlayers();
    }
    return;
  }

  const input = event.target.closest("[data-attribute-index]");
  if (!input) return;
  const index = Number(input.dataset.attributeIndex);
  const value = Number(input.value);
  if (writePlayerAttribute(selectedPlayerSlot, index, value)) {
    renderPlayerDiff();
    renderPlayerAttributes();
  }
});
els.applyPlayerNames.addEventListener("click", () => withWork("Applying Roster Changes", "Rebuilding roster data...", async () => {
  applyPlayerNameEdits();
  updateWork("Roster changes applied.", 1, 1);
}, 1));
renderPalette();
renderHackCategories();
if (window.TECMO_BUNDLED_ROM_BASE64) {
  setLoadedRom(base64ToBytes(window.TECMO_BUNDLED_ROM_BASE64), window.TECMO_BUNDLED_ROM_NAME || "tecmo.nes");
} else {
  els.loadBundled.hidden = true;
}
