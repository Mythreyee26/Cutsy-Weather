// 🌸 background.js — service worker (Manifest V3)
// Reads the user's stored API key, calls OpenWeatherMap, caches results.
// The key is NEVER hardcoded — each user pastes their own.

import {
  fetchCurrentWeather,
  fetchForecast,
  fetchIpLocation,
} from "../lib/weatherApi.js";

import {
  getCachedWeather,
  setCachedWeather,
  getLastKnownWeather,
  getSettings,
  getApiKey,
} from "../lib/storage.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handle(msg)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err) => sendResponse({ ok: false, error: err.message || String(err) }));
  return true; // keep channel open for async sendResponse
});

async function handle(msg) {
  switch (msg?.type) {
    case "GET_WEATHER":
      return getWeather(msg.lat, msg.lon);

    case "GET_FORECAST":
      return getForecastSafe(msg.lat, msg.lon);

    case "GET_IP_LOCATION":
      return fetchIpLocation();

    case "GET_LAST_KNOWN":
      return getLastKnownWeather();

    default:
      throw new Error(`UNKNOWN_MESSAGE_TYPE_${msg?.type}`);
  }
}

async function getWeather(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    throw new Error("BAD_COORDS");
  }

  const cached = await getCachedWeather(lat, lon);
  if (cached) return { ...cached, fromCache: true };

  const { units } = await getSettings();
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");

  try {
    const weather = await fetchCurrentWeather(lat, lon, units, apiKey);
    await setCachedWeather(lat, lon, weather);
    return { ...weather, fromCache: false };
  } catch (err) {
    // If network/API fails, return the last cached weather we have.
    const last = await getLastKnownWeather();
    if (last) return { ...last, fromCache: true, stale: true };
    throw err;
  }
}

async function getForecastSafe(lat, lon) {
  const { units } = await getSettings();
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error("MISSING_API_KEY");
  return fetchForecast(lat, lon, units, apiKey);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("🌸 Cutsy Weather installed — stay cozy ~");
});
