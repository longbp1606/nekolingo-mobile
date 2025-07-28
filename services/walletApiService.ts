import { apiSlice } from "./apiSlice";

export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  url: string;
}

export interface Transaction {
  _id: string;
  vnd_amount: number;
  gem_amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  transaction_code: string;
  createdAt: string;
  message: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  data: Transaction[];
}

export interface DepositOption {
  amount: number;
  gems: number;
  bonus: number;
  displayAmount: string;
  displayGems: string;
  popular: boolean;
}

export const walletApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDeposit: builder.mutation<DepositResponse, DepositRequest>({
      query: (depositData) => ({
        url: "/wallet/vnpay/deposit",
        method: "POST",
        body: depositData,
      }),
      invalidatesTags: ["User"], // Invalidate user data to refresh balance
    }),
    getTransactionHistory: builder.query<Transaction[], void>({
      query: () => "/wallet/transactions",
      transformResponse: (response: TransactionHistoryResponse) => {
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Invalid response format");
        }
        return response.data;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(
                ({ _id }) => ({ type: "Transaction", id: _id } as const)
              ),
              { type: "Transaction", id: "LIST" },
            ]
          : [{ type: "Transaction", id: "LIST" }],
    }),
  }),
});

export const { useCreateDepositMutation, useGetTransactionHistoryQuery } =
  walletApi;

/**
 * Utility functions for wallet operations
 */
export class WalletUtils {
  /**
   * Convert VND to Gem based on backend logic
   */
  static convertVndToGem(amount: number): number {
    if (amount >= 200_000) return 2800;
    if (amount >= 100_000) return 1300;
    if (amount >= 50_000) return 600;
    return Math.floor((amount * 10) / 1000); // 1.000₫ = 10 gem
  }

  /**
   * Get suggested deposit amounts with gem bonuses
   */
  static getDepositOptions(): DepositOption[] {
    return [
      {
        amount: 50_000,
        gems: 600,
        bonus: 100,
        displayAmount: "50.000₫",
        displayGems: "600 gems",
        popular: false,
      },
      {
        amount: 100_000,
        gems: 1300,
        bonus: 300,
        displayAmount: "100.000₫",
        displayGems: "1.300 gems",
        popular: true,
      },
      {
        amount: 200_000,
        gems: 2800,
        bonus: 800,
        displayAmount: "200.000₫",
        displayGems: "2.800 gems",
        popular: false,
      },
    ];
  }
}
