import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Colors, Sizes } from "../constants";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "elevated" | "flat";
}

const Card = ({ children, style, variant = "default" }: CardProps) => {
  const getCardStyle = () => {
    switch (variant) {
      case "elevated":
        return styles.elevated;
      case "flat":
        return styles.flat;
      default:
        return styles.default;
    }
  };

  return <View style={[styles.card, getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: Sizes.md,
  },
  default: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  elevated: {
    backgroundColor: Colors.background,
    shadowColor: Colors.textDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flat: {
    backgroundColor: Colors.card,
  },
});

export default Card;
