import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import { getTheme } from "../theme/colors";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark" ? "dark" : "light");

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="focus"
          options={{ animation: "fade", gestureEnabled: false }}
        />
      </Stack>
    </View>
  );
}
