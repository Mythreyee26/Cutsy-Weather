// 🌸 weatherApi.js
// Talks to OpenWeatherMap, normalizes the response into a tidy object,
// and provides IP-based location as a fallback if geolocation is denied.
//
// 🔑 No API key is hardcoded here. The user pastes their own free key into
// the popup; the background service worker reads it from chrome.storage and
// passes it into these functions as an argument.
// Get a free key at https://home.openweathermap.org/api_keys

const CURRENT_URL  = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

// ---- Current weather ------------------------------------------------------

export async function fetchCurrentWeather(lat, lon, units = "metric", apiKey) {
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const url = `${CURRENT_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401) throw new Error("INVALID_API_KEY");
    throw new Error(`API_ERROR_${res.status}`);
  }
  const data = await res.json();
  return normalize(data, units);
}

// ---- Hourly forecast (bonus) ---------------------------------------------

export async function fetchForecast(lat, lon, units = "metric", apiKey) {
  if (!apiKey) throw new Error("MISSING_API_KEY");

  const url = `${FORECAST_URL}?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API_ERROR_${res.status}`);
  const data = await res.json();

  // OWM "5 day / 3 hour" forecast — keep the next 8 entries (~24 hrs)
  return (data.list || []).slice(0, 8).map((entry) => ({
    time: entry.dt * 1000,
    temp: Math.round(entry.main.temp),
    code: entry.weather[0].id,
    condition: entry.weather[0].main,
  }));
}

// ---- Normalization --------------------------------------------------------

function normalize(data, units) {
  return {
    city: data.name || "Somewhere cozy",
    country: data.sys?.country || "",
    temp: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed ?? 0,
    condition: data.weather[0].main,
    description: data.weather[0].description,
    code: data.weather[0].id,
    sunrise: data.sys?.sunrise ? data.sys.sunrise * 1000 : null,
    sunset:  data.sys?.sunset  ? data.sys.sunset  * 1000 : null,
    units,
    fetchedAt: Date.now(),
  };
}

// ---- IP-based location fallback ------------------------------------------
// Used when the user denies browser geolocation. ipapi.co's free endpoint
// returns approximate lat/lon based on the client's IP. No key needed.

export async function fetchIpLocation() {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("IP_LOOKUP_FAILED");
  const data = await res.json();
  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("IP_LOOKUP_FAILED");
  }
  return { lat: data.latitude, lon: data.longitude, city: data.city };
}
