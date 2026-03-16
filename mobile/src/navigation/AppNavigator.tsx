import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import SurveysScreen from "../screens/SurveysScreen";
import SurveyFormScreen from "../screens/SurveyFormScreen";
import SuccessScreen from "../screens/SuccessScreen";
import { hasToken, getMe } from "../api/client";

type Screen = "loading" | "login" | "surveys" | "form" | "success";

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: { id: string; type: string; label: string; required: boolean; options?: string[]; hideNextOnYes?: boolean }[];
}

export default function AppNavigator() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    (async () => {
      const tokenExists = await hasToken();
      if (tokenExists) {
        try {
          await getMe();
          setScreen("surveys");
        } catch {
          setScreen("login");
        }
      } else {
        setScreen("login");
      }
    })();
  }, []);

  if (screen === "loading") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (screen === "login") {
    return <LoginScreen onLogin={() => setScreen("surveys")} />;
  }

  if (screen === "form" && selectedSurvey) {
    return (
      <SurveyFormScreen
        survey={selectedSurvey}
        onBack={() => setScreen("surveys")}
        onSuccess={() => setScreen("success")}
      />
    );
  }

  if (screen === "success") {
    return <SuccessScreen onDone={() => setScreen("surveys")} />;
  }

  return (
    <SurveysScreen
      onSelectSurvey={(survey) => { setSelectedSurvey(survey as Survey); setScreen("form"); }}
      onLogout={() => setScreen("login")}
    />
  );
}
