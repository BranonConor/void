import { useState, useEffect, useCallback, useRef } from "react";
import { FocusSession } from "../types";
import { sessionStore } from "../stores/sessionStore";

export function useFocusMode() {
  const [isInFocus, setIsInFocus] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(
    null,
  );
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (isInFocus && currentSession) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - currentSession.startTime) / 1000,
        );
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInFocus, currentSession]);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    const loaded = await sessionStore.getSessions();
    setSessions(loaded);
    setIsLoading(false);
  }, []);

  const enterTheVoid = useCallback(async () => {
    const newSession: FocusSession = {
      id: sessionStore.generateId(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      isActive: true,
    };
    setCurrentSession(newSession);
    setIsInFocus(true);
    const updated = await sessionStore.addSession(newSession);
    setSessions(updated);
  }, []);

  const exitTheVoid = useCallback(async () => {
    if (currentSession) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - currentSession.startTime) / 1000);
      const updated = await sessionStore.updateSession(currentSession.id, {
        endTime,
        duration,
        isActive: false,
      });
      setSessions(updated);
    }
    setCurrentSession(null);
    setIsInFocus(false);
    setElapsedTime(0);
  }, [currentSession]);

  const deleteSession = useCallback(async (id: string) => {
    const updated = await sessionStore.deleteSession(id);
    setSessions(updated);
  }, []);

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const formatTime = (ts: number): string => {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (ts: number): string => {
    const date = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return {
    isInFocus,
    currentSession,
    sessions,
    elapsedTime,
    isLoading,
    enterTheVoid,
    exitTheVoid,
    deleteSession,
    formatDuration,
    formatTime,
    formatDate,
    refreshSessions: loadSessions,
  };
}
