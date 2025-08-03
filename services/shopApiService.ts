import { apiSlice } from "./apiSlice";

export interface ShopItem {
  item: string;
  price: number;
  purchased: boolean;
  purchasedToday?: boolean; // Track if purchased today for daily limits
}

export interface ShopItemsResponse {
  success: boolean;
  items: ShopItem[];
}

export interface ShopPurchaseRequest {
  item: string;
}

export interface ShopPurchaseResponse {
  success: boolean;
  item: string;
  price: number;
  remaining_balance: number;
}

export interface ShopHistoryItem {
  _id: string;
  item: string;
  price: number;
  createdAt: string;
}

export interface ShopHistoryResponse {
  success: boolean;
  history: ShopHistoryItem[];
}

export interface ShopStatusResponse {
  success: boolean;
  status: {
    freeze: {
      quantity: number;
      can_buy: boolean;
    };
    double: {
      active: boolean;
      can_buy: boolean;
    };
    repair: {
      available: boolean;
      can_buy: boolean;
    };
  };
  history: ShopHistoryItem[];
}

export const shopApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getShopItems: builder.query<ShopItemsResponse, void>({
      query: () => "/shop/items",
      providesTags: ["Shop"],
    }),

    purchaseItem: builder.mutation<ShopPurchaseResponse, ShopPurchaseRequest>({
      query: (body) => ({
        url: "/shop/buy",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shop", "User"], // Invalidate both shop items and user balance
    }),

    getShopStatus: builder.query<ShopStatusResponse, void>({
      query: () => "/shop/status",
      providesTags: ["Shop"],
    }),
  }),
});

export const {
  useGetShopItemsQuery,
  usePurchaseItemMutation,
  useGetShopStatusQuery,
} = shopApiSlice;

// Helper to get display information for shop items
export const ShopItemDisplayInfo = {
  STREAK_FREEZE: {
    name: "Streak Freeze",
    description: "Bảo vệ chuỗi streak của bạn khỏi bị mất",
    image: require("../assets/images/flame.png"),
    type: "boost" as const,
  },
  DOUBLE_OR_NOTHING: {
    name: "Double or Nothing",
    description: "Thử thách nhân đôi XP hoặc mất hết",
    image: require("../assets/images/lightning.png"),
    type: "boost" as const,
  },
  STREAK_REPAIR: {
    name: "Streak Repair",
    description: "Khôi phục chuỗi streak đã mất",
    image: require("../assets/images/trophy.png"),
    type: "unlock" as const,
  },
  HEART_REFILL: {
    name: "Heart Refill",
    description: "Hồi đầy 5 tim để luyện tập",
    image: require("../assets/images/heart.png"),
    type: "boost" as const,
  },
} as const;

// Helper function to determine if an item can be purchased based on shop status
export const canPurchaseItem = (
  item: ShopItem,
  shopStatus: ShopStatusResponse["status"] | null
): { canPurchase: boolean; reason?: string } => {
  if (!shopStatus) {
    return { canPurchase: false, reason: "Không thể tải trạng thái cửa hàng" };
  }

  // If already purchased today, cannot purchase again
  if (item.purchasedToday) {
    return { canPurchase: false, reason: "Đã mua hôm nay" };
  }

  // Check specific item conditions based on shop status
  switch (item.item) {
    case "STREAK_FREEZE":
      console.log(
        `🧊 Streak Freeze check: Can buy = ${shopStatus.freeze.can_buy}, Quantity = ${shopStatus.freeze.quantity}`
      );
      if (!shopStatus.freeze.can_buy) {
        return { canPurchase: false, reason: "Đã có tối đa 2 Streak Freeze" };
      }
      break;

    case "DOUBLE_OR_NOTHING":
      console.log(
        `⚡ Double or Nothing check: Can buy = ${shopStatus.double.can_buy}, Active = ${shopStatus.double.active}`
      );
      if (!shopStatus.double.can_buy) {
        return {
          canPurchase: false,
          reason: shopStatus.double.active
            ? "Double or Nothing đang hoạt động"
            : "Không thể mua Double or Nothing",
        };
      }
      break;

    case "STREAK_REPAIR":
      console.log(
        `🏆 Streak Repair check: Can buy = ${shopStatus.repair.can_buy}, Available = ${shopStatus.repair.available}`
      );
      if (!shopStatus.repair.can_buy) {
        return { canPurchase: false, reason: "Streak Repair không khả dụng" };
      }
      if (!shopStatus.repair.available) {
        return { canPurchase: false, reason: "Streak không bị hỏng" };
      }
      break;
  }

  return { canPurchase: true };
};

// Helper function to get user's inventory from shop status
export const getUserInventory = (shopStatus: ShopStatusResponse["status"]) => {
  return {
    streakFreeze: {
      quantity: shopStatus.freeze.quantity,
      canBuy: shopStatus.freeze.can_buy,
    },
    doubleOrNothing: {
      active: shopStatus.double.active,
      canBuy: shopStatus.double.can_buy,
    },
    streakRepair: {
      available: shopStatus.repair.available,
      canBuy: shopStatus.repair.can_buy,
    },
  };
};

// Helper function to get today's purchases from history
export const getTodaysPurchases = (history: ShopHistoryItem[]) => {
  const today = new Date().toDateString();
  return history.filter((item) => {
    const purchaseDate = new Date(item.createdAt).toDateString();
    return purchaseDate === today;
  });
};
