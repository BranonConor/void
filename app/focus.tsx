import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getTheme } from "../theme/colors";
import { Waveform, VoidButton } from "../components";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";
import { useFocusMode } from "../hooks/useFocusMode";

export default function FocusScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark" ? "dark" : "light");
  const router = useRouter();

  const { isInFocus, elapsedTime, enterTheVoid, exitTheVoid, formatDuration } =
    useFocusMode();

  const { audioData, hasPermission, isRecording } = useAudioAnalyzer(isInFocus);

  useEffect(() => {
    enterTheVoid();
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      handleExit();
      return true;
    });
    return () => handler.remove();
  }, []);

  const handleExit = async () => {
    await exitTheVoid();
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.timer, { color: theme.textSecondary }]}>
            {formatDuration(elapsedTime)}
          </Text>
        </View>

        <View style={styles.waveformContainer}>
          <Waveform
            levels={audioData.levels}
            theme={theme}
            isActive={isRecording}
          />

          {hasPermission === false && (
            <View style={styles.permissionWarning}>
              <Text
                style={[styles.permissionText, { color: theme.textSecondary }]}
              >
                Microphone access required
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.statusText, { color: theme.textSecondary }]}>
            IN THE VOID
          </Text>
        </View>

        <View style={styles.footer}>
          <VoidButton
            title="Exit the Void"
            onPress={handleExit}
            theme={theme}
            variant="ghost"
            size="medium"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
  },
  timer: {
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: "500",
  },
  waveformContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionWarning: {
    position: "absolute",
    bottom: -60,
    alignItems: "center",
  },
  permissionText: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
});
