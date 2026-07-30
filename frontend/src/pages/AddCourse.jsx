import React, { useState } from 'react'
import Header from '../components/Header'
import { toast } from 'react-toastify'
import axios from 'axios';

// Input component for reusability (moved outside to prevent re-renders)
const InputField = ({ label, name, type = "text", placeholder, value, onChange, error, required = true, rows = null , extraText}) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <h3 className='text-sm text-gray-500'>{extraText}</h3>
    {rows ? (
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all duration-200 resize-none ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-300 bg-white hover:border-[#6366F1]/50'
        }`}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-300 bg-white hover:border-[#6366F1]/50'
        }`}
      />
    )}
    {error && <p className="text-sm text-red-600 flex items-center">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {error}
    </p>}
  </div>
);

const AddCourse = () => {
  // Form state
  const [formData, setFormData] = useState({
    courseName: '',
    shortDescription: '',
    longDescription: '',
    courseIntroduction: '',
    price: '',
    enrollmentType: 'paid',
    googleFormLink: ''
  });
  
  const [courseThumbnailImage, setCourseThumbnailImage] = useState(null);
  const [courseIntroductionImages, setCourseIntroductionImages] = useState([]);
  const [courseIntroductionImageCaptions, setCourseIntroductionImageCaptions] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [introImagesPreview, setIntroImagesPreview] = useState([]);
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
      
      setCourseThumbnailImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle multiple introduction images
  const handleIntroImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max size is 5MB`);
        return false;
      }
      return true;
    });
    
    setCourseIntroductionImages(validFiles);
    
    setCourseIntroductionImageCaptions(validFiles.map(() => ""));
    setIntroImagesPreview(validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    })));
  };

  // Remove introduction image
  const removeIntroImage = (index) => {
    const newImages = courseIntroductionImages.filter((_, i) => i !== index);
    const newPreviews = introImagesPreview.filter((_, i) => i !== index);
    const newCaptions = courseIntroductionImageCaptions.filter((_, i) => i !== index);
    
    setCourseIntroductionImages(newImages);
    setIntroImagesPreview(newPreviews);
    setCourseIntroductionImageCaptions(newCaptions);
  };

  const updateIntroImageCaption = (index, caption) => {
    setCourseIntroductionImageCaptions(prev =>
      prev.map((currentCaption, i) => i === index ? caption : currentCaption)
    );
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    
    if (
      formData.price !== '' &&
      (parseFloat(formData.price) < 0 || isNaN(parseFloat(formData.price)))
    ) {
      newErrors.price = 'Price must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
   
    try{
      const data = new FormData();
      data.append('courseName', formData.courseName);
      data.append('shortDescription', formData.shortDescription);
      data.append('longDescription', formData.longDescription);
      data.append('courseIntroduction', formData.courseIntroduction);
      data.append('enrollmentType', formData.enrollmentType);
      data.append('price', formData.price || '0');
      if (formData.enrollmentType === 'request') {
        data.append('googleFormLink', formData.googleFormLink);
      }
      if (courseThumbnailImage) {
        data.append('courseThumbnailImage', courseThumbnailImage);
      }
      courseIntroductionImages.forEach((file) => {
        data.append('courseIntroductionImages', file);
      });
      data.append(
        'courseIntroductionImageCaptions',
        JSON.stringify(courseIntroductionImageCaptions)
      );

      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/addCourse`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('edvance_token')}`
        }
      });
        console.log("Add Course Response:", response);
      if(response.data.success){
        toast.success(response.data.msg || "Course added successfully");
        
        setFormData({
          courseName: '',
          shortDescription: '',
          longDescription: '',
          courseIntroduction: '',
          price: '',
          enrollmentType: 'paid',
          googleFormLink: ''
        });
        setCourseThumbnailImage(null);
        setCourseIntroductionImages([]);
        setCourseIntroductionImageCaptions([]);
        setThumbnailPreview(null);
        setIntroImagesPreview([]);
      }else{
        toast.error("Failed to add course: " + response.data.msg);
      }
    }catch(error){
      console.error("Error adding course:", error);
      toast.error("An error occurred while adding the course: " + error.message);
    }finally{
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(184,144,47,0.14),_transparent_34%),linear-gradient(135deg,#FAF6EE_0%,#F2ECDD_100%)] pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Add New <span className="text-primary">Course</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share your yoga wisdom with the community. Create a transformative learning experience.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 rounded-3xl shadow-[0_28px_80px_-32px_rgba(34,28,22,0.35)] ring-1 ring-border/70 overflow-hidden backdrop-blur">
            <div className="p-5 sm:p-8 lg:p-12">
              
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Course Name */}
                <InputField
                  label="Course Name"
                  name="courseName"
                  placeholder="Enter course name (e.g., 'Beginner Hatha Yoga')"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  error={errors.courseName}
                />

                {/* Short Description */}
                <InputField
                  label="Short Description"
                  name="shortDescription"
                  placeholder="Short description for this course (2-3 lines)"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  error={errors.shortDescription}
                  rows={3}
                  required={false}
                />

                {/* Long Description */}
                <InputField
                  label="Detailed Description"
                  name="longDescription"
                  placeholder="Detailed course description - explain what students will learn, benefits, and course structure"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  error={errors.longDescription}
                  rows={6}
                  required={false}
                />

                {/* Course Introduction */}
                <InputField
                  label="Course Introduction"
                  name="courseIntroduction"
                  placeholder="Write the course introduction - welcome message, instructor bio, what makes this course special..."
                  value={formData.courseIntroduction}
                  onChange={handleInputChange}
                  error={errors.courseIntroduction}
                  rows={5}
                  required={false}
                />
                
                {/* Enrollment Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Enrollment Type <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500">
                    Choose how learners join this course.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, enrollmentType: 'paid' }))}
                      className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        formData.enrollmentType === 'paid'
                          ? 'border-[#6366F1] bg-[#6366F1]/5'
                          : 'border-stone-300 hover:border-[#6366F1]/50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">💳 Paid / Free Price</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Learners pay a set price (or 0 for free) and get instant access.
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, enrollmentType: 'request' }))}
                      className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                        formData.enrollmentType === 'request'
                          ? 'border-[#6366F1] bg-[#6366F1]/5'
                          : 'border-stone-300 hover:border-[#6366F1]/50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">✋ Request Access</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Learners request enrollment and you approve or reject each request.
                      </div>
                    </button>
                  </div>
                </div>

                {/* Price — shown for both types */}
                <InputField
                  label="Course Price"
                  name="price"
                  type="number"
                  placeholder="Course price (e.g., 99.99)"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                  required={false}
                  extraText={
                    formData.enrollmentType === 'request'
                      ? "Shown to learners for information. Collect the fee yourself (e.g. via the Google Form below), then approve their request. Set 0 if free."
                      : "Set Course Price 0 for Free Course"
                  }
                />

                {/* Google Form link (request access only) — optional */}
                {formData.enrollmentType === 'request' && (
                  <InputField
                    label="Google Form Link (Optional)"
                    name="googleFormLink"
                    type="text"
                    placeholder="https://docs.google.com/forms/... (leave blank if none)"
                    value={formData.googleFormLink}
                    onChange={handleInputChange}
                    error={errors.googleFormLink}
                    required={false}
                    extraText="Optional. If added, learners see this form (for payment / details) before requesting enrollment."
                  />
                )}

                {/* Thumbnail Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Course Thumbnail Image <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 transition-colors duration-200 hover:border-[#6366F1]/50 sm:p-8">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {thumbnailPreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="mb-4 h-32 w-full max-w-48 rounded-xl bg-surface-muted object-contain shadow-lg"
                          />
                          <p className="text-sm text-gray-600">Click to change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-600 text-center">
                            <span className="font-semibold text-[#6366F1]">Click to upload</span> or drag and drop
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

                {/* Introduction Images */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Course Introduction Images <span className="text-gray-500">(Optional - Max 5)</span>
                  </label>
                  <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 transition-colors duration-200 hover:border-[#6366F1]/50 sm:p-8">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleIntroImagesChange}
                      className="hidden"
                      id="intro-images-upload"
                    />
                    <label htmlFor="intro-images-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 text-center">
                          <span className="font-semibold text-[#6366F1]">Click to upload multiple images</span>
                          <br />
                          <span className="text-sm">PNG, JPG, GIF up to 5MB each</span>
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Image Previews */}
                  {introImagesPreview.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {introImagesPreview.map((image, index) => (
                        <div key={index} className="relative group rounded-2xl border border-border bg-white p-3 shadow-sm">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full rounded-xl bg-surface-muted object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => removeIntroImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
                          <label className="block mt-3">
                            <span className="text-xs font-semibold text-ink-muted">
                              Caption <span className="font-normal">(Optional)</span>
                            </span>
                            <input
                              type="text"
                              maxLength={240}
                              value={courseIntroductionImageCaptions[index] || ""}
                              onChange={(e) => updateIntroImageCaption(index, e.target.value)}
                              placeholder="What does this image show?"
                              className="mt-1.5 w-full rounded-xl border border-border bg-bg/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5]/80 text-white py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 ${
                      isSubmitting 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-[#6366F1]/90 hover:to-[#4F46E5]/70 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Course...
                      </div>
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddCourse
