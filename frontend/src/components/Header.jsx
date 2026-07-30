import React, { useState } from 'react'
import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContextData } from '../context/UserContextData';
import { motion as Motion } from 'framer-motion';

const LogoIcon = () => (
  <svg className="h-8 w-8 shrink-0 text-[#7A4E2D]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 16 16)" opacity="0.3"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(-45 16 16)" opacity="0.3"/>
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
    <circle cx="16" cy="2" r="1.5" fill="currentColor"/>
    <circle cx="26" cy="22" r="1.5" fill="currentColor"/>
    <circle cx="6" cy="22" r="1.5" fill="currentColor"/>
  </svg>
);

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

  const handleNavigation = (topic) => {
    if (topic.name === 'Home' || topic.path === 'home') {
      navigate('/');
    } else if (topic.name === 'Courses' || topic.path === 'courses') {
      if (location.pathname === '/') {
        const element = document.getElementById('courses');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/', { state: { scrollTo: 'courses' } });
      }
    } else if (topic.name === 'About' || topic.path === 'about') {
      if (location.pathname === '/') {
        const element = document.getElementById('about');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/', { state: { scrollTo: 'about' } });
      }
    } else {
      navigate(topic.path || `/${topic.name.toLowerCase()}`);
    }
  };

  return (
    <Motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand Name */}
          <Link to="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <LogoIcon />
            <h1 className="brand text-xl font-bold text-ink tracking-tight">
              Edvance
            </h1>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {topics && topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(topic)}
                className="text-ink-muted hover:text-ink text-sm font-medium uppercase tracking-widest transition-opacity duration-200"
              >
                {topic.name}
              </button>       
            ))}
          </nav>

          {/* Authentication Buttons - Right (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-ink-muted hover:text-ink text-sm font-medium transition-colors duration-200"
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-primary hover:bg-primary-hover text-surface px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:-translate-y-[1px] shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink-muted hover:text-ink text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-surface px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:-translate-y-[1px] shadow-md hover:shadow-lg inline-block"
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
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-ink-muted transition-colors duration-200 hover:bg-surface-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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
      <div className={`md:hidden overflow-y-auto transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[calc(100dvh-4rem)] opacity-100 shadow-xl' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="space-y-2 border-t border-border bg-surface px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
          {topics && topics.map((topic, index) => (
            <button
              key={index}
              onClick={() => {
                handleNavigation(topic);
                setIsMobileMenuOpen(false);
              }}
              className="block px-4 py-3 text-sm font-medium uppercase tracking-widest transition-all duration-200 rounded-lg hover:bg-surface-muted text-ink-muted hover:text-ink w-full text-left"
            >
              {topic.name}
            </button>
          ))}
          
          <div className="border-t border-border pt-4 mt-4 space-y-2">
            {loggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-ink-muted hover:text-ink block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-ink-muted hover:text-ink block px-4 py-3 text-sm font-medium transition-all duration-200 w-full text-left rounded-lg hover:bg-surface-muted"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-ink-muted hover:text-ink block px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-surface-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-primary-hover text-surface block px-4 py-3 mx-4 mt-2 rounded-md text-sm font-semibold text-center transition-all duration-200 shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Motion.header>
  )
}

export default Header
