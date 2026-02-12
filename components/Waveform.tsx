import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { ThemeColors } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_COUNT = 48;
const BAR_WIDTH = 2;
const BAR_GAP = 3;
const MAX_HEIGHT = 80;
const MIN_HEIGHT = 1;

interface WaveformProps {
  levels: number[];
  theme: ThemeColors;
  isActive: boolean;
}

interface BarProps {
  level: number;
  theme: ThemeColors;
  isActive: boolean;
  index: number;
}

function WaveformBar({ level, theme, isActive, index }: BarProps) {
  const heightAnim = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    // Very subtle height - silence should be near-invisible
    // Apply easing to make motion more organic
    const easedLevel = Math.pow(level, 1.5); // Exponential easing - quiet stays quiet
    const targetHeight = isActive
      ? Math.max(MIN_HEIGHT, easedLevel * MAX_HEIGHT)
      : MIN_HEIGHT;
    
    // Opacity based on level - quiet = very faint
    const targetOpacity = isActive
      ? 0.15 + (easedLevel * 0.6) // 0.15 to 0.75
      : 0.15;

    // Very slow, smooth animation - organic feel
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: targetHeight,
        duration: 300, // Slower transitions
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [level, isActive, heightAnim, opacityAnim]);

  return (
    <View style={styles.barContainer}>
      <Animated.View
        style={[
          styles.bar,
          {
            height: heightAnim,
            backgroundColor: theme.waveform,
            opacity: opacityAnim,
          },
        ]}
      />
    </View>
  );
}

export function Waveform({ levels, theme, isActive }: WaveformProps) {
  // Pad or slice levels to match BAR_COUNT
  const normalizedLevels = React.useMemo(() => {
    if (levels.length >= BAR_COUNT) {
      return levels.slice(0, BAR_COUNT);
    }
    // Pad with zeros
    return [...levels, ...new Array(BAR_COUNT - levels.length).fill(0)];
  }, [levels]);

  return (
    <View style={styles.container}>
      {/* Main waveform */}
      <View style={styles.waveformRow}>
        {normalizedLevels.map((level, i) => (
          <WaveformBar
            key={i}
            level={level}
            theme={theme}
            isActive={isActive}
            index={i}
          />
        ))}
      </View>
      
      {/* Subtle reflection - very faint */}
      <View style={[styles.waveformRow, styles.reflection]}>
        {normalizedLevels.map((level, i) => (
          <WaveformBar
            key={`r-${i}`}
            level={level * 0.2}
            theme={theme}
            isActive={isActive}
            index={i}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: MAX_HEIGHT,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: MAX_HEIGHT,
    marginHorizontal: BAR_GAP / 2,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 0, // Sharp edges - brutalist
  },
  reflection: {
    opacity: 0.08,
    transform: [{ scaleY: -1 }],
    height: MAX_HEIGHT * 0.2,
    marginTop: 8,
  },
});
