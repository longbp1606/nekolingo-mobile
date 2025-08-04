import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../../components/BackButton";
import {
  Transaction,
  useGetTransactionHistoryQuery,
  WalletUtils,
} from "../../services/walletApiService";

interface FilterOption {
  label: string;
  value: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: "Tất cả", value: "ALL" },
  { label: "Thành công", value: "SUCCESS" },
  { label: "Đang xử lý", value: "PENDING" },
  { label: "Thất bại", value: "FAILED" },
];

const TransactionHistoryDetailScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const {
    data: transactions,
    isLoading,
    refetch,
  } = useGetTransactionHistoryQuery();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions;

    // Filter by status
    if (selectedFilter !== "ALL") {
      filtered = filtered.filter(
        (transaction) => transaction.status === selectedFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.transaction_code.toLowerCase().includes(query) ||
          transaction.message.toLowerCase().includes(query) ||
          transaction.vnd_amount.toString().includes(query)
      );
    }

    return filtered;
  }, [transactions, selectedFilter, searchQuery]);

  const transactionSummary = useMemo(() => {
    return WalletUtils.getTransactionSummary(transactions || []);
  }, [transactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderFilterButton = (option: FilterOption) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.filterButton,
        selectedFilter === option.value && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(option.value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === option.value && styles.filterButtonTextActive,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.leftSection}>
          <Text style={styles.transactionCode}>
            Mã GD: {item.transaction_code}
          </Text>
          <Text style={styles.transactionMessage}>{item.message}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.transactionStatus,
              { color: WalletUtils.getTransactionStatusColor(item.status) },
            ]}
          >
            {WalletUtils.getTransactionStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.amountSection}>
          <Text style={styles.vndAmount}>
            {item.vnd_amount.toLocaleString("vi-VN")}₫
          </Text>
          <Text style={styles.gemAmount}>+{item.gem_amount} 💎</Text>
        </View>
        <Text style={styles.transactionDate}>
          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Tổng quan giao dịch</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {transactionSummary.totalTransactions}
          </Text>
          <Text style={styles.summaryLabel}>Tổng giao dịch</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {transactionSummary.totalVND.toLocaleString("vi-VN")}₫
          </Text>
          <Text style={styles.summaryLabel}>Tổng nạp</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {transactionSummary.totalGems.toLocaleString()} 💎
          </Text>
          <Text style={styles.summaryLabel}>Tổng gems</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery.trim() || selectedFilter !== "ALL"
          ? "Không tìm thấy giao dịch nào"
          : "Chưa có giao dịch nào"}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery.trim() || selectedFilter !== "ALL"
          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
          : "Bạn chưa thực hiện giao dịch nạp tiền nào"}
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
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm giao dịch..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {FILTER_OPTIONS.map(renderFilterButton)}
          </View>

          {/* Summary Card */}
          {transactions && transactions.length > 0 && renderSummaryCard()}

          {/* Transaction List */}
          <FlatList
            data={filteredTransactions}
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
            ListHeaderComponent={() =>
              filteredTransactions.length > 0 ? (
                <Text style={styles.resultCount}>
                  {filteredTransactions.length} giao dịch
                </Text>
              ) : null
            }
          />
        </>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#00C2D1",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00C2D1",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
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
  statusContainer: {
    alignItems: "flex-end",
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
    marginTop: 16,
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

export default TransactionHistoryDetailScreen;
