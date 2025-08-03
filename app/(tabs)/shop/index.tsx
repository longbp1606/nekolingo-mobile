import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../hooks/useAuth";
import {
  ShopItem as ApiShopItem,
  canPurchaseItem,
  getTodaysPurchases,
  getUserInventory,
  ShopItemDisplayInfo,
  useGetShopItemsQuery,
  useGetShopStatusQuery,
  usePurchaseItemMutation,
} from "../../../services/shopApiService";

export default function ShopScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    data: shopItemsData,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems,
  } = useGetShopItemsQuery();
  const {
    data: shopStatusData,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useGetShopStatusQuery();
  const [purchaseItem, { isLoading: isPurchasing }] = usePurchaseItemMutation();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "boost" | "unlock" | "cosmetic"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchItems(), refetchStatus()]);
    setRefreshing(false);
  };

  const handlePurchase = async (item: ApiShopItem) => {
    const userBalance = user?.balance || 0;
    const displayInfo =
      ShopItemDisplayInfo[item.item as keyof typeof ShopItemDisplayInfo];

    // Check if item can be purchased based on shop status
    const purchaseCheck = canPurchaseItem(item, shopStatusData?.status || null);
    if (!purchaseCheck.canPurchase) {
      Alert.alert(
        "Không thể mua",
        purchaseCheck.reason || "Không thể mua vật phẩm này"
      );
      return;
    }

    // Check legacy purchased status
    if (item.purchased) {
      Alert.alert("Đã mua", "Bạn đã mua vật phẩm này rồi!");
      return;
    }

    if (userBalance < item.price) {
      Alert.alert(
        "Không đủ Gems",
        `Bạn cần ${item.price} gems để mua ${
          displayInfo?.name || item.item
        }. Số dư hiện tại: ${userBalance} gems.`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Nạp Gems",
            onPress: () => {
              // Navigate to profile with deposit tab
              router.push("/(tabs)/profile");
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      "Xác nhận mua hàng",
      `Bạn có muốn mua ${displayInfo?.name || item.item} với ${
        item.price
      } gems?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Mua",
          onPress: async () => {
            try {
              const result = await purchaseItem({ item: item.item }).unwrap();
              Alert.alert(
                "Thành công!",
                `Đã mua ${displayInfo?.name || item.item}! Số dư còn lại: ${
                  result.remaining_balance
                } gems.`
              );
            } catch (error: any) {
              let errorMessage = "Có lỗi xảy ra khi mua vật phẩm";

              // Handle specific error for daily purchase limit
              if (
                error?.data?.message === "You have purchased this item today"
              ) {
                errorMessage =
                  "Bạn đã mua vật phẩm này hôm nay rồi. Vui lòng thử lại vào ngày mai.";
              } else if (error?.data?.message) {
                errorMessage = error.data.message;
              } else if (error?.message) {
                errorMessage = error.message;
              }

              Alert.alert("Lỗi", errorMessage);
            }
          },
        },
      ]
    );
  };

  // Combine shop items with purchase status from history
  const shopItems = shopItemsData?.items || [];
  const todaysPurchases = shopStatusData
    ? getTodaysPurchases(shopStatusData.history)
    : [];
  const todaysPurchaseItems = new Set(todaysPurchases.map((p) => p.item));

  const itemsWithPurchaseStatus = shopItems.map((item) => ({
    ...item,
    purchasedToday: todaysPurchaseItems.has(item.item),
  }));

  const filteredItems =
    selectedCategory === "all"
      ? itemsWithPurchaseStatus
      : itemsWithPurchaseStatus.filter((item) => {
          const displayInfo =
            ShopItemDisplayInfo[item.item as keyof typeof ShopItemDisplayInfo];
          return displayInfo?.type === selectedCategory;
        });

  const renderCategoryButton = (
    category: typeof selectedCategory,
    label: string
  ) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderUserStats = () => {
    if (!user || !shopStatusData) return null;

    const hearts = user.hearts || 0;
    const inventory = getUserInventory(shopStatusData.status);
    const todaysPurchases = getTodaysPurchases(shopStatusData.history);

    return (
      <View style={styles.userStatsContainer}>
        <Text style={styles.userStatsTitle}>Trạng thái hiện tại:</Text>
        <View style={styles.userStatsRow}>
          <Text style={styles.userStat}>❤️ Tim: {hearts}/5</Text>
          <Text style={styles.userStat}>
            🧊 Streak Freeze: {inventory.streakFreeze.quantity}/2
          </Text>
        </View>
        <View style={styles.userStatsRow}>
          <Text style={styles.userStat}>
            ⚡ Double or Nothing:{" "}
            {inventory.doubleOrNothing.active
              ? "Đang hoạt động"
              : "Không hoạt động"}
          </Text>
        </View>
        <View style={styles.userStatsRow}>
          <Text style={styles.userStat}>
            📦 Mua hôm nay: {todaysPurchases.length} vật phẩm
          </Text>
        </View>
      </View>
    );
  };

  const renderShopItem = (item: ApiShopItem) => {
    const displayInfo =
      ShopItemDisplayInfo[item.item as keyof typeof ShopItemDisplayInfo];

    if (!displayInfo) return null;

    // Check if item can be purchased
    const purchaseCheck = canPurchaseItem(item, shopStatusData?.status || null);
    const isLocked = !purchaseCheck.canPurchase;
    const isDisabled = item.purchased || isPurchasing || isLocked;

    return (
      <View
        key={item.item}
        style={[
          styles.shopItem,
          item.purchased && styles.shopItemPurchased,
          isLocked && styles.shopItemLocked,
        ]}
      >
        <Image
          source={displayInfo.image}
          style={[styles.itemImage, isLocked && styles.itemImageLocked]}
        />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, isLocked && styles.itemNameLocked]}>
            {displayInfo.name}
          </Text>
          <Text
            style={[
              styles.itemDescription,
              isLocked && styles.itemDescriptionLocked,
            ]}
          >
            {displayInfo.description}
          </Text>
          {isLocked && (
            <Text style={styles.lockReason}>{purchaseCheck.reason}</Text>
          )}
          <View style={styles.itemFooter}>
            <Text
              style={[styles.itemPrice, isLocked && styles.itemPriceLocked]}
            >
              {item.price} 💎
            </Text>
            <TouchableOpacity
              style={[styles.buyButton, isDisabled && styles.buyButtonDisabled]}
              onPress={() => handlePurchase(item)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.buyButtonText,
                  isDisabled && styles.buyButtonTextDisabled,
                ]}
              >
                {item.purchased
                  ? "ĐÃ MUA"
                  : isLocked
                  ? "KHÓA"
                  : isPurchasing
                  ? "ĐANG MUA..."
                  : "MUA"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cửa Hàng</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Số dư:</Text>
            <Text style={styles.balance}>{user?.balance || 0} 💎</Text>
          </View>
        </View>

        {/* User Stats */}
        {renderUserStats()}

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categories}
          >
            {renderCategoryButton("all", "Tất cả")}
            {renderCategoryButton("boost", "Tăng cường")}
            {renderCategoryButton("unlock", "Mở khóa")}
            {renderCategoryButton("cosmetic", "Trang trí")}
          </ScrollView>
        </View>

        {/* Shop Items */}
        <View style={styles.itemsContainer}>
          {isLoadingItems || isLoadingStatus ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00C2D1" />
              <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
            </View>
          ) : itemsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Có lỗi xảy ra khi tải dữ liệu
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  refetchItems();
                  refetchStatus();
                }}
              >
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : filteredItems.length > 0 ? (
            filteredItems.map(renderShopItem)
          ) : (
            <View style={styles.emptyContainer}>
              <Image
                source={require("../../../assets/images/chest.png")}
                style={styles.emptyImage}
              />
              <Text style={styles.emptyText}>
                Không có sản phẩm nào trong danh mục này
              </Text>
            </View>
          )}
        </View>

        {/* Purchase History */}
        {shopStatusData?.history && shopStatusData.history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Lịch sử mua hàng gần đây</Text>
            {shopStatusData.history.slice(0, 5).map((purchase) => {
              const displayInfo =
                ShopItemDisplayInfo[
                  purchase.item as keyof typeof ShopItemDisplayInfo
                ];
              const purchaseDate = new Date(purchase.createdAt);
              const isToday =
                purchaseDate.toDateString() === new Date().toDateString();

              return (
                <View key={purchase._id} style={styles.historyItem}>
                  <Image
                    source={
                      displayInfo?.image ||
                      require("../../../assets/images/chest.png")
                    }
                    style={styles.historyItemImage}
                  />
                  <View style={styles.historyItemInfo}>
                    <Text style={styles.historyItemName}>
                      {displayInfo?.name || purchase.item}
                    </Text>
                    <Text style={styles.historyItemDate}>
                      {isToday
                        ? "Hôm nay"
                        : purchaseDate.toLocaleDateString("vi-VN")}{" "}
                      • {purchase.price} 💎
                    </Text>
                  </View>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>Mới</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Mẹo: Hoàn thành bài học hàng ngày để nhận thêm gems!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  balance: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  // Categories
  categoriesContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
  },
  categories: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  categoryButtonActive: {
    backgroundColor: "#00C2D1",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryTextActive: {
    color: "white",
  },

  // Items
  itemsContainer: {
    padding: 20,
  },
  shopItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  shopItemPurchased: {
    opacity: 0.6,
    backgroundColor: "#f8f8f8",
  },
  shopItemLocked: {
    opacity: 0.5,
    backgroundColor: "#f5f5f5",
    borderColor: "#d0d0d0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  itemImageLocked: {
    opacity: 0.4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemNameLocked: {
    color: "#999",
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDescriptionLocked: {
    color: "#aaa",
  },
  lockReason: {
    fontSize: 12,
    color: "#ff6b6b",
    fontStyle: "italic",
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  itemPriceLocked: {
    color: "#bbb",
  },
  buyButton: {
    backgroundColor: "#00C2D1",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buyButtonDisabled: {
    backgroundColor: "#ccc",
  },
  buyButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  buyButtonTextDisabled: {
    color: "#999",
  },

  // Loading and error states
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#00C2D1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // Footer
  footer: {
    backgroundColor: "white",
    padding: 20,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  userStatsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  userStatsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 8,
  },
  userStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  userStat: {
    fontSize: 14,
    fontWeight: "500",
    color: "#636e72",
  },
  historyContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3436",
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  historyItemImage: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2d3436",
  },
  historyItemDate: {
    fontSize: 12,
    color: "#636e72",
    marginTop: 2,
  },
  todayBadge: {
    backgroundColor: "#00C2D1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
});
