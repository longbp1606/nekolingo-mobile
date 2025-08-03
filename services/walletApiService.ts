import { apiSlice } from "./apiSlice";

export interface DepositRequest {
  amount: number;
  platform?: "mobile" | "web";
}

export interface DepositResponse {
  url: string;
}

export interface DepositSuccessResponse {
  success: boolean;
  message: string;
  amountVND: number;
  gemsAdded: number;
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
        url: "/wallet/vnpay/deposit/mobile", // Match backend endpoint exactly
        method: "POST",
        body: depositData,
      }),
      invalidatesTags: ["User", "Transaction"], // Invalidate user data and transactions to refresh balance and history
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
    if (amount >= 200_000) return 2000;
    if (amount >= 100_000) return 1000;
    if (amount >= 50_000) return 500;
    if (amount >= 10_000) return 100;
    return Math.floor((amount * 10) / 1000); // 1.000₫ = 10 gem
  }

  /**
   * Format VND amount for display
   */
  static formatVND(amount: number): string {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  /**
   * Format gems amount for display
   */
  static formatGems(amount: number): string {
    return `${amount.toLocaleString()} gems`;
  }

  /**
   * Parse return URL parameters from VNPay
   */
  static parseReturnUrl(url: string): Record<string, string> {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  }

  /**
   * Check if VNPay transaction was successful
   */
  static isVNPaySuccess(params: Record<string, string>): boolean {
    return (
      params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00"
    );
  }

  /**
   * Get deposit success message
   */
  static getDepositSuccessMessage(
    amountVND: number,
    gemsAdded: number
  ): string {
    return `Bạn đã nạp thành công ${this.formatVND(
      amountVND
    )} và nhận được ${this.formatGems(gemsAdded)}!`;
  }

  /**
   * Validate deposit amount
   */
  static validateDepositAmount(amount: number): {
    isValid: boolean;
    message?: string;
  } {
    if (!amount || amount < 10000) {
      return { isValid: false, message: "Số tiền nạp tối thiểu là 10.000₫" };
    }

    if (amount > 10000000) {
      return { isValid: false, message: "Số tiền nạp tối đa là 10.000.000₫" };
    }

    return { isValid: true };
  }

  /**
   * Get suggested deposit amounts with gem bonuses
   */
  static getDepositOptions(): DepositOption[] {
    return [
      {
        amount: 10_000,
        gems: 100,
        bonus: 0,
        displayAmount: "10.000₫",
        displayGems: "100 gems",
        popular: false,
      },
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

  /**
   * Format transaction status for display
   */
  static getTransactionStatusText(status: string): string {
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
  }

  /**
   * Get transaction status color
   */
  static getTransactionStatusColor(status: string): string {
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
  }

  /**
   * Get transaction summary
   */
  static getTransactionSummary(transactions: Transaction[]) {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalVND: 0,
        totalGems: 0,
        successfulTransactions: 0,
      };
    }

    const successful = transactions.filter((t) => t.status === "SUCCESS");

    return {
      totalTransactions: transactions.length,
      totalVND: successful.reduce((sum, t) => sum + t.vnd_amount, 0),
      totalGems: successful.reduce((sum, t) => sum + t.gem_amount, 0),
      successfulTransactions: successful.length,
    };
  }
}
