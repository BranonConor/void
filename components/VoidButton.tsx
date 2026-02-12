import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { ThemeColors } from "../types";

interface VoidButtonProps {
  title: string;
  onPress: () => void;
  theme: ThemeColors;
  variant?: "primary" | "secondary" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function VoidButton({
  title,
  onPress,
  theme,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
}: VoidButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: 14, paddingHorizontal: 28, borderRadius: 26 },
      medium: { paddingVertical: 18, paddingHorizontal: 40, borderRadius: 30 },
      large: { paddingVertical: 22, paddingHorizontal: 48, borderRadius: 34 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
      },
      secondary: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      ghost: { backgroundColor: "transparent" },
    };

    return {
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizes: Record<string, number> = { small: 11, medium: 13, large: 16 };

    return {
      fontSize: sizes[size],
      fontWeight: "400",
      letterSpacing: 3,
      textTransform: "lowercase",
      color: "rgba(255, 255, 255, 0.9)",
      fontFamily: "SpaceMono",
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator color="rgba(255, 255, 255, 0.9)" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
