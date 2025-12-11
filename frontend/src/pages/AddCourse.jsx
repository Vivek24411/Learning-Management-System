import React, { useState } from 'react'
import Header from '../components/Header'
import { toast } from 'react-toastify'
import axios from 'axios';

// Input component for reusability (moved outside to prevent re-renders)
const InputField = ({ label, name, type = "text", placeholder, value, onChange, error, required = true, rows = null }) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {rows ? (
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-all duration-200 resize-none ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-300 bg-white hover:border-[#7A7F3F]/50'
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
        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-300 bg-red-50' : 'border-stone-300 bg-white hover:border-[#7A7F3F]/50'
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
    price: ''
  });
  
  const [courseThumbnailImage, setCourseThumbnailImage] = useState(null);
  const [courseIntroductionImages, setCourseIntroductionImages] = useState([]);
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
    
    // Create previews
    const previews = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push({
          file,
          preview: reader.result,
          name: file.name
        });
        
        if (previews.length === validFiles.length) {
          setIntroImagesPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove introduction image
  const removeIntroImage = (index) => {
    const newImages = courseIntroductionImages.filter((_, i) => i !== index);
    const newPreviews = introImagesPreview.filter((_, i) => i !== index);
    
    setCourseIntroductionImages(newImages);
    setIntroImagesPreview(newPreviews);
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required';
    }
    
    if (!formData.shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    
    if (!formData.longDescription.trim()) {
      newErrors.longDescription = 'Long description is required';
    }
    
    if (!formData.courseIntroduction.trim()) {
      newErrors.courseIntroduction = 'Course introduction is required';
    }
    
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!courseThumbnailImage) {
      newErrors.thumbnail = 'Thumbnail image is required';
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
      data.append('price', formData.price);
      data.append('courseThumbnailImage', courseThumbnailImage);
      courseIntroductionImages.forEach((file, index) => {
        data.append('courseIntroductionImages', file);
      });

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
          price: ''
        });
        setCourseThumbnailImage(null);
        setCourseIntroductionImages([]);
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
      
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50 pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Add New <span className="text-[#7A7F3F]">Course</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share your yoga wisdom with the community. Create a transformative learning experience.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="p-8 sm:p-12">
              
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
                />

                {/* Price */}
                <InputField
                  label="Course Price"
                  name="price"
                  type="number"
                  placeholder="Course price (e.g., 99.99)"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={errors.price}
                />

                {/* Thumbnail Image */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Course Thumbnail Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 hover:border-[#7A7F3F]/50 transition-colors duration-200">
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
                            <span className="font-semibold text-[#7A7F3F]">Click to upload</span> or drag and drop
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
                  <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 hover:border-[#7A7F3F]/50 transition-colors duration-200">
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
                          <span className="font-semibold text-[#7A7F3F]">Click to upload multiple images</span>
                          <br />
                          <span className="text-sm">PNG, JPG, GIF up to 5MB each</span>
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Image Previews */}
                  {introImagesPreview.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {introImagesPreview.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeIntroImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                          >
                            ×
                          </button>
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
                    className={`w-full bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white py-4 px-8 rounded-full font-semibold text-lg transition-all duration-200 ${
                      isSubmitting 
                        ? 'opacity-70 cursor-not-allowed' 
                        : 'hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
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