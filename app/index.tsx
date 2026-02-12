import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
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
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: 20,
    fontFamily: "Courier",
  },
  buttonContainer: {
    marginBottom: 60,
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
    fontWeight: "300",
    letterSpacing: 4,
    marginBottom: 8,
    fontFamily: "Courier",
  },
  emptySubtext: {
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier",
    fontWeight: "300",
  },
});
