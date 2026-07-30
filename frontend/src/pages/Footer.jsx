import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

const LogoIcon = () => (
  <svg className="h-7 w-7 shrink-0 text-[#7A4E2D]" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 16 16)" opacity="0.3"/>
    <ellipse cx="16" cy="16" rx="14" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(-45 16 16)" opacity="0.3"/>
    <circle cx="16" cy="16" r="3" fill="currentColor"/>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()
  const location = useLocation()

  const handleFooterNavigation = (section) => {
    if (location.pathname === '/') {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/', { state: { scrollTo: section } });
    }
  }

  return (
    <footer className="bg-bg border-t border-border">
      
      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <LogoIcon />
              <h3 className="brand font-serif text-xl font-bold text-ink tracking-tight">Edvance</h3>
            </div>
            <p className="text-ink-muted text-sm leading-relaxed mb-6">
              Explore structured, expert-crafted courses designed for deep understanding.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a href="#" aria-label="Instagram" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted/70 transition-colors hover:bg-surface-muted hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted/70 transition-colors hover:bg-surface-muted hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="#" aria-label="X" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted/70 transition-colors hover:bg-surface-muted hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-muted/70 transition-colors hover:bg-surface-muted hover:text-primary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-ink-muted/70 font-medium text-xs uppercase tracking-widest mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-ink-muted hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleFooterNavigation('courses')}
                  className="text-ink-muted hover:text-primary transition-colors text-sm text-left"
                >
                  Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleFooterNavigation('about')}
                  className="text-ink-muted hover:text-primary transition-colors text-sm text-left"
                >
                  About
                </button>
              </li>
              <li>
                <Link to="/profile" className="text-ink-muted hover:text-primary transition-colors text-sm">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-ink-muted/70 font-medium text-xs uppercase tracking-widest mb-4">
              Support
            </h4>
            <ul className="space-y-3">
             
              <li>
                <a href="mailto:support@edvance.com" className="text-ink-muted hover:text-primary transition-colors text-sm">
                  Contact Support
                </a>
              </li>
              <li>
                <button 
                  onClick={() => handleFooterNavigation('home')}
                  className="text-ink-muted hover:text-primary transition-colors text-sm text-left"
                >
                  Back to Top
                </button>
              </li>
            </ul>
          </div>

        

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
            <p className="text-ink-muted/70 text-sm">
              © {currentYear} Edvance. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
