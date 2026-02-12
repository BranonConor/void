import { ThemeColors } from "../types";

export const darkTheme: ThemeColors = {
  background: "#000000",
  surface: "#0A0A0A",
  text: "#FFFFFF",
  textSecondary: "#666666",
  accent: "#00FF88",
  waveform: "#00FF88",
  waveformGlow: "rgba(0, 255, 136, 0.3)",
  border: "#1A1A1A",
};

export const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#000000",
  textSecondary: "#999999",
  accent: "#00AA55",
  waveform: "#000000",
  waveformGlow: "rgba(0, 0, 0, 0.1)",
  border: "#E5E5E5",
};

export const getTheme = (mode: "light" | "dark"): ThemeColors => {
  return mode === "dark" ? darkTheme : lightTheme;
};
