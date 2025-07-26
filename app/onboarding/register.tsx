import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { BackButton, Button } from "../../components";
import { AppDispatch } from "../../config/store";
import { Colors, Sizes } from "../../constants";
import { useOnboardingCheck } from "../../hooks/useOnboardingCheck";
import {
  useLoginMutation,
  useSetupRegisterMutation,
} from "../../services/auth/authApiService";
import { storeAuthData } from "../../services/auth/authSlice";
import { Language } from "../../services/languageApiService";

export default function OnboardingRegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { completeOnboarding } = useOnboardingCheck();
  const [setupRegister, { isLoading: registerLoading }] =
    useSetupRegisterMutation();
  const [login, { isLoading: loginLoading }] = useLoginMutation();

  const loading = registerLoading || loginLoading;

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
    if (!validateForm()) {
      return;
    }

    try {
      // Get selected language from AsyncStorage
      const storedLanguageStr = await AsyncStorage.getItem("selectedLanguage");

      if (!storedLanguageStr) {
        setValidationError("Please select a language to learn first");
        return;
      }

      const selectedLanguage: Language = JSON.parse(storedLanguageStr);

      // Step 1: Call setup-register API to create the account
      await setupRegister({
        email,
        password,
        username: username || email.split("@")[0], // Use email prefix if no username
        language_from: "vi", // Vietnamese (source language)
        language_to: selectedLanguage.code, // Target language
        current_level: 0, // Beginner level
      }).unwrap();

      // Step 2: Login to get the auth tokens
      const loginResult = await login({
        email,
        password,
      }).unwrap();

      // Step 3: Store authentication data
      await dispatch(storeAuthData(loginResult.data));

      // Step 4: Mark onboarding as completed
      await completeOnboarding();

      // Step 5: Clear the stored language data since it's now saved in the user profile
      await AsyncStorage.removeItem("selectedLanguage");

      // Step 6: Navigate to home
      router.push("/(tabs)/home" as any);
    } catch (error: any) {
      console.log("Registration failed", error);
      const errorMessage =
        error?.data?.message || "Registration failed. Please try again.";
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
            loading={loading}
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
