import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button, BackButton } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch, RootState } from "../../stores";
import { setupRegisterUser } from "../../stores/userSlice";

export default function OnboardingRegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);
  const onboardingState = useSelector((state: RootState) => state.onboarding);

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

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
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

    // Map onboarding data to API format
    const language_from = 'vi'; // Default or from onboarding
    const language_to = onboardingState.selectedLanguage || 'en';
    const current_level = onboardingState.selectedLevel || 1;

    try {
      await dispatch(setupRegisterUser({
        email,
        password,
        username: username || undefined,
        language_from,
        language_to,
        current_level,
      })).unwrap();

      // Navigate to home on success
      router.push("/(tabs)/home" as any);
    } catch (error) {
      console.log("Registration failed", error);
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
          {(error || validationError) && (
            <Text style={styles.errorText}>{error || validationError}</Text>
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
