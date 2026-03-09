"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SurveyStats {
  _id: string;
  title: string;
  createdAt: string;
  isActive: boolean;
  questionCount: number;
  responseCount: number;
  oldestResponse: string | null;
  newestResponse: string | null;
}

interface CollectionStat {
  name: string;
  sizeBytes: number;
  count: number;
}

interface StorageInfo {
  totalMB: number;
  usedMB: number;
  freeMB: number;
  percent: number;
  usedBytes: number;
  collections: CollectionStat[];
}

interface Stats {
  surveyCount: number;
  responseCount: number;
  userCount: number;
  surveys: SurveyStats[];
  storage: StorageInfo;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [olderThanDays, setOlderThanDays] = useState(0);
  const [confirmAction, setConfirmAction] = useState<{ action: string; label: string; surveyId?: string } | null>(null);

  const fetchStats = () => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  };

  useEffect(() => {
    fetchStats();
  }, [router]);

  const runCleanup = async (action: string, surveyId?: string) => {
    setProcessing(action);
    setResult(null);
    setConfirmAction(null);

    try {
      const res = await fetch("/api/admin/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, surveyId, olderThanDays }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ message: `Successfully deleted ${data.deleted} record(s).`, type: "success" });
        fetchStats();
      } else {
        setResult({ message: data.error || "Failed to perform cleanup.", type: "error" });
      }
    } catch {
      setResult({ message: "Network error. Please try again.", type: "error" });
    }
    setProcessing(null);
  };

  const askConfirm = (action: string, label: string, surveyId?: string) => {
    setConfirmAction({ action, label, surveyId });
  };

  if (loading || !stats)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Confirm Deletion</h3>
            <p className="text-gray-500 text-center mb-6">
              Are you sure you want to <span className="font-semibold text-red-600">{confirmAction.label}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => runCleanup(confirmAction.action, confirmAction.surveyId)}
                disabled={processing !== null}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {processing ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Storage Manager</h1>
              <p className="text-xs text-gray-400">Manage your database storage</p>
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

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Result Banner */}
        {result && (
          <div
            className={`mb-6 px-5 py-4 rounded-xl flex items-center gap-3 ${
              result.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={result.type === "success" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
              />
            </svg>
            <span className="font-medium">{result.message}</span>
            <button onClick={() => setResult(null)} className="ml-auto hover:opacity-70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Storage Visual Dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Storage Overview</h2>
              <p className="text-xs text-gray-400">MongoDB Atlas Free Tier (512 MB)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Storage Gauge */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <div className="relative w-44 h-44">
                <svg className="w-44 h-44 -rotate-90" viewBox="0 0 176 176">
                  <circle cx="88" cy="88" r="72" fill="none" stroke="#f3f4f6" strokeWidth="14" />
                  <circle
                    cx="88" cy="88" r="72" fill="none"
                    stroke={stats.storage.percent >= 80 ? "#ef4444" : stats.storage.percent >= 50 ? "#f59e0b" : "#10b981"}
                    strokeWidth="14"
                    strokeDasharray={`${(stats.storage.percent / 100) * 452.4} 452.4`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${stats.storage.percent >= 80 ? "text-red-600" : stats.storage.percent >= 50 ? "text-amber-600" : "text-emerald-600"}`}>
                    {stats.storage.percent}%
                  </span>
                  <span className="text-xs text-gray-400">Used</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-700">
                  {stats.storage.usedMB} MB <span className="text-gray-400">of</span> {stats.storage.totalMB} MB
                </p>
                <p className={`text-lg font-bold mt-1 ${stats.storage.percent >= 80 ? "text-red-600" : stats.storage.percent >= 50 ? "text-amber-600" : "text-emerald-600"}`}>
                  {stats.storage.freeMB} MB Free
                </p>
                {stats.storage.percent >= 80 && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Storage critically low! Clean up now.</p>
                )}
                {stats.storage.percent >= 50 && stats.storage.percent < 80 && (
                  <p className="text-xs text-amber-500 mt-1 font-medium">Consider cleaning up old data.</p>
                )}
              </div>
            </div>

            {/* Storage Bar + Stats */}
            <div className="lg:col-span-2">
              {/* Storage Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">Storage Usage</span>
                  <span className="text-sm text-gray-400">{stats.storage.usedMB} MB / {stats.storage.totalMB} MB</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      stats.storage.percent >= 80
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : stats.storage.percent >= 50
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                    style={{ width: `${Math.max(stats.storage.percent, 1)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0 MB</span>
                  <span className="text-xs text-gray-400">256 MB</span>
                  <span className="text-xs text-gray-400">512 MB</span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{stats.surveyCount}</p>
                  <p className="text-[11px] text-indigo-400 font-medium">Surveys</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{stats.responseCount}</p>
                  <p className="text-[11px] text-purple-400 font-medium">Responses</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{stats.storage.freeMB}</p>
                  <p className="text-[11px] text-emerald-400 font-medium">MB Free</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.userCount}</p>
                  <p className="text-[11px] text-amber-400 font-medium">Users</p>
                </div>
              </div>

              {/* Collection Breakdown */}
              {stats.storage.collections.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Storage by Collection</h3>
                  <div className="space-y-2">
                    {stats.storage.collections.map((col, i) => {
                      const colColors = ["bg-indigo-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
                      const colMB = (col.sizeBytes / (1024 * 1024)).toFixed(3);
                      const colKB = (col.sizeBytes / 1024).toFixed(1);
                      const colPercent = stats.storage.usedBytes > 0 ? (col.sizeBytes / stats.storage.usedBytes) * 100 : 0;
                      const sizeLabel = col.sizeBytes > 1024 * 1024 ? `${colMB} MB` : `${colKB} KB`;

                      return (
                        <div key={col.name} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colColors[i % colColors.length]}`} />
                          <span className="text-sm text-gray-600 w-24 truncate font-medium">{col.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colColors[i % colColors.length]}`}
                              style={{ width: `${Math.max(colPercent, 1)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-20 text-right">{sizeLabel}</span>
                          <span className="text-xs text-gray-400 w-16 text-right">{col.count} docs</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Quick Cleanup Actions</h2>
          <p className="text-sm text-gray-400 mb-5">Free up storage by removing old or unnecessary data</p>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Delete Old Responses */}
            <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete Old Responses</h3>
                  <p className="text-xs text-gray-400">Remove responses older than specified days</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Older than</span>
                <select
                  value={olderThanDays}
                  onChange={(e) => setOlderThanDays(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={0}>All time (delete all)</option>
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days</option>
                </select>
                <button
                  onClick={() => askConfirm("delete-old-responses", olderThanDays === 0 ? "delete ALL responses across all surveys" : `delete all responses older than ${olderThanDays} day(s)`)}
                  disabled={processing !== null}
                  className="ml-auto px-4 py-2 bg-orange-600 text-white text-sm rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
                >
                  Clean Up
                </button>
              </div>
            </div>

            {/* Delete All Responses */}
            <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete All Responses</h3>
                  <p className="text-xs text-gray-400">Remove all responses but keep surveys</p>
                </div>
              </div>
              <button
                onClick={() => askConfirm("delete-all-responses", `delete ALL ${stats.responseCount} responses`)}
                disabled={processing !== null || stats.responseCount === 0}
                className="w-full py-2.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                Delete All Responses ({stats.responseCount})
              </button>
            </div>

            {/* Delete Inactive Surveys */}
            <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete Inactive Surveys</h3>
                  <p className="text-xs text-gray-400">Remove paused surveys and their responses</p>
                </div>
              </div>
              <button
                onClick={() => askConfirm("delete-inactive-surveys", "delete all inactive/paused surveys and their responses")}
                disabled={processing !== null}
                className="w-full py-2.5 bg-gray-600 text-white text-sm rounded-lg font-medium hover:bg-gray-700 transition disabled:opacity-50"
              >
                Delete Inactive Surveys
              </button>
            </div>

            {/* Refresh Stats */}
            <div className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Refresh Stats</h3>
                  <p className="text-xs text-gray-400">Reload storage statistics</p>
                </div>
              </div>
              <button
                onClick={() => { setLoading(true); fetchStats(); }}
                className="w-full py-2.5 bg-emerald-600 text-white text-sm rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Per-Survey Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Survey-wise Storage</h2>
            <p className="text-sm text-gray-400">Manage responses per survey</p>
          </div>

          {stats.surveys.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No surveys found.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.surveys.map((survey) => (
                <div key={survey._id} className="px-6 py-4 hover:bg-gray-50/50 transition">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{survey.title}</h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            survey.isActive
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {survey.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{survey.questionCount} questions</span>
                        <span className="font-semibold text-indigo-600">{survey.responseCount} responses</span>
                        <span>Created {new Date(survey.createdAt).toLocaleDateString()}</span>
                        {survey.oldestResponse && (
                          <span>
                            Oldest: {new Date(survey.oldestResponse).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          askConfirm(
                            "delete-responses-by-survey",
                            `delete all ${survey.responseCount} responses from "${survey.title}"`,
                            survey._id
                          )
                        }
                        disabled={processing !== null || survey.responseCount === 0}
                        className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition disabled:opacity-40"
                      >
                        Clear Responses ({survey.responseCount})
                      </button>
                      <button
                        onClick={() =>
                          askConfirm(
                            "delete-survey-with-responses",
                            `delete survey "${survey.title}" and all its responses`,
                            survey._id
                          )
                        }
                        disabled={processing !== null}
                        className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition disabled:opacity-40"
                      >
                        Delete Survey
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
