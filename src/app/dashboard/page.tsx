"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Survey {
  _id: string;
  title: string;
  description: string;
  publicId: string;
  isActive: boolean;
  questions: { id: string }[];
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ qrDataUrl: string; publicUrl: string; title: string } | null>(null);
  const [qrLoading, setQrLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch("/api/surveys").then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([userData, surveyData]) => {
        setUser(userData.user);
        setSurveys(surveyData.surveys);
        setLoading(false);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this survey and all its responses?")) return;
    await fetch(`/api/surveys/${id}`, { method: "DELETE" });
    setSurveys(surveys.filter((s) => s._id !== id));
  };

  const handleToggle = async (id: string) => {
    const res = await fetch(`/api/surveys/${id}/toggle`, { method: "PATCH" });
    const data = await res.json();
    setSurveys(surveys.map((s) => (s._id === id ? data.survey : s)));
  };

  const copyLink = (publicId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${publicId}`);
    setCopied(publicId);
    setTimeout(() => setCopied(null), 2000);
  };

  const showQrCode = async (surveyId: string) => {
    setQrLoading(surveyId);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/qrcode`);
      if (res.ok) {
        const data = await res.json();
        setQrModal(data);
      }
    } catch { /* ignore */ }
    setQrLoading(null);
  };

  const downloadQr = () => {
    if (!qrModal) return;
    const link = document.createElement("a");
    link.download = `${qrModal.title.replace(/[^a-zA-Z0-9]/g, "_")}_QR.png`;
    link.href = qrModal.qrDataUrl;
    link.click();
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );

  const activeSurveys = surveys.filter((s) => s.isActive).length;
  const totalQuestions = surveys.reduce((sum, s) => sum + s.questions.length, 0);

  const colors = [
    "from-indigo-500 to-blue-500",
    "from-purple-500 to-pink-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-red-500",
    "from-cyan-500 to-blue-500",
  ];

  const renderSurveyCard = (survey: Survey, index: number) => {
    const colorClass = colors[index % colors.length];
    return (
      <div
        key={survey._id}
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-300 group ${
          survey.isActive ? "border-gray-100" : "border-gray-200 opacity-75"
        }`}
      >
        <div className={`h-2 bg-gradient-to-r ${survey.isActive ? colorClass : "from-gray-300 to-gray-400"}`} />
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className={`text-lg font-bold transition ${survey.isActive ? "text-gray-900 group-hover:text-indigo-600" : "text-gray-500"}`}>
              {survey.title}
            </h3>
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                survey.isActive
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {survey.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {survey.description || "No description provided"}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {survey.questions.length} questions
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(survey.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => router.push(`/dashboard/survey/${survey._id}`)}
                className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Results
              </button>
              <button
                onClick={() => router.push(`/dashboard/edit/${survey._id}`)}
                className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-medium transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={() => copyLink(survey.publicId)}
                className={`flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition ${
                  copied === survey.publicId
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {copied === survey.publicId ? "Copied!" : "Share"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => showQrCode(survey._id)}
                disabled={qrLoading === survey._id}
                className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 font-medium transition disabled:opacity-50"
              >
                {qrLoading === survey._id ? (
                  <div className="w-3.5 h-3.5 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                )}
                QR Code
              </button>
              <button
                onClick={() => handleToggle(survey._id)}
                className={`flex items-center justify-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition ${
                  survey.isActive
                    ? "bg-orange-50 text-orange-600 hover:bg-orange-100"
                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={survey.isActive ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} />
                </svg>
                {survey.isActive ? "Pause" : "Resume"}
              </button>
              <button
                onClick={() => handleDelete(survey._id)}
                className="flex items-center justify-center gap-1.5 text-sm px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Survey App
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={() => router.push("/dashboard/admin")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition px-3 py-1.5 rounded-lg hover:bg-orange-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Storage
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{user?.name}</span>
          </h2>
          <p className="text-gray-500 mt-1">Manage your surveys and track responses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
                <p className="text-sm text-gray-500">Total Surveys</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeSurveys}</p>
                <p className="text-sm text-gray-500">Active Surveys</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                <p className="text-sm text-gray-500">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">My Surveys</h3>
          <button
            onClick={() => router.push("/dashboard/create")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Survey
          </button>
        </div>

        {/* Survey Cards */}
        {surveys.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No surveys yet</h3>
            <p className="text-gray-400 mb-6">Create your first survey and start collecting responses!</p>
            <button
              onClick={() => router.push("/dashboard/create")}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200 font-medium"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Surveys */}
            {surveys.filter((s) => s.isActive).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Active Surveys</h4>
                  <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                    {surveys.filter((s) => s.isActive).length}
                  </span>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.filter((s) => s.isActive).map((survey, index) => {
                    return renderSurveyCard(survey, index);
                  })}
                </div>
              </div>
            )}

            {/* Inactive Surveys */}
            {surveys.filter((s) => !s.isActive).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-500">Inactive Surveys</h4>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                    {surveys.filter((s) => !s.isActive).length}
                  </span>
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.filter((s) => !s.isActive).map((survey, index) => {
                    return renderSurveyCard(survey, index);
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
              <h3 className="text-lg font-bold">QR Code</h3>
              <p className="text-indigo-100 text-sm mt-1 truncate">{qrModal.title}</p>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm">
                <img src={qrModal.qrDataUrl} alt="QR Code" className="w-56 h-56" />
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center break-all">{qrModal.publicUrl}</p>
              <div className="flex gap-3 mt-5 w-full">
                <button
                  onClick={downloadQr}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => setQrModal(null)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
