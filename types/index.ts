export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number;
  isActive: boolean;
}

export interface AudioData {
  metering: number;
  levels: number[];
}

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  accent: string;
  waveform: string;
  waveformGlow: string;
  border: string;
}
