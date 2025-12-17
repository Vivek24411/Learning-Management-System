// src/pages/QuizPage.jsx
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import SecureQuizShell from "../components/SecureQuizShell";
import QuizEngine from "../components/QuizEngine";
import { UserContextData } from "../context/UserContext";

export default function QuizPage() {
  const { chapterId } = useParams();
  const { profile: user } = useContext(UserContextData);

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/getChapterQuiz?chapterId=${chapterId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );

        if (!res.data.success || !res.data.quiz) {
          setError("No quiz configured for this chapter.");
        } else {
          setQuiz(res.data.quiz);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load quiz.");
      } finally {
        setLoading(false);
      }
    };

    if (chapterId) loadQuiz();
  }, [chapterId]);

  // 🔒 Auth guard
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg">Please login to attempt the quiz.</p>
      </div>
    );
  }

  // ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-lg text-gray-300">Loading quiz…</p>
      </div>
    );
  }

  // ❌ Error state
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">
            {error || "Quiz not found."}
          </p>
          <p className="text-sm text-gray-400">
            Ask the course admin to configure a quiz for this chapter.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Quiz UI
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-indigo-300 mb-6">
        {quiz.title || "Chapter Quiz"}
      </h1>

      <SecureQuizShell>
        <QuizEngine quiz={quiz} />
      </SecureQuizShell>
    </div>
  );
}
