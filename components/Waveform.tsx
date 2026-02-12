import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { ThemeColors } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = 5; // Chunkier bars for lo-fi look
const BAR_GAP = 5; // More gap between bars
const BAR_TOTAL_WIDTH = BAR_WIDTH + BAR_GAP;
const BAR_COUNT = Math.floor(SCREEN_WIDTH / BAR_TOTAL_WIDTH); // ~39 bars on iPhone
const MAX_HEIGHT = 140; // Taller for more impressive visuals
const MIN_HEIGHT = 2;

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
  total: number;
}

function WaveformBar({ level, theme, isActive, index, total }: BarProps) {
  const heightAnim = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Smooth easing for organic feel
    const easedLevel = Math.pow(level, 1.3);

    // Add subtle wave pattern based on position
    const positionWave = Math.sin((index / total) * Math.PI) * 0.15;
    const adjustedLevel = Math.max(
      0,
      easedLevel + (isActive ? positionWave * easedLevel : 0),
    );

    const targetHeight = isActive
      ? Math.max(MIN_HEIGHT, adjustedLevel * MAX_HEIGHT)
      : MIN_HEIGHT;

    // Higher base opacity, more visible
    const targetOpacity = isActive
      ? 0.4 + easedLevel * 0.6 // 0.4 to 1.0 - much more visible
      : 0.2;

    // Smooth spring-like animation
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: targetHeight,
        damping: 12,
        stiffness: 100,
        mass: 0.8,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [level, isActive, heightAnim, opacityAnim, index, total]);

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
    const safelevels = levels || [];
    if (safelevels.length >= BAR_COUNT) {
      return safelevels.slice(0, BAR_COUNT);
    }
    // Pad with zeros
    return [...safelevels, ...new Array(BAR_COUNT - safelevels.length).fill(0)];
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
            total={BAR_COUNT}
          />
        ))}
      </View>

      {/* Reflection - more visible */}
      <View style={[styles.waveformRow, styles.reflection]}>
        {normalizedLevels.map((level, i) => (
          <WaveformBar
            key={`r-${i}`}
            level={level * 0.35}
            theme={theme}
            isActive={isActive}
            index={i}
            total={BAR_COUNT}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: SCREEN_WIDTH,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    height: MAX_HEIGHT,
    width: SCREEN_WIDTH,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: MAX_HEIGHT,
    width: BAR_TOTAL_WIDTH,
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 1, // Slightly rounded for smoother look
  },
  reflection: {
    opacity: 0.15,
    transform: [{ scaleY: -1 }],
    height: MAX_HEIGHT * 0.3,
    marginTop: 4,
  },
});
