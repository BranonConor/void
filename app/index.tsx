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
    marginBottom: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: 16,
    fontFamily: "Courier",
  },
  logoDot: {
    width: 4,
    height: 4,
    borderRadius: 0,
    marginLeft: 2,
    marginTop: -16,
  },
  subtitle: {
    fontSize: 9,
    letterSpacing: 8,
    fontWeight: "300",
    marginBottom: 60,
    fontFamily: "Courier",
  },
  buttonContainer: {
    marginBottom: 48,
  },
  sessionsHeader: {
    width: "100%",
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 9,
    letterSpacing: 6,
    fontWeight: "300",
    marginBottom: 12,
    fontFamily: "Courier",
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
    fontSize: 12,
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
