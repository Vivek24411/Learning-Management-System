import React, { useState } from "react";
import Header from "../components/Header";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import axios from 'axios';


const InputField = ({ label, name, type = "text", placeholder, value, onChange, error, required = true, rows = null, accept = null }) => (
  <div className="space-y-3">
    <label htmlFor={name} className="flex items-center text-lg font-semibold text-gray-900 mb-3">
      <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
      </svg>
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {rows ? (
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-6 py-4 bg-gradient-to-r from-stone-50 to-amber-50/30 border-2 border-stone-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-[#7A7F3F] focus:ring-4 focus:ring-[#7A7F3F]/20 focus:bg-white transition-all duration-300 text-lg resize-none shadow-sm hover:shadow-md ${
          error ? 'border-red-300 bg-red-50' : ''
        }`}
      />
    ) : type === "file" ? (
      <input
        id={name}
        name={name}
        type={type}
        accept={accept}
        onChange={onChange}
        className="hidden"
        multiple={name === "chapterFiles"}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-6 py-4 bg-gradient-to-r from-stone-50 to-amber-50/30 border-2 border-stone-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-[#7A7F3F] focus:ring-4 focus:ring-[#7A7F3F]/20 focus:bg-white transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md ${
          error ? 'border-red-300 bg-red-50' : ''
        }`}
      />
    )}
    {error && (
      <p className="text-sm text-red-600 flex items-center">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const AddChapter = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  
  const [formData, setFormData] = useState({
    chapterName: "",
    shortDescription: "",
    chapterSummary: "",
  });

  const [chapterThumbnailImage, setChapterThumbnailImage] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [chapterFiles, setChapterFiles] = useState([]);
  const [videoDetails, setVideoDetails] = useState([]);
  const [externalLinks, setExternalLinks] = useState([{ label: "", url: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle thumbnail image selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setChapterThumbnailImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple file selection
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for documents
        toast.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });
    
    setChapterFiles(validFiles);
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = chapterFiles.filter((_, i) => i !== index);
    setChapterFiles(newFiles);
  };

  // Add new video entry
  const addVideoEntry = () => {
    setVideoDetails(prev => [
      ...prev,
      {
        videoTitle: '',
        videoFile: null,
        videoThumbnail: null,
        thumbnailPreview: null
      }
    ]);
  };

  // Handle video file upload
  const handleVideoFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit for videos
        toast.error('Video file size should be less than 100MB');
        return;
      }
      
      updateVideoDetail(index, 'videoFile', file);
    }
  };

  // Remove video entry
  const removeVideoEntry = (index) => {
    setVideoDetails(prev => prev.filter((_, i) => i !== index));
  };

  // Update video details
  const updateVideoDetail = (index, field, value) => {
    setVideoDetails(prev => prev.map((video, i) => 
      i === index ? { ...video, [field]: value } : video
    ));
  };

  // Handle video thumbnail upload
  const handleVideoThumbnailChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        updateVideoDetail(index, 'videoThumbnail', file);
        updateVideoDetail(index, 'thumbnailPreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // External Links Functions
  const addMoreLink = () => {
    setExternalLinks([...externalLinks, { label: "", url: "" }]);
  };

  const handleExternalLinkChange = (index, field, value) => {
    const updatedLinks = [...externalLinks];
    updatedLinks[index][field] = value;
    setExternalLinks(updatedLinks);
  };

  const removeExternalLink = (index) => {
    if (externalLinks.length > 1) {
      const updatedLinks = externalLinks.filter((_, i) => i !== index);
      setExternalLinks(updatedLinks);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.chapterName.trim()) {
      newErrors.chapterName = 'Chapter name is required';
    }
    
  
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleAddChapter = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append("chapterName", formData.chapterName);
      data.append("shortDescription", formData.shortDescription);
      data.append("chapterSummary", formData.chapterSummary);
      data.append("chapterThumbnailImage", chapterThumbnailImage);
      data.append("sectionId", sectionId);
      
      
      // Append multiple files
      chapterFiles.forEach((file) => {
        data.append("chapterFile", file);
      });

      console.log(videoDetails)
      
      // Append video files and details
      videoDetails.forEach((video, index) => {
        if(video.videoThumbnail && video.videoFile){
          data.append("chapterVideo",video.videoFile);
          data.append("chapterVideoThumbnailImage",video.videoThumbnail);
          data.append("chapterVideoTitle",video.videoTitle);
        }
      });

      // Append external links
      data.append("externalLinks", JSON.stringify(externalLinks));

      console.log(data);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addChapter`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
        console.log(response)
      if (response.data.success) {
        toast.success(response.data.msg || "Chapter added successfully");
        
        // Reset form
        setFormData({
          chapterName: "",
          shortDescription: "",
          chapterSummary: "",
        });
        setChapterThumbnailImage(null);
        setThumbnailPreview(null);
        setChapterFiles([]);
        setVideoDetails([]);
        setExternalLinks([{ label: "", url: "" }]);
        
        // Navigate back or to course page
        setTimeout(() => {
          navigate(-1);
        }, 1500);
        
      } else {
        toast.error(response.data.msg || "Failed to add chapter");
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
      toast.error("An error occurred while adding the chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Add New Chapter
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create a chapter for this section
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-stone-200 overflow-hidden">
            
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#7A7F3F]/15 via-[#7A7F3F]/10 to-[#7A7F3F]/5 px-8 py-6 border-b border-stone-200 relative overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7A7F3F]/10 to-transparent rounded-full -mt-16 -mr-16"></div>
              
              <div className="relative z-10 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Chapter Details</h2>
                  <p className="text-gray-600">Fill in the information for your new chapter</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAddChapter} className="p-8 space-y-8">
              
              {/* Chapter Name */}
              <InputField
                label="Chapter Name"
                name="chapterName"
                placeholder="Enter chapter title"
                value={formData.chapterName}
                onChange={handleInputChange}
                error={errors.chapterName}
                required={true}
              />

              {/* Short Description */}
              <InputField
                label="Short Description"
                name="shortDescription"
                placeholder="Short description about this chapter"
                value={formData.shortDescription}
                onChange={handleInputChange}
                rows={3}
                required={true}
              />

              {/* Chapter Thumbnail */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Chapter Thumbnail Image
                 
                </label>
                
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 hover:border-[#7A7F3F]/50 transition-colors duration-200">
                  <InputField
                    name="chapterThumbnailImage"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    required={false}
                  />
                  <label htmlFor="chapterThumbnailImage" className="cursor-pointer">
                    {thumbnailPreview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={thumbnailPreview}
                          alt="Chapter thumbnail preview"
                          className="w-48 h-32 object-cover rounded-xl shadow-lg mb-4"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 text-center">
                          <span className="font-semibold text-[#7A7F3F]">Click to upload</span> chapter thumbnail
                          <br />
                          <span className="text-sm">PNG, JPG, GIF up to 5MB</span>
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {errors.thumbnail && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.thumbnail}
                  </p>
                )}
              </div>

              {/* Chapter Files */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Chapter Files
                  <span className="text-gray-400 text-sm font-normal ml-2">(PDF, DOC - Max 10 files)</span>
                </label>
                
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 hover:border-[#7A7F3F]/50 transition-colors duration-200">
                  <InputField
                    name="chapterFiles"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFilesChange}
                  />
                  <label htmlFor="chapterFiles" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-600 text-center">
                        <span className="font-semibold text-[#7A7F3F]">Click to upload files</span>
                        <br />
                        <span className="text-sm">PDF, DOC, DOCX up to 10MB each</span>
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* File List */}
                {chapterFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Selected Files:</h4>
                    {chapterFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chapter Summary */}
              <InputField
                label="Chapter Summary"
                name="chapterSummary"
                placeholder="Write the chapter summary..."
                value={formData.chapterSummary}
                onChange={handleInputChange}
                rows={6}
                required={true}
              />

            

              {/* Video File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-lg font-semibold text-gray-900">
                    <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Chapter Video Files
                    <span className="text-gray-400 text-sm font-normal ml-2">(Optional - Upload actual video files)</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={addVideoEntry}
                    className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Video File
                  </button>
                </div>

                {/* Video File Entries */}
                {videoDetails.map((video, index) => (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-amber-50/30 rounded-2xl p-6 border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Video File {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVideoEntry(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Video Title */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Video Title</label>
                      <input
                        type="text"
                        placeholder="Enter video title"
                        value={video.videoTitle}
                        onChange={(e) => updateVideoDetail(index, 'videoTitle', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#7A7F3F] focus:ring-2 focus:ring-[#7A7F3F]/20 transition-all duration-200"
                      />
                    </div>
                    
                    {/* Video File Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Video File</label>
                      <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 hover:border-[#7A7F3F]/50 transition-colors duration-200">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleVideoFileChange(index, e)}
                          className="hidden"
                          id={`videoFile-${index}`}
                        />
                        <label htmlFor={`videoFile-${index}`} className="cursor-pointer">
                          {video.videoFile ? (
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{video.videoFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(video.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                <p className="text-xs text-blue-600">Click to change video file</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <div className="text-center">
                                <p className="text-gray-600">
                                  <span className="font-semibold text-[#7A7F3F]">Click to upload video file</span>
                                </p>
                                <p className="text-sm text-gray-500">MP4, AVI, MOV up to 100MB</p>
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    {/* Video Thumbnail */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Video Thumbnail</label>
                      <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 hover:border-[#7A7F3F]/50 transition-colors duration-200">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleVideoThumbnailChange(index, e)}
                          className="hidden"
                          id={`videoThumbnail-${index}`}
                        />
                        <label htmlFor={`videoThumbnail-${index}`} className="cursor-pointer">
                          {video.thumbnailPreview ? (
                            <div className="flex items-center space-x-3">
                              <img
                                src={video.thumbnailPreview}
                                alt="Video thumbnail"
                                className="w-20 h-12 object-cover rounded-lg shadow"
                              />
                              <span className="text-sm text-gray-600">Click to change thumbnail</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2 py-2">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-gray-600">Upload video thumbnail (optional)</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* External Links Section */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <svg
                    className="w-5 h-5 mr-2 text-[#7A7F3F]"
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
                  External Links
                  <span className="text-gray-400 text-sm font-normal ml-2">
                    (Optional)
                  </span>
                </label>

                <div className="space-y-4">
                  {externalLinks.map((link, index) => (
                    <div key={index} className="bg-gradient-to-r from-stone-50 to-amber-50/30 border-2 border-stone-200 rounded-2xl p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <svg
                              className="w-4 h-4 text-white"
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
                          Link {index + 1}
                        </h4>
                        {externalLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExternalLink(index)}
                            className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors duration-200"
                            title="Remove link"
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Link Label */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Link Label
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => handleExternalLinkChange(index, 'label', e.target.value)}
                              placeholder="e.g., Additional Resources, Documentation"
                              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Link URL */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Link URL
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => handleExternalLinkChange(index, 'url', e.target.value)}
                              placeholder="https://example.com"
                              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg
                                className="w-4 h-4 text-gray-400"
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
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add More Links Button */}
                  <button
                    type="button"
                    onClick={addMoreLink}
                    className="w-full py-4 border-2 border-dashed border-stone-300 rounded-2xl text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <svg
                      className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
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
                    <span className="font-medium">Add Another Link</span>
                  </button>
                </div>

                <p className="text-sm text-gray-500 ml-1">
                  Add helpful external resources, documentation, or supplementary materials for this chapter
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.chapterName.trim()}
                  className={`flex-1 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center ${
                    isSubmitting || !formData.chapterName.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Chapter...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Chapter
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Help Card */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Chapter Creation Tips</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Choose descriptive chapter names that clearly indicate the content</li>
                  <li>• Add supporting files like PDFs, worksheets, or reference materials</li>
                  <li>• Include video content to enhance the learning experience</li>
                  <li>• Write comprehensive summaries to help students understand the chapter goals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddChapter;
