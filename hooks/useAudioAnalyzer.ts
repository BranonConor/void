import { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import { AudioData } from "../types";

const NUM_BARS = 48;
const UPDATE_INTERVAL = 80; // Slower updates for more organic feel
const SMOOTHING_FACTOR = 0.3; // How much to smooth transitions (0-1, lower = smoother)

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
    // More sensitive range for quiet environments
    const minDb = -50; // Silence threshold
    const maxDb = -10; // Loud threshold
    const normalized = (metering - minDb) / (maxDb - minDb);
    return Math.max(0, Math.min(1, normalized));
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
      const newLevels = levelsRef.current.map(l => l * 0.9);
      levelsRef.current = newLevels;
      setAudioData({ metering: -160, levels: newLevels });
      
      if (newLevels.some(l => l > 0.01)) {
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
