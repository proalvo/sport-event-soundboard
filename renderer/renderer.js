let playlist = [];
let musicTags = {};
let currentTrack = null;
let editMode = false;

const playlistDiv = document.getElementById("playlist");

// ---------- tags UI ----------
function renderTags(tags) {
  const c = document.createElement("div");
  c.className = "tags";
  tags.forEach(t => {
    const s = document.createElement("span");
    s.className = "tag";
    s.textContent = t;
    c.appendChild(s);
  });
  return c;
}

function openTagEditor(file) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const input = document.createElement("input");
  input.placeholder = "Comma separated tags";
  input.value = (musicTags[file] || []).join(", ");

  const save = document.createElement("button");
  save.textContent = "Save";
  save.onclick = async () => {
    const tags = input.value.split(",").map(t => t.trim()).filter(Boolean);
    await window.api.setMusicTags(file, tags);
    musicTags[file] = tags;
    modal.remove();
    reload();
  };

  modal.append(input, save);
  document.body.appendChild(modal);
}

// ---------- render ----------
async function reload() {
  playlist = await window.api.getMusic();
  musicTags = await window.api.getMusicTags();

  playlistDiv.innerHTML = "";
  playlist.forEach(t => {
    const row = document.createElement("div");
    row.className = "song";
    row.textContent = `${t.artist ? t.artist + " – " : ""}${t.title}`;

    if (musicTags[t.file]) {
      row.appendChild(renderTags(musicTags[t.file]));
    }

    if (editMode) {
      const btn = document.createElement("button");
      btn.textContent = "🏷";
      btn.onclick = () => openTagEditor(t.file);
      row.appendChild(btn);
    }

    row.onclick = () => playMusic(t);
    playlistDiv.appendChild(row);
  });
}

// ---------- playback ----------
function playMusic(track) {
  currentTrack = track;
  console.log("PLAY", track.file);
}

// ---------- remote ----------
window.api.onRemote(({ cmd, params }) => {
  if (cmd === "play") playMusic(currentTrack || playlist[0]);
  if (cmd === "pause") console.log("PAUSE");
  if (cmd === "stop") console.log("STOP");
  if (cmd === "next") console.log("NEXT");
  if (cmd === "panic") console.log("PANIC");
  if (cmd === "volume") console.log("VOLUME", params.level);
  if (cmd === "jingle") console.log("JINGLE", params.file);
});

reload();
