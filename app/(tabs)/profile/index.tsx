import type { ReactElement } from "react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AchievementList from "../../../components/AchievementList";
import PopupInvite from "../../../components/PopupInvite";
import { VNPayWebView } from "../../../components/membership";
import {
  DepositContent,
  ProfileHeader,
  ProfileTabs,
  StatsContent,
  TransactionContent,
} from "../../../components/profile";
import { useAuth } from "../../../hooks/useAuth";
import {
  useCreateDepositMutation,
  useGetTransactionHistoryQuery,
} from "../../../services/walletApiService";

const ProfileScreen: React.FC = () => {
  const { user, isAuthenticated, logout, refetchProfile } = useAuth();
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
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchTransactions()]);
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

  const handlePaymentSuccess = async () => {
    // Refresh user profile to get updated balance
    await refetchProfile();
    await refetchTransactions();

    Alert.alert(
      "Thành công!",
      "Thanh toán đã được xử lý thành công. Số dư gem của bạn đã được cập nhật.",
      [
        {
          text: "OK",
          onPress: () => {
            setActiveTab("stats"); // Switch to stats tab to show updated balance
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

  const renderMainCard = (): ReactElement => {
    return (
      <View style={styles.card}>
        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={styles.tabContent}>
          {activeTab === "stats" && user && <StatsContent user={user} />}
          {activeTab === "deposit" && (
            <DepositContent
              userBalance={user?.balance || 0}
              onDeposit={handleDeposit}
              isCreatingDeposit={isCreatingDeposit}
            />
          )}
          {activeTab === "transactions" && (
            <TransactionContent
              transactions={transactions}
              isLoadingTransactions={isLoadingTransactions}
            />
          )}
        </View>
      </View>
    );
  };

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
        <ProfileHeader user={user} onLogout={handleLogout} />
        {renderMainCard()}
        {/* <InviteFriendsCard onInvite={() => setShowPopup(true)} /> */}
        {isAuthenticated && user && (user.id || user._id) && (
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

  // Card Styles
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    marginBottom: 20,
  },

  tabContent: {
    padding: 20,
    alignItems: "center",
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
