import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/axios";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";

/* ---------- helpers ---------- */

const makeUuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const emptyQuestion = () => ({
  id: makeUuid(),
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

/* ---------- component ---------- */

export default function AdminQuizEditor() {
  const { scope, chapterId, sectionId } = useParams();
  const navigate = useNavigate();

  const isChapter = scope === "chapter";
  const isSection = scope === "section";

  const entityId = isChapter ? chapterId : sectionId;

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(600);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* ---------- derived endpoints ---------- */

  const getQuizUrl = isChapter
    ? `/user/getChapterQuiz?chapterId=${entityId}`
    : `/user/getSectionQuiz?sectionId=${entityId}`;

  const saveQuizUrl = isChapter
    ? "/user/addChapterQuiz"
    : "/user/addSectionQuiz";

  const savePayloadKey = isChapter ? "chapterId" : "sectionId";

  /* ---------- navigation ---------- */

  const handleBack = () => {
    if (isChapter) {
      navigate(`/chapter/${entityId}`);
    } else {
      navigate(-1, { state: { refreshCourse: true } });
    }
  };

  /* ---------- load quiz ---------- */

  useEffect(() => {
    let mounted = true;

    const loadQuiz = async () => {
      try {
        const res = await api.get(getQuizUrl);
        const quiz = res.data?.quiz;

        if (!mounted) return;

        if (quiz && Array.isArray(quiz.questions)) {
          setTitle(quiz.title || "");
          setDuration(Number(quiz.duration) || 600);
          setQuestions(
            quiz.questions.map((q) => ({
              id: makeUuid(),
              text: q.question || "",
              options: q.options || ["", "", "", ""],
              correctIndex:
                typeof q.correctIndex === "number" ? q.correctIndex : 0,
            }))
          );
        } else {
          setTitle("");
          setDuration(600);
          setQuestions([emptyQuestion()]);
        }
      } catch (err) {
        if (err?.response?.status !== 404) {
          setError("Failed to load quiz");
        }
      } finally {
        mounted && setLoading(false);
      }
    };

    loadQuiz();
    return () => {
      mounted = false;
    };
  }, [getQuizUrl]);

  /* ---------- handlers ---------- */

  const updateQuestion = (qid, patch) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, ...patch } : q))
    );
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qid) =>
    setQuestions((prev) => prev.filter((q) => q.id !== qid));

  /* ---------- save ---------- */

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Quiz title is required");
      return;
    }

    try {
      setSaving(true);

      await api.post(saveQuizUrl, {
        [savePayloadKey]: entityId,
        quiz: {
          title: title.trim(),
          duration,
          questions: questions.map((q) => ({
            question: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
          })),
        },
      });

      setMessage("Quiz saved successfully");
    } catch (err) {
      console.error("Save quiz failed:", err);
      setError("Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- render ---------- */

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-gray-500">
        Loading quiz…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold">
          {isChapter ? "Chapter Quiz Editor" : "Section Quiz Editor"}
        </h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        {/* meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Quiz Title</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Duration (seconds)
            </label>
            <input
              type="number"
              min={60}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
        </div>

        {/* questions */}
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="border rounded-xl p-4 bg-gray-50 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">
                  Question {idx + 1}
                </h3>

                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <textarea
                rows={2}
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Enter question"
                value={q.text}
                onChange={(e) =>
                  updateQuestion(q.id, { text: e.target.value })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {q.options.map((opt, i) => {
                  const isCorrect = q.correctIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() =>
                        updateQuestion(q.id, { correctIndex: i })
                      }
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left ${
                        isCorrect
                          ? "border-green-500 bg-green-50"
                          : "hover:border-indigo-400"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ${
                          isCorrect
                            ? "bg-green-500 text-white"
                            : "border"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>

                      <input
                        className="flex-1 bg-transparent outline-none"
                        value={opt}
                        onChange={(e) => {
                          const next = [...q.options];
                          next[i] = e.target.value;
                          updateQuestion(q.id, { options: next });
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* add question */}
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <PlusCircle size={18} />
          Add Question
        </button>

        {/* save */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}
