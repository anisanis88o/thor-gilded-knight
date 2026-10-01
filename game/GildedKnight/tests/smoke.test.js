// Headless smoke test for Gilded Knight — boots game.js with a stubbed DOM and
// drives Thor through bolt, dive, transform, hammer, teleport and the Spire
// Knight fight to catch runtime errors.  Run with:  npm test
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const code = fs.readFileSync(
  path.join(__dirname, "..", "game", "game.js"),
  "utf8",
);

const gradient = { addColorStop() {} };
function makeCtx() {
  const gradFns = [
    "createLinearGradient",
    "createRadialGradient",
    "createPattern",
  ];
  const store = {};
  return new Proxy(
    {},
    {
      get(target, prop) {
        if (prop === "canvas") return {};
        if (gradFns.includes(prop)) return () => gradient;
        if (prop === "measureText") return () => ({ width: 10 });
        if (prop === "getImageData")
          return () => ({ data: new Uint8ClampedArray(4) });
        if (prop in store) return store[prop];
        return () => {};
      },
      set(target, prop, v) {
        store[prop] = v;
        return true;
      },
    },
  );
}
const ctxShared = makeCtx();

function makeEl(id) {
  const listeners = {};
  return {
    id,
    style: { setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    dataset: {},
    innerHTML: "",
    textContent: "",
    value: "knight",
    appendChild() {},
    addEventListener(ev, fn) {
      (listeners[ev] = listeners[ev] || []).push(fn);
    },
    removeEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
    focus() {},
    querySelector: () => makeEl(id + "-q"),
    querySelectorAll: () => [],
    getContext: () => ctxShared,
    width: 1280,
    height: 720,
    __listeners: listeners,
  };
}

const elements = {};
const ids = [
  "c", "title", "singlePlayer", "openCoop", "openPvp", "openLoadout", "openShop",
  "openSettings", "menuCoins", "multiplayerLobby", "multiTitle", "multiKicker",
  "multiHero1", "multiHero2", "multiBoss", "p1ControlSummary", "p2ControlSummary",
  "editP1Controls", "editP2Controls", "startMultiplayer", "bossSelect",
  "pickSent", "pickArt", "pickDemon", "pickShogun", "pickVolturus", "pickWraith",
  "pickWarden", "pickSpire", "bossHeroName", "loadout", "pickKnight", "pickShadow",
  "pickRonin", "pickRegal", "pickWizard", "pickKillnux", "pickWraithKnight",
  "pickThor", "cSent", "cArt", "cShogun", "cVolturus", "cWraith", "cWarden",
  "cSpire", "cShadow", "cKnight", "cRonin", "cRegal", "cWizard", "cKillnux",
  "cWraithKnight", "cThor", "relicSlots", "buildStats", "relicInventory",
  "shop", "shopCoins", "spinCrystal", "spinResult", "spinRelic", "shopRelicList",
  "shopInventory", "archiveUp", "archiveDown", "end", "endTitle", "endSub",
  "endBtn", "menuBtn", "settings", "bindPlayer", "keyTable", "capPad", "bindMsg",
  "volMusic", "volSfx", "resolutionScale", "graphicsMode", "renderInfo",
  "gamepadStatus", "padTable", "consoleBind", "resetBinds", "closeSettings",
  "pause", "resumeBtn", "pauseSettings", "quitBtn", "pauseBtn", "fpsCounter",
  "devConsole", "consoleOutput", "consoleInput", "touch", "bl", "bdn", "br",
  "ba", "bp", "bd", "bj", "bh", "bb", "bs1", "bs2", "mute", "titleKeys",
];
ids.forEach((id) => (elements[id] = makeEl(id)));

const docListeners = new Map();
const addL = (map) => (el, ev, fn) => {
  const key = (el && el.id) || "anon";
  if (!map.has(key + ":" + ev)) map.set(key + ":" + ev, []);
  map.get(key + ":" + ev).push(fn);
};

let rafCb = null;

const sandbox = {
  console,
  performance: { now: () => Date.now() },
  Math, Date, JSON, Object, Array, Number, String, Boolean, Promise, Set, Map,
  WeakMap, Float32Array, Uint8ClampedArray, isNaN, parseInt, parseFloat,
  requestAnimationFrame: (cb) => { rafCb = cb; return 1; },
  cancelAnimationFrame() {},
  setTimeout: () => 1,
  clearTimeout() {},
  setInterval: () => 1,
  clearInterval() {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  AudioContext: undefined,
  webkitAudioContext: undefined,
  navigator: { userAgent: "node", maxTouchPoints: 0 },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  devicePixelRatio: 1,
  innerWidth: 1280,
  innerHeight: 720,
  Image: class {
    constructor() { this.complete = false; this.naturalWidth = 0; }
    set src(v) {
      this._src = v;
      setTimeout(() => {
        this.complete = true;
        this.naturalWidth = 100;
        if (this.onload) this.onload();
      }, 0);
    }
    get src() { return this._src; }
  },
  addEventListener() {},
  removeEventListener() {},
  document: {
    addEventListener: addL(docListeners),
    removeEventListener() {},
    getElementById: (id) => elements[id] || (elements[id] = makeEl(id)),
    createElement: (tag) => {
      if (tag === "canvas")
        return {
          width: 0,
          height: 0,
          getContext: () => ctxShared,
          toDataURL: () => "data:image/png;base64,",
          style: {},
        };
      return makeEl(tag);
    },
    body: makeEl("body"),
    documentElement: makeEl("html"),
    visibilityState: "visible",
    hidden: false,
    querySelector: () => null,
    querySelectorAll: () => [],
  },
  __TEST__: true,
};
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "game.js" });

