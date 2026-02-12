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
import { VoidButton, SessionCard } from "../components";
import { useFocusMode } from "../hooks/useFocusMode";
import { FocusSession } from "../types";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark" ? "dark" : "light");
  const router = useRouter();

  const {
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

  const renderSession = ({ item }: { item: FocusSession }) => (
    <SessionCard
      session={item}
      theme={theme}
      onDelete={deleteSession}
      formatDuration={formatDuration}
      formatTime={formatTime}
      formatDate={formatDate}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        No sessions yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
        Enter the void to begin
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: theme.text }]}>VOID</Text>
        <View style={[styles.logoDot, { backgroundColor: theme.accent }]} />
      </View>

      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        FOCUS • BREATHE • BE
      </Text>

      <View style={styles.buttonContainer}>
        <VoidButton
          title="Enter the Void"
          onPress={handleEnterVoid}
          theme={theme}
          variant="primary"
          size="large"
        />
      </View>

      {sessions.filter((s) => !s.isActive).length > 0 && (
        <View style={styles.sessionsHeader}>
          <Text style={[styles.sessionsTitle, { color: theme.textSecondary }]}>
            SESSION HISTORY
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <FlatList
        data={sessions.filter((s) => !s.isActive)}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshSessions}
            tintColor={theme.accent}
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
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 12,
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
    marginTop: -24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 6,
    fontWeight: "500",
    marginBottom: 48,
  },
  buttonContainer: {
    marginBottom: 48,
  },
  sessionsHeader: {
    width: "100%",
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "600",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 12,
    letterSpacing: 1,
  },
});
