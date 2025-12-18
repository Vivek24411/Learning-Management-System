import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useEffect } from "react";
import Header from "../components/Header";

const TakeSectionQuiz = () => {
  const [quizData, setQuizData] = React.useState([]);
  const [answeredQuizData, setAnsweredQuizData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [score, setScore] = React.useState(null);
  const [showResults, setShowResults] = React.useState(false);
  const { id,type } = useParams();
  const navigate = useNavigate();

  async function fetchQuizData() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/get${type}Quiz`,
        {
          params: {
            id
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setQuizData(response.data.quiz);
        setAnsweredQuizData(response.data.quiz);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Error fetching quiz data");
    } finally {
      setLoading(false);
    }
  }

  function chooseAnswer(index, option) {
    setAnsweredQuizData((prev) => {
      const newData = [...prev];
      newData[index].chosenAnswer = option;
      console.log(newData);
      return newData;
    });
  }

  async function submitQuiz() {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/submit${type}Quiz`,
        {
          id,
          answeredQuizData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success("Quiz submitted successfully");
        setScore(response.data.score);
        setShowResults(true);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error("Error submitting quiz");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchQuizData();
  }, []);

  if (loading) {
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-200"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Quiz</h3>
            <p className="text-gray-600">Please wait while we prepare your quiz...</p>
          </div>
        </div>
      </>
    );
  }

  if (quizData.length === 0) {
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Quiz Available</h3>
            <p className="text-gray-600 mb-6">This {type} doesn't have a quiz yet. Check back later!</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#7A7F3F] text-white px-6 py-3 rounded font-semibold hover:bg-[#6A6F35] transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // Results View
  if (showResults && score !== null) {
    const percentage = Math.round((score / quizData.length) * 100);
    const isPassing = percentage >= 70;

    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              {/* Results Card */}
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-8">
                {/* Score Circle */}
                <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center mx-auto mb-6 ${
                  isPassing ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                      {percentage}%
                    </div>
                    <div className={`text-sm ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                      {score}/{quizData.length}
                    </div>
                  </div>
                </div>

                {/* Result Message */}
                <div className="mb-6">
                  {isPassing ? (
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Excellent Work!</h2>
                      <p className="text-gray-600">You've successfully completed the quiz with a great score!</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-red-600 mb-2">Keep Learning!</h2>
                      <p className="text-gray-600">Review the material and try again to improve your score.</p>
                    </div>
                  )}
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{score}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{quizData.length - score}</div>
                    <div className="text-sm text-gray-600">Incorrect</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{quizData.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setScore(null);
                      setAnsweredQuizData(quizData.map(q => ({ ...q, chosenAnswer: null })));
                    }}
                    className="bg-[#7A7F3F] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6A6F35] transition-colors duration-200"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-white text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back to Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quiz Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7A7F3F] rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{type} Quiz</h1>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{quizData.length} Questions</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No Time Limit</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">
                {answeredQuizData.filter(q => q.chosenAnswer).length} of {quizData.length} answered
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#7A7F3F] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredQuizData.filter(q => q.chosenAnswer).length / quizData.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Quiz Questions */}
          <div className="space-y-8">
            {quizData.map((quizItem, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Question Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      answeredQuizData[index]?.chosenAnswer 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-[#7A7F3F] text-white'
                    }`}>
                      {answeredQuizData[index]?.chosenAnswer ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="font-semibold text-sm">{index + 1}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
                  </div>
                </div>

                <div className="p-6">
                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-gray-800 leading-relaxed">{quizItem.question}</p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((optionNum) => (
                      <button
                        key={optionNum}
                        onClick={() => chooseAnswer(index, optionNum)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                          answeredQuizData[index]?.chosenAnswer === optionNum
                            ? 'border-[#7A7F3F] bg-[#7A7F3F]/5 text-[#7A7F3F]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            answeredQuizData[index]?.chosenAnswer === optionNum
                              ? 'border-[#7A7F3F] bg-[#7A7F3F]'
                              : 'border-gray-300'
                          }`}>
                            {answeredQuizData[index]?.chosenAnswer === optionNum && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-sm font-medium ${
                              answeredQuizData[index]?.chosenAnswer === optionNum 
                                ? 'text-[#7A7F3F]' 
                                : 'text-gray-500'
                            }`}>
                              {String.fromCharCode(64 + optionNum)}
                            </span>
                            <span className="text-gray-800">{quizItem[optionNum]}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-12 text-center">
            <button
              onClick={submitQuiz}
              disabled={submitting || answeredQuizData.filter(q => q.chosenAnswer).length === 0}
              className="inline-flex items-center justify-center px-8 py-4 bg-[#7A7F3F] text-white rounded-lg font-semibold text-lg hover:bg-[#6A6F35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting Quiz...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit Quiz
                </>
              )}
            </button>
            
            <p className="mt-3 text-sm text-gray-500">
              {answeredQuizData.filter(q => q.chosenAnswer).length === 0 
                ? "Please answer at least one question to submit"
                : `${answeredQuizData.filter(q => q.chosenAnswer).length} of ${quizData.length} questions answered`
              }
            </p>
          </div>

          {/* Quiz Instructions */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Quiz Instructions</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Choose the best answer for each question</li>
                  <li>• You can change your answers before submitting</li>
                  <li>• Take your time - there's no time limit</li>
                  <li>• You can retake the quiz after submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TakeSectionQuiz;