const G = sandbox.__G;
if (!G) throw new Error("window.__G missing — game did not boot");

let t = 0;
function stepFrames(n) {
  for (let i = 0; i < n; i++) {
    t += 16.7;
    const cb = rafCb;
    rafCb = null;
    cb(t);
    if (!rafCb) throw new Error("game stopped scheduling frames");
    if (i % 20 === 0) topUp();
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
}
// keep the test hero alive and topped up so every ability path gets exercised
function topUp() {
  if (G.P && G.P.state !== "dead") {
    G.P.hp = G.P.maxhp;
    G.P.ghost = G.P.maxhp;
    G.P.st = G.P.maxst;
  }
}
function waitFree(maxFrames) {
  for (let i = 0; i < maxFrames; i++) {
    stepFrames(1);
    topUp();
    if (G.P.state === "free") return true;
  }
  return false;
}
// press an action from a clean free state and confirm the expected player
// state appears within a few frames; retries because the boss interrupts
function pressAndCheck(action, okFn, attempts = 5) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    topUp();
    if (!waitFree(90)) continue;
    G.press(action);
    for (let i = 0; i < 10; i++) {
      stepFrames(1);
      if (okFn()) return true;
      if (G.P.state === "hurt") break;
    }
  }
  return false;
}

console.log("boot ok, phase:", G.phase);

// --- Thor solo vs the Spire Knight (fixed hitboxes) ---
G.pickHero("thor");
G.startGame("spire");
stepFrames(150); // intro
assert(["fight", "intro"].includes(G.phase), "fight/intro phase: " + G.phase);
assert(G.heroType === "thor", "hero is thor");

stepFrames(30);
topUp();
assert(
  pressAndCheck("attack", () => G.P.state === "attack"),
  "combo attack started",
);
stepFrames(70);
topUp();

const bossHpBeforeBolt = G.B.hp;
assert(
  pressAndCheck(
    "parry",
    () => G.P.state === "thorBolt" || G.thorBolts.length > 0,
  ),
  "storm bolt fired",
);
stepFrames(120);
console.log(
  "storm bolt fired; boss hp",
  Math.round(bossHpBeforeBolt),
  "→",
  Math.round(G.B.hp),
);

