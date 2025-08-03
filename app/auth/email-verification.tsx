import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { Button } from "../../components";
import { GmailWebView } from "../../components/GmailWebView";
import { AppDispatch } from "../../config/store";
import { Colors, Sizes } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { useOnboardingCheck } from "../../hooks/useOnboardingCheck";
import { storeAuthData } from "../../services/auth/authSlice";

export default function EmailVerificationScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { login } = useAuth();
  const { completeOnboarding } = useOnboardingCheck();
  const [isPolling, setIsPolling] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [showGmailOption, setShowGmailOption] = useState(false);
  const [showGmailWebView, setShowGmailWebView] = useState(false);

  // Clear any existing timer when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Start polling when component mounts
  useEffect(() => {
    startPolling();
    // Show Gmail option after 10 seconds to help user find verification email
    const gmailTimer = setTimeout(() => {
      setShowGmailOption(true);
    }, 10000);

    return () => {
      clearTimeout(gmailTimer);
    };
  }, []);

  const startPolling = async () => {
    if (isPolling || intervalRef.current) return;

    setIsPolling(true);
    setRetryCount(0);

    // Get stored credentials
    const storedEmail = await SecureStore.getItemAsync("verification_email");
    const storedPassword = await SecureStore.getItemAsync(
      "verification_password"
    );

    if (!storedEmail || !storedPassword) {
      Alert.alert(
        "Error",
        "Verification credentials not found. Please register again.",
        [{ text: "OK", onPress: () => router.replace("/onboarding") }]
      );
      return;
    }

    // Start polling every 5 seconds
    intervalRef.current = setInterval(async () => {
      try {
        console.log(
          `🔄 Polling attempt ${retryCount + 1} for email verification...`
        );
        setRetryCount((prev) => prev + 1);

        const result = await login({
          email: storedEmail,
          password: storedPassword,
        });

        if (result.data?.accessToken) {
          console.log("✅ Email verified successfully!");

          // Store authentication data
          await dispatch(storeAuthData(result.data));

          // Check if this is from onboarding flow
          const storedLanguage = await SecureStore.getItemAsync(
            "verification_language"
          );

          if (storedLanguage) {
            // This is from onboarding - complete onboarding
            await completeOnboarding();

            // Clear the stored language data since it's now saved in the user profile
            await AsyncStorage.removeItem("selectedLanguage");
            await SecureStore.deleteItemAsync("verification_language");
          }

          // Clear stored verification credentials
          await SecureStore.deleteItemAsync("verification_email");
          await SecureStore.deleteItemAsync("verification_password");

          // Stop polling
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsPolling(false);

          // Navigate to main app
          router.replace("/(tabs)/home");
        }
      } catch (error: any) {
        console.log(`❌ Polling attempt ${retryCount + 1} failed:`, error);

        // If it's a 500 error or network error, continue polling
        const isServerError =
          error?.status === 500 ||
          error?.code === "InternalServerErrorException" ||
          error?.message?.includes("Network") ||
          error?.message?.includes("timeout");

        if (!isServerError) {
          // For other errors (like invalid credentials), stop polling
          console.log("🛑 Stopping polling due to non-server error");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsPolling(false);

          Alert.alert(
            "Verification Failed",
            "There was an issue with email verification. Please try registering again.",
            [{ text: "OK", onPress: () => router.replace("/onboarding") }]
          );
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  const handleBackToRegister = async () => {
    stopPolling();

    // Clear stored verification credentials
    await SecureStore.deleteItemAsync("verification_email");
    await SecureStore.deleteItemAsync("verification_password");

    // Check if this is from onboarding flow
    const storedLanguage = await SecureStore.getItemAsync(
      "verification_language"
    );

    if (storedLanguage) {
      // Clean up and go back to onboarding register
      await SecureStore.deleteItemAsync("verification_language");
      router.replace("/onboarding/register");
    } else {
      // Go back to auth register (if it exists, but we removed it)
      router.replace("/onboarding"); // Fallback to onboarding
    }
  };

  const handleOpenGmail = () => {
    setShowGmailWebView(true);
  };

  const handleResendEmail = () => {
    Alert.alert(
      "Resend Verification",
      "To resend the verification email, please go back and register again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go Back", onPress: handleBackToRegister },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a verification link to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Please check your email and click the verification link to activate
            your account.
          </Text>

          {isPolling && (
            <View style={styles.pollingIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.pollingText}>
                Waiting for verification... (Attempt {retryCount})
              </Text>
            </View>
          )}
        </View>

        {/* Gmail Helper */}
        {showGmailOption && (
          <View style={styles.gmailContainer}>
            <Text style={styles.gmailText}>
              Using Gmail? Click below to open your inbox:
            </Text>
            <TouchableOpacity
              style={styles.gmailButton}
              onPress={handleOpenGmail}
            >
              <Text style={styles.gmailButtonText}>Open Gmail</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Additional Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • Check your spam folder if you don't see the email
          </Text>
          <Text style={styles.infoText}>
            • The verification link will expire in 24 hours
          </Text>
          <Text style={styles.infoText}>
            • Make sure to click the link from the same device
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendEmail}
          >
            <Text style={styles.resendButtonText}>Resend Email</Text>
          </TouchableOpacity>

          <Button
            title="Back to Register"
            onPress={handleBackToRegister}
            style={styles.backButton}
            variant="outline"
          />
        </View>
      </View>

      {/* Gmail WebView Modal */}
      <GmailWebView
        visible={showGmailWebView}
        onClose={() => setShowGmailWebView(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.lg,
    paddingTop: Sizes.lg,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: Sizes.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Sizes.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Sizes.xs,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
  instructionsContainer: {
    marginBottom: Sizes.lg,
  },
  instructions: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Sizes.md,
  },
  pollingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    padding: Sizes.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pollingText: {
    marginLeft: Sizes.sm,
    fontSize: 14,
    color: Colors.textLight,
  },
  gmailContainer: {
    alignItems: "center",
    marginBottom: Sizes.lg,
    padding: Sizes.md,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  gmailText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Sizes.sm,
  },
  gmailButton: {
    backgroundColor: "#ea4335",
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 6,
  },
  gmailButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  infoContainer: {
    marginBottom: Sizes.lg,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: Sizes.xs,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: Sizes.md,
    paddingBottom: Sizes.lg,
  },
  resendButton: {
    alignItems: "center",
    paddingVertical: Sizes.md,
  },
  resendButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
  },
  backButton: {
    marginTop: Sizes.sm,
  },
});
