import AsyncStorage from "@react-native-async-storage/async-storage";
import { FocusSession } from "../types";

const SESSIONS_KEY = "@void_sessions";

export const sessionStore = {
  async getSessions(): Promise<FocusSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveSessions(sessions: FocusSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch {
      // Ignore errors
    }
  },

  async addSession(session: FocusSession): Promise<FocusSession[]> {
    const sessions = await this.getSessions();
    const updated = [session, ...sessions];
    await this.saveSessions(updated);
    return updated;
  },

  async updateSession(
    id: string,
    updates: Partial<FocusSession>,
  ): Promise<FocusSession[]> {
    const sessions = await this.getSessions();
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    );
    await this.saveSessions(updated);
    return updated;
  },

  async deleteSession(id: string): Promise<FocusSession[]> {
    const sessions = await this.getSessions();
    const updated = sessions.filter((s) => s.id !== id);
    await this.saveSessions(updated);
    return updated;
  },

  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },
};
