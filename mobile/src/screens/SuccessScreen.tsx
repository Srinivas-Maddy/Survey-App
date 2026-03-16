import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
  onDone: () => void;
}

export default function SuccessScreen({ onDone }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.checkCircle}>
          <Text style={styles.check}>✓</Text>
        </View>
        <Text style={styles.title}>Response Submitted!</Text>
        <Text style={styles.subtitle}>The survey response has been recorded successfully.</Text>
        <TouchableOpacity style={styles.button} onPress={onDone}>
          <Text style={styles.buttonText}>Collect Another Response</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "white", borderRadius: 24, padding: 40, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  check: { fontSize: 40, color: "#10b981", fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#6b7280", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  button: { backgroundColor: "#4f46e5", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 16, width: "100%", alignItems: "center" },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
