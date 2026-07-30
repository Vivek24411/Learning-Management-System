import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header";

const EditChapter = () => {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { chapterId } = useParams();
  const navigate = useNavigate();

  async function fetchChapterData() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getChapter`,
        {
          params: { chapterId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setChapter(response.data.chapter);
      } else {
        toast.error(response.data.message || "Chapter not found");
      }
    } catch (error) {
      console.error("Error fetching chapter data:", error);
      toast.error("Failed to fetch chapter data");
    } finally {
      setLoading(false);
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!chapter.chapterName?.trim()) {
      newErrors.chapterName = "Chapter name is required";
    }
    
    // shortDescription and chapterSummary are optional, so no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function editChapter(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/editChapter`,
        {
          chapterId: chapter._id,
          chapterName: chapter.chapterName,
          shortDescription: chapter.shortDescription || "",
          chapterSummary: chapter.chapterSummary || ""
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Chapter updated successfully");
        navigate(-1); // Go back to previous page
      } else {
        toast.error(response.data.message || "Failed to update chapter");
      }
    } catch (error) {
      console.error("Error updating chapter:", error);
      toast.error("Failed to update chapter");
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (field, value) => {
    setChapter(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  useEffect(() => {
    fetchChapterData();
  }, [chapterId]);

  if (loading) {
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-[#6366F1] rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-[#6366F1] rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-[#6366F1] rounded-full animate-bounce delay-200"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Chapter</h3>
            <p className="text-gray-600">Please wait while we load the chapter data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Chapter Not Found</h3>
            <p className="text-gray-600 mb-6">Unable to load chapter data. Please try again.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#6366F1] text-white px-6 py-3 rounded font-semibold hover:bg-[#4F46E5] transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Chapter</h1>
                <p className="text-gray-600 mt-1">Update chapter information and content</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#6366F1] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Chapter Information</h2>
                  <p className="text-sm text-gray-600">Update the details of your chapter</p>
                </div>
              </div>
            </div>

            <form onSubmit={editChapter} className="space-y-6 p-4 sm:p-6">
              {/* Chapter Name */}
              <div>
                <label htmlFor="chapterName" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="chapterName"
                  value={chapter.chapterName || ""}
                  onChange={(e) => handleInputChange('chapterName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-colors duration-200 ${
                    errors.chapterName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter chapter name..."
                />
                {errors.chapterName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.chapterName}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="shortDescription"
                  rows="3"
                  value={chapter.shortDescription || ""}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none transition-colors duration-200"
                  placeholder="Brief description of what this chapter covers (optional)..."
                />
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    A concise overview of the chapter content
                  </p>
                  <p className="text-xs text-gray-500">
                    {chapter.shortDescription?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Chapter Summary */}
              <div>
                <label htmlFor="chapterSummary" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Summary <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="chapterSummary"
                  rows="5"
                  value={chapter.chapterSummary || ""}
                  onChange={(e) => handleInputChange('chapterSummary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6366F1] focus:border-transparent resize-none transition-colors duration-200"
                  placeholder="Detailed summary of the chapter content, key learning points, and outcomes (optional)..."
                />
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    Comprehensive overview of learning objectives and key takeaways
                  </p>
                  <p className="text-xs text-gray-500">
                    {chapter.chapterSummary?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-8 py-3 bg-[#6366F1] text-white rounded-lg font-medium hover:bg-[#4F46E5] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Chapter...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Chapter
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Current Chapter Info */}
          {chapter && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Current Chapter Content</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    {chapter.chapterFile && chapter.chapterFile.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Files:</span>
                        <span>{chapter.chapterFile.length} files attached</span>
                      </div>
                    )}
                    {chapter.chapterVideoDetails && chapter.chapterVideoDetails.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Videos:</span>
                        <span>{chapter.chapterVideoDetails.length} videos</span>
                      </div>
                    )}
                    {chapter.chapterThumbnailImage && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Thumbnail:</span>
                        <span>✅ Available</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800 mb-1">Chapter Editing Tips</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Use a clear and engaging chapter name that reflects the learning content</li>
                  <li>• Short description helps students understand what they'll learn quickly</li>
                  <li>• Chapter summary provides detailed learning objectives and outcomes</li>
                  <li>• Only the chapter name is required - other fields are optional but recommended</li>
                  <li>• Consider how this chapter fits into the overall section flow</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditChapter
