import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion as Motion, useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import QuizReview from "../components/QuizReview";

const navTopics = [
  { name: "Home", path: "home" },
  { name: "Courses", path: "courses" },
  { name: "About", path: "about" },
];

const TakeSectionQuiz = () => {
  const { id, type, quizId } = useParams();
  const [quizData, setQuizData] = React.useState([]);
  const [answeredQuizData, setAnsweredQuizData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [score, setScore] = React.useState(null);
  const [resultTotal, setResultTotal] = React.useState(0);
  const [review, setReview] = React.useState([]);
  const [showResults, setShowResults] = React.useState(false);
  const [quizTitle, setQuizTitle] = React.useState("Knowledge check");
  const [attemptCount, setAttemptCount] = React.useState(0);
  const [canAttempt, setCanAttempt] = React.useState(true);
  const [retakeRequestStatus, setRetakeRequestStatus] =
    React.useState("none");
  const [requestingRetake, setRequestingRetake] = React.useState(false);
  const [isManager, setIsManager] = React.useState(false);
  const [activeQuizId, setActiveQuizId] = React.useState(quizId || "");
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const answeredCount = answeredQuizData.filter(
    (item) => item.chosenAnswer
  ).length;
  const progress = quizData.length
    ? Math.round((answeredCount / quizData.length) * 100)
    : 0;
  const assessmentLabel =
    type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();

  async function fetchQuizData() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/get${type}Quiz`,
        {
          params: { id, quizId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        const questions = (response.data.quiz || []).map((item) => ({
          ...item,
          chosenAnswer: null,
        }));
        setQuizData(questions);
        setAnsweredQuizData(questions.map((item) => ({ ...item })));
        setQuizTitle(response.data.title || "Knowledge check");
        setAttemptCount(response.data.attemptCount || 0);
        setCanAttempt(response.data.canAttempt !== false);
        setRetakeRequestStatus(
          response.data.retakeRequestStatus || "none"
        );
        setIsManager(Boolean(response.data.isManager));
        setActiveQuizId(response.data.quizId || quizId || "");
        if (response.data.latestAttempt) {
          setScore(response.data.latestAttempt.score);
          setResultTotal(response.data.latestAttempt.total || questions.length);
          setReview(response.data.latestAttempt.review || []);
          setShowResults(true);
        }
      } else {
        toast.error(response.data.msg || "Could not load this assessment");
      }
    } catch {
      toast.error("Could not load this assessment");
    } finally {
      setLoading(false);
    }
  }

  function chooseAnswer(index, option) {
    setAnsweredQuizData((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, chosenAnswer: option } : item
      )
    );
  }

  async function submitQuiz() {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/submit${type}Quiz`,
        { id, quizId: activeQuizId, answeredQuizData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Assessment submitted");
        setScore(response.data.score);
        setResultTotal(response.data.total || quizData.length);
        setReview(response.data.review || []);
        setAttemptCount(response.data.attemptCount || attemptCount + 1);
        setCanAttempt(false);
        setRetakeRequestStatus("none");
        setShowResults(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(response.data.msg);
        if (response.data.code === "retake_required") {
          setCanAttempt(false);
          setRetakeRequestStatus(
            response.data.retakeRequestStatus || "none"
          );
          if (response.data.latestAttempt) {
            setScore(response.data.latestAttempt.score);
            setResultTotal(response.data.latestAttempt.total || quizData.length);
            setReview(response.data.latestAttempt.review || []);
            setShowResults(true);
          }
        }
      }
    } catch {
      toast.error("Could not submit this assessment");
    } finally {
      setSubmitting(false);
    }
  }

  async function requestRetake() {
    try {
      setRequestingRetake(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/requestQuizRetake`,
        { quizType: type, quizId: id, assessmentId: activeQuizId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setRetakeRequestStatus("pending");
        toast.success(response.data.msg);
      } else {
        setRetakeRequestStatus(
          response.data.status || retakeRequestStatus
        );
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not request a retake");
    } finally {
      setRequestingRetake(false);
    }
  }

  useEffect(() => {
    fetchQuizData();
  }, [id, type, quizId]);

  if (loading) {
    return (
      <>
        <Header topics={navTopics} />
        <main className="flex min-h-screen items-center justify-center bg-bg px-4 pt-20">
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card w-full max-w-md rounded-[1.75rem] border border-border bg-surface p-9 text-center"
          >
            <div className="mx-auto mb-6 flex w-fit items-center gap-2">
              {[0, 1, 2].map((item) => (
                <Motion.span
                  key={item}
                  className="h-2.5 w-2.5 rounded-full bg-primary"
                  animate={
                    prefersReducedMotion
                      ? undefined
                      : { opacity: [0.35, 1, 0.35], y: [0, -4, 0] }
                  }
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: item * 0.14,
                  }}
                />
              ))}
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink">
              Preparing your knowledge check
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Gathering the questions and saving your place.
            </p>
          </Motion.div>
        </main>
      </>
    );
  }

  if (quizData.length === 0) {
    return (
      <>
        <Header topics={navTopics} />
        <main className="flex min-h-screen items-center justify-center bg-bg px-4 pt-20">
          <div className="premium-card w-full max-w-lg rounded-[1.75rem] border border-border bg-surface px-5 py-10 text-center sm:px-8 sm:py-12">
            <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-bg text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-3-3v6m7 4H5a2 2 0 01-2-2V7a2 2 0 012-2h3l1-2h6l1 2h3a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink">
              No assessment here yet
            </h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-ink-muted">
              Continue through the course. Your instructor can add a knowledge
              check here when this part is ready.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-7 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
            >
              Return to course
            </button>
          </div>
        </main>
      </>
    );
  }

  if (showResults && score !== null) {
    const total = resultTotal || quizData.length;
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const isPassing = percentage >= 70;

    return (
      <>
        <Header topics={navTopics} />
        <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(183,136,49,0.13),transparent_34%),var(--color-bg)] px-4 pb-16 pt-28 sm:px-6">
          <Motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="premium-card mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-surface"
          >
            <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
              <div className="flex items-center justify-center bg-ink p-9 text-white sm:p-12">
                <div className="text-center">
                  <div
                    className="mx-auto flex h-44 w-44 items-center justify-center rounded-full p-3"
                    style={{
                      background: `conic-gradient(var(--color-accent) ${percentage * 3.6}deg, rgba(255,255,255,.13) 0deg)`,
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-ink">
                      <span className="font-serif text-5xl font-bold">
                        {percentage}%
                      </span>
                      <span className="mt-1 text-xs uppercase tracking-[0.18em] text-white/55">
                        overall
                      </span>
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-white/60">
                    {score} of {total} correct
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-8 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Attempt {attemptCount || 1} complete
                </p>
                <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl">
                  {isPassing
                    ? "You have a strong grasp of this material."
                    : "A little review will make this click."}
                </h1>
                <p className="mt-4 leading-7 text-ink-muted">
                  {isPassing
                    ? "Review every answer below. Another attempt is available only after your course creator approves a retake request."
                    : "Review the questions below, revisit the course material, and request another attempt when you are ready."}
                </p>

                <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: score, label: "Correct" },
                    { value: total - score, label: "Review" },
                    { value: total, label: "Total" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-border bg-bg/70 p-4 text-center"
                    >
                      <div className="font-serif text-2xl font-bold text-ink">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-xs font-medium text-ink-muted">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {retakeRequestStatus === "approved" && canAttempt ? (
                    <button
                      onClick={() => {
                        setShowResults(false);
                        setScore(null);
                        setAnsweredQuizData(
                          quizData.map((item) => ({
                            ...item,
                            chosenAnswer: null,
                          }))
                        );
                      }}
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary-hover"
                    >
                      Start approved retake
                    </button>
                  ) : (
                    <button
                      onClick={requestRetake}
                      disabled={
                        requestingRetake || retakeRequestStatus === "pending"
                      }
                      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {requestingRetake
                        ? "Sending request…"
                        : retakeRequestStatus === "pending"
                          ? "Retake request pending"
                          : "Request a retake"}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(-1)}
                    className="rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-bg"
                  >
                    Back to course
                  </button>
                </div>
              </div>
            </div>
          </Motion.section>
          <section className="premium-card mx-auto mt-8 max-w-4xl rounded-[2rem] border border-border bg-surface p-5 sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Answer review
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-ink">
                See what went right and what to revisit
              </h2>
            </div>
            <QuizReview review={review} />
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header topics={navTopics} />
      <main className="min-h-screen bg-[radial-gradient(circle_at_85%_10%,rgba(183,136,49,0.12),transparent_30%),var(--color-bg)] px-4 pb-24 pt-28 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Motion.header
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-10 max-w-3xl"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
              {isManager ? "Instructor preview" : `${assessmentLabel} assessment`}
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              {quizTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
              {isManager
                ? "This is the learner view. Correct choices are highlighted for your preview."
                : "Work through each prompt at your own pace. You can change any answer before submitting."}
            </p>
          </Motion.header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div className="space-y-6">
              {quizData.map((quizItem, index) => {
                const selectedAnswer =
                  answeredQuizData[index]?.chosenAnswer;

                return (
                  <Motion.article
                    key={quizItem._id || index}
                    id={`question-${index + 1}`}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 18 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.12 }}
                    transition={{
                      duration: 0.45,
                      delay: Math.min(index * 0.04, 0.2),
                    }}
                    className="premium-card overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                          selectedAnswer
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-bg text-ink-muted"
                        }`}
                      >
                        {selectedAnswer ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          String(index + 1).padStart(2, "0")
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                          Prompt {index + 1}
                        </p>
                        <h2 className="mt-2 text-lg font-semibold leading-7 text-ink sm:text-xl">
                          {quizItem.question}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3">
                      {[1, 2, 3, 4].map((optionNumber) => {
                        const isSelected = selectedAnswer === optionNumber;
                        return (
                          <button
                            key={optionNumber}
                            onClick={() =>
                              !isManager && chooseAnswer(index, optionNumber)
                            }
                            disabled={isManager}
                            className={`group flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-250 sm:px-5 ${
                              isManager && Number(quizItem.correct) === optionNumber
                                ? "border-success/40 bg-success/[0.08]"
                                : isSelected
                                ? "border-primary bg-primary/[0.06] shadow-[0_8px_26px_-22px_rgba(122,31,43,.8)]"
                                : "border-border/90 bg-white hover:-translate-y-0.5 hover:border-primary/35 hover:bg-bg/55"
                            }`}
                          >
                            <span
                              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                                isManager && Number(quizItem.correct) === optionNumber
                                  ? "bg-success text-white"
                                  : isSelected
                                  ? "bg-primary text-white"
                                  : "border border-border bg-bg text-ink-muted group-hover:border-primary/30 group-hover:text-primary"
                              }`}
                            >
                              {String.fromCharCode(64 + optionNumber)}
                            </span>
                            <span
                              className={`leading-6 ${
                                isManager && Number(quizItem.correct) === optionNumber
                                  ? "font-semibold text-success"
                                  : isSelected
                                  ? "font-medium text-primary"
                                  : "text-ink"
                              }`}
                            >
                              {quizItem[optionNumber]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Motion.article>
                );
              })}
            </div>

            <aside className="lg:sticky lg:top-28">
              <div className="premium-card rounded-[1.75rem] border border-border bg-surface p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
                      {isManager ? "Quiz overview" : "Progress"}
                    </p>
                    <p className="mt-2 font-serif text-3xl font-bold text-ink">
                      {isManager ? quizData.length : answeredCount}
                      <span className="ml-1 text-sm font-sans text-ink-muted">
                        {isManager ? "questions" : `/${quizData.length}`}
                      </span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {isManager ? "Ready" : `${progress}%`}
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-border/70">
                  <Motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{ width: `${isManager ? 100 : progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-5 gap-2">
                  {quizData.map((item, index) => (
                    <a
                      key={item._id || index}
                      href={`#question-${index + 1}`}
                      onClick={(event) => {
                        event.preventDefault();
                        document
                          .getElementById(`question-${index + 1}`)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                      }}
                      className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${
                        answeredQuizData[index]?.chosenAnswer
                          ? "bg-primary text-white"
                          : "border border-border bg-bg text-ink-muted hover:border-primary/40"
                      }`}
                    >
                      {index + 1}
                    </a>
                  ))}
                </div>

                {isManager ? (
                  <div className="mt-7 space-y-3">
                    <button
                      onClick={() =>
                        navigate(`/quiz/${type}/${id}/${activeQuizId}`)
                      }
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover"
                    >
                      Edit this quiz
                    </button>
                    <button
                      onClick={() => navigate(-1)}
                      className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-bg"
                    >
                      Exit preview
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={submitQuiz}
                      disabled={submitting || answeredCount === 0}
                      className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {submitting ? "Submitting…" : "Submit answers"}
                    </button>
                    <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
                      {answeredCount === 0
                        ? "Choose at least one answer to continue."
                        : `${answeredCount} of ${quizData.length} answered`}
                    </p>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default TakeSectionQuiz;
