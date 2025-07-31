import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

interface VNPayWebViewProps {
  visible: boolean;
  paymentUrl: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

export function VNPayWebView({
  visible,
  paymentUrl,
  onClose,
  onPaymentSuccess,
  onPaymentError,
}: VNPayWebViewProps) {
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    setCurrentUrl(url);

    // Check if the URL indicates payment completion
    // Look specifically for the mobile return URL endpoint
    if (
      url.includes("/api/wallet/vnpay/return/mobile") ||
      url.includes("/api/wallet/vnpay/return") ||
      url.includes("vnp_ResponseCode") ||
      url.includes("10.0.2.2:3000/api/wallet/vnpay/return") ||
      url.includes("localhost:3000/api/wallet/vnpay/return")
    ) {
      // Parse URL parameters to check payment status
      const urlParams = new URLSearchParams(url.split("?")[1]);
      const responseCode = urlParams.get("vnp_ResponseCode");
      const txnRef = urlParams.get("vnp_TxnRef");
      const amount = urlParams.get("vnp_Amount");

      if (responseCode === "00") {
        // Payment successful - the backend has automatically updated the user profile
        const vndAmount = amount ? parseInt(amount) / 100 : 0;
        Alert.alert(
          "Thanh toán thành công!",
          `Bạn đã nạp thành công ${vndAmount.toLocaleString()}₫. Số dư gem của bạn đã được cập nhật tự động.`,
          [
            {
              text: "Quay về Profile",
              onPress: () => {
                onClose();
                onPaymentSuccess(); // This will refresh the profile and show updated balance
              },
            },
          ],
          { cancelable: false } // Prevent dismissing without clicking button
        );
      } else {
        // Payment failed
        const errorMessage = getErrorMessage(responseCode);
        Alert.alert("Thanh toán thất bại", errorMessage, [
          {
            text: "OK",
            onPress: () => {
              onPaymentError(errorMessage);
              onClose();
            },
          },
        ]);
      }
    }
  };

  const getErrorMessage = (responseCode: string | null): string => {
    switch (responseCode) {
      case "01":
        return "Giao dịch chưa hoàn tất";
      case "02":
        return "Giao dịch bị lỗi";
      case "04":
        return "Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)";
      case "05":
        return "VNPAY đang xử lý giao dịch này (GD hoàn tiền)";
      case "06":
        return "VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)";
      case "07":
        return "Giao dịch bị nghi ngờ gian lận";
      case "09":
        return "GD Hoàn trả bị từ chối";
      case "10":
        return "Đã giao hàng";
      case "11":
        return "Giao dịch bị hủy";
      case "12":
        return "Giao dịch bị từ chối bởi issuer của thẻ/tài khoản";
      case "13":
        return "Người dùng nhập sai mật khẩu xác thực giao dịch (OTP). Trường hợp này chỉ tập trung vào thẻ nội địa";
      case "21":
        return "Số tiền không đủ để thực hiện giao dịch";
      case "22":
        return "Tài khoản của quý khách chưa đăng ký dịch vụ InternetBanking tại ngân hàng";
      case "23":
        return "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)";
      case "24":
        return "Khách hàng hủy giao dịch";
      case "25":
        return "Ngân hàng từ chối giao dịch";
      case "99":
        return "Người dùng hủy giao dịch";
      default:
        return "Có lỗi xảy ra trong quá trình thanh toán";
    }
  };

  const handleClose = () => {
    Alert.alert(
      "Hủy thanh toán",
      "Bạn có chắc chắn muốn hủy quá trình thanh toán?",
      [
        {
          text: "Không",
          style: "cancel",
        },
        {
          text: "Có",
          onPress: onClose,
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thanh toán VNPay</Text>
          <View style={styles.placeholder} />
        </View>

        {/* URL Display */}
        <View style={styles.urlContainer}>
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl || paymentUrl}
          </Text>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00C2D1" />
              <Text style={styles.loadingText}>
                Đang tải trang thanh toán...
              </Text>
            </View>
          )}

          <WebView
            source={{ uri: paymentUrl }}
            style={styles.webView}
            onLoad={() => setLoading(false)}
            onError={(error) => {
              console.error("WebView error:", error);
              setLoading(false);
              onPaymentError("Không thể tải trang thanh toán");
            }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState={true}
            scalesPageToFit={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsBackForwardNavigationGestures={true}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

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
    backgroundColor: "#F8F9FA",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  urlContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  urlText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  webViewContainer: {
    flex: 1,
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
