import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContextData } from "../context/UserContext";
import Header from "../components/Header";

// Chapter Item Component
const ChapterItem = ({ chapter, onViewChapter }) => {
  const handleChapterClick = () => {
    onViewChapter(chapter._id);
  };

  const { profile } = useContext(UserContextData);
  const { courseId } = useParams();

  return (
    <div className="bg-gradient-to-r from-stone-50 to-white rounded-2xl shadow-lg border border-[#7A7F3F]/20 hover:border-[#7A7F3F]/40 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] p-5">
      <div className="flex items-start space-x-5">
        {/* Chapter Thumbnail */}
        <div className="flex-shrink-0">
          <div className="relative">
            {chapter.chapterThumbnailImage ? (
              <img
                src={chapter.chapterThumbnailImage}
                alt={chapter.chapterName}
                className="w-20 h-20 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-[#7A7F3F]/20 to-[#7A7F3F]/10 text-[#7A7F3F] rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Chapter Info */}
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 hover:text-[#7A7F3F] transition-colors duration-200">
                {chapter.chapterName}
              </h4>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                {chapter.shortDescription ||
                  "Explore this chapter to deepen your understanding and practice."}
              </p>
            </div>
          </div>

          {/* Chapter Meta Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500"></div>

            {/* Chapter Action Button */}
            {profile.coursePurchased.includes(courseId) || profile.isAdmin ? (
              <div>
                <button
                  onClick={handleChapterClick}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/90 text-white hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/80"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a3 3 0 116 0v1M9 10H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-3"
                    />
                  </svg>
                  View Chapter
                </button>
              </div>
            ) : (
              <div>
                <h3>Locked</h3>
                <p className="text-gray-500">
                  Unlock this chapter by enrolling the course.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Item Component
const SectionItem = ({ section, onViewChapter, isAdmin, onAddChapter }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-stone-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/60">
      {/* Section Header */}
      <div className="p-6 bg-gradient-to-r from-[#7A7F3F]/15 via-[#7A7F3F]/10 to-[#7A7F3F]/5 border-b border-stone-200 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7A7F3F]/10 to-transparent rounded-full -mt-16 -mr-16"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex-grow flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/80 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {section.sectionTitle}
              </h3>
              {section.sectionDescription && (
                <p className="text-gray-600 leading-relaxed">
                  {section.sectionDescription}
                </p>
              )}
              {/* Chapter count indicator */}
              <div className="flex items-center mt-3">
                <svg
                  className="w-4 h-4 text-gray-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm text-gray-500">
                  {section.chapters ? section.chapters.length : 0}
                  {section.chapters?.length === 1 ? " Chapter" : " Chapters"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Admin Add Chapter Button */}
            {isAdmin && (
              <button
                onClick={() => onAddChapter(section._id)}
                className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center transform hover:scale-105"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Chapter
              </button>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                isExpanded
                  ? "bg-[#7A7F3F]/10 text-[#7A7F3F]"
                  : "hover:bg-stone-100 text-gray-600"
              }`}
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chapters List with Smooth Animation */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-6 space-y-4">
          {section.chapters && section.chapters.length > 0 ? (
            section.chapters.map((chapter, index) => (
              <div
                key={chapter._id}
                className={`transform transition-all duration-300 ${
                  isExpanded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{
                  transitionDelay: isExpanded ? `${index * 100}ms` : "0ms",
                }}
              >
                <ChapterItem chapter={chapter} onViewChapter={onViewChapter} />
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No chapters available yet
              </h4>
              <p className="text-gray-500 mb-4">
                This section is waiting for content to be added.
              </p>
              {isAdmin && (
                <button
                  onClick={() => onAddChapter(section._id)}
                  className="inline-flex items-center bg-[#7A7F3F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7A7F3F]/90 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add First Chapter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Course = () => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingSection, setAddingSection] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { courseId } = useParams();
  const { profile, setProfile, fetchProfile } = useContext(UserContextData);
  const navigate = useNavigate();

  async function fetchCourse() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCourse`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        setCourse(response.data.course);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      toast.error("An error occurred while fetching the course.");
    } finally {
      setLoading(false);
    }
  }

  const handleViewChapter = (chapterId) => {
    navigate(`/chapter/${chapterId}`);
  };

  const handleAddSection = () => {
    navigate(`/addSection/${courseId}`);
  };

  const handleAddChapter = (sectionId) => {
    navigate(`/addChapter/${sectionId}`);
  };

  async function enrollCourse() {
    try {
      setEnrolling(true);
      if (course.price === 0) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/enrollCourse`,
          { courseId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Successfully enrolled in the course.");
          await fetchProfile();
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/createOrder`,
          {
            courseId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );
        console.log(response);
        if (response.data.success) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: response.data.order.amount,
            currency: "INR",
            name: "Edvance Learning",
            description: "Course Purchase",
            order_id: response.data.order.id,
            handler: async function (responseData) {
              const verifyResponse = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user/verifyOrder`,
                {
                  orderId: response.data.order.id,
                  paymentId: responseData.razorpay_payment_id,
                  signature: responseData.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "edvance_token"
                    )}`,
                  },
                }
              );
              console.log(verifyResponse);
              if(verifyResponse.data.success){
                toast.success("Payment successful and course enrolled!");
                await fetchProfile();
              }else{
                toast.error(verifyResponse.data.message);
              }
            },
            prefill: {
              name: profile.name,
              email: profile.email,
            },
            notes: {
              address: "APJ Lecture Hall",
            },
            theme: {
              color: "#3399cc",
            },
          };

          console.log("Initializing Razorpay with options:", options);

          const rzp = new window.Razorpay(options);

          rzp.on("payment.failed", function (responseData) {
            toast.error("Payment failed: " + responseData.error.description + " Please try again.");
          });

          rzp.open();

        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEnrolling(false);
    }
  }

  useEffect(() => {
    fetchCourse();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50 pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-200"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Loading Course
            </h3>
            <p className="text-gray-500">
              Preparing your learning experience...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50 pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Course Not Found
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The course you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-6 py-3 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("/#courses")}
                className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Browse All Courses
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isAdmin = profile && profile.isAdmin;

  return (
    <>
      <Header
        topics={[
          { name: "Home", path: "/" },
          { name: "Courses", path: "/#courses" },
        ]}
      />

      <div className="min-h-80 bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50">
        {/* Full Screen Hero Section with Course Thumbnail */}
        <section className="relative pt-16">
          {/* Full Screen Hero Banner */}
          <div className="relative h-182 overflow-hidden">
            <img
              src={
                course.courseThumbnailImage ||
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              }
              alt={course.courseName}
              className="w-full h-full object-cover animate-fade-in"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

            {/* Course Title with Animation */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 drop-shadow-2xl leading-tight animate-slide-up">
                  {course.courseName}
                </h1>
              </div>
            </div>

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg
                className="w-6 h-6 text-white opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Course Overview Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-stone-200">
              <div className="flex items-start space-x-4 mb-8">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/70 rounded-2xl flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Course Overview
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {course.shortDescription}
                  </p>
                </div>
              </div>

              {/* Price and Enroll Section */}
              {profile.coursePurchased.includes(courseId) || profile.isAdmin ? (
                <div className="">
                  <span className="text-base font-bold text-[#7A7F3F]">
                    Enrolled
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center  gap-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center bg-gradient-to-r from-[#7A7F3F]/10 to-[#7A7F3F]/5 rounded-xl px-6 py-3 border border-[#7A7F3F]/20">
                    <span className="text-base font-bold text-[#7A7F3F]">
                      {course.price === 0
                        ? "Free"
                        : `₹${course.price.toFixed(2)}`}
                    </span>
                  </div>

                  <button
                    onClick={enrollCourse}
                    className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-8 py-4 rounded-xl text-sm font-bold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Enroll Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Course Introduction Section */}
        {course.courseIntroduction && (
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 mb-8 border border-stone-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/70 rounded-xl flex items-center justify-center mr-4">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Course Introduction
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  <p className="text-lg">{course.courseIntroduction}</p>
                </div>
              </div>

              {/* Course Introduction Images Gallery */}
              {course.courseIntroductionImages &&
                course.courseIntroductionImages.length > 0 && (
                  <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-stone-100">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Course Gallery
                      </h3>
                    </div>
                    <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
                      {course.courseIntroductionImages.map((image, index) => (
                        <div key={index} className="flex-shrink-0 group">
                          <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                            <img
                              src={image}
                              alt={`Course introduction ${index + 1}`}
                              className="w-72 h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* Course Details Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 rounded-3xl shadow-xl shadow-amber-200/30 p-8 border border-amber-200/50 relative overflow-hidden">
              {/* Decorative Pattern */}
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-yellow-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-amber-200/20 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Course Details
                  </h2>
                </div>
                <div className="prose prose-lg max-w-none text-gray-800">
                  <div className="text-lg leading-relaxed whitespace-pre-line bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
                    {course.longDescription}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sections & Chapters Display */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/80 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Course Content
                  </h2>
                </div>
                <p className="text-gray-600 text-lg">
                  Explore the structured learning path designed for your
                  transformation.
                </p>
              </div>

              {/* Admin Add Section Button */}
              {isAdmin && (
                <button
                  onClick={handleAddSection}
                  className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-6 py-3 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Section
                </button>
              )}
            </div>

            {/* Sections List */}
            <div className="space-y-6">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section) => (
                  <SectionItem
                    key={section._id}
                    section={section}
                    onViewChapter={handleViewChapter}
                    isAdmin={isAdmin}
                    onAddChapter={handleAddChapter}
                  />
                ))
              ) : (
                <div className="bg-gradient-to-br from-stone-50 to-white rounded-3xl shadow-xl shadow-gray-200/50 p-16 text-center border border-stone-200">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Course Content Coming Soon
                  </h3>
                  <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                    This course is being prepared with love and care. Exciting
                    content will be available soon!
                  </p>
                  {profile.isAdmin && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                        As an admin, you can start building this course:
                      </p>
                      <button
                        onClick={handleAddSection}
                        className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-8 py-4 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center mx-auto"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create First Section
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Course;
