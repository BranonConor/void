import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { Waveform } from "../components";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";
import { useFocusMode } from "../hooks/useFocusMode";
import { colors } from "../theme/colors";

const THRESHOLD_DURATION = 4000; // 4 second entry
const UI_VISIBLE_DURATION = 3000; // Controls show for 3 seconds
const LONG_PRESS_DURATION = 1200; // 1.2 second long press to exit

// Exit button dimensions
const EXIT_BUTTON_SIZE = 56;
const RING_SIZE = EXIT_BUTTON_SIZE + 8;
const STROKE_WIDTH = 2;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function FocusScreen() {
  const router = useRouter();
  const { levels, isAnalyzing, startAnalysis, stopAnalysis } = useAudioAnalyzer();
  const { startSession, endSession, sessionDuration } = useFocusMode();
  
  // Threshold animation state
  const [isEntering, setIsEntering] = useState(true);
  const thresholdOpacity = useRef(new Animated.Value(1)).current;
  
  // Tap-to-reveal controls
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Long press state
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressProgress = useRef(new Animated.Value(0)).current;
  
  // Pop animation
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;

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
    if (isEntering || isLongPressing) return;
    
    // Clear any existing hide timer
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Auto-hide after delay
    hideControlsTimer.current = setTimeout(() => {
      if (!isLongPressing) {
        Animated.timing(controlsOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    }, UI_VISIBLE_DURATION);
  }, [isEntering, isLongPressing, controlsOpacity]);

  // Pop animation and exit
  const triggerPopAndExit = useCallback(() => {
    // Pop animation
    Animated.parallel([
      Animated.timing(popScale, {
        toValue: 1.4,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(popOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      endSession();
      router.replace("/");
    });
  }, [endSession, router, popScale, popOpacity]);

  // Long press handlers for exit
  const handlePressIn = useCallback(() => {
    setIsLongPressing(true);
    longPressProgress.setValue(0);
    
    // Clear hide timer while pressing
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    
    // Animate progress
    Animated.timing(longPressProgress, {
      toValue: 1,
      duration: LONG_PRESS_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    
    // Set timer for completion
    longPressTimer.current = setTimeout(() => {
      triggerPopAndExit();
    }, LONG_PRESS_DURATION);
  }, [longPressProgress, triggerPopAndExit]);

  const handlePressOut = useCallback(() => {
    setIsLongPressing(false);
    
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Smoothly reset progress
    Animated.timing(longPressProgress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Restart auto-hide timer
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, UI_VISIBLE_DURATION);
  }, [longPressProgress, controlsOpacity]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  // Circle progress animation
  const strokeDashoffset = longPressProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
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
            pointerEvents="none"
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

          {/* Exit button - circular icon with ring progress */}
          <Animated.View
            style={[styles.exitContainer, { opacity: controlsOpacity }]}
          >
            <Animated.View
              style={[
                styles.exitButtonWrapper,
                {
                  transform: [{ scale: popScale }],
                  opacity: popOpacity,
                },
              ]}
            >
              {/* Progress ring */}
              <View style={styles.ringContainer}>
                <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
                  {/* Background ring */}
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                  />
                  {/* Progress ring */}
                  <AnimatedCircle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="#FFFFFF"
                    strokeWidth={STROKE_WIDTH}
                    fill="transparent"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                  />
                </Svg>
              </View>
              
              {/* Button */}
              <Pressable
                style={styles.exitButton}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
              >
                {/* X icon */}
                <View style={styles.iconContainer}>
                  <View style={[styles.iconLine, styles.iconLine1]} />
                  <View style={[styles.iconLine, styles.iconLine2]} />
                </View>
              </Pressable>
            </Animated.View>
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
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  waveformContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  exitContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  exitButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: {
    transform: [{ rotate: "0deg" }],
  },
  exitButton: {
    width: EXIT_BUTTON_SIZE,
    height: EXIT_BUTTON_SIZE,
    borderRadius: EXIT_BUTTON_SIZE / 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLine: {
    position: "absolute",
    width: 18,
    height: 1.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  iconLine1: {
    transform: [{ rotate: "45deg" }],
  },
  iconLine2: {
    transform: [{ rotate: "-45deg" }],
  },
});
