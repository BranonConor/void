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
      Alert.alert("", "delete this session?", [
        { text: "cancel", style: "cancel" },
        {
          text: "delete",
          style: "destructive",
          onPress: () => onDelete(session.id),
        },
      ]);
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.6}
      style={[styles.container, { borderColor: theme.border }]}
    >
      {/* Timeline connector */}
      <View style={[styles.timelineConnector, { backgroundColor: theme.border }]} />
      
      {/* Session content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(session.startTime)}
          </Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>
            {formatTime(session.startTime)}
          </Text>
        </View>
        
        <Text style={[styles.duration, { color: theme.text }]}>
          {session.isActive ? "..." : formatDuration(session.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 12,
    paddingLeft: 4,
  },
  timelineConnector: {
    width: 1,
    marginRight: 16,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  date: {
    fontSize: 9,
    fontWeight: "300",
    letterSpacing: 3,
    fontFamily: "Courier",
  },
  time: {
    fontSize: 9,
    fontFamily: "Courier",
    fontWeight: "300",
    letterSpacing: 1,
  },
  duration: {
    fontSize: 16,
    fontWeight: "300",
    letterSpacing: 3,
    fontFamily: "Courier",
  },
});
