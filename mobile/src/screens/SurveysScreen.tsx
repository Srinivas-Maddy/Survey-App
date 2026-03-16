import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { getAssignedSurveys, logout } from "../api/client";

interface Survey {
  _id: string;
  title: string;
  description: string;
  questions: { id: string }[];
}

interface Props {
  onSelectSurvey: (survey: Survey) => void;
  onLogout: () => void;
}

export default function SurveysScreen({ onSelectSurvey, onLogout }: Props) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSurveys = useCallback(async () => {
    try {
      const data = await getAssignedSurveys();
      setSurveys(data);
    } catch { /* ignore */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadSurveys(); }, [loadSurveys]);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#4f46e5" /></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Assigned Surveys</Text>
          <Text style={styles.subtitle}>{surveys.length} survey{surveys.length !== 1 ? "s" : ""} available</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={surveys}
        keyExtractor={(s) => s._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSurveys(); }} colors={["#4f46e5"]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No surveys assigned</Text>
            <Text style={styles.emptyText}>Ask your admin to assign surveys to you</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelectSurvey(item)} activeOpacity={0.7}>
            <View style={styles.cardTop} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description || "No description"}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardMetaText}>{item.questions.length} questions</Text>
                <Text style={styles.startText}>Start →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  header: { backgroundColor: "white", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: "bold", color: "#1f2937" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: "#fef2f2" },
  logoutText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: "white", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop: { height: 4, backgroundColor: "#4f46e5" },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: "bold", color: "#1f2937" },
  cardDesc: { fontSize: 14, color: "#6b7280", marginTop: 6, lineHeight: 20 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  cardMetaText: { fontSize: 12, color: "#9ca3af" },
  startText: { fontSize: 14, color: "#4f46e5", fontWeight: "600" },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#6b7280" },
  emptyText: { fontSize: 14, color: "#9ca3af", marginTop: 8 },
});
