import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";

export default function OnboardingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding/welcome" as any);
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Nekolingo</Text>
          <Text style={styles.subtitle}>
            Learn a language for free, forever.
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎓</Text>
            <Text style={styles.featureText}>
              Learn through interactive lessons
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>
              Track your progress with achievements
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔥</Text>
            <Text style={styles.featureText}>Build daily streaks</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          size="large"
          style={styles.getStartedButton}
        />
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginLink}>Log in</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
  },
  header: {
    alignItems: "center",
    marginBottom: Sizes.xxl,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.h4,
    color: Colors.textLight,
    textAlign: "center",
  },
  imageContainer: {
    marginBottom: Sizes.xxl,
  },
  image: {
    width: 200,
    height: 200,
  },
  features: {
    width: "100%",
    marginBottom: Sizes.xxl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Sizes.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: Sizes.md,
  },
  featureText: {
    fontSize: Sizes.body,
    color: Colors.textDark,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Sizes.md,
    paddingBottom: Sizes.xl,
  },
  getStartedButton: {
    marginBottom: Sizes.md,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Sizes.md,
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
