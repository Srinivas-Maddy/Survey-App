"use client";
import { useEffect, useState, use } from "react";

interface Question {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number" | "date" | "list" | "yesno";
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
  logo?: string;
}

export default function PublicSurveyPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/${publicId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setSurvey(data.survey);
        setLoading(false);
      })
      .catch(() => {
        setError("Survey not found or no longer active.");
        setLoading(false);
      });
  }, [publicId]);

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers({ ...answers, [questionId]: value });
    if (highlightedId === questionId) setHighlightedId(null);
  };

  const toggleCheckbox = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    if (current.includes(option)) {
      updateAnswer(questionId, current.filter((o) => o !== option));
    } else {
      updateAnswer(questionId, [...current, option]);
    }
  };

  const getHiddenQuestionIds = (): Set<string> => {
    const hidden = new Set<string>();
    if (!survey) return hidden;
    survey.questions.forEach((q, index) => {
      if (q.type === "yesno" && index < survey.questions.length - 1) {
        const answer = answers[q.id] as string;
        if (answer !== "No") {
          hidden.add(survey.questions[index + 1].id);
        }
      }
    });
    return hidden;
  };

  const hiddenIds = getHiddenQuestionIds();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom validation: find first unanswered required visible question
    if (survey) {
      for (const q of survey.questions) {
        if (hiddenIds.has(q.id)) continue;
        if (!q.required) continue;
        const answer = answers[q.id];
        const isEmpty = !answer || (Array.isArray(answer) ? answer.length === 0 : answer.trim() === "");
        if (isEmpty) {
          setHighlightedId(q.id);
          const el = document.getElementById(`question-${q.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.classList.add("animate-shake");
            setTimeout(() => el.classList.remove("animate-shake"), 600);
          }
          return;
        }
      }
    }

    setHighlightedId(null);
    setSubmitting(true);
    const filteredAnswers = { ...answers };
    hiddenIds.forEach((id) => delete filteredAnswers[id]);
    const res = await fetch(`/api/public/${publicId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: filteredAnswers }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Failed to submit response");
      setSubmitting(false);
    }
  };

  // Get visible question number
  const getVisibleIndex = (qId: string): number => {
    let count = 0;
    for (const q of survey!.questions) {
      if (hiddenIds.has(q.id)) continue;
      count++;
      if (q.id === qId) return count;
    }
    return count;
  };

  const visibleCount = survey ? survey.questions.filter((q) => !hiddenIds.has(q.id)).length : 0;
  const answeredCount = survey
    ? survey.questions.filter((q) => !hiddenIds.has(q.id) && answers[q.id] && (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : answers[q.id] !== "")).length
    : 0;
  const progress = visibleCount > 0 ? Math.round((answeredCount / visibleCount) * 100) : 0;

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading survey...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-10 max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Survey Unavailable</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-10 max-w-md border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Thank You!</h2>
          <p className="text-gray-500 text-lg mb-6">Your response has been successfully recorded.</p>
          <div className="inline-flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Response submitted successfully
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6 px-4">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
          {survey!.logo ? (
            <div className="w-full">
              <img src={survey!.logo} alt="Survey banner" className="w-full max-h-40 object-contain bg-gray-50" />
            </div>
          ) : (
            <div className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}
          <div className="p-8">
            <div className="flex items-center gap-3 mb-3">
              {!survey!.logo && (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{survey!.title}</h1>
            </div>
            {survey!.description && (
              <p className="text-gray-500 leading-relaxed ml-13">{survey!.description}</p>
            )}
            <div className="flex items-center gap-3 mt-5 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {visibleCount} questions
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-red-400">* Required fields</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{answeredCount} of {visibleCount} questions answered</p>
        </div>

        {/* Questions */}
        {survey!.questions.map((q) => {
          if (hiddenIds.has(q.id)) return null;
          const qNum = getVisibleIndex(q.id);

          return (
            <div
              key={q.id}
              id={`question-${q.id}`}
              className={`bg-white rounded-2xl shadow-sm p-6 border-2 hover:shadow-md transition-all duration-300 ${
                highlightedId === q.id
                  ? "border-red-400 bg-red-50/50 ring-2 ring-red-200"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {qNum}
                </span>
                <label className="block font-semibold text-gray-800 text-lg leading-snug">
                  {q.label}
                  {q.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {highlightedId === q.id && (
                  <p className="text-red-500 text-sm font-medium mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    This question is required
                  </p>
                )}
              </div>

              <div className="ml-11">
                {q.type === "text" && (
                  <input
                    type="text"

                    placeholder="Type your answer here..."
                    className="w-full border-b-2 border-gray-200 pb-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "textarea" && (
                  <textarea

                    placeholder="Type your detailed answer here..."
                    className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    rows={4}
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "number" && (
                  <input
                    type="number"

                    placeholder="Enter a number..."
                    className="w-full border-b-2 border-gray-200 pb-2 text-gray-700 placeholder-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "date" && (
                  <input
                    type="date"

                    className="w-full sm:w-auto border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  />
                )}

                {q.type === "radio" && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                          answers[q.id] === opt
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          answers[q.id] === opt ? "border-indigo-500" : "border-gray-300"
                        }`}>
                          {answers[q.id] === opt && (
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <span className={`font-medium ${answers[q.id] === opt ? "text-indigo-700" : "text-gray-600"}`}>{opt}</span>
                        <input
                          type="radio"
                          name={q.id}
      
                          className="hidden"
                          checked={answers[q.id] === opt}
                          onChange={() => updateAnswer(q.id, opt)}
                        />
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "checkbox" && (
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const checked = ((answers[q.id] as string[]) || []).includes(opt);
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                            checked
                              ? "border-indigo-500 bg-indigo-50 shadow-sm"
                              : "border-gray-100 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            checked ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                          }`}>
                            {checked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${checked ? "text-indigo-700" : "text-gray-600"}`}>{opt}</span>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={checked}
                            onChange={() => toggleCheckbox(q.id, opt)}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "select" && (
                  <select

                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%236366f1%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  >
                    <option value="">Select an option...</option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {q.type === "list" && (
                  <select

                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%236366f1%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                    value={(answers[q.id] as string) || ""}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                  >
                    <option value="">Select from list...</option>
                    {q.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {q.type === "yesno" && (
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateAnswer(q.id, "Yes")}
                      className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                        answers[q.id] === "Yes"
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-[1.02]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => updateAnswer(q.id, "No")}
                      className={`flex-1 py-4 rounded-xl font-semibold border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
                        answers[q.id] === "No"
                          ? "bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-500 shadow-lg shadow-red-200 scale-[1.02]"
                          : "bg-white text-gray-500 border-gray-200 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      No
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Response
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Your response is anonymous and securely stored.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-indigo-500">Survey App</span>
          </p>
        </div>
      </form>
    </div>
  );
}
