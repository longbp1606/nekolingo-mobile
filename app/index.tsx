import { Redirect, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../stores";

export default function Index() {
  const { user, token } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  // Determine which screen to show based on auth state
  const getInitialRoute = () => {
    if (!token) {
      // Not logged in, go to onboarding
      return "/onboarding";
    }

    if (!user?.selectedLanguage) {
      // Logged in but no language selected, go to language selection
      return "/onboarding/language-selection";
    }

    // Logged in with language, go to home
    return "/(tabs)/home";
  };

  return <Redirect href={getInitialRoute()} />;
}
