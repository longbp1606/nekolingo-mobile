import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { DepositHeader } from "../../components/membership";
import { WalletUtils } from "../../services/walletApiService";

interface DepositContentProps {
  userBalance: number;
  onDeposit: (amount: number) => Promise<void>;
  isCreatingDeposit: boolean;
}

const DepositContent: React.FC<DepositContentProps> = ({
  userBalance,
  onDeposit,
  isCreatingDeposit,
}) => {
  const [customAmount, setCustomAmount] = useState<string>("");

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, "");
    if (!numbers) return "";

    return new Intl.NumberFormat("vi-VN").format(parseInt(numbers));
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setCustomAmount(formatted);
  };

  const validateAndDeposit = async () => {
    const amount = parseInt(customAmount.replace(/[^\d]/g, ""));

    if (!amount || amount < 10000) {
      Alert.alert("Lỗi", "Số tiền nạp tối thiểu là 10.000₫");
      return;
    }

    if (amount > 10000000) {
      Alert.alert("Lỗi", "Số tiền nạp tối đa là 10.000.000₫");
      return;
    }

    await onDeposit(amount);
  };

  const amount = parseInt(customAmount.replace(/[^\d]/g, "")) || 0;
  const expectedGems = WalletUtils.convertVndToGem(amount);

  return (
    <View style={styles.depositContent}>
      <DepositHeader
        currentBalance={userBalance}
        title="Số dư hiện tại"
        subtitle="NHẬP SỐ TIỀN CẦN NẠP"
      />

      <View style={styles.customDepositContainer}>
        <Text style={styles.depositLabel}>Số tiền muốn nạp (VNĐ)</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.amountInput}
            value={customAmount}
            onChangeText={handleAmountChange}
            placeholder="Nhập số tiền (tối thiểu 10.000₫)"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={15}
          />
          <Text style={styles.currencySymbol}>₫</Text>
        </View>

        {amount >= 10000 && (
          <View style={styles.gemPreview}>
            <Text style={styles.gemPreviewText}>
              Bạn sẽ nhận được:{" "}
              <Text style={styles.gemPreviewAmount}>
                {expectedGems.toLocaleString()} 💎
              </Text>
            </Text>
          </View>
        )}

        <Text style={styles.depositNote}>
          Tối thiểu: 10.000₫ - Tối đa: 10.000.000₫
        </Text>

        <TouchableOpacity
          style={[
            styles.depositButton,
            (!customAmount || amount < 10000 || isCreatingDeposit) &&
              styles.depositButtonDisabled,
          ]}
          onPress={validateAndDeposit}
          disabled={!customAmount || amount < 10000 || isCreatingDeposit}
        >
          {isCreatingDeposit ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.depositButtonText}>NẠP TIỀN</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  depositContent: {
    paddingTop: 16,
  },
  customDepositContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  depositLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e5e5",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 16,
    textAlign: "right",
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginLeft: 8,
  },
  gemPreview: {
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  gemPreviewText: {
    fontSize: 14,
    color: "#666",
  },
  gemPreviewAmount: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  depositNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  depositButton: {
    backgroundColor: "#00C2D1",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  depositButtonDisabled: {
    backgroundColor: "#ccc",
  },
  depositButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default DepositContent;
