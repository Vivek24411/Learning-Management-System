import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { toast } from 'react-toastify';
import { UserContextData } from '../context/UserContext';
import { motion } from 'framer-motion';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { profile, loggedIn } = useContext(UserContextData);
  const navigate = useNavigate();
  const location = useLocation();

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/getAllCourses`);
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
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const timer = setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        navigate(location.pathname, { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  // --- Animation Variants ---
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 }
    }
  };

  const wordVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  const fadeUp = {
    hidden: { y: 10, opacity: 0 },
    visible: (delay = 0) => ({
      y: 0, opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut', delay }
    })
  };

  const cardGridVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  // --- Course Card ---
  const CourseCard = ({ course }) => (
    <div className="bg-surface rounded-xl border border-border overflow-hidden group cursor-pointer flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-[0_8px_24px_rgba(34,28,22,0.08)] hover:-translate-y-1">
      {/* Course Image */}
      <div className="relative h-44 overflow-hidden bg-surface-muted flex-shrink-0">
        <img
          src={course.courseThumbnailImage || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={course.courseName}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay on thumbnail bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-80 pointer-events-none"/>
        <div className="absolute top-3 right-3">
          <span className="bg-primary text-surface px-3 py-1 rounded-full text-xs font-semibold">
            {course.price === 0 ? 'Free' : `₹${course.price}`}
          </span>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="brand font-serif text-lg font-semibold text-ink mb-2 leading-snug">
          {course.courseName}
        </h3>
        <p className="text-ink-muted text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
          {course.shortDescription || "Structured content designed to take you from fundamentals to mastery."}
        </p>
        
        {/* Bottom row */}
        <div className="flex items-center justify-between text-xs mt-auto flex-shrink-0">
          <div className="flex items-center text-ink-muted">
            <svg className="w-3.5 h-3.5 mr-1 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {course.publishedDate ? new Date(course.publishedDate).toLocaleDateString() : 'Recently Added'}
          </div>
          <span className="text-primary text-sm font-medium group-hover:text-primary-hover flex items-center gap-1 transition-colors duration-200">
            View Course
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      {/* ===== HERO SECTION ===== */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16 bg-bg">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left — Text */}
            <div className="py-20 lg:py-0">
              {/* Eyebrow */}
           
              {/* H1 */}
              <motion.h1
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="text-5xl lg:text-7xl font-serif text-ink tracking-tight leading-[1.1] mb-6"
              >
                <motion.span variants={wordVariants} className="block">
                  Your Journey to Learning
                </motion.span>
                <motion.span variants={wordVariants} className="block text-primary">
                  Starts Today.
                </motion.span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                custom={0.5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-base lg:text-sm text-ink-muted mb-10 max-w-lg leading-relaxed"
              >
               EdVance is a wisdom portal which sees education not just as passing on of information, but as kindling of the soul that brings out the perfection already in us. Discover profound insights into consciousness, nature, and the self through the classical Indian Knowledge Systems.
              </motion.p>
              
              {/* CTAs */}
              <motion.div
                custom={0.65}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const el = document.getElementById('courses');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-primary hover:bg-primary-hover text-surface px-7 py-3.5 rounded-md font-semibold transition-all duration-150 shadow-[0_4px_15px_rgba(122,31,43,0.15)]"
                >
                  Browse Courses
                </motion.button>
                {!loggedIn ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="border border-border text-ink-muted hover:border-primary hover:text-ink px-7 py-3.5 rounded-md font-semibold transition-all duration-150"
                  >
                    Sign In
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/profile')}
                    className="border border-border text-ink-muted hover:border-primary hover:text-ink px-7 py-3.5 rounded-md font-semibold transition-all duration-150"
                  >
                    Go to Profile
                  </motion.button>
                )}
              </motion.div>

              
            </div>

            {/* Right — Featured Placeholder Graphic */}
            <div className="hidden lg:flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full aspect-[4/3] max-w-md rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(34,28,22,0.08)] border border-border"
              >
                <div className="absolute inset-0 bg-surface-muted flex flex-col items-center justify-center p-8">
                  <svg className="w-24 h-24 text-accent opacity-40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm font-serif italic text-ink-muted text-center max-w-xs">
                    "Wisdom begins in wonder." <br /> Socrates
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES SECTION ===== */}
      <section id="courses" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-16"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
              <div className="mb-6 lg:mb-0">
                <p className="text-xs tracking-[0.05em] text-accent uppercase font-semibold mb-3">Courses</p>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-ink mb-3">
                  Expand Your Knowledge
                </h2>
                <p className="text-base text-ink-muted max-w-2xl leading-relaxed">
                  Comprehensive programs designed to build deep understanding, from fundamentals to advanced topics.
                </p>
              </div>
              
              {/* Add Course Button for Admin */}
              {profile && profile.isAdmin && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/addCourse')}
                  className="bg-surface-muted hover:bg-border text-ink px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-150 flex items-center space-x-2 border border-border"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Course</span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          ) : courses.length > 0 ? (
            <motion.div
              variants={cardGridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className={`grid grid-cols-1 ${courses.length === 1 ? 'max-w-xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}
            >
              {courses.map((course, index) => (
                <motion.div
                  key={course._id || index}
                  variants={cardVariants}
                  className={`${profile?.isAdmin ? 'min-h-[460px]' : 'min-h-[400px]'} flex flex-col`}
                >
                  <div 
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="flex-grow"
                  >
                    <CourseCard course={course} />
                  </div>
                  
                  {profile?.isAdmin && (
                    <div className="mt-4 flex flex-col sm:flex-row gap-2 flex-shrink-0">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editCourse/${course._id}`)
                        }}
                        className="flex-1 bg-surface border border-border text-ink-muted px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-surface-muted transition-colors duration-150 flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit Course
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course._id)
                        }}
                        className="flex-1 bg-surface border border-border text-danger px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-surface-muted transition-colors duration-150 flex items-center justify-center"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete Course
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-surface border border-border rounded-2xl max-w-2xl mx-auto shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-muted rounded-lg mb-4 text-accent">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-ink mb-2">No Courses Available</h3>
              <p className="text-ink-muted text-sm px-6">
                New courses are coming soon. Stay tuned for exciting programs!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="py-20 bg-bg">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs tracking-[0.05em] text-accent uppercase font-semibold mb-4">Why Edvance</p>
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-ink mb-6 leading-tight">
              Built for Serious Learners
            </h2>
            <p className="text-base text-ink-muted mb-12 leading-relaxed">
              We believe that deep understanding comes from structured learning, not scattered content. Our expert instructors guide you through each course that build intuition and clarity.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
              {[
                { icon: (
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ), title: "Structured Curriculum", desc: "Carefully sequenced content that builds understanding." },
                { icon: (
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ), title: "Active Practice", desc: "Integrated quizzes and reflections at every learning milestone." },
                { icon: (
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ), title: "Authentic Content", desc: "Designed in collaboration with domain experts." }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-start">
                  <div className="mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-ink mb-1 text-sm uppercase tracking-wider">{feature.title}</h3>
                  <p className="text-ink-muted leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Home