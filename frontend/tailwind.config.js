/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pixel: {
          bg:       "#1a1a2e",
          panel:    "#16213e",
          border:   "#0f3460",
          gold:     "#ffd700",
          green:    "#39ff14",
          red:      "#ff3131",
          blue:     "#4fc3f7",
          purple:   "#ce93d8",
          terminal: "#001100",
          termtext: "#00ff41",
          floor:    "#c8a96e",
          wall:     "#8b6914",
          server:   "#2d2d2d",
          desk:     "#a0522d",
        },
        agent: {
          alice:    "#4fc3f7",
          scribe:   "#81c784",
          sentinel: "#ef5350",
        },
      },
      fontFamily: {
        pixel: ["'Press Start 2P'", "monospace"],
        mono:  ["monospace"],
      },
      fontSize: {
        "2xs": "0.5rem",
        "3xs": "0.4rem",
      },
      animation: {
        "pixel-breathe":  "pixelBreathe 2.5s ease-in-out infinite",
        "pixel-walk":     "pixelWalk 0.4s steps(2) infinite",
        "server-blink":   "serverBlink 1.2s step-end infinite",
        "cursor-blink":   "cursorBlink 1s step-end infinite",
        "scanline":       "scanline 8s linear infinite",
        "float-bubble":   "floatBubble 0.3s ease-out forwards",
        "report-drop":    "reportDrop 0.5s ease-out forwards",
        "walk-right":     "walkRight 1.2s ease-in-out forwards",
        "walk-left":      "walkLeft 1.2s ease-in-out forwards",
      },
      keyframes: {
        pixelBreathe: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-2px)" },
        },
        pixelWalk: {
          "0%":   { transform: "translateX(0)" },
          "50%":  { transform: "translateX(2px)" },
          "100%": { transform: "translateX(0)" },
        },
        serverBlink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.1" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        scanline: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        floatBubble: {
          "0%":   { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        reportDrop: {
          "0%":   { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        walkRight: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(120px)" },
        },
        walkLeft: {
          "0%":   { transform: "translateX(120px)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "pixel": "4px 4px 0px 0px rgba(0,0,0,0.8)",
        "pixel-inset": "inset 4px 4px 0px 0px rgba(0,0,0,0.5)",
        "pixel-gold": "4px 4px 0px 0px #b8860b",
        "pixel-red":  "4px 4px 0px 0px #8b0000",
        "glow-green": "0 0 8px #39ff14, 0 0 16px #39ff14",
        "glow-blue":  "0 0 8px #4fc3f7, 0 0 16px #4fc3f7",
        "glow-gold":  "0 0 8px #ffd700, 0 0 16px #ffd700",
      },
      backgroundImage: {
        "floor-tiles": "repeating-conic-gradient(#c8a96e 0% 25%, #b8996e 0% 50%) 0 0 / 16px 16px",
        "server-bg": "repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 4px, #222 4px, #222 8px)",
      },
    },
  },
  plugins: [],
};
