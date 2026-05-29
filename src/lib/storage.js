// 🌸 storage.js
// A tiny, friendly wrapper around chrome.storage.local with sensible defaults.
// Keeps every piece of code that touches storage in one place.

const DEFAULT_SETTINGS = {
  theme: "light",       // "light" or "dark"
  units: "metric",      // "metric" (°C) or "imperial" (°F)
  sound: false,         // gentle chimes off by default
  position: null,       // { x, y } — null means top-right default
  collapsed: false,     // is widget minimized to a bubble?
};

// ---- Settings -------------------------------------------------------------

export async function getSettings() {
  const data = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

export async function setSettings(partial) {
  const current = await getSettings();
  const next = { ...current, ...partial };
  await chrome.storage.local.set({ settings: next });
  return next;
}

// ---- API key --------------------------------------------------------------
// The user pastes their own free OpenWeatherMap key into the popup.
// We store it locally so it stays on their machine — never committed to git.

export async function getApiKey() {
  const data = await chrome.storage.local.get("apiKey");
  return data.apiKey || "";
}

export async function setApiKey(key) {
  await chrome.storage.local.set({ apiKey: (key || "").trim() });
}

export async function clearApiKey() {
  await chrome.storage.local.remove("apiKey");
}

// ---- Weather cache --------------------------------------------------------
// Cached weather is keyed by rounded lat/lon (so small movements still hit
// the cache) and considered fresh for CACHE_TTL_MS.

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function cacheKey(lat, lon) {
  return `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export async function getCachedWeather(lat, lon) {
  const key = cacheKey(lat, lon);
  const data = await chrome.storage.local.get(key);
  const entry = data[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.weather;
}

export async function setCachedWeather(lat, lon, weather) {
  const key = cacheKey(lat, lon);
  await chrome.storage.local.set({
    [key]: { weather, timestamp: Date.now() },
  });
}

// Sometimes we just want the most-recent cached weather no matter where the
// user is — useful for the offline / no-location fallback.
export async function getLastKnownWeather() {
  const all = await chrome.storage.local.get(null);
  let best = null;
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith("weather_")) continue;
    if (!best || v.timestamp > best.timestamp) best = v;
  }
  return best ? best.weather : null;
}
