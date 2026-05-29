# 🌸 Cutsy Weather

A soft, cozy, **minimalist kawaii Chrome extension** that floats live weather information at the top-right of every webpage. Built with Manifest V3, vanilla HTML/CSS/JS — no frameworks, no servers, no tracking. (｡•ᴗ•｡)

> Each user uses their **own free OpenWeatherMap API key**, pasted once into the popup. The key stays on your machine in `chrome.storage` — nothing is shared.

---

## ✨ Features

- 🌍 Auto-detects your location (browser geolocation, with IP fallback)
- 🌡️ Shows city, temperature, condition, humidity, wind speed
- 🐰 Cute emoji + emoticon mascot that reacts to the weather
- 🃏 Floating glass card, minimalist palette, soft shadow
- 🌸 Light & 🌙 dark themes with a single dusty-rose accent
- ✦ Tiny animated particles (hearts, sparkles, raindrops, snow…)
- 🖱️ Draggable — moves where you like, position is remembered
- 💬 Cute mood phrases per weather condition
- ⏰ Hourly forecast popout
- ☀️🌙 Animated sun by day, moon by night
- 🛡️ No frameworks, no servers, no tracking, no API key shipped in code

---

## 🪄 Install (Load unpacked, 3 minutes)

### Step 1 — Download

Click **Code → Download ZIP** on the GitHub page, then unzip somewhere you'll remember (e.g. `Documents/Cutsy-Weather`).

> Or `git clone https://github.com/YOUR_USERNAME/cutsy-weather.git`

### Step 2 — Load it in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** ON (top-right)
3. Click **Load unpacked**
4. Select the `Cutsy-Weather` folder (the one with `manifest.json`)
5. The 🌸 icon appears in your toolbar — pin it for easy access

### Step 3 — Get your free OpenWeatherMap API key

1. Sign up: https://home.openweathermap.org/users/sign_up (free, 30 sec)
2. Verify your email
3. Copy your key from https://home.openweathermap.org/api_keys
4. ⏳ **New keys take 10 minutes – 2 hours to activate**

### Step 4 — Paste your key into the extension

1. Click the 🌸 toolbar icon
2. Paste your key into the input field → click **save**
3. Allow location when prompted
4. ✨ The widget appears on every normal webpage

---

## 🧪 Quick test

Open https://example.com → allow location → the widget should appear at the top-right within ~2 seconds.

If it doesn't:
- Click the 🌸 icon → make sure the key is saved (you'll see "🔑 key saved ✓")
- Wait up to 2 hours after signup (key takes time to activate)
- Test your key: `https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=YOUR_KEY` — should return JSON

---

## 🎮 Usage

- 🖱️ **Drag** the widget header to move it
- 🔄 **Refresh** with the button on the widget
- ⏰ **Hourly forecast** popout
- ✖ **Minimize** → tiny floating bubble; click bubble to expand
- 🌸 **Toolbar popup** → toggle light/dark theme, change key, reset position

---

## 🔐 Privacy

Cutsy Weather is **fully local**:
- Your **API key** is stored in `chrome.storage.local` on your machine — never sent anywhere except OpenWeatherMap.
- Your **coordinates** are sent only to OpenWeatherMap (and optionally ipapi.co if you deny geolocation).
- **Nothing is logged, sold, or shared.** No analytics. No server-side code.

The source code is auditable — read `src/background/background.js` to see exactly which URLs are hit.

---

## 📁 Project Structure

```
Cutsy-Weather/
├── manifest.json
├── README.md
├── .gitignore
└── src/
    ├── background/background.js   # Service worker — API calls + 10-min cache
    ├── content/
    │   ├── content.js             # Floating widget injection
    │   └── widget.css             # Minimalist styling + animations
    ├── popup/
    │   ├── popup.html             # API key + theme + live weather card
    │   ├── popup.css
    │   └── popup.js
    ├── lib/
    │   ├── weatherApi.js          # OpenWeatherMap fetch logic
    │   ├── emojiMap.js            # Weather code → cute style mapping
    │   └── storage.js             # chrome.storage wrapper
    └── assets/icons/              # 16/32/48/128 px PNG icons
```

---

## 🐞 Troubleshooting

| Problem | Fix |
|---|---|
| Widget never appears | Refresh the test page. Then go to `chrome://extensions` → click ↻ on Cutsy Weather → refresh tab again. |
| `Invalid API key` | Wait up to 2 hours after signup. Test with the URL in Step 3 above. |
| No location prompt | Click 🔒 in the address bar → reset location permission → reload. |
| Doesn't show on Google Account / banking | Those sites enforce strict CSP that blocks all extension injection. Normal behavior. |
| Doesn't show on Chrome's New Tab / `chrome://` pages | Chrome blocks all content scripts there. Normal behavior. |

To inspect the service worker: `chrome://extensions` → click **service worker** under Cutsy Weather.

---

## 🛠️ Development

The code is pure HTML / CSS / JS — no build tools needed.

After editing any file:
1. `chrome://extensions` → click ↻ on Cutsy Weather
2. Refresh the webpage you're testing on

---

## 📜 License

MIT — see [`LICENSE`](./LICENSE)

---

## 💌 Credits

Made with soft pastel feelings 🌸✨ — kawaii UI inspired by Japanese stationery, cozy desktop weather widgets, and warm hugs from the sun.

Weather data by [OpenWeatherMap](https://openweathermap.org/). IP-based location fallback by [ipapi.co](https://ipapi.co/).

*Stay cozy. ☁️🍑*
