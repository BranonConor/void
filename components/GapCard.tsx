import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeColors } from "../types";

interface GapCardProps {
  days: number;
  theme: ThemeColors;
}

// Encouraging messages for time spent away from the app
const getGapMessage = (days: number): string => {
  if (days === 1) return "lived real life for a day";
  if (days < 7) return `lived real life for ${days} days`;
  if (days < 14) return "lived real life for a week";
  if (days < 30) return `lived real life for ${Math.floor(days / 7)} weeks`;
  return `lived real life for ${Math.floor(days / 30)} months`;
};

export function GapCard({ days, theme }: GapCardProps) {
  return (
    <View style={[styles.container, { borderColor: theme.border }]}>
      <Text style={[styles.text, { color: theme.textSecondary }]}>
        {getGapMessage(days)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 1,
    marginLeft: 4,
  },
  text: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "300",
    fontFamily: "Courier",
    fontStyle: "italic",
  },
});
