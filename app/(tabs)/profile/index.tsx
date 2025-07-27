import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchievementList from "../../../components/AchievementList";
import PopupInvite from "../../../components/PopupInvite";
import { useAuth } from "../../../hooks/useAuth";
import { User } from "../../../services/auth/authApiService";

const { width } = Dimensions.get("window");

interface FollowUser {
  name?: string;
  username?: string;
  email?: string;
}

interface StatItem {
  icon: any;
  label: string;
  value: string;
  className: string;
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

const getLeague = (xp: number): string => {
  if (xp < 100) return "Đồng";
  if (xp < 300) return "Bạc";
  if (xp < 600) return "Vàng";
  if (xp < 1000) return "Bạch Kim";
  return "Kim Cương";
};

const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    // TODO: Add profile refresh logic here if needed
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const getStatsFromUser = (userData: User): StatItem[] => {
    const streak = userData.streakDays || userData.current_streak || 0;
    const xp = userData.xp || userData.total_xp || 0;
    const weeklyXp = userData.weeklyXp || 0;

    return [
      {
        icon: require("../../../assets/images/flame.png"),
        label: "Ngày streak",
        value: streak.toString(),
        className: "streak",
      },
      {
        icon: require("../../../assets/images/lightning.png"),
        label: "Tổng điểm XP",
        value: xp.toString(),
        className: "lightning",
      },
      {
        icon: require("../../../assets/images/winner.png"),
        label: "Giải đấu hiện tại",
        value: getLeague(weeklyXp || xp),
        className: "bronze",
      },
      {
        icon: require("../../../assets/images/trophy.png"),
        label: "Cấp độ hiện tại",
        value: (userData.currentLevel || userData.level || 1).toString(),
        className: "trophy",
      },
    ];
  };

  const renderProfileHeader = (): ReactElement | null => {
    if (!user) return null;

    const displayName =
      user.full_name ||
      user.username ||
      user.email?.split("@")[0] ||
      "Người dùng";
    const handle = `@${user.username || user.email?.split("@")[0] || "user"}`;

    return (
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.editButton} onPress={handleLogout}>
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
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileHandle}>{handle}</Text>
          <Text style={styles.profileJoinDate}>
            {formatJoinDate(user.createdAt || user.created_at)}
          </Text>
          <View style={styles.followSection}>
            <Text style={styles.followStats}>
              Đang theo dõi {followingList.length || 0}
            </Text>
            <Text style={styles.followStats}>
              {followersList.length || 0} Người theo dõi
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsCard = (): ReactElement | null => {
    if (!user) return null;

    const stats = getStatsFromUser(user);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thống kê</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat: StatItem, index: number) => (
            <View key={index} style={styles.statCard}>
              <Image source={stat.icon} style={styles.statImg} />
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderFollowCard = (): ReactElement => {
    const currentList =
      activeTab === "following" ? followingList : followersList;
    const hasData = currentList && currentList.length > 0;

    return (
      <View style={styles.card}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "following" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("following")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "following" && styles.tabTextActive,
              ]}
            >
              ĐANG THEO DÕI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "followers" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("followers")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "followers" && styles.tabTextActive,
              ]}
            >
              NGƯỜI THEO DỖI
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {hasData ? (
            <View style={styles.followList}>
              {currentList.map((item, index) => (
                <View key={index} style={styles.followItem}>
                  <Text>{item.name || item.username || item.email}</Text>
                </View>
              ))}
            </View>
          ) : (
            <>
              <Image
                source={
                  activeTab === "following"
                    ? require("../../../assets/images/following.gif")
                    : require("../../../assets/images/addfriend.gif")
                }
                style={styles.emptyImage}
              />
              <Text style={styles.emptyMessage}>
                {activeTab === "following"
                  ? "Kết nối bạn bè giúp học vui và hiệu quả hơn."
                  : "Chưa có người theo dõi"}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderAddFriendsCard = (): ReactElement => (
    <View style={styles.card}>
      <View style={styles.content}>
        <Image
          source={require("../../../assets/images/add.png")}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mời bạn bè</Text>
          <Text style={styles.description}>
            Chia sẻ với bạn bè về ứng dụng học ngoại ngữ thú vị - Nekolingo nhé!
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowPopup(true)}
      >
        <Text style={styles.buttonText}>GỬI LỜI MỜI</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingScreen = (): ReactElement => (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Đang tải thông tin...</Text>
    </SafeAreaView>
  );

  const renderUnauthenticatedScreen = (): ReactElement => (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorText}>Chưa đăng nhập</Text>
      <Text style={styles.errorMessage}>
        Vui lòng đăng nhập để xem thông tin cá nhân
      </Text>
    </SafeAreaView>
  );

  if (!isAuthenticated || !user) {
    return renderUnauthenticatedScreen();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
      >
        {renderProfileHeader()}
        {renderStatsCard()}
        {renderFollowCard()}
        {renderAddFriendsCard()}
        {user && (user.id || user._id) && (
          <AchievementList
            userId={user.id || user._id || ""}
            userStats={{
              xp: user.xp || user.total_xp || 0,
              completed_lessons: 0,
              completed_courses: 0,
              has_practiced: (user.xp || user.total_xp || 0) > 0,
              streak_days: user.streakDays || user.current_streak || 0,
              perfect_lessons: 0,
            }}
            limit={3}
            showViewAll={true}
          />
        )}

        {showPopup && (
          <PopupInvite
            visible={showPopup}
            onClose={() => setShowPopup(false)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingHorizontal: 15,
  },

  // Profile Header
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
    marginBottom: 20,
  },

  followSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  followStats: {
    fontSize: 14,
    color: "white",
  },

  // Card Styles
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#4B4B4B",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 16,
    backgroundColor: "#fff",
  },

  statImg: {
    width: 38,
    height: 38,
    marginTop: 5,
    marginBottom: 5,
    resizeMode: "contain",
  },

  statInfo: {
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4B4B4B",
    lineHeight: 26,
  },

  statLabel: {
    fontSize: 12,
    color: "#777",
    lineHeight: 16,
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  tabButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#00C2D1",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B4B4B",
  },

  tabTextActive: {
    color: "#00C2D1",
  },

  tabContent: {
    padding: 20,
    alignItems: "center",
  },

  followList: {
    width: "100%",
  },
  followItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },

  emptyMessage: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },

  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  image: {
    width: 90,
    height: 90,
    marginRight: 12,
    marginTop: -10,
    marginBottom: -15,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4B4B4B",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#00C2D1",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4444",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
});

export default ProfileScreen;
