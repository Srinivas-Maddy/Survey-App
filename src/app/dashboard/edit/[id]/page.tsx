"use client";
import { useEffect, useState, use } from "react";
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
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "radio", label: "Single Choice" },
  { value: "checkbox", label: "Multiple Choice" },
  { value: "select", label: "Dropdown" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "list", label: "List (Product Names)" },
  { value: "yesno", label: "Yes / No" },
  { value: "image", label: "Image Upload" },
  { value: "rating", label: "Rating (1-5 Stars)" },
  { value: "phone", label: "Phone Number" },
  { value: "email", label: "Email Address" },
];

export default function EditSurveyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetch(`/api/surveys/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setTitle(data.survey.title);
        setDescription(data.survey.description);
        setLogo(data.survey.logo || "");
        setQuestions(
          data.survey.questions.map((q: Question) => ({
            ...q,
            options: q.options || [],
            hideNextOnYes: q.hideNextOnYes ?? true,
          }))
        );
        setLoading(false);
      })
      .catch(() => router.replace("/dashboard"));
  }, [id, router]);

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

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Add at least one question");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/surveys/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, questions, logo }),
    });
    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Failed to update survey");
      setSaving(false);
    }
  };

  const needsOptions = (type: string) => ["radio", "checkbox", "select", "list"].includes(type);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading survey...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Edit Survey</h1>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Survey Title</label>
            <input
              type="text"
              placeholder="Survey Title"
              required
              className="w-full text-2xl font-bold border-b pb-2 mt-1 focus:outline-none focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-4 block">Description</label>
            <textarea
              placeholder="Survey Description (optional)"
              className="w-full mt-1 text-gray-600 border-b pb-2 focus:outline-none focus:border-indigo-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            {/* Logo / Banner Upload */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Company Logo / Banner</label>
              {logo ? (
                <div className="relative inline-block mt-2">
                  <img src={logo} alt="Logo" className="max-h-24 rounded-lg border border-gray-200 shadow-sm" />
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow"
                  >
                    x
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 px-4 py-3 mt-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Click to upload logo or banner (max 500KB)</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {qIndex + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-400">Question</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIndex, "up")}
                    disabled={qIndex === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(qIndex, "down")}
                    disabled={qIndex === questions.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 text-red-400 hover:text-red-600 ml-2"
                    title="Remove question"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Question text"
                required
                className="w-full text-lg border-b pb-2 mb-4 focus:outline-none focus:border-indigo-500"
                value={q.label}
                onChange={(e) => updateQuestion(qIndex, { label: e.target.value })}
              />

              <div className="flex gap-4 items-center mb-4 flex-wrap">
                <select
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      {t.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                    className="accent-indigo-600"
                  />
                  Required
                </label>
              </div>

              {q.type === "yesno" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-amber-800 mb-2">Conditional Logic</p>
                  <p className="text-sm text-amber-700">
                    If user selects <span className="font-bold text-green-700">&quot;Yes&quot;</span> → the next question will be <span className="font-bold">hidden</span>.
                  </p>
                  <p className="text-sm text-amber-700">
                    If user selects <span className="font-bold text-red-700">&quot;No&quot;</span> → the next question will be <span className="font-bold">shown</span>.
                  </p>
                  {qIndex === questions.length - 1 && (
                    <p className="text-xs text-amber-500 mt-2 italic">
                      Add a question after this one for the condition to apply.
                    </p>
                  )}
                </div>
              )}

              {needsOptions(q.type) && (
                <div className="space-y-2 ml-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {q.type === "list" ? "List items (e.g., product names):" : "Options:"}
                  </p>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 w-5">{oIndex + 1}.</span>
                      <input
                        type="text"
                        placeholder={q.type === "list" ? `Item ${oIndex + 1} (e.g., Product Name)` : `Option ${oIndex + 1}`}
                        required
                        className="flex-1 border-b pb-1 text-sm focus:outline-none focus:border-indigo-500"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        x
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qIndex)}
                    className="text-sm text-indigo-500 hover:underline"
                  >
                    {q.type === "list" ? "+ Add Item" : "+ Add Option"}
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition"
          >
            + Add Question
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
