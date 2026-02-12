export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number | null;
  duration: number;
  isActive: boolean;
}

// Timeline items can be sessions or gaps (lived real life)
export interface TimelineItem {
  id: string;
  type: "session" | "gap";
  startTime: number;
  endTime: number;
  duration: number; // seconds for sessions, days for gaps
  isActive?: boolean;
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
  textMuted: string;
  accent: string;
  waveform: string;
  waveformGlow: string;
  border: string;
}
