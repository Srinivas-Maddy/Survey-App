"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface Survey {
  _id: string;
  title: string;
  description: string;
  publicId: string;
  isActive: boolean;
  questions: Question[];
}

interface SurveyResponse {
  _id: string;
  answers: Record<string, string | string[]>;
  submittedAt: string;
}

const BAR_COLORS = [
  "from-indigo-500 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-red-500",
  "from-cyan-500 to-sky-500",
];

const PIE_COLORS = [
  "#6366f1", "#a855f7", "#10b981", "#f59e0b", "#ef4444", "#06b6d4",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316",
];

export default function SurveyDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"analytics" | "responses">("analytics");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/surveys/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setSurvey(data.survey);
        setResponses(data.responses);
        setLoading(false);
      })
      .catch(() => router.replace("/dashboard"));
  }, [id, router]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${survey!.publicId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !survey)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );

  const getAnalytics = (question: Question) => {
    const counts: Record<string, number> = {};
    responses.forEach((r) => {
      const answer = r.answers[question.id];
      if (Array.isArray(answer)) {
        answer.forEach((a) => (counts[a] = (counts[a] || 0) + 1));
      } else if (answer) {
        counts[answer] = (counts[answer] || 0) + 1;
      }
    });
    return counts;
  };

  const totalAnswered = (question: Question) => {
    return responses.filter((r) => {
      const a = r.answers[question.id];
      return a && (Array.isArray(a) ? a.length > 0 : a.trim() !== "");
    }).length;
  };

  const isChoice = (type: string) => ["radio", "checkbox", "select", "list", "yesno"].includes(type);
  const isImage = (val: string) => typeof val === "string" && val.startsWith("data:image/");
  const isRating = (type: string) => type === "rating";

  // Summary stats
  const avgCompletionRate = survey.questions.length > 0
    ? Math.round(survey.questions.reduce((sum, q) => sum + (totalAnswered(q) / Math.max(responses.length, 1)) * 100, 0) / survey.questions.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{survey.title}</h1>
              <p className="text-xs text-gray-400">Survey Analytics</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{responses.length}</p>
                <p className="text-sm text-gray-500">Total Responses</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{survey.questions.length}</p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{avgCompletionRate}%</p>
                <p className="text-sm text-gray-500">Avg Completion</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <button onClick={copyLink} className="text-sm font-medium text-amber-600 hover:underline">
                  {copied ? "Copied!" : "Copy Survey Link"}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">Share with respondents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-200 w-fit">
          <button
            onClick={() => setTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "analytics"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
          <button
            onClick={() => setTab("responses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "responses"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Individual Responses ({responses.length})
          </button>
        </div>

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {responses.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No responses yet</h3>
                <p className="text-gray-400 mb-4">Share your survey link to start collecting responses</p>
                <button
                  onClick={copyLink}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200"
                >
                  {copied ? "Link Copied!" : "Copy Survey Link"}
                </button>
              </div>
            ) : (
              survey.questions.map((q, qIndex) => {
                const counts = getAnalytics(q);
                const total = totalAnswered(q);
                const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
                const topAnswer = entries.length > 0 ? entries[0] : null;

                return (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    {/* Question Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {qIndex + 1}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{q.label}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{q.type.toUpperCase()}</span>
                              <span className="text-xs text-gray-400">{total} of {responses.length} answered</span>
                            </div>
                          </div>
                        </div>
                        {/* Response rate mini-ring */}
                        <div className="flex flex-col items-center">
                          <div className="relative w-14 h-14">
                            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                              <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                              <circle
                                cx="28" cy="28" r="22" fill="none"
                                stroke={responses.length > 0 && total / responses.length >= 0.7 ? "#10b981" : total / responses.length >= 0.4 ? "#f59e0b" : "#ef4444"}
                                strokeWidth="4"
                                strokeDasharray={`${(total / Math.max(responses.length, 1)) * 138.2} 138.2`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                              {responses.length > 0 ? Math.round((total / responses.length) * 100) : 0}%
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1">Response</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {isChoice(q.type) ? (
                        <div>
                          {/* Top answer highlight */}
                          {topAnswer && (
                            <div className="mb-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 flex items-center justify-between">
                              <div>
                                <p className="text-xs text-indigo-500 font-medium mb-1">Most Popular Answer</p>
                                <p className="font-bold text-gray-900 text-lg">{topAnswer[0]}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-indigo-600">{Math.round((topAnswer[1] / responses.length) * 100)}%</p>
                                <p className="text-xs text-gray-400">{topAnswer[1]} responses</p>
                              </div>
                            </div>
                          )}

                          {/* Bar chart */}
                          <div className="space-y-3">
                            {entries.map(([option, count], i) => {
                              const pct = responses.length > 0 ? Math.round((count / responses.length) * 100) : 0;
                              const colorClass = BAR_COLORS[i % BAR_COLORS.length];
                              return (
                                <div key={option}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                      {option}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                                  </div>
                                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pie-style legend (mini donut visualization) */}
                          {entries.length > 1 && (
                            <div className="mt-5 pt-5 border-t border-gray-100">
                              <div className="flex items-center gap-6 flex-wrap">
                                <div className="relative w-24 h-24 flex-shrink-0">
                                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                                    {(() => {
                                      let offset = 0;
                                      const totalCount = entries.reduce((s, e) => s + e[1], 0);
                                      return entries.map(([option, count], i) => {
                                        const pct = (count / totalCount) * 251.2;
                                        const el = (
                                          <circle
                                            key={option}
                                            cx="48" cy="48" r="40" fill="none"
                                            stroke={PIE_COLORS[i % PIE_COLORS.length]}
                                            strokeWidth="16"
                                            strokeDasharray={`${pct} ${251.2 - pct}`}
                                            strokeDashoffset={-offset}
                                          />
                                        );
                                        offset += pct;
                                        return el;
                                      });
                                    })()}
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-600">{entries.reduce((s, e) => s + e[1], 0)}</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-x-5 gap-y-2">
                                  {entries.map(([option, count], i) => (
                                    <div key={option} className="flex items-center gap-2">
                                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                      <span className="text-sm text-gray-600">{option}</span>
                                      <span className="text-xs text-gray-400">({count})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : isRating(q.type) ? (
                        /* Rating analytics */
                        <div>
                          {(() => {
                            const ratings = responses.map((r) => r.answers[q.id]).filter((a) => a && typeof a === "string" && a.trim() !== "").map(Number).filter((n) => !isNaN(n));
                            const avg = ratings.length > 0 ? (ratings.reduce((s, v) => s + v, 0) / ratings.length) : 0;
                            const distribution = [1, 2, 3, 4, 5].map((star) => ({ star, count: ratings.filter((r) => r === star).length }));
                            return (
                              <div>
                                <div className="mb-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 flex items-center gap-4">
                                  <div>
                                    <p className="text-xs text-amber-600 font-medium mb-1">Average Rating</p>
                                    <p className="text-3xl font-bold text-gray-900">{avg.toFixed(1)}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg key={star} className={`w-7 h-7 ${star <= Math.round(avg) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-400 ml-auto">{ratings.length} ratings</p>
                                </div>
                                <div className="space-y-2">
                                  {distribution.reverse().map(({ star, count }) => {
                                    const pct = ratings.length > 0 ? Math.round((count / ratings.length) * 100) : 0;
                                    return (
                                      <div key={star} className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-600 w-12 flex items-center gap-1">
                                          {star} <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        </span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        /* Text / Image responses */
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-500">{total} {q.type === "image" ? "image" : "text"} responses</span>
                          </div>
                          <div className={`${q.type === "image" ? "grid grid-cols-2 sm:grid-cols-3 gap-3" : "space-y-2"} max-h-96 overflow-y-auto pr-2`}>
                            {responses.map((r, rIdx) => {
                              const ans = r.answers[q.id];
                              if (!ans || (typeof ans === "string" && ans.trim() === "")) return null;
                              const ansStr = ans as string;

                              if (isImage(ansStr)) {
                                return (
                                  <div key={r._id} className="relative group">
                                    <img src={ansStr} alt={`Response ${rIdx + 1}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                      #{rIdx + 1} &middot; {new Date(r.submittedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={r._id} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition">
                                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                    {rIdx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{ansStr}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(r.submittedAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Individual Responses Tab */}
        {tab === "responses" && (
          <div className="space-y-4">
            {responses.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                <p className="text-gray-500">No responses yet.</p>
              </div>
            ) : (
              responses.map((r, i) => (
                <div key={r._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {responses.length - i}
                      </div>
                      <span className="text-white font-medium">Response #{responses.length - i}</span>
                    </div>
                    <span className="text-white/70 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(r.submittedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {survey.questions.map((q, qi) => {
                        const ans = r.answers[q.id];
                        const displayAns = Array.isArray(ans) ? ans.join(", ") : ans || "—";
                        const hasAnswer = ans && (Array.isArray(ans) ? ans.length > 0 : ans.trim() !== "");

                        return (
                          <div key={q.id} className={`rounded-xl p-4 ${hasAnswer ? "bg-gray-50" : "bg-red-50/50"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: PIE_COLORS[qi % PIE_COLORS.length] + "22", color: PIE_COLORS[qi % PIE_COLORS.length] }}>
                                {qi + 1}
                              </span>
                              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{q.label}</p>
                            </div>
                            {hasAnswer && typeof displayAns === "string" && isImage(displayAns) ? (
                              <img src={displayAns} alt="Uploaded" className="max-h-40 rounded-lg border border-gray-200" />
                            ) : hasAnswer && isRating(q.type) ? (
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg key={star} className={`w-6 h-6 ${star <= Number(displayAns) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-sm text-gray-500 ml-1">({displayAns}/5)</span>
                              </div>
                            ) : (
                              <p className={`font-medium ${hasAnswer ? "text-gray-800" : "text-gray-400 italic"}`}>
                                {displayAns}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
