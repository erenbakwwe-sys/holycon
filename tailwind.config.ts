import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Holycon brand - Mapped to Greek Pantheon (Ivory, Marble, Bronze)
        coffee: {
          50: "#FAF9F6",   // Ivory White
          100: "#F4EFE6",  // Alabaster Cream
          200: "#EADEC9",  // Warm Sandstone
          300: "#DECBAA",  // Muted Gold
          400: "#CBAE85",  // Bronze Gold
          500: "#AA8C60",  // Antique Bronze
          600: "#7D623C",  // Dark Bronze
          700: "#4E4642",  // Deep Stone Gray
          800: "#2A2421",  // Charcoal Marble
          900: "#1C1917",  // Obsidian Stone
          950: "#12100F",  // Pantheon Dark
        },
        gold: {
          DEFAULT: "#D4AF37", // True Gold
          light: "#F4D068",   // Hellenic Yellow Gold
          dark: "#AA7C11",    // Antique Gold
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "stamp-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
        },
        "stamp-pop": {
          "0%": { opacity: "0", transform: "scale(0) rotate(-45deg)" },
          "70%": { transform: "scale(1.15) rotate(5deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-100%) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 165, 116, 0.3)" },
          "50%": { boxShadow: "0 0 22px rgba(212, 165, 116, 0.7)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "bokeh-1": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.2" },
          "33%": { transform: "translate(30px, -50px) scale(1.2)", opacity: "0.4" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)", opacity: "0.3" },
        },
        "bokeh-2": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)", opacity: "0.15" },
          "50%": { transform: "translate(-40px, 40px) scale(1.3)", opacity: "0.35" },
        },
      },
      animation: {
        "stamp-bounce": "stamp-bounce 0.5s ease-in-out",
        "stamp-pop": "stamp-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        shimmer: "shimmer 2.5s infinite linear",
        "confetti-fall": "confetti-fall 3s ease-in forwards",
        "pulse-glow": "pulse-glow 2.5s infinite ease-in-out",
        float: "float 4s ease-in-out infinite",
        "bokeh-1": "bokeh-1 12s infinite ease-in-out",
        "bokeh-2": "bokeh-2 15s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