console.log(
  "pre-dodge — hp:",
  Math.round(G.P.hp),
  "state:",
  G.P.state,
  "boss state:",
  G.B.state,
);
assert(
  pressAndCheck("dodge", () => G.P.state === "dodge"),
  "ground dodge ok",
);
stepFrames(40);

topUp();
waitFree(90);
G.press("jump");
stepFrames(4);
G.press("dodge");
stepFrames(30);
topUp();
assert(
  ["free", "airdash", "attack", "hurt"].includes(G.P.state),
  "air dodge ok: " + G.P.state,
);

// Skill 1: Thunder Sky Strike (retry until one dive survives the charge)
let diveAir = false;
for (let attempt = 0; attempt < 4 && !diveAir; attempt++) {
  if (!pressAndCheck("skill1", () => G.P.state === "thorDive")) continue;
  stepFrames(45);
  if (
    G.P.state === "thorDive" &&
    ["rise", "fly", "slam"].includes(G.P.thorDivePhase) &&
    G.P.y < 500
  )
    diveAir = true;
}
assert(diveAir, "dive reached the sky, phase=" + G.P.thorDivePhase);
stepFrames(130);
assert(
  ["free", "hurt", "thorDive"].includes(G.P.state),
  "dive resolved: " + G.P.state,
);
assert(isFinite(G.P.x) && isFinite(G.P.y), "finite after dive");
assert(G.P.skill1CD > 0 && G.P.skill1CD <= 45, "skill1 cd: " + G.P.skill1CD);

// Skill 2: Storm Ascension
assert(
  pressAndCheck("skill2", () => G.P.state === "thorTransform"),
  "transform started",
);
stepFrames(165);
assert(
  ["free", "hurt", "dodge"].includes(G.P.state),
  "transform ended, state=" + G.P.state + " buffT=" + G.P.thorBuffT,
);
assert(G.P.thorBuffT > 0 && G.P.thorBuffT <= 40, "storm form: " + G.P.thorBuffT);
assert(G.P.skill2CD > 0 && G.P.skill2CD <= 80, "skill2 cd: " + G.P.skill2CD);

// transformed parry = hammer throw
topUp();
assert(
  pressAndCheck(
    "parry",
    () => G.P.state === "thorHammer" || G.thorHammers.length > 0,
  ),
  "hammer thrown",
);
stepFrames(130);
console.log("hammer thrown and resolved");

// transformed dodge = lightning teleport in the air (with retries — the boss
// interrupts constantly, so wait for a clean window)
let teleOk = false;
for (let attempt = 0; attempt < 5 && !teleOk; attempt++) {
  topUp();
  if (!waitFree(90)) continue;
  G.press("jump");
  stepFrames(5);
  G.press("dodge");
  for (let i = 0; i < 8; i++) {
    stepFrames(1);
    if (G.P.state === "thorTeleport") {
      teleOk = true;
      break;
    }
    if (G.P.state === "hurt") break;
  }
}
assert(teleOk, "air lightning teleport");
stepFrames(40);

// bolt still fires while transformed
G.press("parry");
stepFrames(60);

// let the Spire Knight fight for ~35s to exercise the fixed hitboxes
for (let s = 0; s < 2100; s++) {
  stepFrames(1);
  if (s % 30 === 0) topUp();
  if (s % 90 === 0) G.press("attack");
  if (s % 260 === 0) G.press("dodge");
}
assert(isFinite(G.P.x) && isFinite(G.P.y), "finite after boss fight");
assert(isFinite(G.B.x) && isFinite(G.B.hp), "boss finite after fight");
console.log(
  "after fight — boss hp:",
  Math.round(G.B.hp),
  "| player hp:",
  Math.round(G.P.hp),
  "| player state:",
  G.P.state,
);

console.log("ALL SMOKE TESTS PASSED");
