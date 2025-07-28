import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email address");
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual password reset logic
    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset link sent to your email!");
      router.push("/auth/login");
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={require("../../assets/images/react-logo.png")}
          style={styles.logo}
        />

        <Text style={styles.subtitle}>
          Don't worry! Enter your email address and we'll send you a link to
          reset your password.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <Button
          title={isLoading ? "Sending..." : "Send Reset Link"}
          onPress={handleResetPassword}
          disabled={isLoading}
          style={styles.resetButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember your password?{" "}
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.sm,
  },
  backButton: {
    padding: Sizes.sm,
    marginRight: Sizes.md,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Sizes.md,
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: Sizes.xl,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: Sizes.xl,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: Sizes.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Sizes.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.sm,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.md,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  resetButton: {
    marginTop: Sizes.md,
    marginBottom: Sizes.xl,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
