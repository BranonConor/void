import { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { Dimensions } from "react-native";
import { AudioData } from "../types";

// Calculate number of bars - lower fidelity for chunky lo-fi look
const SCREEN_WIDTH = Dimensions.get("window").width;
const BAR_TOTAL_WIDTH = 10; // Wider spacing = fewer bars
const NUM_BARS = Math.floor(SCREEN_WIDTH / BAR_TOTAL_WIDTH);
const UPDATE_INTERVAL = 12; // ~83fps for ultra-responsive feel
const SMOOTHING_FACTOR = 0.7; // Very responsive to changes

export function useAudioAnalyzer(isActive: boolean) {
  const [audioData, setAudioData] = useState<AudioData>({
    metering: -160,
    levels: new Array(NUM_BARS).fill(0),
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const levelsRef = useRef<number[]>(new Array(NUM_BARS).fill(0));
  const smoothedLevelRef = useRef<number>(0);
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

  // More sensitive normalization for ambient sounds
  const normalizeLevel = (metering: number): number => {
    // Sensitive range for ambient sounds
    const minDb = -60; // Silence threshold (very sensitive)
    const maxDb = 0; // Loud threshold
    const normalized = (metering - minDb) / (maxDb - minDb);
    // Boost quieter sounds more
    const boosted = Math.pow(Math.max(0, normalized), 0.7);
    return Math.min(1, boosted * 1.5); // Extra boost
  };

  const updateLevels = useCallback((metering: number) => {
    const rawLevel = normalizeLevel(metering);

    // Smooth the level to avoid jumpy motion
    smoothedLevelRef.current =
      smoothedLevelRef.current * (1 - SMOOTHING_FACTOR) +
      rawLevel * SMOOTHING_FACTOR;

    const smoothedLevel = smoothedLevelRef.current;

    // Shift levels and add new one (creates flowing wave effect)
    const newLevels = [...levelsRef.current];
    newLevels.shift();

    // Add very subtle organic variation
    const microVariation = (Math.random() - 0.5) * 0.03;
    const finalLevel = Math.max(0, Math.min(1, smoothedLevel + microVariation));

    newLevels.push(finalLevel);
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

    // Slowly fade out levels instead of instant reset
    const fadeOutLevels = () => {
      const newLevels = levelsRef.current.map((l) => l * 0.9);
      levelsRef.current = newLevels;
      setAudioData({ metering: -160, levels: newLevels });

      if (newLevels.some((l) => l > 0.01)) {
        setTimeout(fadeOutLevels, 50);
      } else {
        levelsRef.current = new Array(NUM_BARS).fill(0);
        setAudioData({ metering: -160, levels: new Array(NUM_BARS).fill(0) });
      }
    };
    fadeOutLevels();

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
