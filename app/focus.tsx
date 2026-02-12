import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  BackHandler,
  Animated,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getTheme } from "../theme/colors";
import { Waveform } from "../components";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";
import { useFocusMode } from "../hooks/useFocusMode";

const THRESHOLD_DURATION = 4000; // 4 second fade in
const LONG_PRESS_DURATION = 2000; // 2 second hold to exit

export default function FocusScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark" ? "dark" : "light");
  const router = useRouter();

  const { isInFocus, elapsedTime, enterTheVoid, exitTheVoid, formatDuration } =
    useFocusMode();

  const { audioData, hasPermission, isRecording } = useAudioAnalyzer(isInFocus);

  // Threshold animation state
  const [hasEnteredVoid, setHasEnteredVoid] = useState(false);
  const thresholdOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Timer visibility state - tap to reveal
  const [timerVisible, setTimerVisible] = useState(false);
  const timerOpacity = useRef(new Animated.Value(0)).current;
  const timerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Long press exit state
  const [exitProgress, setExitProgress] = useState(0);
  const exitPressStart = useRef<number | null>(null);
  const exitAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Enter the void on mount
  useEffect(() => {
    enterTheVoid();
    
    // Threshold entry animation - slow fade
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(thresholdOpacity, {
          toValue: 0,
          duration: THRESHOLD_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: THRESHOLD_DURATION,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHasEnteredVoid(true);
      });
    }, 500);
  }, []);

  // Handle back button (Android)
  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Prevent accidental back - require long press
      return true;
    });
    return () => handler.remove();
  }, []);

  // Timer tap to reveal
  const handleScreenTap = () => {
    if (!hasEnteredVoid) return;
    
    // Clear existing timeout
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
    }

    setTimerVisible(true);
    Animated.timing(timerOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto-hide after 3 seconds
    timerTimeoutRef.current = setTimeout(() => {
      Animated.timing(timerOpacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => setTimerVisible(false));
    }, 3000);
  };

  // Long press to exit
  const handlePressIn = () => {
    exitPressStart.current = Date.now();
    
    exitAnimationRef.current = setInterval(() => {
      if (exitPressStart.current) {
        const elapsed = Date.now() - exitPressStart.current;
        const progress = Math.min(elapsed / LONG_PRESS_DURATION, 1);
        setExitProgress(progress);
        
        if (progress >= 1) {
          handleExit();
        }
      }
    }, 16);
  };

  const handlePressOut = () => {
    exitPressStart.current = null;
    if (exitAnimationRef.current) {
      clearInterval(exitAnimationRef.current);
    }
    setExitProgress(0);
  };

  const handleExit = async () => {
    if (exitAnimationRef.current) {
      clearInterval(exitAnimationRef.current);
    }
    
    // Fade out before exiting
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start(async () => {
      await exitTheVoid();
      router.back();
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Threshold overlay - fades out on entry */}
      <Animated.View
        style={[
          styles.thresholdOverlay,
          { backgroundColor: theme.background, opacity: thresholdOpacity },
        ]}
        pointerEvents={hasEnteredVoid ? "none" : "auto"}
      >
        <Text style={[styles.thresholdText, { color: theme.textSecondary }]}>
          entering the void
        </Text>
      </Animated.View>

      {/* Main content */}
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
          {/* Timer - only visible on tap */}
          <View style={styles.header}>
            <Animated.Text
              style={[
                styles.timer,
                { color: theme.textSecondary, opacity: timerOpacity },
              ]}
            >
              {formatDuration(elapsedTime)}
            </Animated.Text>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            <Waveform
              levels={audioData.levels}
              theme={theme}
              isActive={isRecording}
            />
          </View>

          {/* Exit zone - long press at bottom */}
          <Pressable
            style={styles.exitZone}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <View style={styles.exitIndicator}>
              {/* Progress bar for long press */}
              <View
                style={[
                  styles.exitProgress,
                  {
                    backgroundColor: theme.textSecondary,
                    width: `${exitProgress * 100}%`,
                    opacity: exitProgress > 0 ? 0.3 : 0,
                  },
                ]}
              />
              <Text
                style={[
                  styles.exitHint,
                  {
                    color: theme.textSecondary,
                    opacity: exitProgress > 0 ? 0.5 : 0.15,
                  },
                ]}
              >
                {exitProgress > 0 ? "hold to exit" : "· · ·"}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  thresholdOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  thresholdText: {
    fontSize: 11,
    letterSpacing: 8,
    fontWeight: "300",
    fontFamily: "Courier",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    minHeight: 80,
  },
  timer: {
    fontSize: 11,
    letterSpacing: 8,
    fontWeight: "300",
    fontFamily: "Courier",
  },
  waveformContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  exitZone: {
    paddingBottom: 50,
    paddingTop: 30,
    alignItems: "center",
  },
  exitIndicator: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    width: 120,
  },
  exitProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 0,
  },
  exitHint: {
    fontSize: 9,
    letterSpacing: 4,
    fontWeight: "300",
    fontFamily: "Courier",
  },
});
