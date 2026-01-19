const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  listProfiles: () => ipcRenderer.invoke("profiles:list"),
  getCurrentProfile: () => ipcRenderer.invoke("profiles:getCurrent"),
  setCurrentProfile: (n) => ipcRenderer.invoke("profiles:setCurrent", n),

  getMusic: () => ipcRenderer.invoke("get-music"),

  getMusicTags: () => ipcRenderer.invoke("get-music-tags"),
  setMusicTags: (file, tags) => ipcRenderer.invoke("set-music-tags", file, tags),

  onRemote: (cb) =>
    ipcRenderer.on("remote", (_, d) => cb(d))
});
