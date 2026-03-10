"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number" | "date" | "list" | "yesno";
  label: string;
  required: boolean;
  options: string[];
  hideNextOnYes: boolean;
}

const QUESTION_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "radio", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkboxes" },
  { value: "select", label: "Dropdown" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "list", label: "List (Product Names)" },
  { value: "yesno", label: "Yes / No" },
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

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">Create Survey</h1>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">
            Back
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <input
              type="text"
              placeholder="Survey Title"
              required
              className="w-full text-2xl font-bold border-b pb-2 focus:outline-none focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Survey Description (optional)"
              className="w-full mt-4 text-gray-600 border-b pb-2 focus:outline-none focus:border-indigo-500 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            {/* Logo / Banner Upload */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo / Banner (optional)</label>
              {logo ? (
                <div className="relative inline-block">
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
                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
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
            <div key={q.id} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-medium text-gray-400">Question {qIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Remove
                </button>
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
                  />
                  Required
                </label>
              </div>

              {/* Yes/No conditional logic info */}
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

              {/* Options for radio, checkbox, select, list */}
              {needsOptions(q.type) && (
                <div className="space-y-2 ml-4">
                  <p className="text-xs text-gray-500 mb-1">
                    {q.type === "list" ? "Add list items (e.g., product names):" : "Options:"}
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

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Survey"}
          </button>
        </form>
      </main>
    </div>
  );
}
