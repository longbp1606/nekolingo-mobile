import { apiSlice } from "./apiSlice";

export interface ShopItem {
  item: string;
  price: number;
  purchased: boolean;
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
    is_freeze: boolean;
    hearts: number;
    streak_days: number;
    double_or_nothing: {
      start_date: string;
      is_active: boolean;
      is_completed: boolean;
    } | null;
  };
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

    getShopHistory: builder.query<ShopHistoryResponse, void>({
      query: () => "/shop/history",
      providesTags: ["Shop"],
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
  useGetShopHistoryQuery,
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
