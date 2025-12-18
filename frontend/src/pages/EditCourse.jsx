import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/Header";

const EditCourse = () => {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const { courseId } = useParams();
  const navigate = useNavigate();

  async function fetchCourseData() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCourse`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
          params: {
            courseId,
          },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        setCourseData(response.data.course);
      } else {
        toast.error(response.data.message || "Failed to fetch course data");
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!courseData.courseName?.trim()) {
      newErrors.courseName = "Course name is required";
    } else if (courseData.courseName.length < 3) {
      newErrors.courseName = "Course name must be at least 3 characters";
    }
    
    if (!courseData.shortDescription?.trim()) {
      newErrors.shortDescription = "Short description is required";
    } else if (courseData.shortDescription.length < 10) {
      newErrors.shortDescription = "Short description must be at least 10 characters";
    }
    
    
    
    if (courseData.price === undefined || courseData.price === null || courseData.price < 0) {
      newErrors.price = "Price must be a valid number (0 or greater)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function editCourseData(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/editCourse`,
        {
          courseId: courseData._id,
          courseName: courseData.courseName,
          shortDescription: courseData.shortDescription,
          longDescription: courseData.longDescription,
          courseIntroduction: courseData.courseIntroduction,
          price: parseFloat(courseData.price)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response.data);
      if (response.data.success) {
        toast.success("Course updated successfully");
        navigate(-1); // Go back to previous page
      } else {
        toast.error(response.data.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Error editing course data:", error);
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  }

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
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
    fetchCourseData();
  }, [courseId]);

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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Course</h3>
            <p className="text-gray-600">Please wait while we load the course data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!courseData) {
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Not Found</h3>
            <p className="text-gray-600 mb-6">Unable to load course data. Please try again.</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-gray-600 mt-1">Update course information and settings</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#7A7F3F] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Course Information</h2>
                  <p className="text-sm text-gray-600">Update the details of your course</p>
                </div>
              </div>
            </div>

            <form onSubmit={editCourseData} className="p-6 space-y-8">
              {/* Course Name */}
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="courseName"
                  value={courseData.courseName || ""}
                  onChange={(e) => handleInputChange('courseName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-colors duration-200 ${
                    errors.courseName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter course name..."
                />
                {errors.courseName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.courseName}
                  </p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="shortDescription"
                  rows="3"
                  value={courseData.shortDescription || ""}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent resize-none transition-colors duration-200 ${
                    errors.shortDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the course..."
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.shortDescription ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.shortDescription}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-gray-500">
                    {courseData.shortDescription?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Long Description */}
              <div>
                <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="longDescription"
                  rows="6"
                  value={courseData.longDescription || ""}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent resize-none transition-colors duration-200 ${
                    errors.longDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Comprehensive description of the course content, objectives, and outcomes..."
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.longDescription ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.longDescription}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-gray-500">
                    {courseData.longDescription?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Course Introduction */}
              <div>
                <label htmlFor="courseIntroduction" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Introduction <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="courseIntroduction"
                  rows="4"
                  value={courseData.courseIntroduction || ""}
                  onChange={(e) => handleInputChange('courseIntroduction', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent resize-none transition-colors duration-200 ${
                    errors.courseIntroduction ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Introduction to welcome students and explain what they'll learn..."
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.courseIntroduction ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.courseIntroduction}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <p className="text-xs text-gray-500">
                    {courseData.courseIntroduction?.length || 0} characters
                  </p>
                </div>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={courseData.price || ""}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-colors duration-200 ${
                      errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  {errors.price ? (
                    <p className="text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.price}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">Set to 0 for free courses</p>
                  )}
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
                      Updating Course...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Course
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Course Editing Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use a clear and descriptive course name that reflects the content</li>
                  <li>• Write a compelling short description to attract students</li>
                  <li>• Include detailed information about learning outcomes in the long description</li>
                  <li>• Create an engaging introduction to welcome new students</li>
                  <li>• Set appropriate pricing based on course value and market research</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditCourse;
