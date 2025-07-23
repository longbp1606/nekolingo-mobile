import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/onboarding/language-selection");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <View style={styles.speechBubble}>
            <Text style={styles.welcomeText}>
              Chào mừng bạn đến với Nekolingo!
            </Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/images/cat-hi.png")}
              style={styles.catImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Tiếp tục"
          onPress={handleContinue}
          size="large"
          style={styles.continueButton}
        />
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
  welcomeSection: {
    alignItems: "center",
    width: "100%",
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: Sizes.md,
    marginBottom: Sizes.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  welcomeText: {
    fontSize: Sizes.h3,
    color: Colors.textDark,
    textAlign: "center",
    fontWeight: "500",
  },
  imageContainer: {
    marginTop: Sizes.lg,
  },
  catImage: {
    width: 200,
    height: 200,
  },
  footer: {
    paddingHorizontal: Sizes.md,
    paddingBottom: Sizes.xl,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: Sizes.md,
  },
  continueButton: {
    backgroundColor: Colors.primary,
  },
});
