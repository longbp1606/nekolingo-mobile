import { useState } from "react";
import { useLoginQuestHandler } from "./useLoginQuestHandler";

interface AuthWithQuestsResult {
  success: boolean;
  user?: any;
  quests?: any[];
  questsCreated?: boolean;
  error?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

export const useAuthWithQuests = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { handleLoginQuests } = useLoginQuestHandler();

  const loginWithQuests = async (
    loginData: LoginData,
    loginFn: (data: LoginData) => Promise<any>
  ): Promise<AuthWithQuestsResult> => {
    setIsProcessing(true);

    try {
      console.log("🔑 Step 1: Logging in user...");
      const loginResult = await loginFn(loginData);

      if (!loginResult || !loginResult.success) {
        throw new Error(loginResult?.message || "Login failed");
      }

      console.log("✅ Login successful, user:", loginResult.user);

      console.log("🎯 Step 2: Handling daily quests...");
      const questResult = await handleLoginQuests();

      return {
        success: true,
        user: loginResult.user,
        quests: questResult.quests,
        questsCreated: questResult.created,
      };
    } catch (error: any) {
      console.error("❌ Login with quests failed:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const registerWithQuests = async (
    registrationData: RegistrationData,
    registerFn: (data: RegistrationData) => Promise<any>
  ): Promise<AuthWithQuestsResult> => {
    setIsProcessing(true);

    try {
      console.log("👤 Step 1: Registering new user...");
      const registerResult = await registerFn(registrationData);

      if (!registerResult || !registerResult.success) {
        throw new Error(registerResult?.message || "Registration failed");
      }

      console.log("✅ Registration successful, user:", registerResult.user);

      console.log("🎯 Step 2: Creating daily quests for new user...");
      const questResult = await handleLoginQuests();

      if (questResult.success) {
        console.log(
          `✅ Successfully set up ${questResult.quests.length} daily quests for new user`
        );

        return {
          success: true,
          user: registerResult.user,
          quests: questResult.quests,
          questsCreated: questResult.created,
        };
      } else {
        // Registration succeeded but quest creation failed
        console.warn(
          "⚠️ User registered but quest creation failed:",
          questResult.error
        );

        return {
          success: true,
          user: registerResult.user,
          quests: [],
          questsCreated: false,
          error:
            "Account created successfully, but daily quests will be available after next login.",
        };
      }
    } catch (error: any) {
      console.error("❌ Registration with quests failed:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    loginWithQuests,
    registerWithQuests,
    isProcessing,
  };
};
