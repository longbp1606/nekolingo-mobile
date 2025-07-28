import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Transaction,
  useGetTransactionHistoryQuery,
} from "../../../services/walletApiService";

export default function TransactionHistoryScreen() {
  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useGetTransactionHistoryQuery();

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionCode}>{item.transaction_code}</Text>
        <Text
          style={[
            styles.transactionStatus,
            { color: getStatusColor(item.status) },
          ]}
        >
          {getStatusText(item.status)}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <Text style={styles.amount}>
          {item.vnd_amount.toLocaleString("vi-VN")}₫
        </Text>
        <Text style={styles.gems}>+{item.gem_amount} 💎</Text>
      </View>

      <Text style={styles.transactionDate}>
        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>

      {item.message && (
        <Text style={styles.transactionMessage}>{item.message}</Text>
      )}
    </View>
  );

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "#4CAF50";
      case "FAILED":
        return "#F44336";
      case "PENDING":
        return "#FF9800";
      default:
        return "#777";
    }
  };

  const getStatusText = (status: Transaction["status"]) => {
    switch (status) {
      case "SUCCESS":
        return "Thành công";
      case "FAILED":
        return "Thất bại";
      case "PENDING":
        return "Đang xử lý";
      default:
        return status;
    }
  };

  if (isLoading && !transactions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C2D1" />
          <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Không thể tải lịch sử giao dịch. Vui lòng thử lại.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử giao dịch</Text>
      </View>

      <FlatList
        data={transactions || []}
        keyExtractor={(item) => item._id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={["#00C2D1"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3C3C3C",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
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
    color: "#3C3C3C",
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C3C3C",
  },
  gems: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00C2D1",
  },
  transactionDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },
  transactionMessage: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#777",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
});
