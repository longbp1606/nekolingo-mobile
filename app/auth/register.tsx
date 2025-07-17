import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch, RootState } from "../../stores";
import { registerUser } from "../../stores/userSlice";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const validateForm = () => {
    if (!name.trim()) {
      setValidationError("Name is required");
      return false;
    }

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

    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
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
      await dispatch(registerUser({ name, email, password })).unwrap();
      // Navigate to home (onboarding should already be completed)
      router.push("/(tabs)/home" as any);
    } catch (error) {
      console.log("Registration failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>Nekolingo</Text>
      </View>

      <View style={styles.formContainer}>
        {(error || validationError) && (
          <Text style={styles.errorText}>{error || validationError}</Text>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoCapitalize="words"
          />
        </View>

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

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </Link>
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
  logoContainer: {
    alignItems: "center",
    marginTop: "10%",
    marginBottom: Sizes.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.md,
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
    marginTop: Sizes.md,
    marginBottom: Sizes.lg,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Sizes.sm,
  },
  loginText: {
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  loginLink: {
    fontSize: Sizes.body,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
