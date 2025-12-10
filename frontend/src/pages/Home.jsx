import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    fetchCourses();
    // Trigger hero animation after component mounts
    const timer = setTimeout(() => {
      setHeroLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const CourseCard = ({ course }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group">
      {/* Course Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={course.courseThumbnailImage || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={course.courseName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-[#7A7F3F] text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${course.price || '99'}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#7A7F3F] transition-colors duration-200">
          {course.courseName}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {course.shortDescription || "Discover inner peace and balance through this transformative yoga journey."}
        </p>
        
        {/* Course Meta */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {course.publishedDate ? new Date(course.publishedDate).toLocaleDateString() : 'Recently Added'}
          </div>
        </div>

        {/* View Details Button */}
        <button className="w-full bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white py-3 px-6 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Header topics={[{ name: 'Home', path: '#home' }, { name: 'Courses', path: '#courses' }, { name: 'About', path: '#about' }]} />
      
      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Meditation by the lake"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10"></div>
        </div>

        {/* Hero Content */}
        <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 ${
          heroLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-opacity-95 mb-6 leading-tight">
            Your Mind & Soul Is
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">
              Beautiful
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-white text-opacity-80 mb-8 max-w-3xl mx-auto leading-relaxed font-light">
            Begin your journey of peace, balance, and transformation.
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <button className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transform hover:scale-105 transition-all duration-200 shadow-2xl hover:shadow-3xl">
              Start Your Journey
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-200 shadow-lg">
              Explore Courses
            </button>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Discover Our
                  <span className="text-[#7A7F3F]"> Yoga Courses</span>
                </h2>
              </div>
              
              {/* Add Course Button for Admin */}
              {profile && profile.isAdmin && (
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => navigate('/addCourse')}
                    className="bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white px-6 py-3 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Course</span>
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transform your life through our carefully crafted yoga programs designed for every level of practitioner.
            </p>
          </div>

          {/* Courses Grid */}
          {loading ? (
            /* Loading State */
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-[#7A7F3F] rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-[#7A7F3F] rounded-full animate-pulse delay-75"></div>
                <div className="w-4 h-4 bg-[#7A7F3F] rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <div
                  key={course._id || index}
                  className={`transform transition-all duration-500 ${
                    heroLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/course/${course._id}`)}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          ) : (
            /* No Courses State */
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600">
                New courses are coming soon. Stay tuned for exciting yoga programs!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:gap-12">
            
            {/* Content */}
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose
                <span className="text-[#7A7F3F]"> Edvance?</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                At Edvance, we believe that yoga is more than just physical exercise—it's a journey of self-discovery, healing, and transformation. Our expert instructors guide you through practices that nurture both body and mind.
              </p>
              
              {/* Features */}
              <div className="space-y-4">
                {[
                  { title: "Expert Instructors", desc: "Learn from certified yoga masters with years of experience" },
                  { title: "Flexible Learning", desc: "Practice at your own pace with our online and offline options" },
                  { title: "Community Support", desc: "Join a welcoming community of like-minded practitioners" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-[#7A7F3F] rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <p className="text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Yoga practice"
                  className="rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#7A7F3F]/10 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home