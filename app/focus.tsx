import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Waveform } from "../components";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";
import { useFocusMode } from "../hooks/useFocusMode";
import { colors } from "../theme/colors";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const THRESHOLD_DURATION = 4000; // 4 second entry
const UI_VISIBLE_DURATION = 3000; // Controls show for 3 seconds
const LONG_PRESS_DURATION = 1500; // 1.5 second long press to exit

export default function FocusScreen() {
  const router = useRouter();
  const { levels, isAnalyzing, startAnalysis, stopAnalysis } = useAudioAnalyzer();
  const { startSession, endSession, sessionDuration } = useFocusMode();
  
  // Threshold animation state
  const [isEntering, setIsEntering] = useState(true);
  const thresholdOpacity = useRef(new Animated.Value(1)).current;
  
  // Tap-to-reveal controls
  const [showControls, setShowControls] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Long press state
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressProgress = useRef(new Animated.Value(0)).current;

  // Start session on mount
  useEffect(() => {
    startSession();
    startAnalysis();
    
    // Threshold entry animation
    const timer = setTimeout(() => {
      Animated.timing(thresholdOpacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        setIsEntering(false);
      });
    }, THRESHOLD_DURATION);

    return () => {
      clearTimeout(timer);
      stopAnalysis();
    };
  }, []);

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Show controls on tap
  const revealControls = useCallback(() => {
    if (isEntering) return;
    
    // Clear any existing hide timer
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after delay
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setShowControls(false);
      });
    }, UI_VISIBLE_DURATION);
  }, [isEntering, controlsOpacity]);

  // Long press handlers for exit
  const handlePressIn = useCallback(() => {
    if (!showControls) return;
    
    setIsLongPressing(true);
    longPressProgress.setValue(0);
    
    // Animate progress
    Animated.timing(longPressProgress, {
      toValue: 1,
      duration: LONG_PRESS_DURATION,
      useNativeDriver: false,
    }).start();
    
    // Set timer for completion
    longPressTimer.current = setTimeout(() => {
      endSession();
      router.back();
    }, LONG_PRESS_DURATION);
  }, [showControls, endSession, router, longPressProgress]);

  const handlePressOut = useCallback(() => {
    setIsLongPressing(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    Animated.timing(longPressProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [longPressProgress]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Exit button width animation
  const exitButtonWidth = longPressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable 
      style={styles.container} 
      onPress={revealControls}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Threshold entry overlay */}
        {isEntering && (
          <Animated.View
            style={[styles.threshold, { opacity: thresholdOpacity }]}
            pointerEvents="none"
          >
            <Text style={styles.thresholdText}>entering the void</Text>
          </Animated.View>
        )}

        {/* Main content */}
        <View style={styles.content}>
          {/* Timer - shown on tap */}
          <Animated.View
            style={[styles.timerContainer, { opacity: controlsOpacity }]}
          >
            <Text style={styles.timer}>{formatDuration(sessionDuration)}</Text>
          </Animated.View>

          {/* Waveform - always visible, the star of the show */}
          <View style={styles.waveformContainer}>
            <Waveform
              levels={levels}
              theme={colors}
              isActive={isAnalyzing && !isEntering}
            />
          </View>

          {/* Exit button - shown on tap */}
          <Animated.View
            style={[styles.exitContainer, { opacity: controlsOpacity }]}
          >
            <Pressable
              style={styles.exitButton}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              {/* Progress fill */}
              <Animated.View
                style={[
                  styles.exitProgress,
                  { width: exitButtonWidth },
                ]}
              />
              <Text style={styles.exitText}>
                {isLongPressing ? "releasing..." : "hold to exit"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  threshold: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  thresholdText: {
    fontFamily: "Courier",
    fontWeight: "300",
    fontSize: 18,
    color: colors.textMuted,
    letterSpacing: 4,
    textTransform: "lowercase",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  timer: {
    fontFamily: "Courier",
    fontWeight: "300",
    fontSize: 48,
    color: "#FFFFFF", // Pure white for visibility
    letterSpacing: 2,
  },
  waveformContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  exitContainer: {
    position: "absolute",
    bottom: 80,
    left: 40,
    right: 40,
  },
  exitButton: {
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  exitProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  exitText: {
    fontFamily: "Courier",
    fontWeight: "300",
    fontSize: 14,
    color: "#FFFFFF", // Pure white for visibility
    letterSpacing: 3,
    textTransform: "lowercase",
  },
});
