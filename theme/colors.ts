import { ThemeColors } from "../types";

// Monochromatic black & white theme - brutally simple
export const darkTheme: ThemeColors = {
  background: "#000000",
  surface: "#0A0A0A",
  text: "#FFFFFF",
  textSecondary: "#666666",
  accent: "#FFFFFF",
  waveform: "#FFFFFF",
  waveformGlow: "rgba(255, 255, 255, 0.2)",
  border: "#222222",
};

// Force dark mode everywhere for consistent monochromatic look
export const lightTheme: ThemeColors = {
  background: "#000000",
  surface: "#0A0A0A",
  text: "#FFFFFF",
  textSecondary: "#666666",
  accent: "#FFFFFF",
  waveform: "#FFFFFF",
  waveformGlow: "rgba(255, 255, 255, 0.2)",
  border: "#222222",
};

export const getTheme = (mode: "light" | "dark"): ThemeColors => {
  // Always return dark theme for monochromatic aesthetic
  return darkTheme;
};
