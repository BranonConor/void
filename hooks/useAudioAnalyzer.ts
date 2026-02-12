import { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { AudioData } from "../types";

const NUM_BARS = 32;
const UPDATE_INTERVAL = 50;

export function useAudioAnalyzer(isActive: boolean) {
  const [audioData, setAudioData] = useState<AudioData>({
    metering: -160,
    levels: new Array(NUM_BARS).fill(0),
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const levelsRef = useRef<number[]>(new Array(NUM_BARS).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === "granted");
      return status === "granted";
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  const normalizeLevel = (metering: number): number => {
    const minDb = -60;
    const maxDb = 0;
    const normalized = (metering - minDb) / (maxDb - minDb);
    return Math.max(0, Math.min(1, normalized));
  };

  const updateLevels = useCallback((metering: number) => {
    const level = normalizeLevel(metering);
    const newLevels = [...levelsRef.current];
    newLevels.shift();
    const variation = (Math.random() - 0.5) * 0.15;
    const adjusted = Math.max(0, Math.min(1, level + variation));
    const quantized = Math.round(adjusted * 8) / 8;
    newLevels.push(quantized);
    levelsRef.current = newLevels;
    setAudioData({ metering, levels: newLevels });
  }, []);

  const startAnalyzing = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.LOW_QUALITY,
        isMeteringEnabled: true,
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      intervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          try {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              updateLevels(status.metering);
            }
          } catch {
            // Ignore
          }
        }
      }, UPDATE_INTERVAL);
    } catch {
      // Ignore
    }
  }, [hasPermission, requestPermission, updateLevels]);

  const stopAnalyzing = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignore
      }
      recordingRef.current = null;
    }

    setIsRecording(false);
    levelsRef.current = new Array(NUM_BARS).fill(0);
    setAudioData({ metering: -160, levels: new Array(NUM_BARS).fill(0) });

    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  }, []);

  useEffect(() => {
    if (isActive) {
      startAnalyzing();
    } else {
      stopAnalyzing();
    }
    return () => {
      stopAnalyzing();
    };
  }, [isActive, startAnalyzing, stopAnalyzing]);

  return { audioData, hasPermission, isRecording, requestPermission };
}
