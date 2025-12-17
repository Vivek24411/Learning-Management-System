import { useEffect, useState, useRef } from "react";
import QuestionCard from "./QuestionCard";

export default function QuizEngine({ quiz, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz?.duration || 600);

  const timerRef = useRef(null);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // prepare questions and shuffle options while updating correctIndex
  useEffect(() => {
    if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
      setQuestions([]);
      setSelectedAnswers({});
      setCurrent(0);
      setSubmitted(false);
      setScore(0);
      setTimeLeft(quiz?.duration || 600);
      return;
    }

    const shuffled = shuffle(
      quiz.questions.map((q) => {
        const opts = Array.isArray(q.options) ? q.options : [];
        const optionObjs = opts.map((opt, idx) => ({ text: opt, originalIndex: idx }));
        const shuffledOptions = shuffle(optionObjs);
        const originalCorrectIndex = typeof q.correctIndex === "number" ? q.correctIndex : Number(q.correctIndex);
        const newCorrectIndex = shuffledOptions.findIndex((o) => o.originalIndex === originalCorrectIndex);
        return {
          ...q,
          id: q.id ?? Math.random().toString(36).slice(2, 9),
          options: shuffledOptions,
          correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
          text: q.question ?? q.text ?? "",
        };
      })
    );

    setQuestions(shuffled);
    setCurrent(0);
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    setTimeLeft(quiz.duration || 600);
  }, [quiz]);

  // timer
  useEffect(() => {
    if (submitted) return;
    if (!questions.length) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [questions, submitted]);

  // auto submit
  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0 && questions.length) {
      handleSubmit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSelect = (questionId, optIndex) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optIndex }));
  };

  const handleSubmit = (auto = false) => {
    if (submitted) return;
    let total = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) total++;
    });
    setScore(total);
    setSubmitted(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (onFinish) {
      try {
        onFinish({ score: total, autoSubmit: auto });
      } catch (e) {
        console.error("onFinish error:", e);
      }
    }
  };

  const handleRetake = () => {
    // re-run initialization using original quiz prop by forcing effect: simply re-run shuffle step
    // easiest approach: set quiz into state in parent or here we just re-run same prep
    // create fresh shuffled set from the same quiz prop
    if (!quiz) return;
    // re-trigger the preparation effect by toggling questions to empty then setting back
    setQuestions([]);
    setTimeout(() => {
      // replicate preparation logic quickly
      const shuffled = shuffle(
        quiz.questions.map((q) => {
          const opts = Array.isArray(q.options) ? q.options : [];
          const optionObjs = opts.map((opt, idx) => ({ text: opt, originalIndex: idx }));
          const shuffledOptions = shuffle(optionObjs);
          const originalCorrectIndex = typeof q.correctIndex === "number" ? q.correctIndex : Number(q.correctIndex);
          const newCorrectIndex = shuffledOptions.findIndex((o) => o.originalIndex === originalCorrectIndex);
          return {
            ...q,
            id: q.id ?? Math.random().toString(36).slice(2, 9),
            options: shuffledOptions,
            correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
            text: q.question ?? q.text ?? "",
          };
        })
      );
      setQuestions(shuffled);
      setCurrent(0);
      setSelectedAnswers({});
      setSubmitted(false);
      setScore(0);
      setTimeLeft(quiz.duration || 600);
    }, 60);
  };

  if (!questions.length) {
    return (
      <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 text-center text-gray-300">
        Loading quiz…
      </div>
    );
  }

  const currentQuestion = questions[current];
  const percent = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="space-y-6 bg-gray-900/80 border border-gray-700 p-6 rounded-xl">
      <div className="flex justify-between items-center">
        <div className="text-sm text-yellow-400">
          ⏳ Time Left: {Math.max(0, Math.floor(timeLeft / 60))}:{String(Math.max(0, timeLeft % 60)).padStart(2, "0")}
        </div>
        <div className="text-sm text-gray-300 font-medium">{current + 1} / {questions.length}</div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${percent}%` }} />
      </div>

      <QuestionCard
        question={currentQuestion}
        index={current}
        selected={selectedAnswers[currentQuestion.id]}
        onSelect={handleSelect}
        submitted={submitted}
      />

      {!submitted ? (
        <div className="flex justify-between mt-4">
          <button
            disabled={current === 0}
            onClick={() => setCurrent((c) => c - 1)}
            className={`px-4 py-2 rounded ${current === 0 ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
          >
            Back
          </button>

          {current === questions.length - 1 ? (
            <button
              disabled={Object.keys(selectedAnswers).length !== questions.length}
              onClick={() => handleSubmit(false)}
              className={`px-6 py-2 rounded font-semibold ${Object.keys(selectedAnswers).length !== questions.length ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-400 text-black"}`}
            >
              Submit
            </button>
          ) : (
            <button onClick={() => setCurrent((c) => c + 1)} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded text-white">Next</button>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-xl font-bold text-indigo-300 mb-4">🎉 Score: {score} / {questions.length}</div>

          <div className="flex justify-center gap-4">
            <button onClick={() => window.history.back()} className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200">Return</button>
            <button onClick={handleRetake} className="px-4 py-2 bg-indigo-600 rounded text-white">Retake</button>
          </div>
        </div>
      )}
    </div>
  );
}
