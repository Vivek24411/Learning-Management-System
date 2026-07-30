import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import QuizReview from "../components/QuizReview";
import { UserContextData } from "../context/UserContextData";
import profileEditorial from "../assets/edvance-profile-editorial.webp";

const navTopics = [
  { name: "Home", path: "home" },
  { name: "Courses", path: "courses" },
  { name: "About", path: "about" },
];

const Profile = () => {
  const { profile, fetchProfile } = useContext(UserContextData);
  const prefersReducedMotion = useReducedMotion();
  const [scores, setScores] = useState([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [expandedScore, setExpandedScore] = useState(null);
  const [creatorRequests, setCreatorRequests] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [handlingUserId, setHandlingUserId] = useState(null);

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
  };

  async function fetchMyScores() {
    try {
      setLoadingScores(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getMyScores`,
        { headers: authHeader }
      );
      if (response.data.success) setScores(response.data.scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
    } finally {
      setLoadingScores(false);
    }
  }

  async function fetchCreatorRequests() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCreatorRequests`,
        { headers: authHeader }
      );
      if (response.data.success) setCreatorRequests(response.data.requests);
    } catch (error) {
      console.error("Error fetching creator requests:", error);
    }
  }

  async function requestCreatorAccess() {
    try {
      setRequesting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/requestCreatorAccess`,
        {},
        { headers: authHeader }
      );
      if (response.data.success) {
        toast.success(response.data.msg);
        await fetchProfile();
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequesting(false);
    }
  }

  async function handleCreatorRequest(userId, decision) {
    try {
      setHandlingUserId(userId);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/handleCreatorRequest`,
        { userId, decision },
        { headers: authHeader }
      );
      if (response.data.success) {
        toast.success(response.data.msg);
        setCreatorRequests((previous) =>
          previous.filter((request) => request._id !== userId)
        );
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHandlingUserId(null);
    }
  }

  useEffect(() => {
    if (!profile) return;
    fetchMyScores();
    if (profile.isAdmin) fetchCreatorRequests();
  }, [profile?._id, profile?.isAdmin]);

  const roleLabel = profile?.isAdmin
    ? "Administrator"
    : profile?.isCreator
      ? "Course creator"
      : "Learner";
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "EV";

  return (
    <>
      <Header topics={navTopics} />
      <main className="min-h-screen bg-[radial-gradient(circle_at_10%_8%,rgba(183,136,49,0.11),transparent_28%),var(--color-bg)] px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="premium-card overflow-hidden rounded-[2rem] border border-border/80 bg-surface"
          >
            {profile ? (
              <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
                <div className="p-7 sm:p-10 lg:p-12">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-[1.75rem] bg-primary text-2xl font-bold text-white shadow-xl shadow-primary/20">
                      {initials}
                      <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-success" />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.17em] text-primary">
                          {roleLabel}
                        </span>
                        <span className="text-xs font-medium text-ink-muted">
                          Active account
                        </span>
                      </div>
                      <h1 className="truncate font-serif text-3xl font-bold text-ink sm:text-4xl">
                        {profile.name || "Your profile"}
                      </h1>
                      <p className="mt-1 truncate text-sm text-ink-muted sm:text-base">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-9 grid grid-cols-2 gap-3">
                    {[
                      {
                        value: profile.coursePurchased?.length || 0,
                        label: "Courses",
                      },
                      { value: scores.length, label: "Attempts" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-border/80 bg-bg/65 px-3 py-4 text-center"
                      >
                        <div className="font-serif text-2xl font-bold text-ink">
                          {item.value}
                        </div>
                        <div className="mt-1 text-[11px] font-semibold text-ink-muted">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">
                      Account details
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: "Full name", value: profile.name || "Not provided" },
                        { label: "Email address", value: profile.email || "Not provided" },
                        ...(profile.phone
                          ? [{ label: "Phone", value: profile.phone }]
                          : []),
                        {
                          label: "Account access",
                          value: roleLabel,
                        },
                        ...(profile.dateOfBirth
                          ? [
                              {
                                label: "Date of birth",
                                value: new Date(
                                  profile.dateOfBirth
                                ).toLocaleDateString(),
                              },
                            ]
                          : []),
                      ].map((detail) => (
                        <div
                          key={detail.label}
                          className="rounded-2xl border border-border/75 bg-white px-4 py-4"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
                            {detail.label}
                          </p>
                          <p className="mt-1.5 break-words text-sm font-semibold text-ink">
                            {detail.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!profile.isAdmin && !profile.isCreator && (
                    <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-5">
                      <p className="text-sm font-bold text-ink">
                        Share what you know
                      </p>
                      {profile.creatorRequestStatus === "pending" ? (
                        <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                          Your creator request is with the Edvance team for review.
                        </p>
                      ) : (
                        <>
                          <p className="mt-1.5 text-sm leading-6 text-ink-muted">
                            Request creator access to publish and manage your own courses.
                          </p>
                          <button
                            onClick={requestCreatorAccess}
                            disabled={requesting}
                            className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-50"
                          >
                            {requesting ? "Sending request…" : "Become a creator"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:min-h-full">
                  <Motion.img
                    src={profileEditorial}
                    alt="A learner reviewing a personal study portfolio"
                    className="absolute inset-0 h-full w-full object-cover object-[52%_center]"
                    initial={prefersReducedMotion ? false : { scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.19em] backdrop-blur-md">
                      Your learning space
                    </span>
                    <p className="mt-4 max-w-md font-serif text-2xl font-bold leading-tight sm:text-3xl">
                      Small, steady progress becomes real expertise.
                    </p>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
                      Keep your courses, assessments, and creator access together in one place.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-16 text-center sm:px-8 sm:py-20">
                <div className="mx-auto mb-5 h-14 w-14 animate-pulse rounded-2xl bg-primary/10" />
                <h1 className="font-serif text-2xl font-bold text-ink">
                  Loading your profile
                </h1>
              </div>
            )}
          </Motion.section>

          {profile && (
            <Motion.section
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.55 }}
              className="premium-card mt-8 rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8"
            >
              <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Learning record
                  </p>
                  <h2 className="font-serif text-3xl font-bold text-ink">
                    Assessment history
                  </h2>
                </div>
                <p className="text-sm text-ink-muted">
                  {scores.length} {scores.length === 1 ? "attempt" : "attempts"} recorded
                </p>
              </div>

              {loadingScores ? (
                <div className="h-24 animate-pulse rounded-2xl bg-bg" />
              ) : scores.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-bg/50 px-6 py-10 text-center">
                  <p className="font-semibold text-ink">Your record starts here</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Completed course assessments will appear in this space.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scores.map((item, index) => {
                    const percentage = item.total
                      ? Math.round((item.score / item.total) * 100)
                      : 0;
                    const isOpen = expandedScore === index;

                    return (
                      <div
                        key={item._id || index}
                        className="overflow-hidden rounded-2xl border border-border/80 bg-white"
                      >
                        <button
                          onClick={() =>
                            setExpandedScore(isOpen ? null : index)
                          }
                          className="flex w-full items-center justify-between gap-5 p-5 text-left transition hover:bg-bg/60"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {item.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-ink-muted">
                              {item.type}
                              {item.courseName ? ` · ${item.courseName}` : ""}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                percentage >= 70
                                  ? "bg-success/10 text-success"
                                  : "bg-accent/15 text-ink"
                              }`}
                            >
                              {item.score}
                              {item.total ? ` / ${item.total}` : ""}
                            </span>
                            <svg
                              className={`h-4 w-4 text-ink-muted transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <Motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-border bg-bg/60"
                            >
                              <div className="p-5">
                                <QuizReview review={item.review} />
                              </div>
                            </Motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </Motion.section>
          )}

          {profile?.isAdmin && (
            <section className="premium-card mt-8 rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    Administration
                  </p>
                  <h2 className="font-serif text-3xl font-bold text-ink">
                    Creator requests
                  </h2>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  {creatorRequests.length} pending
                </span>
              </div>

              {creatorRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-bg/50 px-6 py-8 text-center text-sm text-ink-muted">
                  No pending creator requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {creatorRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-border/80 bg-white p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-semibold text-ink">{request.name}</p>
                        <p className="mt-0.5 text-sm text-ink-muted">
                          {request.email}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleCreatorRequest(request._id, "approve")
                          }
                          disabled={handlingUserId === request._id}
                          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleCreatorRequest(request._id, "reject")
                          }
                          disabled={handlingUserId === request._id}
                          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-danger transition hover:bg-bg disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default Profile;
