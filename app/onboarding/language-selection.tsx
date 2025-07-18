import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { AppDispatch } from "../../stores";
import { setCurrentStep, setLanguage } from "../../stores/onboardingSlice";
import { updateUserSettings } from "../../stores/userSlice";

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
      // Update user's selected language in Redux
      dispatch(updateUserSettings({ selectedLanguage }));
      dispatch(setLanguage(selectedLanguage));
      dispatch(setCurrentStep(4));

      // Navigate to source selection
      router.push("/onboarding/source-selection" as any);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item.code)}
    >
      <Text style={styles.languageFlag}>{item.flag}</Text>
      <Text
        style={[
          styles.languageName,
          selectedLanguage === item.code && styles.selectedLanguageName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a language</Text>
        <Text style={styles.subtitle}>What language do you want to learn?</Text>
      </View>

      <FlatList
        data={languages}
        keyExtractor={(item) => item.code}
        renderItem={renderLanguageItem}
        style={styles.languageList}
        contentContainerStyle={styles.languageListContent}
      />

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedLanguage}
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
  header: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xl,
    alignItems: "center",
  },
  title: {
    fontSize: Sizes.h1,
    fontWeight: "bold",
    color: Colors.textDark,
    marginBottom: Sizes.sm,
  },
  subtitle: {
    fontSize: Sizes.body,
    color: Colors.textLight,
    textAlign: "center",
  },
  languageList: {
    flex: 1,
  },
  languageListContent: {
    paddingHorizontal: Sizes.md,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    marginVertical: Sizes.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.background,
  },
  selectedLanguageItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10", // 10% opacity
  },
  languageFlag: {
    fontSize: 28,
    marginRight: Sizes.md,
  },
  languageName: {
    fontSize: Sizes.h4,
    fontWeight: "600",
    color: Colors.textDark,
  },
  selectedLanguageName: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  footer: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.lg,
  },
  continueButton: {
    height: 56,
  },
});
