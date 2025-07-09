import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlanProps {
  title: string;
  badge?: string;
  features: PlanFeature[];
  price: string;
  buttonText: string;
  isRecommended?: boolean;
  avatars?: string[];
  memberCount?: string;
  onSubscribe?: () => void;
}

export function SubscriptionPlan({
  title,
  badge,
  features,
  price,
  buttonText,
  isRecommended = false,
  avatars,
  memberCount,
  onSubscribe,
}: SubscriptionPlanProps) {
  return (
    <View
      style={[styles.planContainer, isRecommended && styles.recommendedPlan]}
    >
      {isRecommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>ĐỀ XUẤT</Text>
        </View>
      )}

      <View style={styles.planContent}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>{title}</Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          {avatars && (
            <View style={styles.avatarContainer}>
              {avatars.map((avatar, index) => (
                <View
                  key={index}
                  style={[styles.avatar, { zIndex: avatars.length - index }]}
                >
                  <Text style={styles.avatarText}>{avatar}</Text>
                </View>
              ))}
              {memberCount && (
                <View style={styles.memberCount}>
                  <Text style={styles.memberCountText}>{memberCount}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text
                style={[
                  styles.checkIcon,
                  feature.included ? styles.included : styles.excluded,
                ]}
              >
                {feature.included ? "✓" : "✗"}
              </Text>
              <Text
                style={[
                  styles.featureText,
                  !feature.included && styles.excludedText,
                ]}
              >
                {feature.text}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
          <Text style={styles.subscribeButtonText}>{buttonText}</Text>
          <Text style={styles.priceText}>{price}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  planContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  recommendedPlan: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  recommendedBadge: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    alignItems: "center",
  },
  recommendedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  planContent: {
    padding: 20,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  badge: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 12,
  },
  memberCount: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 5,
  },
  memberCountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  included: {
    color: "#4CAF50",
  },
  excluded: {
    color: "#F44336",
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  excludedText: {
    color: "#999",
    textDecorationLine: "line-through",
  },
  subscribeButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  subscribeButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  priceText: {
    color: "#666",
    fontSize: 14,
  },
});
