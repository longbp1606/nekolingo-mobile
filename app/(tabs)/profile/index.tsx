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
import {
  DepositHeader,
  DepositOption,
  VNPayWebView,
} from "../../../components/membership";
import { useAuth } from "../../../hooks/useAuth";
import { User } from "../../../services/auth/authApiService";
import {
  Transaction,
  useCreateDepositMutation,
  useGetTransactionHistoryQuery,
  WalletUtils,
} from "../../../services/walletApiService";

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
  if (xp < 500) return "Đồng";
  if (xp < 1999) return "Bạc";
  if (xp < 9999) return "Vàng";
  return "Kim Cương";
};

const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [createDeposit, { isLoading: isCreatingDeposit }] =
    useCreateDepositMutation();
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
  } = useGetTransactionHistoryQuery();
  const [activeTab, setActiveTab] = useState<
    "stats" | "deposit" | "transactions"
  >("stats");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await refetchTransactions();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleDeposit = async (amount: number) => {
    if (isCreatingDeposit) return;

    try {
      console.log("Creating deposit for amount:", amount);
      const response = await createDeposit({ amount }).unwrap();

      if (response.url) {
        setPaymentUrl(response.url);
        setWebViewVisible(true);
      } else {
        Alert.alert("Lỗi", "Không thể tạo thanh toán");
      }
    } catch (error: any) {
      console.error("Error creating deposit:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi tạo thanh toán";
      Alert.alert("Lỗi", errorMessage);
    }
  };

  const handlePaymentSuccess = () => {
    Alert.alert(
      "Thành công!",
      "Thanh toán đã được xử lý thành công. Số dư gem của bạn sẽ được cập nhật trong vài phút.",
      [
        {
          text: "OK",
          onPress: () => {
            refetchTransactions();
            setActiveTab("stats");
          },
        },
      ]
    );
  };

  const handlePaymentError = (error: string) => {
    Alert.alert("Thanh toán thất bại", error);
  };

  const handleCloseWebView = () => {
    setWebViewVisible(false);
    setPaymentUrl("");
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
    const streak =
      (userData as any).streak_days ||
      userData.streakDays ||
      userData.current_streak ||
      0;
    const totalXp = userData.xp || userData.total_xp || 0;
    const currentLevel =
      (userData as any).current_level ||
      userData.currentLevel ||
      userData.level ||
      1;
    const freezeCount =
      (userData as any).freeze_count !== undefined
        ? (userData as any).freeze_count
        : userData.freezeCount || 0;
    const isFreeze =
      (userData as any).is_freeze !== undefined
        ? (userData as any).is_freeze
        : userData.isFreeze || false;

    console.log("User data debug:", {
      raw_user: userData,
      streak_days: (userData as any).streak_days,
      streakDays: userData.streakDays,
      current_level: (userData as any).current_level,
      currentLevel: userData.currentLevel,
      xp: userData.xp,
      freeze_count: (userData as any).freeze_count,
      freezeCount: userData.freezeCount,
      is_freeze: (userData as any).is_freeze,
      isFreeze: userData.isFreeze,
      calculated_streak: streak,
      calculated_level: currentLevel,
      calculated_xp: totalXp,
      calculated_freeze_count: freezeCount,
      calculated_is_freeze: isFreeze,
    });

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
        value: totalXp.toString(),
        className: "lightning",
      },
      {
        icon: require("../../../assets/images/winner.png"),
        label: "Giải đấu hiện tại",
        value: getLeague(totalXp),
        className: "bronze",
      },
      {
        icon: require("../../../assets/images/trophy.png"),
        label: "Cấp độ hiện tại",
        value: currentLevel.toString(),
        className: "trophy",
      },
      {
        icon: require("../../../assets/images/star.png"),
        label: "Freeze bảo vệ",
        value: freezeCount === -1 ? "∞" : freezeCount.toString(),
        className: "freeze",
      },
      {
        icon: require("../../../assets/images/star-3d.png"),
        label: "Trạng thái freeze",
        value: isFreeze ? "Đang bảo vệ" : "Không hoạt động",
        className: isFreeze ? "freeze-active" : "freeze-inactive",
      },
    ];
  };

  const getLeague = (xp: number): string => {
    if (xp < 500) return "Đồng";
    if (xp < 1999) return "Bạc";
    if (xp < 9999) return "Vàng";
    return "Kim Cương";
  };

  const renderProfileHeader = (): ReactElement | null => {
    if (!user) return null;

    const displayName =
      user.full_name ||
      user.username ||
      user.email?.split("@")[0] ||
      "Người dùng";
    const handle = `@${user.email || user.email?.split("@")[0] || "user"}`;

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
          <View style={styles.gemBalanceHeader}>
            <Text style={styles.gemBalanceHeaderLabel}>Gems:</Text>
            <Text style={styles.gemBalanceHeaderValue}>
              {user?.balance || 0} 💎
            </Text>
          </View>
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
    const freezeCount =
      (user as any).freeze_count !== undefined
        ? (user as any).freeze_count
        : user.freezeCount || 0;
    const isFreeze =
      (user as any).is_freeze !== undefined
        ? (user as any).is_freeze
        : user.isFreeze || false;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gem & Thống kê</Text>
        <View style={styles.gemBalance}>
          <Text style={styles.gemBalanceLabel}>Số dư Gem hiện tại</Text>
          <Text style={styles.gemAmount}>{user?.balance || 0} 💎</Text>
        </View>

        {/* Freeze Status Info */}
        {(freezeCount > 0 || isFreeze) && (
          <View style={styles.freezeStatusCard}>
            <Text style={styles.freezeStatusTitle}>
              🛡️ Trạng thái Freeze Protection
            </Text>
            <Text style={styles.freezeStatusText}>
              {isFreeze
                ? "🟢 Streak của bạn đang được bảo vệ!"
                : // : freezeCount === -1
                // ? "⭐ Bạn có freeze bảo vệ không giới hạn"
                freezeCount > 0
                ? `⚡ Bạn có ${freezeCount} lần freeze bảo vệ`
                : "❌ Không có freeze bảo vệ"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderMainCard = (): ReactElement => {
    return (
      <View style={styles.card}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "stats" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("stats")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "stats" && styles.tabTextActive,
              ]}
            >
              THỐNG KÊ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "deposit" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("deposit")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "deposit" && styles.tabTextActive,
              ]}
            >
              NẠP GEM
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "transactions" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("transactions")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "transactions" && styles.tabTextActive,
              ]}
            >
              LỊCH SỬ
            </Text>
          </TouchableOpacity> */}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "stats" && renderStatsContent()}
          {activeTab === "deposit" && renderDepositContent()}
          {activeTab === "transactions" && renderTransactionContent()}
        </View>
      </View>
    );
  };

  const renderStatsContent = (): ReactElement | null => {
    if (!user) return null;

    const stats = getStatsFromUser(user);

    return (
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
    );
  };

  const renderDepositContent = (): ReactElement => {
    const depositOptions = WalletUtils.getDepositOptions();

    return (
      <View style={styles.depositContent}>
        <DepositHeader
          currentBalance={user?.balance || 0}
          title="Số dư hiện tại"
          subtitle="CHỌN GÓI NẠP PHÙ HỢP"
        />

        <View style={styles.depositOptions}>
          {depositOptions.map((option) => (
            <DepositOption
              key={option.amount}
              amount={option.amount}
              gems={option.gems}
              bonus={option.bonus}
              displayAmount={option.displayAmount}
              displayGems={option.displayGems}
              popular={option.popular}
              onPress={() => handleDeposit(option.amount)}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderTransactionContent = (): ReactElement => {
    if (isLoadingTransactions) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C2D1" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <View style={styles.emptyTransactions}>
          <Image
            source={require("../../../assets/images/chest.png")}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyMessage}>Chưa có giao dịch nào</Text>
        </View>
      );
    }

    return (
      <View style={styles.transactionsList}>
        {transactions.slice(0, 5).map((transaction: Transaction) => (
          <View key={transaction._id} style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
              <Text style={styles.transactionCode}>
                {transaction.transaction_code}
              </Text>
              <Text
                style={[
                  styles.transactionStatus,
                  { color: getTransactionStatusColor(transaction.status) },
                ]}
              >
                {getTransactionStatusText(transaction.status)}
              </Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionAmount}>
                {transaction.vnd_amount.toLocaleString("vi-VN")}₫
              </Text>
              <Text style={styles.transactionGems}>
                +{transaction.gem_amount} 💎
              </Text>
            </View>
            <Text style={styles.transactionDate}>
              {new Date(transaction.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        ))}
        {transactions.length > 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => {
              // Navigate to full transaction history if needed
            }}
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getTransactionStatusColor = (status: string): string => {
    switch (status) {
      case "SUCCESS":
        return "#4CAF50";
      case "PENDING":
        return "#FF9800";
      case "FAILED":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getTransactionStatusText = (status: string): string => {
    switch (status) {
      case "SUCCESS":
        return "Thành công";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      default:
        return status;
    }
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
        {renderMainCard()}
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

      <VNPayWebView
        visible={webViewVisible}
        paymentUrl={paymentUrl}
        onClose={handleCloseWebView}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
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
    width: "32%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: "700",
    color: "#4B4B4B",
    lineHeight: 24,
    textAlign: "center",
  },

  statLabel: {
    fontSize: 11,
    color: "#777",
    lineHeight: 14,
    textAlign: "center",
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

  // Deposit and transaction styles
  gemBalance: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
  },
  gemBalanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  gemAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  // Freeze status card
  freezeStatusCard: {
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#00C2D1",
  },

  freezeStatusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },

  freezeStatusText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  depositContent: {
    paddingTop: 16,
  },
  depositOptions: {
    marginTop: 16,
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 40,
  },
  transactionsList: {
    paddingTop: 16,
  },
  transactionItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  transactionCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  transactionGems: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  viewAllButton: {
    backgroundColor: "#00C2D1",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  viewAllText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
});

export default ProfileScreen;
