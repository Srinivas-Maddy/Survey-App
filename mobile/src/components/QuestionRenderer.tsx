import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  hideNextOnYes?: boolean;
}

interface Props {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export default function QuestionRenderer({ question, value, onChange }: Props) {
  const strValue = typeof value === "string" ? value : "";
  const arrValue = Array.isArray(value) ? value : [];

  switch (question.type) {
    case "text":
    case "email":
    case "phone":
      return (
        <TextInput
          style={styles.input}
          value={strValue}
          onChangeText={(t) => onChange(t)}
          placeholder={`Enter ${question.type === "email" ? "email" : question.type === "phone" ? "phone number" : "your answer"}`}
          keyboardType={question.type === "email" ? "email-address" : question.type === "phone" ? "phone-pad" : "default"}
          autoCapitalize={question.type === "email" ? "none" : "sentences"}
        />
      );

    case "textarea":
      return (
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          value={strValue}
          onChangeText={(t) => onChange(t)}
          placeholder="Enter your answer"
          multiline
          numberOfLines={4}
        />
      );

    case "number":
      return (
        <TextInput
          style={styles.input}
          value={strValue}
          onChangeText={(t) => onChange(t)}
          placeholder="Enter a number"
          keyboardType="numeric"
        />
      );

    case "date":
      return (
        <TextInput
          style={styles.input}
          value={strValue}
          onChangeText={(t) => onChange(t)}
          placeholder="YYYY-MM-DD"
        />
      );

    case "radio":
    case "select":
      return (
        <View style={styles.optionsContainer}>
          {(question.options || []).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionButton, strValue === opt && styles.optionSelected]}
              onPress={() => onChange(opt)}
            >
              <View style={[styles.radioCircle, strValue === opt && styles.radioCircleSelected]} />
              <Text style={[styles.optionText, strValue === opt && styles.optionTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case "checkbox":
    case "list":
      return (
        <View style={styles.optionsContainer}>
          {(question.options || []).map((opt) => {
            const isChecked = arrValue.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optionButton, isChecked && styles.optionSelected]}
                onPress={() => {
                  if (isChecked) onChange(arrValue.filter((v) => v !== opt));
                  else onChange([...arrValue, opt]);
                }}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxSelected]}>
                  {isChecked && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.optionText, isChecked && styles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );

    case "yesno":
      return (
        <View style={styles.yesnoContainer}>
          {["Yes", "No"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.yesnoButton, strValue === opt && (opt === "Yes" ? styles.yesSelected : styles.noSelected)]}
              onPress={() => onChange(opt)}
            >
              <Text style={[styles.yesnoText, strValue === opt && styles.yesnoTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case "rating":
      return (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => onChange(star.toString())}>
              <Text style={[styles.star, Number(strValue) >= star && styles.starSelected]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case "image":
      return (
        <View>
          {strValue ? (
            <Image source={{ uri: strValue }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePlaceholder}>Image upload not available in mobile app</Text>
          )}
        </View>
      );

    default:
      return (
        <TextInput
          style={styles.input}
          value={strValue}
          onChangeText={(t) => onChange(t)}
          placeholder="Enter your answer"
        />
      );
  }
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#1f2937",
  },
  optionsContainer: { gap: 8 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    gap: 12,
  },
  optionSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#eef2ff",
  },
  optionText: { fontSize: 15, color: "#374151", flex: 1 },
  optionTextSelected: { color: "#4338ca", fontWeight: "600" },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
  },
  radioCircleSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#6366f1",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#6366f1",
    backgroundColor: "#6366f1",
  },
  checkmark: { color: "white", fontSize: 12, fontWeight: "bold" },
  yesnoContainer: { flexDirection: "row", gap: 12 },
  yesnoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  yesSelected: { borderColor: "#10b981", backgroundColor: "#ecfdf5" },
  noSelected: { borderColor: "#ef4444", backgroundColor: "#fef2f2" },
  yesnoText: { fontSize: 16, fontWeight: "600", color: "#6b7280" },
  yesnoTextSelected: { color: "#1f2937" },
  ratingContainer: { flexDirection: "row", gap: 8, justifyContent: "center" },
  star: { fontSize: 40, color: "#d1d5db" },
  starSelected: { color: "#f59e0b" },
  imagePreview: { width: "100%", height: 200, borderRadius: 12 },
  imagePlaceholder: { color: "#9ca3af", textAlign: "center", padding: 20, fontSize: 14 },
});
