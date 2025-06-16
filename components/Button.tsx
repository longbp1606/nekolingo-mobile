import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { Colors, Sizes } from "../constants";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "tertiary" | "outline";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
}

const Button = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.border;

    switch (variant) {
      case "primary":
        return Colors.primary;
      case "secondary":
        return Colors.secondary;
      case "tertiary":
        return Colors.quaternary;
      case "outline":
        return "transparent";
      default:
        return Colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return Colors.border;

    switch (variant) {
      case "outline":
        return Colors.primary;
      default:
        return "transparent";
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textLight;

    switch (variant) {
      case "primary":
        return Colors.background;
      case "secondary":
        return Colors.textDark;
      case "tertiary":
        return Colors.background;
      case "outline":
        return Colors.primary;
      default:
        return Colors.background;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "small":
        return styles.buttonSmall;
      case "medium":
        return styles.buttonMedium;
      case "large":
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return styles.textSmall;
      case "medium":
        return styles.textMedium;
      case "large":
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={loading || disabled}
      style={[
        styles.button,
        getButtonSize(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? Colors.primary : Colors.background}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextSize(),
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderWidth: 2,
  },
  buttonSmall: {
    paddingVertical: Sizes.xs,
    paddingHorizontal: Sizes.md,
    height: 36,
  },
  buttonMedium: {
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.md,
    height: 48,
  },
  buttonLarge: {
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    height: 56,
  },
  text: {
    fontWeight: "700",
    textAlign: "center",
  },
  textSmall: {
    fontSize: Sizes.small,
  },
  textMedium: {
    fontSize: Sizes.body,
  },
  textLarge: {
    fontSize: Sizes.h4,
  },
});

export default Button;
