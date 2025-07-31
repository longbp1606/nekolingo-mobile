import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Transaction } from "../../services/walletApiService";

interface TransactionContentProps {
  transactions: Transaction[] | undefined;
  isLoadingTransactions: boolean;
}

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

const formatTransactionCode = (code: string): string => {
  // Show only last 8 characters for display
  return code.length > 8 ? `...${code.slice(-8)}` : code;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return `Hôm nay, ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const TransactionContent: React.FC<TransactionContentProps> = ({
  transactions,
  isLoadingTransactions,
}) => {
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
          source={require("../../assets/images/chest.png")}
          style={styles.emptyImage}
        />
        <Text style={styles.emptyMessage}>Chưa có giao dịch nào</Text>
        <Text style={styles.emptySubMessage}>
          Bạn chưa thực hiện giao dịch nạp tiền nào
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.transactionsList}>
      {transactions.slice(0, 5).map((transaction: Transaction) => (
        <View key={transaction._id} style={styles.transactionItem}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionCode}>
              {formatTransactionCode(transaction.transaction_code)}
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
          <Text style={styles.transactionMessage}>{transaction.message}</Text>
          <Text style={styles.transactionDate}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
      ))}
      {transactions.length > 5 && (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => router.push("/transaction-history" as any)}
        >
          <Text style={styles.viewAllText}>
            Xem tất cả ({transactions.length} giao dịch)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyTransactions: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  emptyMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubMessage: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
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
  transactionMessage: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 4,
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

export default TransactionContent;
