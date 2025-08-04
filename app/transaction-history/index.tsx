import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/BackButton";
import {
  Transaction,
  useGetTransactionHistoryQuery,
} from "../../services/walletApiService";

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TransactionHistoryScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    data: transactions,
    isLoading,
    refetch,
  } = useGetTransactionHistoryQuery();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.leftSection}>
          <Text style={styles.transactionCode}>
            Mã GD: {item.transaction_code}
          </Text>
          <Text style={styles.transactionMessage}>{item.message}</Text>
        </View>
        <Text
          style={[
            styles.transactionStatus,
            { color: getTransactionStatusColor(item.status) },
          ]}
        >
          {getTransactionStatusText(item.status)}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.amountSection}>
          <Text style={styles.vndAmount}>
            {item.vnd_amount.toLocaleString("vi-VN")}₫
          </Text>
          <Text style={styles.gemAmount}>+{item.gem_amount} 💎</Text>
        </View>
        <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
      <Text style={styles.emptyMessage}>
        Bạn chưa thực hiện giao dịch nạp tiền nào
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#00C2D1" />
      <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Lịch sử giao dịch</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading && !refreshing ? (
        renderLoadingState()
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#00C2D1"]}
              tintColor="#00C2D1"
            />
          }
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  transactionCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  transactionMessage: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountSection: {
    flex: 1,
  },
  vndAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  gemAmount: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

export default TransactionHistoryScreen;
