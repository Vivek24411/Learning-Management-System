import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Header from '../components/Header'
import QuizReview from '../components/QuizReview'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';
import { motion } from 'framer-motion';


const Profile = () => {
  const { profile, fetchProfile } = useContext(UserContextData);

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
      if (response.data.success) {
        setScores(response.data.scores);
      }
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
      if (response.data.success) {
        setCreatorRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching creator requests:", error);
    }
  }

  // Ask the admin for permission to publish courses
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

  // Admin approves / rejects a creator request
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
        setCreatorRequests((prev) => prev.filter((r) => r._id !== userId));
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
    if (profile.isAdmin) {
      fetchCreatorRequests();
    }
  }, [profile?._id, profile?.isAdmin]);

  const roleLabel = profile?.isAdmin
    ? "Admin Account"
    : profile?.isCreator
    ? "Creator Account"
    : "Student Account";

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 pt-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-border mt-10">
            <div className="lg:flex lg:flex-row-reverse">
              
              {/* Right Side — Illustration */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-bg"
                style={{
                  backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  opacity: 0.05
                }}
              >
                <div className="max-w-md w-full text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <p className="text-ink-muted text-sm">Your account details</p>
                </div>
              </div>

              {/* Left Side — Profile Information */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="brand font-serif text-3xl font-bold text-ink mb-2">
                      My Profile
                    </h1>
                    <p className="text-ink-muted">
                      Your account details and information
                    </p>
                  </div>

                  {/* Profile Information */}
                  {profile ? (
                    <div className="space-y-6">
                      
                      {/* Profile Picture Section */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4 border border-primary/20">
                          <span className="text-2xl font-bold text-primary">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </span>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Full Name
                        </label>
                        <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                          {profile.name || 'Not provided'}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                          {profile.email || 'Not provided'}
                        </div>
                      </div>

                      {/* Phone Field */}
                      {profile.phone && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Phone Number
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {profile.phone}
                          </div>
                        </div>
                      )}

                      {/* Date of Birth */}
                      {profile.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Date of Birth
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {new Date(profile.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Account Type
                        </label>
                        <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                          {roleLabel}
                        </div>
                      </div>

                      {/* Creator access request (non-admin, non-creator) */}
                      {!profile.isAdmin && !profile.isCreator && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Teach on Edvance
                          </label>
                          {profile.creatorRequestStatus === "pending" ? (
                            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium">
                              Your creator request is pending admin approval.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {profile.creatorRequestStatus === "rejected" && (
                                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                  Your previous request was declined. You may request again.
                                </div>
                              )}
                              <button
                                onClick={requestCreatorAccess}
                                disabled={requesting}
                                className="w-full bg-primary hover:bg-primary-hover text-surface py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                              >
                                {requesting ? "Sending request..." : "Become a Creator"}
                              </button>
                              <p className="text-xs text-ink-muted">
                                Creators can publish and manage their own courses.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Created Date */}
                      {profile.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Member Since
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-bg border border-border rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-ink mb-2">No Profile Data</h3>
                      <p className="text-ink-muted">
                        Your profile information is not available at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===== My Test Scores ===== */}
          {profile && (
            <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-border mt-8 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h2 className="brand font-serif text-2xl font-bold text-ink">My Test Scores</h2>
                  <p className="text-ink-muted text-sm">Every quiz you have attempted</p>
                </div>
              </div>

              {loadingScores ? (
                <p className="text-ink-muted text-sm py-4">Loading your scores...</p>
              ) : scores.length === 0 ? (
                <p className="text-ink-muted text-sm py-4">
                  You haven't attempted any quizzes yet. Take a section or chapter quiz to see your scores here.
                </p>
              ) : (
                <div className="space-y-3">
                  {scores.map((s, i) => {
                    const pct = s.total ? Math.round((s.score / s.total) * 100) : 0;
                    const open = expandedScore === i;
                    return (
                      <div key={i} className="border border-border rounded-xl overflow-hidden">
                        <button
                          onClick={() => setExpandedScore(open ? null : i)}
                          className="w-full flex items-center justify-between gap-4 p-4 hover:bg-bg transition-colors duration-200 text-left"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate">{s.title}</div>
                            <div className="text-xs text-ink-muted">
                              {s.type}{s.courseName ? ` · ${s.courseName}` : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-sm font-bold px-3 py-1 rounded-full ${
                                pct >= 70 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                              }`}
                            >
                              {s.score}{s.total ? ` / ${s.total}` : ""}
                            </span>
                            <svg
                              className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {open && (
                          <div className="p-4 bg-bg border-t border-border">
                            <QuizReview review={s.review} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== Creator Requests (admin only) ===== */}
          {profile?.isAdmin && (
            <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-border mt-8 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="brand font-serif text-2xl font-bold text-ink">Creator Requests</h2>
                    <p className="text-ink-muted text-sm">Approve users who want to publish courses</p>
                  </div>
                </div>
                <span className="bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {creatorRequests.length} pending
                </span>
              </div>

              {creatorRequests.length === 0 ? (
                <p className="text-ink-muted text-sm py-4">No pending creator requests.</p>
              ) : (
                <div className="space-y-3">
                  {creatorRequests.map((request) => (
                    <div
                      key={request._id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg border border-border rounded-lg p-4"
                    >
                      <div>
                        <div className="font-semibold text-ink">{request.name}</div>
                        <div className="text-sm text-ink-muted">{request.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreatorRequest(request._id, "approve")}
                          disabled={handlingUserId === request._id}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                        >
                          Give Access
                        </button>
                        <button
                          onClick={() => handleCreatorRequest(request._id, "reject")}
                          disabled={handlingUserId === request._id}
                          className="bg-surface border border-border text-danger px-4 py-2 rounded-md text-sm font-semibold hover:bg-bg transition-colors duration-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default Profile