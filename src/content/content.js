// 🌸 content.js — the heart of Cutsy Weather
// Injects the floating glass widget into every webpage, talks to the
// service worker for weather data, and handles all UI interactions.
//
// Why classic-script style (no import statements)?
// Content scripts in MV3 don't support ES module imports directly without
// dynamic import gymnastics. To keep things beginner-friendly we inline the
// little bit of styling data we need.

(() => {
  // Don't run twice if the script is somehow injected more than once
  if (window.__cutsyWeatherLoaded) return;
  window.__cutsyWeatherLoaded = true;

  // 🐛 Debug log — confirms the content script reached this page.
  // Open DevTools (F12) on the page and look for "🌸 Cutsy Weather: hello"
  console.log("🌸 Cutsy Weather: hello — content script loaded on", location.href);

  // ---------------------------------------------------------------------
  // 1. CUTE STYLE DATA — mirrors src/lib/emojiMap.js
  // ---------------------------------------------------------------------

  const STYLES = {
    sunny: {
      emoji: "☀️", secondaryEmoji: "🌸",
      emoticons: ["(｡•ᴗ•｡)", "(◕‿◕)", "( ˘ ³˘)♡", "✿(。◕ᴗ◕。)✿"],
      label: "Sunny",
      gradient: "linear-gradient(135deg, #FFE7A0 0%, #FFC2A0 100%)",
      darkGradient: "linear-gradient(135deg, #5C4A2A 0%, #7A4A3A 100%)",
      accent: "#FF8E66",
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
      accent: "#7B8FE0",
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
      emoticons: ["(´｡• ᵕ •｡`)", "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ", "(´｡• ω •｡`)", "~(￣▽￣)~*"],
      label: "Cloudy",
      gradient: "linear-gradient(135deg, #D9D9E3 0%, #FBD0E0 100%)",
      darkGradient: "linear-gradient(135deg, #3C3A4D 0%, #4A2E3D 100%)",
      accent: "#C68DA6",
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
      accent: "#8AB3DC",
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
      accent: "#FFD27A",
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
      accent: "#A6A0B8",
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

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

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
      accent: s.accent,
      particles: s.particles,
    };
  }

  function isDaytime(now, sunrise, sunset) {
    if (sunrise && sunset && now) return now >= sunrise && now < sunset;
    const h = new Date().getHours();
    return h >= 6 && h < 19;
  }

  // ---------------------------------------------------------------------
  // 2. STATE
  // ---------------------------------------------------------------------

  let settings = {
    theme: "light",
    units: "metric",
    sound: false,
    position: null,
    collapsed: false,
  };
  let lastWeather = null;
  let lastCoords = null;
  let particleTimer = null;

  // ---------------------------------------------------------------------
  // 3. BUILD THE WIDGET DOM
  // ---------------------------------------------------------------------

  const root = document.createElement("div");
  root.id = "cutsy-weather-root";

  // Some sites (Google Account, banking, etc.) enforce Trusted Types via CSP
  // and reject any plain string assigned to innerHTML. We try a Trusted Types
  // policy first; if that's not allowed either, we bail out gracefully so the
  // host page is never broken.
  const widgetHTML = `
    <div id="cutsy-weather-widget" class="cutsy-state-loading" role="region" aria-label="Cutsy Weather widget">
      <div class="cutsy-particles" aria-hidden="true"></div>

      <div class="cutsy-header" data-drag-handle>
        <span class="cutsy-mascot" aria-hidden="true">(｡•ᴗ•｡)</span>
        <div class="cutsy-header-text">
          <div class="cutsy-city">~ loading ~</div>
          <div class="cutsy-condition">finding the sky 🌷</div>
        </div>
        <div class="cutsy-buttons">
          <button class="cutsy-btn" data-action="refresh" title="Refresh">🔄</button>
          <button class="cutsy-btn" data-action="forecast" title="Hourly forecast">⏰</button>
          <button class="cutsy-btn" data-action="collapse" title="Minimize">✖</button>
        </div>
      </div>

      <div class="cutsy-body">
        <div class="cutsy-main">
          <div class="cutsy-temp">--°</div>
          <div class="cutsy-emoji">☁️</div>
        </div>
        <div class="cutsy-mood">~ welcome ~</div>
        <div class="cutsy-meta">
          <div class="cutsy-meta-item"><span class="cutsy-meta-icon">💧</span><span class="cutsy-meta-val cutsy-humidity">--%</span></div>
          <div class="cutsy-meta-item"><span class="cutsy-meta-icon">🍃</span><span class="cutsy-meta-val cutsy-wind">--</span></div>
        </div>
      </div>

      <div class="cutsy-forecast" hidden>
        <div class="cutsy-forecast-title">~ next few hours ~</div>
        <div class="cutsy-forecast-row"></div>
      </div>

      <div class="cutsy-fallback" hidden>
        <div class="cutsy-fallback-emoji">(´｡• ᵕ •｡`)</div>
        <div class="cutsy-fallback-msg">let me see the sky 🌷</div>
        <button class="cutsy-retry-btn">try again</button>
      </div>

      <div class="cutsy-sun-moon" aria-hidden="true">☀️</div>
    </div>

    <button id="cutsy-bubble" hidden title="Open Cutsy Weather">🌸</button>
  `;

  try {
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      const policy = window.trustedTypes.createPolicy("cutsy-weather", {
        createHTML: (s) => s,
      });
      root.innerHTML = policy.createHTML(widgetHTML);
    } else {
      root.innerHTML = widgetHTML;
    }
  } catch (err) {
    console.warn(
      "🌸 Cutsy Weather: this page blocks widget injection (strict CSP) — skipping.",
      err.message
    );
    return; // bail quietly; the host page is untouched
  }

  // ---------------------------------------------------------------------
  // 4. INIT — wait for body, then attach
  // ---------------------------------------------------------------------

  function attach() {
    if (!document.body) {
      requestAnimationFrame(attach);
      return;
    }
    document.body.appendChild(root);
    boot();
  }
  attach();

  async function boot() {
    settings = await loadSettings();
    applyTheme(settings.theme);
    applyPosition(settings.position);
    if (settings.collapsed) collapse(true);

    bindEvents();
    requestWeather();
  }

  // ---------------------------------------------------------------------
  // 5. SETTINGS
  // ---------------------------------------------------------------------

  function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get("settings", (data) => {
        resolve({
          theme: "light", units: "metric", sound: false,
          position: null, collapsed: false,
          ...(data.settings || {}),
        });
      });
    });
  }

  function saveSettings(partial) {
    settings = { ...settings, ...partial };
    chrome.storage.local.set({ settings });
  }

  // ---------------------------------------------------------------------
  // 6. LOCATION + WEATHER
  // ---------------------------------------------------------------------

  function requestWeather() {
    setState("loading");
    console.log("🌸 Cutsy Weather: requesting location...");
    getLocation()
      .then(({ lat, lon }) => {
        console.log("🌸 Cutsy Weather: got location", lat, lon);
        lastCoords = { lat, lon };
        return sendMsg({ type: "GET_WEATHER", lat, lon });
      })
      .then((res) => {
        console.log("🌸 Cutsy Weather: weather response", res);
        if (!res.ok) throw new Error(res.error);
        lastWeather = res.data;
        render(res.data);
      })
      .catch((err) => {
        console.warn("🌸 Cutsy Weather error:", err.message || err);
        showFallback(err.message || "");
      });
  }

  function getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log("🌸 Cutsy: no geolocation → IP fallback");
        ipFallback().then(resolve).catch(reject);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log(
            `🌸 Cutsy: GPS-ish coords ${pos.coords.latitude.toFixed(4)}, ` +
            `${pos.coords.longitude.toFixed(4)} (accuracy ~${Math.round(pos.coords.accuracy)} m)`
          );
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          // Only fall back to IP if the user DENIED or device has no provider.
          // For timeouts, IP is so inaccurate we'd rather show an error.
          console.warn("🌸 Cutsy: geolocation failed", err.code, err.message);
          if (err.code === err.PERMISSION_DENIED || err.code === err.POSITION_UNAVAILABLE) {
            ipFallback().then(resolve).catch(reject);
          } else {
            reject(new Error("LOCATION_TIMEOUT"));
          }
        },
        {
          enableHighAccuracy: true,   // ask for GPS if available
          timeout: 15000,             // give GPS time to acquire (was 8s)
          maximumAge: 0,              // never reuse stale positions
        }
      );
    });
  }

  async function ipFallback() {
    const res = await sendMsg({ type: "GET_IP_LOCATION" });
    if (!res.ok) throw new Error(res.error || "IP_FAILED");
    return { lat: res.data.lat, lon: res.data.lon };
  }

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

  // ---------------------------------------------------------------------
  // 7. RENDER
  // ---------------------------------------------------------------------

  function render(w) {
    setState("ok");
    const widget = q("#cutsy-weather-widget");
    const style = getStyle(w.code);

    // Gradient by weather + theme
    widget.style.setProperty(
      "--cutsy-gradient",
      settings.theme === "dark" ? style.darkGradient : style.gradient
    );
    widget.style.setProperty("--cutsy-accent", style.accent);

    // Header content
    q(".cutsy-mascot").textContent = style.emoticon;
    q(".cutsy-city").textContent = w.city + (w.country ? `, ${w.country}` : "");
    q(".cutsy-condition").textContent =
      `${style.label} ${style.secondaryEmoji}` +
      (w.stale ? " · offline" : "");

    // Main numbers
    const unitSymbol = w.units === "imperial" ? "°F" : "°C";
    q(".cutsy-temp").textContent = `${w.temp}${unitSymbol}`;
    q(".cutsy-emoji").textContent = style.emoji;
    q(".cutsy-mood").textContent = style.mood;

    q(".cutsy-humidity").textContent = `${w.humidity}%`;
    const windUnits = w.units === "imperial" ? "mph" : "m/s";
    q(".cutsy-wind").textContent = `${w.windSpeed} ${windUnits}`;

    // Sun/moon corner sprite
    const sm = q(".cutsy-sun-moon");
    const day = isDaytime(Date.now(), w.sunrise, w.sunset);
    sm.textContent = day ? "☀️" : "🌙";
    sm.classList.toggle("cutsy-daytime", day);
    sm.classList.toggle("cutsy-night", !day);

    spawnParticles(style.particles);

    if (settings.sound) playChime(style.category);
  }

  function setState(state) {
    const w = q("#cutsy-weather-widget");
    w.classList.remove("cutsy-state-loading", "cutsy-state-ok", "cutsy-state-error");
    w.classList.add(`cutsy-state-${state}`);
  }

  function showFallback(reason) {
    setState("error");
    const fb = q(".cutsy-fallback");
    const msg = q(".cutsy-fallback-msg");
    fb.hidden = false;
    q(".cutsy-body").hidden = true;
    q(".cutsy-forecast").hidden = true;

    if (reason.includes("MISSING_API_KEY")) {
      msg.textContent = "(⌒_⌒;) click the 🌸 toolbar icon to add your key";
    } else if (reason.includes("INVALID_API_KEY")) {
      msg.textContent = "(⌒_⌒;) the key isn't awake yet — try again in a bit";
    } else if (reason.toLowerCase().includes("denied") || reason.includes("PERMISSION")) {
      msg.textContent = "let me see the sky 🌷 (allow location)";
    } else {
      msg.textContent = "the sky is quiet right now ~ ☁️";
    }
  }

  // ---------------------------------------------------------------------
  // 8. PARTICLES — drifting hearts, sparkles, raindrops, etc.
  // ---------------------------------------------------------------------

  function spawnParticles(glyphs) {
    const container = q(".cutsy-particles");
    container.innerHTML = "";
    if (particleTimer) clearInterval(particleTimer);

    const make = () => {
      const span = document.createElement("span");
      span.className = "cutsy-particle";
      span.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

      // Random start position + animation duration
      const startX = Math.random() * 100;
      const drift = (Math.random() - 0.5) * 30;
      const dur = 4 + Math.random() * 5;
      const delay = Math.random() * 2;
      const size = 10 + Math.random() * 10;
      const opacity = 0.6 + Math.random() * 0.4;

      span.style.left = `${startX}%`;
      span.style.fontSize = `${size}px`;
      span.style.opacity = String(opacity);
      span.style.setProperty("--cutsy-drift", `${drift}px`);
      span.style.animationDuration = `${dur}s`;
      span.style.animationDelay = `${delay}s`;

      container.appendChild(span);
      setTimeout(() => span.remove(), (dur + delay) * 1000);
    };

    // Initial burst
    for (let i = 0; i < 6; i++) make();
    // Continuous slow spawn
    particleTimer = setInterval(make, 900);
  }

  // ---------------------------------------------------------------------
  // 9. SOUNDS (optional, gentle)
  // ---------------------------------------------------------------------

  let audioCtx = null;
  function playChime(category) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = category === "thunder" ? 220 : category === "rain" ? 440 : 660;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(ctx.destination);
      const now = ctx.currentTime;
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch (e) { /* sound is optional, swallow */ }
  }

  // ---------------------------------------------------------------------
  // 10. INTERACTIONS — drag, collapse, forecast, refresh
  // ---------------------------------------------------------------------

  function bindEvents() {
    // Buttons
    on(q(".cutsy-buttons"), "click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "refresh")  requestWeather();
      if (action === "forecast") toggleForecast();
      if (action === "collapse") collapse(true);
    });

    // Bubble click → expand back
    on(q("#cutsy-bubble"), "click", () => collapse(false));

    // Mascot bounce on hover happens via CSS; click for a tiny giggle
    on(q(".cutsy-mascot"), "click", () => {
      if (lastWeather) {
        const style = getStyle(lastWeather.code);
        q(".cutsy-mood").textContent = pick(STYLES[style.category].moods);
        q(".cutsy-mascot").textContent = pick(STYLES[style.category].emoticons);
      }
    });

    // Retry from fallback
    on(q(".cutsy-retry-btn"), "click", () => {
      q(".cutsy-fallback").hidden = true;
      q(".cutsy-body").hidden = false;
      requestWeather();
    });

    // Drag
    initDrag();

    // Listen for popup setting changes
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === "SETTINGS_UPDATED") {
        settings = { ...settings, ...msg.settings };
        applyTheme(settings.theme);
        if (lastCoords) requestWeather();
      }
      if (msg?.type === "RESET_POSITION") {
        saveSettings({ position: null });
        applyPosition(null);
      }
      if (msg?.type === "FORCE_REFRESH" || msg?.type === "API_KEY_UPDATED") {
        // Hide any error fallback and try fetching with the new key
        const fb = q(".cutsy-fallback");
        if (fb) fb.hidden = true;
        const body = q(".cutsy-body");
        if (body) body.hidden = false;
        requestWeather();
      }
    });

    // Auto-refresh every 10 minutes
    setInterval(() => { if (lastCoords) requestWeather(); }, 10 * 60 * 1000);
  }

  function initDrag() {
    const handle = q("[data-drag-handle]");
    const widget = q("#cutsy-weather-widget");
    let dragging = false;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    handle.addEventListener("pointerdown", (e) => {
      // Ignore clicks on buttons
      if (e.target.closest(".cutsy-btn")) return;
      dragging = true;
      handle.setPointerCapture(e.pointerId);
      const rect = widget.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      widget.classList.add("cutsy-dragging");
    });

    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const x = origX + (e.clientX - startX);
      const y = origY + (e.clientY - startY);
      applyPosition({ x, y });
    });

    handle.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      widget.classList.remove("cutsy-dragging");
      const rect = widget.getBoundingClientRect();
      saveSettings({ position: { x: rect.left, y: rect.top } });
    });
  }

  function applyPosition(pos) {
    const widget = q("#cutsy-weather-widget");
    if (!pos) {
      widget.style.left = "auto";
      widget.style.top  = "20px";
      widget.style.right = "20px";
      return;
    }
    // Clamp to viewport so it never floats off-screen
    const maxX = Math.max(0, window.innerWidth  - widget.offsetWidth  - 8);
    const maxY = Math.max(0, window.innerHeight - widget.offsetHeight - 8);
    const x = Math.max(8, Math.min(maxX, pos.x));
    const y = Math.max(8, Math.min(maxY, pos.y));
    widget.style.right = "auto";
    widget.style.left = `${x}px`;
    widget.style.top  = `${y}px`;
  }

  function applyTheme(theme) {
    const widget = q("#cutsy-weather-widget");
    const bubble = q("#cutsy-bubble");
    widget.dataset.theme = theme;
    bubble.dataset.theme = theme;
    if (lastWeather) {
      const style = getStyle(lastWeather.code);
      widget.style.setProperty(
        "--cutsy-gradient",
        theme === "dark" ? style.darkGradient : style.gradient
      );
    }
  }

  function collapse(state) {
    saveSettings({ collapsed: state });
    q("#cutsy-weather-widget").hidden = state;
    q("#cutsy-bubble").hidden = !state;
  }

  // ---------------------------------------------------------------------
  // 11. FORECAST POPOUT
  // ---------------------------------------------------------------------

  async function toggleForecast() {
    const fc = q(".cutsy-forecast");
    if (!fc.hidden) {
      fc.hidden = true;
      return;
    }
    if (!lastCoords) return;
    const row = q(".cutsy-forecast-row");
    row.innerHTML = `<div class="cutsy-forecast-loading">~ peeking ahead ~</div>`;
    fc.hidden = false;

    const res = await sendMsg({ type: "GET_FORECAST", ...lastCoords });
    if (!res.ok) {
      row.innerHTML = `<div class="cutsy-forecast-loading">couldn't peek today ~</div>`;
      return;
    }
    const unitSym = lastWeather?.units === "imperial" ? "°F" : "°C";
    row.innerHTML = res.data.map((f) => {
      const t = new Date(f.time);
      const hour = t.getHours().toString().padStart(2, "0");
      const style = getStyle(f.code);
      return `
        <div class="cutsy-forecast-cell">
          <div class="cutsy-forecast-hour">${hour}:00</div>
          <div class="cutsy-forecast-emoji">${style.emoji}</div>
          <div class="cutsy-forecast-temp">${f.temp}${unitSym}</div>
        </div>
      `;
    }).join("");
  }

  // ---------------------------------------------------------------------
  // 12. TINY DOM HELPERS
  // ---------------------------------------------------------------------

  function q(sel) { return root.querySelector(sel); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
})();
