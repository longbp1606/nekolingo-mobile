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
  ShopItemDisplayInfo,
  useGetShopHistoryQuery,
  useGetShopItemsQuery,
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
    data: historyData,
    isLoading: isLoadingHistory,
    refetch: refetchHistory,
  } = useGetShopHistoryQuery();
  const [purchaseItem, { isLoading: isPurchasing }] = usePurchaseItemMutation();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "boost" | "unlock" | "cosmetic"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchItems(), refetchHistory()]);
    setRefreshing(false);
  };

  const handlePurchase = async (item: ApiShopItem) => {
    const userBalance = user?.balance || 0;
    const displayInfo =
      ShopItemDisplayInfo[item.item as keyof typeof ShopItemDisplayInfo];

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
              const errorMessage =
                error?.data?.message ||
                error?.message ||
                "Có lỗi xảy ra khi mua vật phẩm";
              Alert.alert("Lỗi", errorMessage);
            }
          },
        },
      ]
    );
  };

  const shopItems = shopItemsData?.items || [];

  const filteredItems =
    selectedCategory === "all"
      ? shopItems
      : shopItems.filter((item) => {
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

  const renderShopItem = (item: ApiShopItem) => {
    const displayInfo =
      ShopItemDisplayInfo[item.item as keyof typeof ShopItemDisplayInfo];

    if (!displayInfo) return null;

    return (
      <View
        key={item.item}
        style={[styles.shopItem, item.purchased && styles.shopItemPurchased]}
      >
        <Image source={displayInfo.image} style={styles.itemImage} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{displayInfo.name}</Text>
          <Text style={styles.itemDescription}>{displayInfo.description}</Text>
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{item.price} 💎</Text>
            <TouchableOpacity
              style={[
                styles.buyButton,
                (item.purchased || isPurchasing) && styles.buyButtonDisabled,
              ]}
              onPress={() => handlePurchase(item)}
              disabled={item.purchased || isPurchasing}
            >
              <Text
                style={[
                  styles.buyButtonText,
                  (item.purchased || isPurchasing) &&
                    styles.buyButtonTextDisabled,
                ]}
              >
                {item.purchased
                  ? "ĐÃ MUA"
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
          {isLoadingItems ? (
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
                onPress={refetchItems}
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
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
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
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
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
});
