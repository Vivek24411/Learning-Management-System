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
  const [submitting, setSubmitting] = useState(false);

  async function handleDeleteChapter(chapterId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/deleteChapter`,
        {
          params: {
            chapterId,
            sectionId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        toast.success("Chapter deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(
          "Failed to delete chapter: " + (response.data.msg || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 overflow-hidden group cursor-pointer h-[580px] flex flex-col">
      {/* Chapter Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
        {chapter.chapterThumbnailImage ? (
          <img
            src={chapter.chapterThumbnailImage}
            alt={chapter.chapterName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
          {chapter.chapterName}
        </h4>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 flex-shrink-0">
          {chapter.shortDescription ||
            "Explore this chapter to deepen your understanding and practice."}
        </p>

        {/* External Links Indicator */}
        <div className="flex-grow">
          {chapter.externalLinks && chapter.externalLinks.length > 0 && (
            <div className="mb-3">
              <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                <svg
                  className="w-3 h-3 text-blue-500 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-xs font-medium text-blue-700">
                  {chapter.externalLinks.length} Resource
                  {chapter.externalLinks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="mt-auto flex flex-col gap-2">
          {profile?.isAdmin && (
            <div className="mb-4">
              <button
                onClick={() => navigate(`/editChapter/${chapter._id}`)}
                className="w-full bg-blue-50 text-blue-700 py-2.5 px-4 rounded-md font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center border border-blue-200"
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
                disabled={submitting}
                className="w-full bg-red-50 text-red-700 py-2.5 px-4 rounded-md font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center border border-red-200 mt-2"
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
              className="w-full bg-[#7A7F3F] text-white py-2.5 px-4 rounded-md font-medium hover:bg-[#6A6F35] transition-colors duration-200"
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
    </div>
  );
};

// Section Item Component
const SectionItem = ({
  section,
  onViewChapter,
  isAdmin,
  onAddChapter,
  sectionVideoInput,
  setSectionVideoInput,
  sectionVideoFiles,
  setSectionVideoFiles,
  sectionVideoPreview,
  setSectionVideoPreview,
  handleSectionVideoFiles,
  addSectionVideos,
  removeSectionVideo,
  updatingThumbnail,
  setCourse,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { profile } = useContext(UserContextData);
  const [submitting, setSubmitting] = useState(false);
  const [sectionLink, setSectionLink] = useState([{
    label: "",
    url: "",
  }]);
  const [showSectionLinkInput, setShowSectionLinkInput] = useState(false);

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

  async function removeSectionLink(label) {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/deleteSectionLink`,
        {
          sectionId: section._id,
          label,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        setCourse((prev) => {
          const oldCourse = { ...prev };
          console.log(oldCourse)
          console.log(section._id)
          oldCourse.sections = oldCourse.sections.map((sec) => {
            return sec._id === section._id
              ? { ...sec, externalLinks: response.data.externalLinks }
              : sec;
          });
        
          console.log(oldCourse);
          return oldCourse;
        });
        toast.success("Section link removed successfully");
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function addSection() {
    try {
      if (!sectionLink[0].url) {
        return toast.error("Please add atleast One Link");
      }
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addSectionLink`,
        {
          sectionId: section._id,
          sectionLink,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        setCourse((prev) => {
          const oldCourse = { ...prev };
          oldCourse.sections = oldCourse.sections.map((sec) => {
            return sec._id === section._id
              ? { ...sec, externalLinks: response.data.externalLinks }
              : sec;
          });
          return oldCourse;
        });
        setSectionLink([{ label: "", url: "" }]);
        setShowSectionLinkInput(false);
        toast.success("Section links added successfully");
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function addSectionInput() {
    setSectionLink((prev) => {
      return [...prev, { label: "", url: "" }];
    });
  }

  function removeSectionInput(index){
    const secLink = [...sectionLink];
    const updatedSecLink = secLink.filter((sec, i)=>{
      if(index!==i){
        return sec
      }
    })
    setSectionLink(updatedSecLink);
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

              {/* External Links indicator */}
              {section.externalLinks && section.externalLinks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1 flex items-center">
                  <svg
                    className="w-4 h-4 text-blue-500 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm font-medium text-blue-700">
                    {section.externalLinks.length}
                    {section.externalLinks.length === 1 ? " Link" : " Links"}
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
                      onClick={() =>
                        setSectionVideoInput((prev) => ({
                          ...prev,
                          [section._id]: !prev[section._id],
                        }))
                      }
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Manage Videos
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
                    className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 relative"
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

                      {/* Admin Remove Button */}
                      {profile?.isAdmin && (
                        <button
                          onClick={() =>
                            removeSectionVideo(section._id, videoUrl, index)
                          }
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full transition-colors duration-200 backdrop-blur-sm"
                          title="Remove video"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
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

          {/* Section Video Management - Admin Only */}
          {profile?.isAdmin && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Section Video Gallery
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                    {section.sectionVideoUrl
                      ? section.sectionVideoUrl.length
                      : 0}{" "}
                    videos
                  </div>
                </div>

                {!sectionVideoInput[section._id] ? (
                  <button
                    onClick={() =>
                      setSectionVideoInput((prev) => ({
                        ...prev,
                        [section._id]: true,
                      }))
                    }
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
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
                    Add Section Videos
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-red-300">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-red-400 mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-1">
                          Upload section videos
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Select multiple video files to add to this section
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={(e) =>
                            handleSectionVideoFiles(e, section._id)
                          }
                          className="hidden"
                          id={`sectionVideo-${section._id}`}
                        />
                        <label
                          htmlFor={`sectionVideo-${section._id}`}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 cursor-pointer transition-colors duration-200"
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
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Choose Videos
                        </label>
                      </div>
                    </div>

                    {/* Video Preview Grid */}
                    {sectionVideoFiles[section._id] &&
                      sectionVideoFiles[section._id].length > 0 && (
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              Preview ({sectionVideoFiles[section._id].length}{" "}
                              videos selected)
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {sectionVideoPreview[section._id]?.map(
                              (videoSrc, index) => (
                                <div key={index} className="relative">
                                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <video
                                      src={videoSrc}
                                      className="w-full h-full object-cover"
                                      controls={false}
                                      muted
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                      <div className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                                        Video {index + 1}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => addSectionVideos(section._id)}
                              disabled={updatingThumbnail}
                              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                            >
                              {updatingThumbnail ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                <>
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
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  Upload Videos
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSectionVideoInput((prev) => ({
                                  ...prev,
                                  [section._id]: false,
                                }));
                                setSectionVideoFiles((prev) => ({
                                  ...prev,
                                  [section._id]: null,
                                }));
                                setSectionVideoPreview((prev) => ({
                                  ...prev,
                                  [section._id]: null,
                                }));
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Link Management - Admin Only */}
          {profile?.isAdmin && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
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
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Section External Links
                    </h3>
                  </div>
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                    {section.externalLinks ? section.externalLinks.length : 0} links
                  </div>
                </div>

                {!showSectionLinkInput ? (
                  <button
                    onClick={() => setShowSectionLinkInput(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
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
                    Add Section Links
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">Add External Links</h4>
                          <button
                            onClick={() => addSectionInput()}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add More Links
                          </button>
                        </div>

                        {sectionLink.map((link, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-gray-900">Link {index + 1}</h5>
                              {sectionLink.length > 1 && (
                                <button
                                  onClick={() => removeSectionInput(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove this link"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Link Label
                                </label>
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => {
                                    const newLinks = [...sectionLink];
                                    newLinks[index].label = e.target.value;
                                    setSectionLink(newLinks);
                                  }}
                                  placeholder="Enter link label (e.g., Documentation, Tutorial)"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Link URL
                                </label>
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => {
                                    const newLinks = [...sectionLink];
                                    newLinks[index].url = e.target.value;
                                    setSectionLink(newLinks);
                                  }}
                                  placeholder="https://example.com"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={addSection}
                            disabled={submitting}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Adding Links...
                              </>
                            ) : (
                              <>
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
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                                Add Section Links
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowSectionLinkInput(false);
                              setSectionLink([{ label: "", url: "" }]);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Links Display */}
          {section.externalLinks && section.externalLinks.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                External Resources ({section.externalLinks.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.externalLinks.map((link, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:shadow-md transition-all duration-200 group relative"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-5 5"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-semibold text-gray-900 group-hover:text-blue-800 transition-colors duration-200 mb-1">
                            {link.label || `External Link ${index + 1}`}
                          </h5>
                          <p className="text-sm text-blue-700 truncate font-medium">
                            {link.url}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-blue-600">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-5 5"
                              />
                            </svg>
                            <span>Opens in new tab</span>
                          </div>
                        </div>
                      </div>
                    </a>
                    
                    {/* Admin Remove Button */}
                    {profile?.isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeSectionLink(link.label);
                        }}
                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        title="Remove link"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
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
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState(null);
  const [updatingThumbnail, setUpdatingThumbnail] = useState(false);
  const [introductionImageInput, setIntroductionImageInput] = useState(false);
  const [introductionImageFiles, setIntroductionImageFiles] = useState(null);
  const [introductionImagePreview, setIntroductionImagePreview] =
    useState(null);

  // Section Video Management States
  const [sectionVideoInput, setSectionVideoInput] = useState({});
  const [sectionVideoFiles, setSectionVideoFiles] = useState({});
  const [sectionVideoPreview, setSectionVideoPreview] = useState({});

  // Course Access Management States
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Admin Access Management States
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [grantingAdminAccess, setGrantingAdminAccess] = useState(false);

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

  function inputThumbnailFile(e) {
    const file = e.target.files[0];
    setCourseThumbnailFile(file);
    setCourseThumbnailPreview(URL.createObjectURL(file));
  }

  async function updateCourseThumbnail() {
    try {
      if (!courseThumbnailFile) {
        toast.error("Please select a thumbnail image to upload.");
        return;
      }
      setUpdatingThumbnail(true);
      const formData = new FormData();
      formData.append("courseThumbnailImage", courseThumbnailFile);
      formData.append("courseId", courseId);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/updateCourseThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);

      if (response.data.success) {
        toast.success(response.data.msg);
        setCourse(response.data.course);
        setShowThumbnailInput(false);
        setCourseThumbnailFile(null);
        setCourseThumbnailPreview(null);
      } else {
        toast.error(response.data.msg);
      }
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
      toast.error("An error occurred while uploading the thumbnail.");
    } finally {
      setUpdatingThumbnail(false);
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

  const handleRemoveImage = async (imageURL) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/removeCourseIntroductionImage`,
        {
          courseId,
          imageURL,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Image Removed");
        setCourse(response.data.course);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  function handleIntroductionImageFiles(e) {
    const files = Array.from(e.target.files);
    setIntroductionImageFiles(files);
    setIntroductionImagePreview(files.map((file) => URL.createObjectURL(file)));
  }

  async function addIntroductionImages() {
    try {
      if (!introductionImageFiles || introductionImageFiles.length === 0) {
        toast.error("Please select introduction images to upload.");
        return;
      }

      setUpdatingThumbnail(true);
      const formData = new FormData();
      introductionImageFiles.forEach((file) => {
        formData.append("courseIntroductionImages", file);
      });
      formData.append("courseId", courseId);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addIntroductionImages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success("Introduction Images Added Successfully");
        setCourse(response.data.course);
        setIntroductionImageInput(false);
        setIntroductionImageFiles(null);
        setIntroductionImagePreview(null);
      }
    } catch (err) {
      console.error("Error uploading introduction images:", err);
      toast.error("An error occurred while uploading the introduction images.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  // Section Video Management Functions
  function handleSectionVideoFiles(e, sectionId) {
    const files = Array.from(e.target.files);
    setSectionVideoFiles((prev) => ({
      ...prev,
      [sectionId]: files,
    }));
    setSectionVideoPreview((prev) => ({
      ...prev,
      [sectionId]: files.map((file) => URL.createObjectURL(file)),
    }));
  }

  async function addSectionVideos(sectionId) {
    try {
      if (
        !sectionVideoFiles[sectionId] ||
        sectionVideoFiles[sectionId].length === 0
      ) {
        toast.error("Please select section videos to upload.");
        return;
      }

      setUpdatingThumbnail(true);
      const formData = new FormData();
      sectionVideoFiles[sectionId].forEach((file) => {
        formData.append("sectionVideo", file);
      });
      formData.append("sectionId", sectionId);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addSectionVideos`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        toast.success("Section Videos Added Successfully");
        // Update the course state with the updated section
        setCourse((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section._id === sectionId
              ? {
                  ...section,
                  sectionVideoUrl: response.data.section.sectionVideoUrl,
                }
              : section
          ),
        }));
        setSectionVideoInput((prev) => ({ ...prev, [sectionId]: false }));
        setSectionVideoFiles((prev) => ({ ...prev, [sectionId]: null }));
        setSectionVideoPreview((prev) => ({ ...prev, [sectionId]: null }));
      }
    } catch (err) {
      console.error("Error uploading section videos:", err);
      toast.error("An error occurred while uploading the section videos.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  async function removeSectionVideo(sectionId, videoURL, videoIndex) {
    if (!window.confirm("Are you sure you want to remove this video?")) {
      return;
    }

    try {
      setUpdatingThumbnail(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/removeSectionVideo`,
        {
          sectionId,
          videoURL,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Section Video Removed Successfully");
        // Update the course state with the updated section
        setCourse((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section._id === sectionId
              ? {
                  ...section,
                  sectionVideoUrl: response.data.section.sectionVideoUrl,
                }
              : section
          ),
        }));
      }
    } catch (err) {
      console.error("Error removing section video:", err);
      toast.error("An error occurred while removing the section video.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  // Course Access Management Function
  async function grantCourseAccess() {
    if (!emailInput.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    try {
      setGrantingAccess(true);

      // Parse comma-separated emails and clean them
      const emailArray = emailInput
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .filter((email) => {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            toast.error(`Invalid email format: ${email}`);
            return false;
          }
          return true;
        });

      if (emailArray.length === 0) {
        toast.error("No valid email addresses found");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/giveCourseAccess`,
        {
          courseId: courseId,
          emailArray: emailArray,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success(
          `Course access granted to ${emailArray.length} user${
            emailArray.length !== 1 ? "s" : ""
          }`
        );
        setEmailInput("");
        setShowAccessManagement(false);
      } else {
        toast.error(response.data.msg || "Failed to grant course access");
      }
    } catch (error) {
      console.error("Error granting course access:", error);
      toast.error("An error occurred while granting course access");
    } finally {
      setGrantingAccess(false);
    }
  }

  // Admin Access Management Function
  async function grantAdminAccess() {
    if (!adminEmailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setGrantingAdminAccess(true);

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmailInput.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/giveAdminAccess`,
        {
          email: adminEmailInput.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Admin access granted to ${adminEmailInput.trim()}`);
        setAdminEmailInput("");
        setShowAdminManagement(false);
      } else {
        toast.error(response.data.msg || "Failed to grant admin access");
      }
    } catch (error) {
      console.error("Error granting admin access:", error);
      toast.error("An error occurred while granting admin access");
    } finally {
      setGrantingAdminAccess(false);
    }
  }

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
        {/* Fullscreen Hero Image Section */}
        <section className="relative pt-16">
          <div
            className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"
            style={{ height: "calc(100vh - 4rem)" }}
          >
            <img
              src={
                course.courseThumbnailImage ||
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
              }
              alt={course.courseName}
              className="w-full h-full object-contain"
            />
            {/* Optional subtle overlay for better image visibility */}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </section>

        {/* Course Info Section - Below Thumbnail */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {course.courseName}
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {course.shortDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Admin Thumbnail Update Section */}
        {profile.isAdmin && (
          <section className="py-8 bg-gray-50 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Course Thumbnail
                      </h3>
                      <p className="text-sm text-gray-600">
                        Update the course thumbnail image
                      </p>
                    </div>
                  </div>

                  {!showThumbnailInput && (
                    <button
                      onClick={() => setShowThumbnailInput(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
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
                      Update Thumbnail
                    </button>
                  )}
                </div>

                {/* Thumbnail Upload Interface */}
                {showThumbnailInput && (
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors duration-200">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            Upload new thumbnail
                          </p>
                          <p className="text-sm text-gray-600">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => inputThumbnailFile(e)}
                              className="hidden"
                            />
                            <span className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200 inline-flex items-center">
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
                              Choose File
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {courseThumbnailFile && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center mb-4">
                          <svg
                            className="w-5 h-5 text-green-500 mr-2"
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
                          <h4 className="text-lg font-medium text-gray-900">
                            Preview
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Current Thumbnail */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Current Thumbnail
                            </p>
                            <div className="relative">
                              <img
                                src={
                                  course.courseThumbnailImage ||
                                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                }
                                alt="Current Course Thumbnail"
                                className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-gray-200"
                              />
                              <div className="absolute top-2 left-2 bg-gray-800/70 text-white px-2 py-1 rounded text-xs">
                                Current
                              </div>
                            </div>
                          </div>

                          {/* New Thumbnail Preview */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              New Thumbnail
                            </p>
                            <div className="relative">
                              <img
                                src={courseThumbnailPreview}
                                alt="New Course Thumbnail Preview"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="absolute top-2 left-2 bg-green-600/90 text-white px-2 py-1 rounded text-xs">
                                New
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <button
                            onClick={updateCourseThumbnail}
                            disabled={updatingThumbnail}
                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                          >
                            {updatingThumbnail ? (
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
                                Uploading...
                              </>
                            ) : (
                              <>
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                Upload Thumbnail
                              </>
                            )}
                          </button>

                          {!updatingThumbnail && (
                            <button
                              onClick={() => {
                                setShowThumbnailInput(false);
                                setCourseThumbnailFile(null);
                                setCourseThumbnailPreview(null);
                              }}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Admin Course Access Management Section */}
        {profile.isAdmin && (
          <section className="py-8 bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.196-2.121L17 20zM9 3a4 4 0 100 8 4 4 0 000-8zM3 20a6 6 0 0112 0H3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Grant Course Access
                      </h3>
                      <p className="text-sm text-gray-600">
                        Give specific users access to this course by email
                      </p>
                    </div>
                  </div>

                  {!showAccessManagement && (
                    <button
                      onClick={() => setShowAccessManagement(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors duration-200 flex items-center"
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
                      Grant Access
                    </button>
                  )}
                </div>

                {showAccessManagement && (
                  <div className="space-y-6">
                    {/* Email Input Section */}
                    <div className="bg-white rounded-lg border border-green-200 p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Addresses
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          Enter email addresses separated by commas. Users with
                          these emails will get access to this course.
                        </p>
                        <textarea
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="user1@example.com, user2@example.com, user3@example.com"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>

                      {/* Email Preview */}
                      {emailInput.trim() && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Email Preview (
                            {
                              emailInput
                                .split(",")
                                .filter((email) => email.trim().length > 0)
                                .length
                            }{" "}
                            emails):
                          </p>
                          <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {emailInput
                                .split(",")
                                .map((email) => email.trim())
                                .filter((email) => email.length > 0)
                                .map((email, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                                        ? "bg-green-100 text-green-800 border border-green-200"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                    }`}
                                  >
                                    {email}
                                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                      email
                                    ) ? (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={grantCourseAccess}
                          disabled={!emailInput.trim() || grantingAccess}
                          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                        >
                          {grantingAccess ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Granting Access...
                            </>
                          ) : (
                            <>
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
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Grant Access
                            </>
                          )}
                        </button>

                        {!grantingAccess && (
                          <button
                            onClick={() => {
                              setShowAccessManagement(false);
                              setEmailInput("");
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Admin Access Management Section */}
        {profile.isAdmin && (
          <section className="py-8 bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Admin Access Management
                      </h3>
                      <p className="text-purple-600 text-sm">
                        Grant admin privileges to specific users
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminManagement(!showAdminManagement)}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                      showAdminManagement
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    {showAdminManagement ? (
                      <>
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Close
                      </>
                    ) : (
                      <>
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Manage Admin Access
                      </>
                    )}
                  </button>
                </div>

                {showAdminManagement && (
                  <div className="mt-6 p-6 bg-white rounded-lg border border-purple-200 shadow-sm">
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        Grant Admin Access
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Enter an email address to grant admin privileges. The
                        user will be able to manage courses, sections, and
                        chapters.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="adminEmail"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          User Email Address
                        </label>
                        <input
                          id="adminEmail"
                          type="email"
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 text-sm"
                          disabled={grantingAdminAccess}
                        />
                        {adminEmailInput && (
                          <div className="mt-2 flex items-center">
                            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              adminEmailInput
                            ) ? (
                              <div className="flex items-center text-green-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Valid email address
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-600">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Invalid email format
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <div>
                            <h5 className="text-sm font-medium text-yellow-800 mb-1">
                              Important Notice
                            </h5>
                            <p className="text-sm text-yellow-700">
                              Admin privileges grant full access to the platform
                              including course management, user management, and
                              system settings. Only grant admin access to
                              trusted users.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={grantAdminAccess}
                          disabled={
                            !adminEmailInput.trim() ||
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              adminEmailInput
                            ) ||
                            grantingAdminAccess
                          }
                          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                        >
                          {grantingAdminAccess ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Granting Admin Access...
                            </>
                          ) : (
                            <>
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
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Grant Admin Access
                            </>
                          )}
                        </button>

                        {!grantingAdminAccess && (
                          <button
                            onClick={() => {
                              setShowAdminManagement(false);
                              setAdminEmailInput("");
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

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

              {/* Course Gallery Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
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
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Course Gallery
                      </h3>
                      <p className="text-sm text-gray-600">
                        Visual introduction to the course content
                      </p>
                    </div>
                  </div>

                  {/* Admin Add Images Button */}
                  {profile.isAdmin && !introductionImageInput && (
                    <button
                      onClick={() => setIntroductionImageInput(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200 flex items-center"
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
                      Add Images
                    </button>
                  )}
                </div>

                {/* Image Upload Interface */}
                {profile.isAdmin && introductionImageInput && (
                  <div className="space-y-6 mb-8">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-purple-200 rounded-lg p-6 text-center hover:border-purple-300 transition-colors duration-200">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            Upload course gallery images
                          </p>
                          <p className="text-sm text-gray-600">
                            Select multiple images to showcase your course
                          </p>
                        </div>
                        <div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleIntroductionImageFiles}
                              className="hidden"
                            />
                            <span className="bg-purple-600 text-white px-6 py-2 rounded-md font-medium hover:bg-purple-700 transition-colors duration-200 inline-flex items-center">
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
                              Choose Images
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {introductionImageFiles &&
                      introductionImageFiles.length > 0 && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                          <div className="flex items-center mb-4">
                            <svg
                              className="w-5 h-5 text-green-500 mr-2"
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
                            <h4 className="text-lg font-medium text-gray-900">
                              Preview ({introductionImageFiles.length} images
                              selected)
                            </h4>
                          </div>

                          {/* Image Previews Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                            {introductionImagePreview &&
                              introductionImagePreview.map((preview, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                  />
                                  <div className="absolute top-1 left-1 bg-purple-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                                    {index + 1}
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={addIntroductionImages}
                              disabled={updatingThumbnail}
                              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                            >
                              {updatingThumbnail ? (
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
                                  Uploading Images...
                                </>
                              ) : (
                                <>
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
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                  </svg>
                                  Upload Images
                                </>
                              )}
                            </button>

                            {!updatingThumbnail && (
                              <button
                                onClick={() => {
                                  setIntroductionImageInput(false);
                                  setIntroductionImageFiles(null);
                                  setIntroductionImagePreview(null);
                                }}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Current Gallery Images */}
                {course.courseIntroductionImages &&
                course.courseIntroductionImages.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        {course.courseIntroductionImages.length}{" "}
                        {course.courseIntroductionImages.length === 1
                          ? "image"
                          : "images"}{" "}
                        in gallery
                      </p>
                      {profile.isAdmin && (
                        <span className="text-xs text-gray-500">
                          Click on an image to remove it
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {course.courseIntroductionImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative group overflow-hidden rounded-lg hover:shadow-lg transition-all duration-200"
                        >
                          <img
                            src={image}
                            alt={`Course gallery ${index + 1}`}
                            className="w-full h-48 object-cover"
                          />

                          {/* Image Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200"></div>

                          {/* Image Number Badge */}
                          <div className="absolute top-3 left-3 bg-white/90 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
                            {index + 1}
                          </div>

                          {/* Admin Remove Button */}
                          {profile.isAdmin && (
                            <button
                              onClick={() => handleRemoveImage(image)}
                              className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0"
                            >
                              <svg
                                className="w-4 h-4"
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
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* No Images State */
                  <div className="text-center py-12">
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                      No Gallery Images
                    </h4>
                    <p className="text-gray-500 mb-4">
                      Add some images to showcase your course visually
                    </p>
                    {profile?.isAdmin && !introductionImageInput && (
                      <button
                        onClick={() => setIntroductionImageInput(true)}
                        className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors duration-200"
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
                        Add First Images
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                    sectionVideoInput={sectionVideoInput}
                    setSectionVideoInput={setSectionVideoInput}
                    sectionVideoFiles={sectionVideoFiles}
                    setSectionVideoFiles={setSectionVideoFiles}
                    sectionVideoPreview={sectionVideoPreview}
                    setSectionVideoPreview={setSectionVideoPreview}
                    handleSectionVideoFiles={handleSectionVideoFiles}
                    addSectionVideos={addSectionVideos}
                    removeSectionVideo={removeSectionVideo}
                    updatingThumbnail={updatingThumbnail}
                    setCourse={setCourse}
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
