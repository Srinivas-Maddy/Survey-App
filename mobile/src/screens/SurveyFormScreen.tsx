import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import QuestionRenderer from "../components/QuestionRenderer";
import { submitResponse } from "../api/client";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  hideNextOnYes?: boolean;
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Props {
  survey: Survey;
  onBack: () => void;
  onSuccess: () => void;
}

export default function SurveyFormScreen({ survey, onBack, onSuccess }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const setAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isQuestionVisible = (index: number): boolean => {
    if (index === 0) return true;
    const prevQ = survey.questions[index - 1];
    if (prevQ.type === "yesno" && prevQ.hideNextOnYes) {
      const prevAnswer = answers[prevQ.id];
      if (prevAnswer === "Yes") return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validate required fields
    for (let i = 0; i < survey.questions.length; i++) {
      const q = survey.questions[i];
      if (!isQuestionVisible(i)) continue;
      if (q.required) {
        const val = answers[q.id];
        if (!val || (Array.isArray(val) ? val.length === 0 : val.trim() === "")) {
          Alert.alert("Required", `Please answer: "${q.label}"`);
          return;
        }
      }
    }

    // Strip hidden question answers
    const filteredAnswers: Record<string, string | string[]> = {};
    survey.questions.forEach((q, i) => {
      if (isQuestionVisible(i) && answers[q.id]) {
        filteredAnswers[q.id] = answers[q.id];
      }
    });

    setSubmitting(true);
    try {
      await submitResponse(survey._id, filteredAnswers);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Submission failed";
      Alert.alert("Error", msg);
    }
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{survey.title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {survey.description ? <Text style={styles.description}>{survey.description}</Text> : null}

        {survey.questions.map((q, i) => {
          if (!isQuestionVisible(i)) return null;
          return (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{i + 1}</Text>
                </View>
                <View style={styles.questionLabelContainer}>
                  <Text style={styles.questionLabel}>{q.label}</Text>
                  {q.required && <Text style={styles.required}>Required</Text>}
                </View>
              </View>
              <QuestionRenderer
                question={q}
                value={answers[q.id] || (["checkbox", "list"].includes(q.type) ? [] : "")}
                onChange={(val) => setAnswer(q.id, val)}
              />
            </View>
          );
        })}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Submit Response</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "white", paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  backText: { color: "#4f46e5", fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: "#1f2937", flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  description: { fontSize: 15, color: "#6b7280", marginBottom: 20, lineHeight: 22 },
  questionCard: { backgroundColor: "white", borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  questionHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14, gap: 12 },
  questionNumber: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },
  questionNumberText: { fontSize: 13, fontWeight: "bold", color: "#4f46e5" },
  questionLabelContainer: { flex: 1 },
  questionLabel: { fontSize: 16, fontWeight: "600", color: "#1f2937", lineHeight: 22 },
  required: { fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: "500" },
  submitBtn: { backgroundColor: "#4f46e5", borderRadius: 14, padding: 18, alignItems: "center", marginTop: 8 },
  submitText: { color: "white", fontSize: 17, fontWeight: "bold" },
});
