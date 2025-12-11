import React, { useState } from 'react'
import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContextData } from '../context/UserContext';

const Header = ({topics}) => {
  const { loggedIn, setLoggedIn, setProfile } = useContext(UserContextData);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('edvance_token');
    setLoggedIn(false);
    setProfile(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation handler that works for both hash links and routes
  const handleNavigation = (topic) => {
    if (topic.name === 'Home' || topic.path === 'home') {
      navigate('/');
    } else if (topic.name === 'Courses' || topic.path === 'courses') {
      if (location.pathname === '/') {
        // If on home page, scroll to courses section
        const element = document.getElementById('courses');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If on other pages, navigate to home and then scroll
        navigate('/', { state: { scrollTo: 'courses' } });
      }
    } else if (topic.name === 'About' || topic.path === 'about') {
      if (location.pathname === '/') {
        // If on home page, scroll to about section
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If on other pages, navigate to home and then scroll
        navigate('/', { state: { scrollTo: 'about' } });
      }
    } else {
      // For other navigation items, use the path directly
      navigate(topic.path || `/${topic.name.toLowerCase()}`);
    }
  };

  // Lotus Icon SVG Component
  const LotusIcon = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.5 5h5.5l-4.5 3.5 1.5 5.5-4.5-3.5-4.5 3.5 1.5-5.5-4.5-3.5h5.5z"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1"/>
    </svg>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-[#7A7F3F] via-[#7A7F3F] to-[#7A7F3F] overflow-hidden min-h-18 shadow-lg backdrop-blur-md">
      {/* Subtle Yoga Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.08) 3px, transparent 3px),
                             radial-gradient(circle at 50% 10%, rgba(255, 255, 255, 0.06) 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px'
          }}
        />
      </div>

      {/* Additional Mandala-like Pattern */}
      <div 
        className="absolute inset-0 opacity-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='1'%3E%3Ccircle cx='50' cy='50' r='20'/%3E%3Cpath d='M30 50a20 20 0 0 1 40 0'/%3E%3Cpath d='M50 30a20 20 0 0 1 0 40'/%3E%3Cpath d='M70 50a20 20 0 0 1-40 0'/%3E%3Cpath d='M50 70a20 20 0 0 1 0-40'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="/src/assets/EdvanceLogo.png" 
                alt="Edvance Logo" 
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden">
                <LotusIcon />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider drop-shadow-sm font-sans">
              Edvance
            </h1>
          </Link>

          {/* Desktop Navigation Links - Center */}
          <nav className="hidden md:flex space-x-8">
            {topics && topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(topic)}
                className="relative text-white hover:text-yellow-300 px-3 py-2 text-base font-medium transition-all duration-300 tracking-wide font-sans group"
              >
                {topic.name}
                <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300 group-hover:w-8 shadow-lg shadow-yellow-500/30"></span>
              </button>       
            ))}
          </nav>

          {/* Authentication Buttons - Right (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-yellow-300 px-4 py-2 text-sm font-medium transition-all duration-300 tracking-wide font-sans drop-shadow-sm"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-800 hover:text-gray-900 px-6 py-2 rounded-full text-sm font-semibold font-sans tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 px-4 py-2 text-sm font-medium transition-all duration-300 tracking-wide font-sans drop-shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-800 hover:text-gray-900 px-6 py-2 rounded-full text-sm font-semibold font-sans tracking-wide transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 inline-block"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-yellow-300 focus:outline-none focus:text-yellow-300 transition-colors duration-200 p-2 rounded-md"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden backdrop-blur-md transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-6 space-y-2 bg-gray-600 bg-opacity-95">
          {topics && topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => {
                handleNavigation(topic);
                setIsMobileMenuOpen(false);
              }}
              className="block px-4 py-3 text-base font-medium transition-all duration-200 font-sans tracking-wide rounded-lg hover:bg-white hover:bg-opacity-10 text-white hover:text-yellow-300 w-full text-left"
            >
              {topic.name}
            </button>
          ))}
          
          <div className="border-t border-gray-400 border-opacity-30 pt-4 mt-4 space-y-2">
            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-yellow-300 block px-4 py-3 text-base font-medium transition-all duration-200 font-sans tracking-wide rounded-lg hover:bg-white hover:bg-opacity-10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-white hover:text-yellow-300 block px-4 py-3 text-base font-medium transition-all duration-200 font-sans tracking-wide w-full text-left rounded-lg hover:bg-white hover:bg-opacity-10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 block px-4 py-3 text-base font-medium transition-all duration-200 font-sans tracking-wide rounded-lg hover:bg-white hover:bg-opacity-10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-800 hover:text-gray-900 block px-4 py-3 mx-4 mt-2 rounded-full text-base font-semibold font-sans tracking-wide text-center transition-all duration-300 shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header