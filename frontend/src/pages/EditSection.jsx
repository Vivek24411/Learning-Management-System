import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header";

const EditSection = () => {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { sectionId } = useParams();
  const navigate = useNavigate();

  async function fetchSectionData() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getSection`,
        {
          params: { sectionId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setSection(response.data.section);
      } else {
        toast.error(response.data.message || "Section not found");
      }
    } catch (error) {
      console.error("Error fetching section data:", error);
      toast.error("Failed to fetch section data");
    } finally {
      setLoading(false);
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!section.sectionTitle?.trim()) {
      newErrors.sectionTitle = "Section name is required";
    } else if (section.sectionTitle.length < 3) {
      newErrors.sectionTitle = "Section name must be at least 3 characters";
    }
    
    // sectionDescription is optional, so no validation needed
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function editSection(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/editSection`,
        {
          sectionId: section._id,
          sectionTitle: section.sectionTitle,
          sectionDescription: section.sectionDescription || ""
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Section updated successfully");
        navigate(-1); // Go back to previous page
      } else {
        toast.error(response.data.message || "Failed to update section");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (field, value) => {
    setSection(prev => ({
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
    fetchSectionData();
  }, [sectionId]);

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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Section</h3>
            <p className="text-gray-600">Please wait while we load the section data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!section) {
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Section Not Found</h3>
            <p className="text-gray-600 mb-6">Unable to load section data. Please try again.</p>
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

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Section</h1>
                <p className="text-gray-600 mt-1">Update section information and settings</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#7A7F3F] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Section Information</h2>
                  <p className="text-sm text-gray-600">Update the details of your section</p>
                </div>
              </div>
            </div>

            <form onSubmit={editSection} className="p-6 space-y-6">
              {/* Section Name */}
              <div>
                <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sectionTitle"
                  value={section.sectionTitle || ""}
                  onChange={(e) => handleInputChange('sectionTitle', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-colors duration-200 ${
                    errors.sectionTitle ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter section name..."
                />
                {errors.sectionTitle && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.sectionTitle}
                  </p>
                )}
              </div>

              {/* Section Description */}
              <div>
                <label htmlFor="sectionDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Section Description <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  id="sectionDescription"
                  rows="4"
                  value={section.sectionDescription || ""}
                  onChange={(e) => handleInputChange('sectionDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent resize-none transition-colors duration-200"
                  placeholder="Brief description of what this section covers (optional)..."
                />
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Provide additional context about this section's content
                  </p>
                  <p className="text-xs text-gray-500">
                    {section.sectionDescription?.length || 0} characters
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
                  className="w-full sm:w-auto px-8 py-3 bg-[#7A7F3F] text-white rounded-lg font-medium hover:bg-[#6A6F35] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Section...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Current Section Info */}
          {section && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">Current Section Information</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Chapters:</span>
                      <span>{section.chapters?.length || 0} chapters</span>
                    </div>
                    {section.sectionVideoUrl && section.sectionVideoUrl.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Videos:</span>
                        <span>{section.sectionVideoUrl.length} videos</span>
                      </div>
                    )}
                    {section.sectionQuiz && section.sectionQuiz.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Quiz:</span>
                        <span>{section.sectionQuiz.length} questions</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 mb-1">Section Editing Tips</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use a clear and descriptive section name that reflects the content</li>
                  <li>• Section description is optional but helps students understand the content</li>
                  <li>• Keep section names concise but informative</li>
                  <li>• Consider the logical flow of sections within your course</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSection;
