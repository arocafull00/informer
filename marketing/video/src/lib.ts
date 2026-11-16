import { Easing, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSign } from "@remotion/google-fonts/MrsSaintDelafield";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const fonts = {
  ui: loadInter("normal", {
    weights: ["400", "500", "600", "700", "800"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily,
  serif: loadSerif("normal", {
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily,
  sign: loadSign("normal", {
    weights: ["400"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily,
  mono: loadMono("normal", { weights: ["500"], subsets: ["latin"] }).fontFamily,
};

// GasApp installation-theme tokens (gas-app/app/globals.css)
export const app = {
  canvas: "#f8fafc",
  surface: "#ffffff",
  ink: "#172334",
  inkSecondary: "#5c6d80",
  inkMuted: "#68778b",
  primary: "#1d64d8",
  primarySubtle: "#eff6ff",
  primaryLight: "#1855ba",
  border: "#dde5ec",
  borderSubtle: "#e5eaf0",
  warning: "#956b3d",
  warningSubtle: "#fff8ed",
  success: "#34805a",
  successSubtle: "#e7f6ee",
  diagramGrid: "#dce5f0",
  diagramCanvas: "#fbfdff",
  danger: "#b3261e",
  dangerSubtle: "#fdecea",
};

// Personal brand tokens (portfolio-v3 marca template)
export const brand = {
  bg: "#06070a",
  text: "#ece8e1",
  muted: "#9b988f",
  blueLight: "#93b6e6",
};

export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const ip = (
  frame: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = easeInOut,
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Characters of `text` visible when typing starts at `start`, one char every `speed` frames. */
export const typed = (
  text: string,
  frame: number,
  start: number,
  speed = 1.6,
) =>
  text.slice(
    0,
    Math.max(0, Math.min(text.length, Math.floor((frame - start) / speed))),
  );

/** Blinking caret visibility while typing is active. */
export const caretOn = (frame: number, start: number, end: number) =>
  frame >= start && frame < end + 12 && Math.floor(frame / 8) % 2 === 0;
