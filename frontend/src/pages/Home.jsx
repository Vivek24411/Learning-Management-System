import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { toast } from 'react-toastify';
import { UserContextData } from '../context/UserContext';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroLoaded, setHeroLoaded] = useState(false);
  
  // Get user profile from context and navigation
  const { profile } = useContext(UserContextData);
  const navigate = useNavigate();
  const location = useLocation();

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/getAllCourses`);
      console.log(response);
      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Error in fetching courses: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCourse(courseId) {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/deleteCourse`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
        },
        params: { courseId },
      });
      console.log(response);  
      if (response.data.success) {
        toast.success("Course deleted successfully");
        fetchCourses(); 
      } else {
        toast.error("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  }

  useEffect(() => {
    fetchCourses();
    // Trigger hero animation after component mounts
    const timer = setTimeout(() => {
      setHeroLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle scrolling to sections when coming from other pages
  useEffect(() => {
    if (location.state?.scrollTo) {
      const timer = setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        // Clear the state after scrolling
        navigate(location.pathname, { replace: true });
      }, 500); // Give time for page to load
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 overflow-hidden group cursor-pointer">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={course.courseThumbnailImage || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={course.courseName}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-md text-sm font-medium border border-white/20">
            {course.price ===0 ? 'Free' : `₹${course.price}`}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-snug">
          {course.courseName}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {course.shortDescription || "Discover inner peace and balance through this transformative yoga journey."}
        </p>
        
        {/* Course Meta */}
        <div className="flex items-center text-xs text-gray-500 mb-5">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {course.publishedDate ? new Date(course.publishedDate).toLocaleDateString() : 'Recently Added'}
        </div>

        {/* View Details Button */}
        <button className="w-full bg-[#7A7F3F] text-white py-2.5 px-4 rounded-md font-medium hover:bg-[#6B7035] transition-colors duration-200">
          View Details
        </button>
        
      </div>
    </div>
  );

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Meditation by the lake"
            className="w-full h-full object-cover"
          />
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transform transition-all duration-700 ease-out ${
          heroLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight tracking-wide">
            Your Mind & Soul Is
            <span className="block font-medium text-amber-100 mt-2">
              Beautiful
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Begin your journey of peace, balance, and transformation through mindful movement and inner awareness.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-[#7A7F3F] text-white px-8 py-3 rounded-md font-medium hover:bg-[#6B7035] transform hover:scale-105 transition-all duration-200">
              Start Your Journey
            </button>
            <button className="border border-white/60 text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 hover:border-white transition-all duration-200">
              Explore Courses
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="mb-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-3">
                  Discover Our Yoga Courses
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                  Transform your life through our carefully crafted yoga programs designed for every level of practitioner.
                </p>
              </div>
              
              {/* Add Course Button for Admin */}
              {profile && profile.isAdmin && (
                <button
                  onClick={() => navigate('/addCourse')}
                  className="bg-[#7A7F3F] text-white px-6 py-3 rounded-md font-medium hover:bg-[#6B7035] transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Course</span>
                </button>
              )}
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div>
                  <div
                  key={course._id || index}
                  className={`transform transition-all duration-500 ease-out ${
                    heroLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <CourseCard course={course} />
                  
                </div>
                  {profile?.isAdmin && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => navigate(`/editCourse/${course._id}`)}
                        className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors duration-200 flex items-center justify-center"
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
                        Edit Course
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="flex-1 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center"
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
                        Delete Course
                      </button>
                    </div>
                  )}
              </div>
            ))}
          </div>
        ) : (
          /* No Courses State */
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600 text-sm">
                New courses are coming soon. Stay tuned for exciting yoga programs!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            
            {/* Content */}
            <div className="mb-12 lg:mb-0">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6 leading-tight">
                Why Choose Edvance?
              </h2>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                At Edvance, we believe that yoga is more than just physical exercise—it's a journey of self-discovery, healing, and transformation. Our expert instructors guide you through practices that nurture both body and mind.
              </p>
              
              {/* Features */}
              <div className="space-y-6">
                {[
                  { title: "Expert Instructors", desc: "Learn from certified yoga masters with years of experience" },
                  { title: "Flexible Learning", desc: "Practice at your own pace with our online and offline options" },
                  { title: "Community Support", desc: "Join a welcoming community of like-minded practitioners" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-1.5 h-1.5 bg-[#7A7F3F] rounded-full mt-3"></div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="lg:order-first">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Yoga practice"
                  className="rounded-lg shadow-sm w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home