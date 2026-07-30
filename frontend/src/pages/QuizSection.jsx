import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { motion as Motion, useReducedMotion } from "framer-motion";

const QuizSection = () => {
  const [title, setTitle] = useState("");
  const [quizData, setQuizData] = React.useState([
    {
      question: "Enter Your Question Here",
      1: "Option A",
      2: "Option B",
      3: "Option C",
      4: "Option D",
      correct: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const [existingQuiz, setExistingQuiz] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const { id, type, quizId } = useParams();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    async function fetchExistingQuiz() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/get${type}Quiz`,
          {
            params: { id, quizId, create: quizId ? undefined : "true" },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );
        if (response.data.success) {
          setCourseId(response.data.courseId);
          if (quizId && response.data.quiz?.length > 0) {
            setQuizData(response.data.quiz);
            setTitle(response.data.title || "");
            setExistingQuiz(true);
          } else {
            setTitle(
              response.data.targetName
                ? `${response.data.targetName} knowledge check`
                : ""
            );
          }
        } else {
          toast.error(response.data.msg || "Could not load this quiz");
        }
      } catch (error) {
        toast.error(error.response?.data?.msg || "Could not load this quiz");
      } finally {
        setLoadingQuiz(false);
      }
    }

    fetchExistingQuiz();
  }, [id, type, quizId]);
  function addQuestion() {
    setQuizData([
      ...quizData,
      {
        question: "Enter Your Question Here",
        1: "Option A",
        2: "Option B",
        3: "Option C",
        4: "Option D",
        correct: "",
      },
    ]);
  }

  function removeQuestion(index) {
    setQuizData((prev) => {
      return prev.filter((quiz, i) => index != i);
    });
  }

  function emptyOnClick(index, type) {
    setQuizData((prev) => {
      return prev?.map((quiz, i) =>
        i === index ? { ...quiz, [type]: "" } : quiz
      );
    });
  }

  function changeInput(index, type, e) {
    setQuizData((prev) => {
      return prev?.map((quiz, i) =>
        i === index ? { ...quiz, [type]: e.target.value } : quiz
      );
    });
  }

  function checkNotNull() {
    for (let i = 0; i < quizData.length; i++) {
      if (
        !quizData[i].question ||
        !quizData[i][1] ||
        !quizData[i][2] ||
        !quizData[i][3] ||
        !quizData[i][4] ||
        !quizData[i].correct
      ) {
        return true;
      }
    }
  }

  function selectAnswer(index, option) {
    setQuizData((prev) => {
      return prev?.map((quiz, i) =>
        i === index ? { ...quiz, correct: option } : quiz
      );
    });
  }

  async function addQuiz() {
    try {
     if (!title.trim()) {
       return toast.error("Please give the quiz a title");
     }
     const isValid =  checkNotNull();
     if(isValid){
        return toast.error("Please fill all required fields");
     }
      setLoading(true);

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/add${type}Quiz`,{
        id,
        quizId,
        title: title.trim(),
        quizData
      },{
        headers:{
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`
        }
      })
      console.log(response);
      
      if(response.data.success){
        toast.success(existingQuiz ? "Quiz updated successfully" : "Quiz published successfully");
        const parentCourseId = response.data.courseId || courseId;
        if (type === "chapter") {
          navigate(`/chapter/${id}`, { replace: true });
        } else if (parentCourseId) {
          navigate(`/course/${parentCourseId}`, { replace: true });
        } else {
          navigate(-1);
        }
      }else{
        toast.error(response.data.msg);
      }
    } catch (error) {
        toast.error(error.message);
    }finally{
        setLoading(false)
    };
  }

  async function deleteQuiz() {
    if (!window.confirm("Delete this published quiz? Existing attempt history will be kept.")) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/delete${type}Quiz`,
        { id, quizId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Quiz deleted successfully");
        if (type === "chapter") {
          navigate(`/chapter/${id}`, { replace: true });
        } else if (courseId) {
          navigate(`/course/${courseId}`, { replace: true });
        } else {
          navigate(-1);
        }
      } else {
        toast.error(response.data.msg || "Could not delete this quiz");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete this quiz");
    } finally {
      setLoading(false);
    }
  }

  if (loadingQuiz) {
    return (
      <>
        <Header topics={[{ name: "Home", path: "home" }, { name: "Courses", path: "courses" }]} />
        <main className="flex min-h-screen items-center justify-center bg-bg pt-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-bg pt-20">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Page Header */}
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-12"
          >
            <Motion.div
              animate={prefersReducedMotion ? undefined : { rotate: [0, -3, 3, 0], y: [0, -3, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 1.5 }}
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {existingQuiz ? "Manage" : "Create"} {`${type}`} quiz
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {existingQuiz
                ? "Update the title or questions, or remove this published quiz."
                : "Design an assessment to test your students' knowledge and track their progress."}
            </p>
          </Motion.div>

          <div className="premium-card mb-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <label
              htmlFor="quiz-title"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Quiz title
            </label>
            <input
              id="quiz-title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Foundations knowledge check"
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <p className="mt-2 text-xs text-ink-muted">
              Learners will see this title on the course, attempt, and review screens.
            </p>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-8">
            {quizData?.map((quiz, index) => (
              <div key={index} className="premium-card overflow-hidden rounded-2xl border border-border bg-surface">
                {/* Question Header */}
                <div className="border-b border-border bg-bg/60 px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                    </div>
                    
                    {quizData.length > 1 && (
                      <button
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                        title="Remove Question"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Question Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      rows="3"
                      className="w-full resize-none rounded-xl border border-border px-3 py-2.5 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="Enter your question here..."
                      value={quiz.question}
                      onClick={() => emptyOnClick(index, "question")}
                      onChange={(e) => changeInput(index, "question", e)}
                    />
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Answer Options</h4>
                    
                    {[1, 2, 3, 4].map((optionNum) => (
                      <div key={optionNum} className="grid grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto]">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-500">
                            {String.fromCharCode(64 + optionNum)}
                          </div>
                        </div>
                        
                        <input
                          type="text"
                          className="w-full rounded-xl border border-border px-3 py-2.5 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          placeholder={`Option ${String.fromCharCode(64 + optionNum)}`}
                          value={quiz[optionNum]}
                          onClick={() => emptyOnClick(index, optionNum.toString())}
                          onChange={(e) => changeInput(index, optionNum.toString(), e)}
                        />
                        
                        <button
                          onClick={() => selectAnswer(index, optionNum)}
                          className={`col-span-2 min-h-11 w-full rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-200 sm:col-span-1 sm:w-auto ${
                            quiz.correct === optionNum
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-50 text-gray-600 border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {quiz.correct === optionNum ? (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Correct</span>
                            </div>
                          ) : (
                            'Mark Correct'
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Correct Answer Indicator */}
                  {quiz.correct && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Correct Answer: Option {String.fromCharCode(64 + quiz.correct)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {existingQuiz && (
              <button
                onClick={deleteQuiz}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-full border border-danger/30 bg-white px-6 py-3 font-medium text-danger transition hover:bg-danger/10 disabled:opacity-50"
              >
                Delete published quiz
              </button>
            )}
            <button
              onClick={addQuestion}
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Question
            </button>

            <button
              onClick={addQuiz}
              disabled={loading}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 py-3 font-medium text-white shadow-lg shadow-primary/15 transition-colors duration-200 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {existingQuiz ? "Saving Quiz..." : "Publishing Quiz..."}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {existingQuiz ? "Save Quiz" : "Publish Quiz"}
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Quiz Creation Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Make questions clear and concise</li>
                  <li>• Provide four distinct answer options</li>
                  <li>• Mark the correct answer for each question</li>
                  <li>• Review all questions before creating the quiz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuizSection;
