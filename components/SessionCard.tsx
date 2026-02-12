import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { FocusSession, ThemeColors } from "../types";

interface SessionCardProps {
  session: FocusSession;
  theme: ThemeColors;
  onDelete?: (id: string) => void;
  formatDuration: (seconds: number) => string;
  formatTime: (timestamp: number) => string;
  formatDate: (timestamp: number) => string;
}

export function SessionCard({
  session,
  theme,
  onDelete,
  formatDuration,
  formatTime,
  formatDate,
}: SessionCardProps) {
  const handleLongPress = () => {
    if (onDelete && !session.isActive) {
      Alert.alert("Delete Session", "Delete this session?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(session.id),
        },
      ]);
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderColor: session.isActive ? theme.accent : theme.border,
          borderWidth: session.isActive ? 2 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.dateRow}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(session.startTime)}
          </Text>
          {session.isActive && (
            <View style={[styles.badge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.badgeText, { color: theme.background }]}>
                ACTIVE
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.time, { color: theme.textSecondary }]}>
          {formatTime(session.startTime)}
          {session.endTime && ` - ${formatTime(session.endTime)}`}
        </Text>
      </View>
      <View>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          DURATION
        </Text>
        <Text style={[styles.duration, { color: theme.text }]}>
          {session.isActive ? "..." : formatDuration(session.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  time: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 4,
  },
  duration: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
