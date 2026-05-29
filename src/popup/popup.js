// 🌸 popup.js
// Fetches weather and shows it inside the popup, plus handles settings.
// The popup also broadcasts setting changes to the active tab's content
// script so the floating widget updates without needing a reload.

// ---------- Cute style data (mirrors emojiMap.js) ----------

const STYLES = {
  sunny: {
    emoji: "☀️", secondaryEmoji: "🌸",
    emoticons: ["(｡•ᴗ•｡)", "(◕‿◕)", "( ˘ ³˘)♡", "✿(。◕ᴗ◕。)✿"],
    label: "Sunny",
    gradient: "linear-gradient(135deg, #FFE7A0 0%, #FFC2A0 100%)",
    darkGradient: "linear-gradient(135deg, #5C4A2A 0%, #7A4A3A 100%)",
    particles: ["✦", "♡", "🌸", "✨"],
    moods: [
      "the sun is hugging you today 🌷",
      "soft sunbeams, soft heart ✿",
      "warm and cozy outside ~",
      "perfect day for a little picnic 🍑",
    ],
  },
  rain: {
    emoji: "🌧️", secondaryEmoji: "☔",
    emoticons: ["(╥﹏╥)", "(っ´ω`c)♡", "(｡•́︿•̀｡)", "( ˘･з･)"],
    label: "Rainy",
    gradient: "linear-gradient(135deg, #A6BDF6 0%, #C9B6F5 100%)",
    darkGradient: "linear-gradient(135deg, #2E3A6E 0%, #3D2E6B 100%)",
    particles: ["💧", "☔", "♡", "✦"],
    moods: [
      "soft rain, soft thoughts ~ ☔",
      "stay inside with tea today 🍵",
      "the clouds are crying gently 💧",
      "puddle-jumping weather (´｡• ᵕ •｡`)",
    ],
  },
  cloudy: {
    emoji: "☁️", secondaryEmoji: "🐰",
    emoticons: ["(´｡• ᵕ •｡`)", "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ", "(´｡• ω •｡`)", "( ˘ω˘ )"],
    label: "Cloudy",
    gradient: "linear-gradient(135deg, #D9D9E3 0%, #FBD0E0 100%)",
    darkGradient: "linear-gradient(135deg, #3C3A4D 0%, #4A2E3D 100%)",
    particles: ["☁️", "♡", "✦", "🐰"],
    moods: [
      "soft pillowy clouds today ☁️",
      "the sky is napping (´- ω -`)",
      "everything feels gentle ~",
      "perfect day to be a soft bunny 🐰",
    ],
  },
  snow: {
    emoji: "❄️", secondaryEmoji: "🩵",
    emoticons: ["(❀´◡`❀)", "(っ˘ω˘ς )", "(´｡• ᵕ •｡`)", "ʚ(*´꒳`*)ɞ"],
    label: "Snowy",
    gradient: "linear-gradient(135deg, #E8F5FF 0%, #D0E8FF 100%)",
    darkGradient: "linear-gradient(135deg, #2E4458 0%, #3D5A7A 100%)",
    particles: ["❄", "✦", "♡", "🩵"],
    moods: [
      "tiny snowflakes drifting down ❄",
      "soft and white outside ~ 🤍",
      "perfect hot cocoa weather 🍫",
      "wrap up cozy today (っ˘ω˘ς )",
    ],
  },
  thunder: {
    emoji: "⛈️", secondaryEmoji: "⚡",
    emoticons: ["(ﾉ◕ヮ◕)ﾉ*✲ﾟ*｡", "(⊙_⊙;)", "(°ロ°) !", "(╯°□°)╯"],
    label: "Thunder",
    gradient: "linear-gradient(135deg, #7B6FAE 0%, #FFD27A 100%)",
    darkGradient: "linear-gradient(135deg, #2A2342 0%, #6B5B2E 100%)",
    particles: ["⚡", "💧", "✦", "♡"],
    moods: [
      "lil thunder is rumbling ~ ⚡",
      "stay safe and snug inside 🏠",
      "the sky is sparking today (⊙_⊙;)",
      "boom boom — be cozy ⛈️",
    ],
  },
  mist: {
    emoji: "🌫️", secondaryEmoji: "🪷",
    emoticons: ["(´｡• ω •｡`)", "(˘･_･˘)", "(￣～￣;)", "( ˘ω˘ )"],
    label: "Misty",
    gradient: "linear-gradient(135deg, #D8DCE8 0%, #E5DCEB 100%)",
    darkGradient: "linear-gradient(135deg, #3A3D48 0%, #4A3D58 100%)",
    particles: ["✦", "♡", "☁️"],
    moods: [
      "everything looks dreamy ~ 🌫️",
      "soft and hazy today 🪷",
      "the world is whispering 🤍",
      "a quiet, gentle morning ☁️",
    ],
  },
};

