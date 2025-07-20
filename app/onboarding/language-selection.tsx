import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components";
import { Colors, Sizes } from "../../constants";
import { Language } from "../../services/languageService";
import { AppDispatch, RootState } from "../../stores";
import {
  fetchLanguages,
  setSelectedLanguageTo,
} from "../../stores/languageSlice";
import { setCurrentStep, setLanguage } from "../../stores/onboardingSlice";
import { updateUserSettings } from "../../stores/userSlice";

export default function LanguageSelectionScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { languages, loading, error } = useSelector(
    (state: RootState) => state.language
  );

  useEffect(() => {
    dispatch(fetchLanguages());
  }, [dispatch]);

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language.code);
    dispatch(setSelectedLanguageTo(language));
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

  const renderLanguageItem = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item.code && styles.selectedLanguageItem,
      ]}
      onPress={() => handleLanguageSelect(item)}
    >
      <Text style={styles.languageFlag}>{item.flag || "🌐"}</Text>
      <Text
        style={[
          styles.languageName,
          selectedLanguage === item.code && styles.selectedLanguageName,
        ]}
      >
        {item.name}
      </Text>
      {item.native_name && item.native_name !== item.name && (
        <Text style={styles.nativeName}>({item.native_name})</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading languages...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && languages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load languages</Text>
          <Button
            title="Retry"
            onPress={() => dispatch(fetchLanguages())}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a language</Text>
        <Text style={styles.subtitle}>What language do you want to learn?</Text>
      </View>

      <FlatList
        data={languages}
        keyExtractor={(item) => item._id}
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
    flex: 1,
  },
  selectedLanguageName: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  nativeName: {
    fontSize: Sizes.caption,
    color: Colors.textLight,
    fontStyle: "italic",
    marginLeft: Sizes.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.body,
    color: Colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Sizes.md,
  },
  errorText: {
    fontSize: Sizes.body,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Sizes.lg,
  },
  retryButton: {
    minWidth: 120,
  },
  footer: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.lg,
  },
  continueButton: {
    height: 56,
  },
});
