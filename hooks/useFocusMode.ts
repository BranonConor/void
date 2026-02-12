import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FocusSession, TimelineItem } from "../types";
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
    if (date.toDateString() === today.toDateString()) return "today";
    if (date.toDateString() === yesterday.toDateString()) return "yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" }).toLowerCase();
  };

  // Build timeline with gap detection
  const timeline = useMemo((): TimelineItem[] => {
    const completedSessions = sessions.filter(s => !s.isActive && s.endTime);
    if (completedSessions.length === 0) return [];

    const items: TimelineItem[] = [];
    const sortedSessions = [...completedSessions].sort((a, b) => b.startTime - a.startTime);

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      
      // Add session as timeline item
      items.push({
        id: session.id,
        type: "session",
        startTime: session.startTime,
        endTime: session.endTime!,
        duration: session.duration,
      });

      // Check for gap to next session (or to today if first session)
      const nextSession = sortedSessions[i + 1];
      const gapEnd = session.startTime;
      const gapStart = nextSession ? nextSession.endTime! : null;

      // For the most recent session, check gap to today
      if (i === 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionDay = new Date(session.startTime);
        sessionDay.setHours(0, 0, 0, 0);
        
        const daysSinceSession = Math.floor((today.getTime() - sessionDay.getTime()) / MS_PER_DAY);
        
        // Only add gap if more than 1 day since last session
        if (daysSinceSession > 1) {
          items.unshift({
            id: `gap-today-${session.id}`,
            type: "gap",
            startTime: sessionDay.getTime() + MS_PER_DAY,
            endTime: today.getTime(),
            duration: daysSinceSession - 1, // days lived in real life
          });
        }
      }

      // Check gap between sessions
      if (gapStart) {
        const gapStartDay = new Date(gapStart);
        gapStartDay.setHours(0, 0, 0, 0);
        const gapEndDay = new Date(gapEnd);
        gapEndDay.setHours(0, 0, 0, 0);
        
        const daysBetween = Math.floor((gapEndDay.getTime() - gapStartDay.getTime()) / MS_PER_DAY);
        
        // Only add gap if more than 1 day between sessions
        if (daysBetween > 1) {
          items.push({
            id: `gap-${session.id}-${nextSession.id}`,
            type: "gap",
            startTime: gapStartDay.getTime() + MS_PER_DAY,
            endTime: gapEndDay.getTime(),
            duration: daysBetween - 1, // days lived in real life
          });
        }
      }
    }

    return items;
  }, [sessions]);

  return {
    isInFocus,
    currentSession,
    sessions,
    timeline,
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