function categorize(code) {
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "mist";
  if (code === 800) return "sunny";
  if (code > 800 && code < 900) return "cloudy";
  return "cloudy";
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function getStyle(code) {
  const cat = categorize(code);
  const s = STYLES[cat];
  return {
    category: cat,
    emoji: s.emoji,
    secondaryEmoji: s.secondaryEmoji,
    emoticon: pick(s.emoticons),
    mood: pick(s.moods),
    label: s.label,
    gradient: s.gradient,
    darkGradient: s.darkGradient,
    particles: s.particles,
  };
}

// ---------- Settings ----------

const DEFAULTS = { theme: "light", units: "metric", sound: false };

function fromUi(group, value) {
  if (group === "sound") return value === "on";
  return value;
}
function toUi(group, value) {
  if (group === "sound") return value ? "on" : "off";
  return value;
}

async function getSettings() {
  const data = await chrome.storage.local.get("settings");
  return { ...DEFAULTS, ...(data.settings || {}) };
}

// ---------- API key (stored per-user in chrome.storage) ----------

async function getApiKey() {
  const data = await chrome.storage.local.get("apiKey");
  return data.apiKey || "";
}
async function setApiKey(key) {
  await chrome.storage.local.set({ apiKey: (key || "").trim() });
}
async function clearApiKey() {
  await chrome.storage.local.remove("apiKey");
}

function renderKeyState(hasKey) {
  document.getElementById("key-not-set").hidden = hasKey;
  document.getElementById("key-set").hidden = !hasKey;
}

async function updateSettings(partial) {
  const settings = await getSettings();
  const next = { ...settings, ...partial };
  await chrome.storage.local.set({ settings: next });
  return next;
}

// ---------- DOM helpers ----------

const $ = (id) => document.getElementById(id);

function showState(name) {
  ["loading", "ok", "error"].forEach((s) => {
    const el = $(`state-${s}`);
    if (el) el.hidden = (s !== name);
  });
}

function markActive(groupId, value) {
  document.querySelectorAll(`#${groupId} .popup-pill`).forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function bindToggle(groupId, key) {
  $(groupId).addEventListener("click", async (e) => {
    const btn = e.target.closest(".popup-pill");
    if (!btn) return;
    const uiValue = btn.dataset.value;
    const value = fromUi(key, uiValue);
    markActive(groupId, uiValue);
    if (key === "theme") document.documentElement.dataset.theme = value;
    const settings = await updateSettings({ [key]: value });
    broadcast({ type: "SETTINGS_UPDATED", settings });
    if (key === "units") loadWeather(); // refetch in new units
  });
}

// ---------- Messaging ----------

function sendMsg(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        resolve(response);
      }
    });
  });
}

async function broadcast(msg) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id != null) {
      chrome.tabs.sendMessage(tab.id, msg, () => {
        void chrome.runtime.lastError;
      });
    }
  } catch (_) {}
}

// ---------- Location ----------

function getLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log("Cutsy popup: no geolocation → IP fallback");
      ipFallback().then(resolve).catch(reject);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(
          `Cutsy popup: coords ${pos.coords.latitude.toFixed(4)}, ` +
          `${pos.coords.longitude.toFixed(4)} (accuracy ~${Math.round(pos.coords.accuracy)} m)`
        );
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        console.warn("Cutsy popup: geolocation failed", err.code, err.message);
        // Only fall back to IP for DENY / unavailable, not timeouts
        if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
          ipFallback().then(resolve).catch(reject);
        } else {
          reject(new Error("LOCATION_TIMEOUT"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

async function ipFallback() {
  const res = await sendMsg({ type: "GET_IP_LOCATION" });
  if (!res.ok) throw new Error(res.error || "IP_FAILED");
  return { lat: res.data.lat, lon: res.data.lon };
}

// ---------- Weather load + render ----------

async function loadWeather() {
  showState("loading");
  try {
    const { lat, lon } = await getLocation();
    const res = await sendMsg({ type: "GET_WEATHER", lat, lon });
    if (!res.ok) throw new Error(res.error || "FETCH_FAILED");
    render(res.data);
  } catch (err) {
    console.warn("Cutsy popup:", err);
    renderError(err.message || String(err));
  }
}

function render(w) {
  const style = getStyle(w.code);
  const settings = document.documentElement.dataset.theme;
  const dark = settings === "dark";

  // Card gradient based on weather + theme
  const card = $("weather-card");
  card.style.setProperty("--w-gradient", dark ? style.darkGradient : style.gradient);

  // Mascot in header reflects condition
  $("mascot").textContent = style.emoticon;

  $("w-city").textContent = w.city + (w.country ? `, ${w.country}` : "");
  $("w-condition").textContent =
    `${style.label} ${style.secondaryEmoji}` + (w.stale ? " · offline" : "");
  const unit = w.units === "imperial" ? "°F" : "°C";
  $("w-temp").textContent = `${w.temp}${unit}`;
  $("w-emoji").textContent = style.emoji;
  $("w-mood").textContent = style.mood;
  $("w-humidity").textContent = `${w.humidity}%`;
  const windUnits = w.units === "imperial" ? "mph" : "m/s";
  $("w-wind").textContent = `${w.windSpeed} ${windUnits}`;

  spawnParticles(style.particles);
  showState("ok");
}

function renderError(reason) {
  let emoji = "(´｡• ᵕ •｡`)";
  let msg = "the sky is quiet right now ~ ☁️";

  if (reason.includes("MISSING_API_KEY")) {
    emoji = "(⌒_⌒;)";
    msg = "please add your OpenWeatherMap key";
  } else if (reason.includes("INVALID_API_KEY")) {
    emoji = "(⌒_⌒;)";
    msg = "the key isn't awake yet — try again in a bit";
  } else if (/denied|PERMISSION|DENIED/i.test(reason)) {
    emoji = "(｡•́︿•̀｡)";
    msg = "let me see the sky 🌷 (allow location)";
  } else if (/IP_FAILED|failed to fetch/i.test(reason)) {
    emoji = "(´- ω -`)";
    msg = "couldn't reach the sky right now";
  }

  $("err-emoji").textContent = emoji;
  $("err-msg").textContent = msg;
  showState("error");
}

// ---------- Particles ----------

let particleTimer = null;
function spawnParticles(glyphs) {
  const container = document.querySelector(".weather-particles");
  if (!container) return;
  container.innerHTML = "";
  if (particleTimer) clearInterval(particleTimer);

  const make = () => {
    const span = document.createElement("span");
    span.className = "weather-particle";
    span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    span.style.left = `${Math.random() * 100}%`;
    span.style.fontSize = `${10 + Math.random() * 8}px`;
    span.style.opacity = String(0.6 + Math.random() * 0.4);
    span.style.setProperty("--drift", `${(Math.random() - 0.5) * 30}px`);
    const dur = 4 + Math.random() * 4;
    span.style.animationDuration = `${dur}s`;
    span.style.animationDelay = `${Math.random() * 1.5}s`;
    container.appendChild(span);
    setTimeout(() => span.remove(), (dur + 2) * 1000);
  };

  for (let i = 0; i < 5; i++) make();
  particleTimer = setInterval(make, 1000);
}

// ---------- Boot ----------

async function init() {
  const settings = await getSettings();

  document.documentElement.dataset.theme = settings.theme;
  markActive("theme-toggle", toUi("theme", settings.theme));

  bindToggle("theme-toggle", "theme");

  // API key UI
  const apiKey = await getApiKey();
  renderKeyState(!!apiKey);
  bindKeyEvents();

  $("refresh-btn").addEventListener("click", () => {
    broadcast({ type: "FORCE_REFRESH" });
    loadWeather();
  });
  $("reset-pos-btn").addEventListener("click", async () => {
    await updateSettings({ position: null });
    broadcast({ type: "RESET_POSITION" });
  });
  $("retry-btn").addEventListener("click", loadWeather);

  if (apiKey) {
    loadWeather();
  } else {
    renderError("MISSING_API_KEY");
  }
}

function bindKeyEvents() {
  $("key-save").addEventListener("click", async () => {
    const value = $("key-input").value.trim();
    if (!value) return;
    await setApiKey(value);
    renderKeyState(true);
    $("key-input").value = "";
    broadcast({ type: "API_KEY_UPDATED" });
    loadWeather();
  });

  // Allow pressing Enter inside the input to save
  $("key-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("key-save").click();
  });

  $("key-change").addEventListener("click", async () => {
    await clearApiKey();
    renderKeyState(false);
    renderError("MISSING_API_KEY");
    broadcast({ type: "API_KEY_UPDATED" });
  });
}

init();
