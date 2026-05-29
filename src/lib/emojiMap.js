// 🌸 emojiMap.js
// Maps OpenWeatherMap condition codes to cute emojis, emoticons, gradients,
// and adorable mood messages. The whole "personality" of the widget lives here.
//
// Reference: https://openweathermap.org/weather-conditions
// Condition codes are 3-digit numbers grouped by category:
//   2xx → thunderstorm     ⛈️
//   3xx → drizzle          🌦️
//   5xx → rain             🌧️
//   6xx → snow             ❄️
//   7xx → atmosphere (mist/fog/etc.)
//   800 → clear            ☀️
//   80x → clouds           ☁️

// Map a raw OpenWeatherMap code to one of our cute categories
export function categorize(code) {
  if (code >= 200 && code < 300) return "thunder";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "mist";
  if (code === 800) return "sunny";
  if (code > 800 && code < 900) return "cloudy";
  return "cloudy";
}

// Pick a different sub-emoticon every couple of minutes so it feels alive 🌷
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// All the cute style data per category
// You can tweak these freely — they drive the entire vibe of the widget.
export const STYLES = {
  sunny: {
    emoji: "☀️",
    secondaryEmoji: "🌸",
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
    emoji: "🌧️",
    secondaryEmoji: "☔",
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
    emoji: "☁️",
    secondaryEmoji: "🐰",
    emoticons: ["(´｡• ᵕ •｡`)", "(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ", "(´｡• ω •｡`)", "( ˘ω˘ )"],
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
    emoji: "❄️",
    secondaryEmoji: "🩵",
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
    emoji: "⛈️",
    secondaryEmoji: "⚡",
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
    emoji: "🌫️",
    secondaryEmoji: "🪷",
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

// Public API — get the styling pack for a given OpenWeatherMap weather id
export function getStyle(weatherCode) {
  const category = categorize(weatherCode);
  const s = STYLES[category];
  return {
    category,
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

// Sun/moon helper — used for the animated sun/moon based on local time
export function isDaytime(dt, sunrise, sunset) {
  if (sunrise && sunset && dt) {
    return dt >= sunrise && dt < sunset;
  }
  const hour = new Date().getHours();
  return hour >= 6 && hour < 19;
}
