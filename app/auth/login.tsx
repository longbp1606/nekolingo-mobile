import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { useAuth } from "../../hooks/useAuth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;

    try {
      await login({ email, password });
      // Navigate to home on success (onboarding should already be completed)
      router.push("/(tabs)/home" as any);
    } catch (error) {
      // Error is handled by the useAuth hook
      console.log("Login failed", error);
    }
  };

  // Debug function to reset onboarding for testing
  const resetOnboardingForTesting = async () => {
    try {
      await AsyncStorage.removeItem("onboarding_completed");
      await AsyncStorage.removeItem("auth_token");
      console.log("Onboarding and auth reset! App will restart.");
      // Reload the app
      router.replace("/");
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>Nekolingo</Text>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        {/* Error message */}
        {error && <Text style={styles.errorText}>{error}</Text>}

        {/* Email input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        {/* Forgot password link */}
        <Link href="/auth/forgot-password" asChild>
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </Link>

        {/* Login button */}
        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          style={styles.loginButton}
        />

        {/* Register link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Link href="/auth/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Debug button for testing - only in development */}
        {__DEV__ && (
          <TouchableOpacity
            onPress={resetOnboardingForTesting}
            style={styles.debugButton}
          >
            <Text style={styles.debugText}>Reset Onboarding (Dev Only)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Sizes.md,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: "15%",
    marginBottom: Sizes.xl,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.md,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: "100%",
  },
  errorText: {
    color: Colors.error,
    marginBottom: Sizes.md,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: Sizes.md,
  },
  label: {
    fontSize: Sizes.body,
    marginBottom: Sizes.xs,
    fontWeight: "600",
    color: Colors.textDark,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Sizes.md,
    fontSize: Sizes.body,
    backgroundColor: "#FFF",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: Sizes.lg,
  },
  forgotPasswordText: {
    color: Colors.quaternary,
    fontSize: Sizes.caption,
  },
  loginButton: {
    marginBottom: Sizes.xl,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Sizes.lg,
  },
  registerText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  registerLink: {
    fontSize: Sizes.body,
    color: Colors.primary,
    fontWeight: "bold",
  },
  debugButton: {
    marginTop: Sizes.lg,
    padding: Sizes.sm,
    backgroundColor: Colors.error,
    borderRadius: 8,
    alignItems: "center",
  },
  debugText: {
    color: Colors.background,
    fontSize: Sizes.caption,
    fontWeight: "bold",
  },
});
