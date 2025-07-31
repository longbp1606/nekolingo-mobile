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
