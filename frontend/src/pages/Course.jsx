import React, { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContextData } from "../context/UserContext";
import Header from "../components/Header";

// Chapter Item Component
const ChapterItem = ({ chapter, onViewChapter, sectionId }) => {
  const handleChapterClick = () => {
    onViewChapter(chapter._id);
  };

  const { profile } = useContext(UserContextData);
  const { courseId } = useParams();
  const navigate = useNavigate();

  async function handleDeleteChapter(chapterId) {
    if (!window.confirm("Are you sure you want to delete this chapter? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/deleteChapter`, {
        params: { 
          chapterId,
          sectionId 
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
        }
      });
      
      console.log(response);
      if(response.data.success){
        toast.success("Chapter deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Failed to delete chapter: " + (response.data.msg || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter: " + error.message);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Chapter Thumbnail */}
      <div className="relative h-44">
        {chapter.chapterThumbnailImage ? (
          <img
            src={chapter.chapterThumbnailImage}
            alt={chapter.chapterName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7A7F3F] to-[#6A6F35] flex items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-white rounded-full"></div>
              <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}

        {/* Chapter Status Badge */}
        <div className="absolute top-3 right-3">
          {profile.coursePurchased.includes(courseId) || profile.isAdmin ? (
            <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Available
            </div>
          ) : (
            <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Chapter Info */}
      <div className="p-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
          {chapter.chapterName}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {chapter.shortDescription ||
            "Explore this chapter to deepen your understanding and practice."}
        </p>

        {profile?.isAdmin && (
          <div className="mb-4">
            <button
              onClick={() => navigate(`/editChapter/${chapter._id}`)}
              className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md font-medium hover:bg-blue-100 transition-colors duration-200 text-sm flex items-center justify-center border border-blue-200"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Chapter
            </button>
            <button
              onClick={() => handleDeleteChapter(chapter._id)}
              className="w-full bg-red-50 text-red-700 px-4 py-2 rounded-md font-medium hover:bg-red-100 transition-colors duration-200 text-sm flex items-center justify-center border border-red-200 mt-2"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Chapter
            </button>
          </div>
        )}

        {/* Chapter Action Button */}
        {profile.coursePurchased.includes(courseId) || profile.isAdmin ? (
          <button
            onClick={handleChapterClick}
            className="w-full bg-[#7A7F3F] text-white px-4 py-2 rounded font-medium hover:bg-[#6A6F35] transition-colors duration-200 text-sm"
          >
            Start Learning
          </button>
        ) : (
          <div className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-center">
            <div className="flex items-center justify-center mb-1">
              <svg
                className="w-4 h-4 text-gray-400 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-600 font-medium text-sm">
                Requires enrollment
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Section Item Component
const SectionItem = ({ section, onViewChapter, isAdmin, onAddChapter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { profile } = useContext(UserContextData);

  async function handleDeleteSection(sectionId) {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/user/deleteSection`,
      {
        params: { sectionId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
        },
      }
    );
    console.log(response);
    if (response.data.success) {
      toast.success("Section deleted successfully");
      setTimeout(() => {
        // Refresh the page or update the UI as needed
        window.location.reload();
      }, 2000);
    } else {
      toast.error("Failed to delete section");
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-[#7A7F3F] rounded-lg flex items-center justify-center mr-4">
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
              <h3 className="text-xl font-semibold text-gray-900">
                {section.sectionTitle}
              </h3>
            </div>

            {section.sectionDescription && (
              <p className="text-gray-600 leading-relaxed mb-3 ml-14">
                {section.sectionDescription}
              </p>
            )}

            {/* Section Info Indicators */}
            <div className="flex items-center space-x-3 ml-14">
              <div className="bg-gray-50 border border-gray-200 rounded px-3 py-1 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {section.chapters ? section.chapters.length : 0}
                  {section.chapters?.length === 1 ? " Chapter" : " Chapters"}
                </span>
              </div>

              {/* Video count indicator */}
              {section.sectionVideoUrl &&
                section.sectionVideoUrl.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded px-3 py-1 flex items-center">
                    <svg
                      className="w-4 h-4 text-red-500 mr-2"
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
                    <span className="text-sm font-medium text-red-700">
                      {section.sectionVideoUrl.length}
                      {section.sectionVideoUrl.length === 1
                        ? " Video"
                        : " Videos"}
                    </span>
                  </div>
                )}

              <div>
                {profile?.isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/quiz/section/${section._id}`)}
                      className="bg-purple-50 border border-purple-200 text-purple-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-purple-100 transition-colors duration-200 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Add Quiz
                    </button>
                    <button
                      onClick={() => navigate(`/editSection/${section._id}`)}
                      className="bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Section
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(section._id)}
                      className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-red-100 transition-colors duration-200 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {section.sectionQuiz && section.sectionQuiz.length > 0 && (
                <div>
                  <button
                    onClick={() => navigate(`/takeQuiz/section/${section._id}`)}
                    className="bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 text-sm font-medium hover:bg-green-100 transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Admin Add Chapter Button */}
            {isAdmin && (
              <button
                onClick={() => onAddChapter(section._id)}
                className="bg-[#7A7F3F] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#6A6F35] transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
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
              className={`p-2 rounded hover:bg-gray-50 transition-colors duration-200 ${
                isExpanded ? "text-[#7A7F3F]" : "text-gray-500"
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
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
        <div className="p-6 space-y-6">
          {/* Section Videos */}
          {section.sectionVideoUrl && section.sectionVideoUrl.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-600"
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
                Section Videos ({section.sectionVideoUrl.length})
              </h4>
              <h6 className="text-gray-500 text-xs mb-3">
                Double Tap On Video To Enter Fullscreen
              </h6>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.sectionVideoUrl.map((videoUrl, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      <video
                        src={videoUrl}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover protected"
                        controlsList="nodownload noremoteplayback"
                        disablePictureInPicture
                        disableRemotePlayback
                        onContextMenu={(e) => e.preventDefault()}
                        onSelectStart={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        onLoadStart={(e) => {
                          // Additional protection
                          e.target.addEventListener("contextmenu", (e) =>
                            e.preventDefault()
                          );
                          e.target.addEventListener("selectstart", (e) =>
                            e.preventDefault()
                          );
                          e.target.addEventListener("dragstart", (e) =>
                            e.preventDefault()
                          );
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        Video {index + 1}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg
                            className="w-4 h-4 mr-1 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          <span>Section Video</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.chapters && section.chapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.chapters.map((chapter, index) => (
                <div
                  key={chapter._id}
                  className={`transform transition-all duration-500 ${
                    isExpanded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isExpanded ? `${index * 150}ms` : "0ms",
                  }}
                >
                  <ChapterItem
                    chapter={chapter}
                    onViewChapter={onViewChapter}
                    sectionId={section._id}
                  />
                </div>
              ))}
            </div>
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
              if (verifyResponse.data.success) {
                toast.success("Payment successful and course enrolled!");
                await fetchProfile();
              } else {
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
            toast.error(
              "Payment failed: " +
                responseData.error.description +
                " Please try again."
            );
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

    // Additional video protection
    const protectVideos = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        // Disable right-click
        video.addEventListener("contextmenu", (e) => e.preventDefault());

        // Disable text selection
        video.addEventListener("selectstart", (e) => e.preventDefault());

        // Disable drag
        video.addEventListener("dragstart", (e) => e.preventDefault());

        // Disable keyboard shortcuts that might allow download
        video.addEventListener("keydown", (e) => {
          // Disable F12, Ctrl+Shift+I, Ctrl+S, etc.
          if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && e.key === "I") ||
            (e.ctrlKey && e.key === "s") ||
            (e.ctrlKey && e.key === "S") ||
            (e.ctrlKey && e.key === "u") ||
            (e.ctrlKey && e.key === "U")
          ) {
            e.preventDefault();
            return false;
          }
        });

        // Handle fullscreen changes to maintain protection
        video.addEventListener("fullscreenchange", () => {
          if (document.fullscreenElement === video) {
            // Video is now in fullscreen - reapply protection
            setTimeout(() => {
              video.addEventListener("contextmenu", (e) => e.preventDefault());
              video.addEventListener("selectstart", (e) => e.preventDefault());
              video.addEventListener("dragstart", (e) => e.preventDefault());
            }, 100);
          }
        });

        // Handle webkit fullscreen
        video.addEventListener("webkitfullscreenchange", () => {
          if (document.webkitFullscreenElement === video) {
            setTimeout(() => {
              video.addEventListener("contextmenu", (e) => e.preventDefault());
              video.addEventListener("selectstart", (e) => e.preventDefault());
              video.addEventListener("dragstart", (e) => e.preventDefault());
            }, 100);
          }
        });
      });
    };

    // Apply protection initially and whenever DOM changes
    protectVideos();
    const observer = new MutationObserver(protectVideos);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  if (localStorage.getItem("edvance_token") === null) {
    toast.info("Please login to access the course details.");
    navigate("/login");
  }

  if (loading) {
    return (
      <>
        <Header
          topics={[
            { name: "Home", path: "home" },
            { name: "Courses", path: "courses" },
            { name: "About", path: "about" },
          ]}
        />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-[#7A7F3F] rounded-full animate-bounce delay-200"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Course
            </h3>
            <p className="text-gray-600">
              Please wait while we load the course content...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header
          topics={[
            { name: "Home", path: "home" },
            { name: "Courses", path: "courses" },
            { name: "About", path: "about" },
          ]}
        />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Course Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The course you're looking for doesn't exist or has been moved.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-[#7A7F3F] text-white px-6 py-3 rounded font-semibold hover:bg-[#6A6F35] transition-colors duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("/#courses")}
                className="w-full bg-white text-gray-700 px-6 py-3 rounded font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
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
          { name: "Home", path: "home" },
          { name: "Courses", path: "courses" },
          { name: "About", path: "about" },
        ]}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative pt-16">
          <div className="relative h-210 overflow-hidden">
            <img
              src={
                course.courseThumbnailImage ||
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              }
              alt={course.courseName}
              className="w-full h-full object-cover"
            />

            <img src={course.courseThumbnailImage} alt="" />
            <div></div>

            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-center max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {course.courseName}
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto">
                  {course.shortDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Course Overview Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Course Overview
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {course.shortDescription}
                </p>
              </div>

              {/* Price and Enroll Section */}
              {profile.coursePurchased.includes(courseId) || profile.isAdmin ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-lg font-semibold text-green-700">
                      Successfully Enrolled
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {course.price === 0
                          ? "Free"
                          : `₹${course.price.toFixed(2)}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {course.price === 0
                          ? "No cost to enroll"
                          : "One-time payment"}
                      </div>
                    </div>

                    <button
                      onClick={enrollCourse}
                      disabled={enrolling}
                      className="bg-[#7A7F3F] text-white px-6 py-3 rounded font-semibold hover:bg-[#6A6F35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {enrolling ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Enroll Now
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Course Introduction Section */}
        {course.courseIntroduction && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Course Introduction
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  <p className="text-base">{course.courseIntroduction}</p>
                </div>
              </div>

              {/* Course Introduction Images Gallery */}
              {course.courseIntroductionImages &&
                course.courseIntroductionImages.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Course Gallery
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {course.courseIntroductionImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative overflow-hidden rounded-lg"
                        >
                          <img
                            src={image}
                            alt={`Course introduction ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </section>
        )}

        {/* Course Details Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Course Details
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div className="text-base whitespace-pre-line">
                  {course.longDescription}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sections & Chapters Display */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Course Content
                </h2>
                <p className="text-gray-600">
                  Explore the structured learning path designed for your
                  success.
                </p>
              </div>

              {/* Admin Add Section Button */}
              {isAdmin && (
                <button
                  onClick={handleAddSection}
                  className="bg-[#7A7F3F] text-white px-4 py-2 rounded font-medium hover:bg-[#6A6F35] transition-colors duration-200 flex items-center"
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No Content Available Yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    This course is currently being prepared. Content will be
                    available soon.
                  </p>
                  {profile.isAdmin && (
                    <div>
                      <p className="text-sm text-gray-500 mb-4">
                        As an admin, you can start building this course:
                      </p>
                      <button
                        onClick={handleAddSection}
                        className="bg-[#7A7F3F] text-white px-6 py-3 rounded font-semibold hover:bg-[#6A6F35] transition-colors duration-200 flex items-center mx-auto"
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
