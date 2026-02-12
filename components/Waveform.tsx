import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemeColors } from "../types";

const MAX_HEIGHT = 120;

interface WaveformProps {
  levels: number[];
  theme: ThemeColors;
  isActive: boolean;
}

interface BarProps {
  level: number;
  theme: ThemeColors;
  isActive: boolean;
}

function WaveformBar({ level, theme, isActive }: BarProps) {
  const heightAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const targetHeight = isActive
      ? Math.max(4, Math.round((level * MAX_HEIGHT) / 8) * 8)
      : 4;
    Animated.spring(heightAnim, {
      toValue: targetHeight,
      damping: 15,
      stiffness: 150,
      mass: 0.5,
      useNativeDriver: false,
    }).start();
  }, [level, isActive, heightAnim]);

  return (
    <View style={styles.barContainer}>
      <Animated.View
        style={[
          styles.bar,
          {
            height: heightAnim,
            backgroundColor: theme.waveform,
          },
        ]}
      />
    </View>
  );
}

export function Waveform({ levels, theme, isActive }: WaveformProps) {
  return (
    <View style={styles.container}>
      <View style={styles.waveformRow}>
        {levels.map((level, i) => (
          <WaveformBar
            key={i}
            level={level}
            theme={theme}
            isActive={isActive}
          />
        ))}
      </View>
      <View style={[styles.waveformRow, styles.reflection]}>
        {levels.map((level, i) => (
          <WaveformBar
            key={`r-${i}`}
            level={level * 0.3}
            theme={theme}
            isActive={isActive}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: MAX_HEIGHT,
  },
  barContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: MAX_HEIGHT,
    marginHorizontal: 1,
  },
  bar: {
    width: 6,
    borderRadius: 2,
  },
  reflection: {
    opacity: 0.15,
    transform: [{ scaleY: -1 }],
    height: MAX_HEIGHT * 0.3,
  },
});
