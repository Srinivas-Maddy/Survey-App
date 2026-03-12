"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number" | "date" | "list" | "yesno" | "image" | "rating" | "phone" | "email";
  label: string;
  required: boolean;
  options: string[];
  hideNextOnYes: boolean;
}

const QUESTION_TYPES = [
  { value: "text", label: "Short Text", icon: "T", color: "bg-blue-100 text-blue-600 border-blue-200" },
  { value: "textarea", label: "Long Text", icon: "¶", color: "bg-sky-100 text-sky-600 border-sky-200" },
  { value: "radio", label: "Single Choice", icon: "◉", color: "bg-violet-100 text-violet-600 border-violet-200" },
  { value: "checkbox", label: "Multiple Choice", icon: "☑", color: "bg-purple-100 text-purple-600 border-purple-200" },
  { value: "select", label: "Dropdown", icon: "▾", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
  { value: "number", label: "Number", icon: "#", color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  { value: "date", label: "Date", icon: "📅", color: "bg-teal-100 text-teal-600 border-teal-200" },
  { value: "list", label: "List", icon: "≡", color: "bg-cyan-100 text-cyan-600 border-cyan-200" },
  { value: "yesno", label: "Yes / No", icon: "✓✗", color: "bg-amber-100 text-amber-600 border-amber-200" },
  { value: "image", label: "Image Upload", icon: "🖼", color: "bg-pink-100 text-pink-600 border-pink-200" },
  { value: "rating", label: "Rating", icon: "★", color: "bg-orange-100 text-orange-600 border-orange-200" },
  { value: "phone", label: "Phone Number", icon: "📞", color: "bg-green-100 text-green-600 border-green-200" },
  { value: "email", label: "Email", icon: "✉", color: "bg-rose-100 text-rose-600 border-rose-200" },
];

export default function CreateSurveyPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState("");


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Image must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: uuidv4(), type: "text", label: "", required: false, options: [], hideNextOnYes: true },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const duplicateQuestion = (index: number) => {
    const copy = { ...questions[index], id: uuidv4(), options: [...questions[index].options] };
    const updated = [...questions];
    updated.splice(index + 1, 0, copy);
    setQuestions(updated);
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = [...updated[qIndex].options, ""];
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Add at least one question");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, questions, logo }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to create survey");
      setSaving(false);
    }
  };

  const needsOptions = (type: string) => ["radio", "checkbox", "select", "list"].includes(type);
  const getTypeInfo = (type: string) => QUESTION_TYPES.find((t) => t.value === type) || QUESTION_TYPES[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Create Survey</h1>
              <p className="text-xs text-gray-400">{questions.length} question{questions.length !== 1 ? "s" : ""} added</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim() || questions.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publish Survey
              </>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Survey Details Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-6">
              <div className="mb-1 flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Survey Title</label>
                <span className="text-xs text-gray-300">{title.length}/120</span>
              </div>
              <input
                type="text"
                placeholder="e.g., Customer Satisfaction Survey 2025"
                required
                maxLength={120}
                className="w-full text-xl font-bold text-gray-800 border-0 border-b-2 border-gray-100 pb-3 focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-300 bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="mt-5 mb-1 flex justify-between items-center">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
                <span className="text-xs text-gray-300">{description.length}/500</span>
              </div>
              <textarea
                placeholder="Briefly describe the purpose of this survey (optional)"
                maxLength={500}
                className="w-full text-gray-600 border-0 border-b-2 border-gray-100 pb-3 focus:outline-none focus:border-indigo-500 transition resize-none placeholder:text-gray-300 bg-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              {/* Logo Upload */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                  Logo / Banner
                  <span className="text-gray-300 font-normal normal-case tracking-normal ml-2">optional, max 500KB</span>
                </label>
                {logo ? (
                  <div className="relative inline-block group">
                    <img src={logo} alt="Logo" className="max-h-24 rounded-xl border border-gray-200 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition group">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition">Click to upload</p>
                      <p className="text-xs text-gray-400">PNG, JPG, SVG up to 500KB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((q, qIndex) => {
            const typeInfo = getTypeInfo(q.type);
            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group/card hover:shadow-md transition-shadow duration-300">
                {/* Question Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    {/* Reorder buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveQuestion(qIndex, -1)}
                        disabled={qIndex === 0}
                        className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQuestion(qIndex, 1)}
                        disabled={qIndex === questions.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-600 hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold">
                      {qIndex + 1}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => duplicateQuestion(qIndex)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 transition"
                      title="Duplicate"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Question Label */}
                  <input
                    type="text"
                    placeholder="Type your question here..."
                    required
                    className="w-full text-lg font-medium text-gray-800 border-0 border-b-2 border-gray-100 pb-3 mb-5 focus:outline-none focus:border-indigo-500 transition placeholder:text-gray-300 bg-transparent"
                    value={q.label}
                    onChange={(e) => updateQuestion(qIndex, { label: e.target.value })}
                  />

                  {/* Type selector + Required toggle */}
                  <div className="flex gap-3 items-center mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </span>
                      <select
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition bg-white cursor-pointer"
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value as Question["type"];
                          updateQuestion(qIndex, {
                            type: newType,
                            options: needsOptions(newType) ? (q.options.length ? q.options : [""]) : [],
                            hideNextOnYes: newType === "yesno" ? true : q.hideNextOnYes,
                          });
                        }}
                      >
                        {QUESTION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.icon} {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-500">Required</span>
                    </label>
                  </div>

                  {/* Yes/No info */}
                  {q.type === "yesno" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 mb-1">Conditional Logic</p>
                          <p className="text-sm text-amber-700">
                            <span className="font-semibold text-green-700">&quot;Yes&quot;</span> hides the next question &middot;
                            <span className="font-semibold text-red-700"> &quot;No&quot;</span> shows it
                          </p>
                          {qIndex === questions.length - 1 && (
                            <p className="text-xs text-amber-500 mt-1 italic">Add a question after this one for the condition to apply.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  {needsOptions(q.type) && (
                    <div className="space-y-2 bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {q.type === "list" ? "List Items" : "Answer Options"}
                      </p>
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex gap-2 items-center group/opt">
                          <span className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-400">
                            {oIndex + 1}
                          </span>
                          <input
                            type="text"
                            placeholder={q.type === "list" ? `Item ${oIndex + 1}` : `Option ${oIndex + 1}`}
                            required
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition"
                            value={opt}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover/opt:opacity-100"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-700 font-medium mt-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {q.type === "list" ? "Add Item" : "Add Option"}
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Add Question Button */}
          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 flex items-center justify-center gap-2 font-medium group"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            Add Question
          </button>

          {/* Empty state */}
          {questions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">Start building your survey by adding questions above</p>
              <p className="text-gray-300 text-xs mt-1">You can reorder, duplicate, and customize each question</p>
            </div>
          )}
        </form>
      </main>

    </div>
  );
}
