import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getTheme } from "../theme/colors";
import { VoidButton, SessionCard, GapCard } from "../components";
import { useFocusMode } from "../hooks/useFocusMode";
import { TimelineItem } from "../types";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark" ? "dark" : "light");
  const router = useRouter();

  const {
    timeline,
    sessions,
    isLoading,
    deleteSession,
    formatDuration,
    formatTime,
    formatDate,
    refreshSessions,
  } = useFocusMode();

  const handleEnterVoid = () => {
    router.push("/focus");
  };

  const handleExportData = async () => {
    if (sessions.length === 0) {
      Alert.alert("no data", "no sessions to export yet");
      return;
    }

    const exportData = {
      exported: new Date().toISOString(),
      totalSessions: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        startTime: new Date(s.startTime).toISOString(),
        endTime: s.endTime ? new Date(s.endTime).toISOString() : null,
        durationSeconds: s.duration,
        durationFormatted: formatDuration(s.duration),
      })),
    };

    try {
      await Share.share({
        message: JSON.stringify(exportData, null, 2),
        title: "void sessions",
      });
    } catch {
      // User cancelled
    }
  };

  const renderTimelineItem = ({ item }: { item: TimelineItem }) => {
    if (item.type === "gap") {
      return <GapCard days={item.duration} theme={theme} />;
    }

    // It's a session
    return (
      <SessionCard
        session={{
          id: item.id,
          startTime: item.startTime,
          endTime: item.endTime,
          duration: item.duration,
          isActive: false,
        }}
        theme={theme}
        onDelete={deleteSession}
        formatDuration={formatDuration}
        formatTime={formatTime}
        formatDate={formatDate}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        no sessions yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        enter the void to begin
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: theme.text }]}>void</Text>
      </View>

      <View style={styles.buttonContainer}>
        <VoidButton
          title="enter the void"
          onPress={handleEnterVoid}
          theme={theme}
          variant="secondary"
          size="medium"
        />
      </View>

      {sessions.length > 0 && (
        <Pressable onPress={handleExportData} style={styles.exportButton}>
          <Text style={[styles.exportText, { color: theme.textSecondary }]}>
            export data
          </Text>
        </Pressable>
      )}

      {timeline.length > 0 && (
        <View style={styles.timelineHeader}>
          <View
            style={[styles.timelineLine, { backgroundColor: theme.border }]}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={timeline}
        renderItem={renderTimelineItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshSessions}
            tintColor={theme.textSecondary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    fontSize: 22,
    fontWeight: "400",
    letterSpacing: 16,
    fontFamily: "SpaceMono",
  },
  buttonContainer: {
    marginBottom: 60,
  },
  exportButton: {
    marginBottom: 40,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  exportText: {
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 2,
    fontFamily: "SpaceMono",
    textTransform: "lowercase",
  },
  timelineHeader: {
    width: "100%",
    alignItems: "center",
  },
  timelineLine: {
    width: 1,
    height: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 11,
    fontWeight: "400",
    letterSpacing: 3,
    marginBottom: 8,
    fontFamily: "SpaceMono",
  },
  emptySubtext: {
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "SpaceMono",
    fontWeight: "400",
  },
});
