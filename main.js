const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const mm = require("music-metadata");

const baseDir = __dirname;
const musicDir = path.join(baseDir, "music");
const jinglesDir = path.join(baseDir, "jingles");
const profilesDir = path.join(baseDir, "profiles");
const configFile = path.join(baseDir, "config.json");

const userDataDir = app.getPath("userData");
const settingsFile = path.join(userDataDir, "settings.json");

let mainWindow;

// ---------- helpers ----------
function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
}
function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), "utf8");
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
function listMp3(dir) {
  try { return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".mp3")); }
  catch { return []; }
}

// ---------- profiles ----------
function profilePath(name) {
  return path.join(profilesDir, `${name}.json`);
}
function ensureProfile(name) {
  ensureDir(profilesDir);
  const p = profilePath(name);
  if (!fs.existsSync(p)) {
    writeJSON(p, { musicOrder: [], jingleOrder: [], musicTags: {} });
  }
  return p;
}
function getCurrentProfile() {
  const s = readJSON(settingsFile, { currentProfile: "default" });
  ensureProfile(s.currentProfile);
  return s.currentProfile;
}
function setCurrentProfile(name) {
  ensureProfile(name);
  ensureDir(userDataDir);
  writeJSON(settingsFile, { currentProfile: name });
}

// ---------- metadata ----------
const metaCache = new Map();
async function getMeta(filePath, fallback) {
  if (metaCache.has(filePath)) return metaCache.get(filePath);
  let title = fallback, artist = "";
  try {
    const m = await mm.parseFile(filePath);
    title = m.common.title || fallback;
    artist = m.common.artist || "";
  } catch {}
  const r = { title, artist };
  metaCache.set(filePath, r);
  return r;
}

// ---------- lists ----------
async function buildMusicList(profile) {
  const prof = readJSON(profilePath(profile), {});
  const files = prof.musicOrder.length
    ? prof.musicOrder
    : listMp3(musicDir).sort();

  if (!prof.musicOrder.length) {
    prof.musicOrder = files;
    writeJSON(profilePath(profile), prof);
  }

  const out = [];
  for (const f of files) {
    const meta = await getMeta(path.join(musicDir, f), f);
    out.push({ file: f, ...meta });
  }
  return out;
}

// ---------- Electron ----------
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });
  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

// ---------- IPC ----------
ipcMain.handle("profiles:list", () =>
  fs.readdirSync(profilesDir).map(f => f.replace(".json", ""))
);
ipcMain.handle("profiles:getCurrent", getCurrentProfile);
ipcMain.handle("profiles:setCurrent", (_, n) => setCurrentProfile(n));
ipcMain.handle("get-music", async () => buildMusicList(getCurrentProfile()));

ipcMain.handle("get-music-tags", () => {
  const p = readJSON(profilePath(getCurrentProfile()), {});
  return p.musicTags || {};
});

ipcMain.handle("set-music-tags", (_, file, tags) => {
  const prof = readJSON(profilePath(getCurrentProfile()), {});
  prof.musicTags = prof.musicTags || {};
  prof.musicTags[file] = tags;
  writeJSON(profilePath(getCurrentProfile()), prof);
});

// ---------- HTTP API ----------
function send(cmd, params = {}) {
  if (mainWindow) mainWindow.webContents.send("remote", { cmd, params });
}

function startHttp() {
  const port = readJSON(configFile, { httpPort: 3131 }).httpPort;
  http.createServer((req, res) => {
    const u = new URL(req.url, "http://localhost");
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (u.pathname === "/play") send("play");
    if (u.pathname === "/pause") send("pause");
    if (u.pathname === "/stop") send("stop");
    if (u.pathname === "/next") send("next");
    if (u.pathname === "/panic") send("panic");
    if (u.pathname === "/volume")
      send("volume", { level: Number(u.searchParams.get("level")) });
    if (u.pathname === "/jingle")
      send("jingle", { file: u.searchParams.get("file") });

    res.end(JSON.stringify({ ok: true }));
  }).listen(port, "127.0.0.1");
}

app.whenReady().then(() => {
  ensureDir(profilesDir);
  ensureProfile("default");
  createWindow();
  startHttp();
});
