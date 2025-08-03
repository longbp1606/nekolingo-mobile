import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackButton, Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { Language } from "../../services/languageApiService";

export default function OnboardingRegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const { setupRegister, isLoading } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError("Please enter a valid email address");
      return false;
    }

    if (!password) {
      setValidationError("Password is required");
      return false;
    }

    // Match API password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return false;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])/;
    if (!passwordRegex.test(password)) {
      setValidationError(
        "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol"
      );
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords don't match");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleRegister = async () => {
    console.log("🔄 Starting registration...", {
      email,
      password: "***",
      username,
    });

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return;
    }

    try {
      // Get selected language from AsyncStorage
      const storedLanguageStr = await AsyncStorage.getItem("selectedLanguage");
      console.log("📚 Stored language:", storedLanguageStr);

      let selectedLanguage: Language;

      if (!storedLanguageStr) {
        console.log("⚠️ No language selected, using default English");
        // Default to English if no language is selected
        selectedLanguage = {
          _id: "default-en",
          code: "en",
          name: "English",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        selectedLanguage = JSON.parse(storedLanguageStr);
      }

      console.log("🌍 Selected language:", selectedLanguage);

      const registerData = {
        email,
        password,
        username: username || email.split("@")[0], // Use email prefix if no username
        language_from: "vi", // Vietnamese (source language)
        language_to: selectedLanguage.code, // Target language
        current_level: 0, // Beginner level
      };

      console.log("📝 Registration data:", {
        ...registerData,
        password: "***",
      });

      // Call setup-register API to create the account
      const result = await setupRegister(registerData);
      console.log("✅ Setup register result:", result);

      if (result.message === "Setup register successfully!") {
        console.log("🔐 Storing verification credentials...");

        // Store email and password securely for verification polling
        await SecureStore.setItemAsync("verification_email", email);
        await SecureStore.setItemAsync("verification_password", password);

        // Store the selected language for post-verification setup
        await SecureStore.setItemAsync(
          "verification_language",
          JSON.stringify(selectedLanguage)
        );

        console.log("🚀 Navigating to email verification...");

        // Navigate to email verification screen
        router.push({
          pathname: "/auth/email-verification",
          params: { email: email },
        });
      } else {
        console.log("❌ Unexpected response:", result);
        setValidationError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Registration failed. Please try again.";
      console.log("💬 Error message:", errorMessage);
      setValidationError(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.subtitle}>
            Complete your profile to get started
          </Text>
        </View>

        <View style={styles.formContainer}>
          {validationError && (
            <Text style={styles.errorText}>{validationError}</Text>
          )}

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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username (Optional)</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
            />
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Sizes.md,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Sizes.xl,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    textAlign: "center",
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
  registerButton: {
    marginTop: Sizes.lg,
  },
});
