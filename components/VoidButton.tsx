import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
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
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 14, paddingHorizontal: 28 },
      large: { paddingVertical: 18, paddingHorizontal: 36 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: theme.accent,
        borderWidth: 2,
        borderColor: theme.accent,
      },
      secondary: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: theme.accent,
      },
      ghost: { backgroundColor: "transparent" },
    };

    return {
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizes: Record<string, number> = { small: 12, medium: 16, large: 20 };
    const colors: Record<string, string> = {
      primary: theme.background,
      secondary: theme.accent,
      ghost: theme.text,
    };

    return {
      fontSize: sizes[size],
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: colors[variant],
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? theme.background : theme.accent}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({});
