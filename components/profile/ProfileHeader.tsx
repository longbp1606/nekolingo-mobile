import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "../../services/auth/authApiService";

interface ProfileHeaderProps {
  user: User;
  onLogout: () => void;
}

const formatJoinDate = (dateString: string | undefined): string => {
  if (!dateString) return "Ngày tham gia không xác định";

  const date = new Date(dateString);
  const months = [
    "Tháng Một",
    "Tháng Hai",
    "Tháng Ba",
    "Tháng Tư",
    "Tháng Năm",
    "Tháng Sáu",
    "Tháng Bảy",
    "Tháng Tám",
    "Tháng Chín",
    "Tháng Mười",
    "Tháng Mười Một",
    "Tháng Mười Hai",
  ];
  return `Đã tham gia ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onLogout }) => {
  const displayName =
    user.full_name ||
    user.username ||
    user.email?.split("@")[0] ||
    "Người dùng";
  const handle = `@${user.email || user.email?.split("@")[0] || "user"}`;

  return (
    <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.editButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={20} color="white" />
      </TouchableOpacity>

      <View style={styles.profileAvatar}>
        <View style={styles.avatarPlaceholder}>
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{String(displayName || "")}</Text>
        <Text style={styles.profileHandle}>{String(handle || "")}</Text>
        <Text style={styles.profileJoinDate}>
          {formatJoinDate(user.createdAt || user.created_at)}
        </Text>
        <View style={styles.gemBalanceHeader}>
          <Text style={styles.gemBalanceHeaderLabel}>Gems:</Text>
          <Text style={styles.gemBalanceHeaderValue}>
            {user?.balance || 0} 💎
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    borderRadius: 16,
    padding: 20,
    marginTop: 30,
    marginBottom: 20,
    position: "relative",
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#87CEEB",
  },

  editButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatar: {
    marginBottom: 20,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 3,
    borderColor: "white",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },

  profileInfo: {
    alignItems: "center",
  },

  profileName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#4B4B4B",
    marginBottom: 5,
  },

  profileHandle: {
    fontSize: 16,
    color: "white",
    marginBottom: 8,
  },

  profileJoinDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },

  gemBalanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "center",
  },

  gemBalanceHeaderLabel: {
    fontSize: 14,
    color: "white",
    marginRight: 8,
  },

  gemBalanceHeaderValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
});

export default ProfileHeader;
