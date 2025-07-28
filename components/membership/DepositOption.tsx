import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DepositOptionProps {
  amount: number;
  gems: number;
  bonus?: number;
  displayAmount: string;
  displayGems: string;
  popular?: boolean;
  onPress: (amount: number) => void;
}

export function DepositOption({
  amount,
  gems,
  bonus,
  displayAmount,
  displayGems,
  popular = false,
  onPress,
}: DepositOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.container, popular && styles.popularContainer]}
      onPress={() => onPress(amount)}
      activeOpacity={0.8}
    >
      {popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>PHỔ BIẾN</Text>
        </View>
      )}

      <View style={[styles.content, popular && styles.popularContent]}>
        <View style={styles.amountSection}>
          <Text style={styles.amount}>{displayAmount}</Text>
          <Text style={styles.gems}>{displayGems}</Text>
        </View>

        {bonus && bonus > 0 && (
          <View style={styles.bonusSection}>
            <Text style={styles.bonusText}>+{bonus} gems bonus!</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginHorizontal: 20,
    marginVertical: 8,
    overflow: "hidden",
  },
  popularContainer: {
    borderColor: "#58CC02",
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    backgroundColor: "#58CC02",
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: "center",
    position: "absolute",
    top: -8,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    padding: 20,
  },
  popularContent: {
    paddingTop: 30,
  },
  amountSection: {
    alignItems: "center",
  },
  amount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3C3C3C",
    marginBottom: 4,
  },
  gems: {
    fontSize: 16,
    fontWeight: "600",
    color: "#58CC02",
  },
  bonusSection: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 12,
    alignSelf: "center",
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#856404",
  },
});
