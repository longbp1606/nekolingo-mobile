import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DepositHeaderProps {
  title: string;
  subtitle: string;
  currentBalance: number;
}

export function DepositHeader({
  title,
  subtitle,
  currentBalance,
}: DepositHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceAmount}>{currentBalance}</Text>
          <Text style={styles.gemIcon}>💎</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#3C3C3C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#777777",
    textAlign: "center",
    marginBottom: 20,
  },
  balanceContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C757D",
    textAlign: "center",
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#58CC02",
    marginRight: 8,
  },
  gemIcon: {
    fontSize: 24,
  },
});
