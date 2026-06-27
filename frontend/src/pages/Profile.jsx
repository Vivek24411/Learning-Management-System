import React from 'react'
import Header from '../components/Header'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';
import { motion } from 'framer-motion';


const Profile = () => {
  const { profile } = useContext(UserContextData);

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 pt-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden border border-border mt-10">
            <div className="lg:flex lg:flex-row-reverse">
              
              {/* Right Side — Illustration */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-bg"
                style={{
                  backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  opacity: 0.05
                }}
              >
                <div className="max-w-md w-full text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <p className="text-ink-muted text-sm">Your account details</p>
                </div>
              </div>

              {/* Left Side — Profile Information */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="brand font-serif text-3xl font-bold text-ink mb-2">
                      My Profile
                    </h1>
                    <p className="text-ink-muted">
                      Your account details and information
                    </p>
                  </div>

                  {/* Profile Information */}
                  {profile ? (
                    <div className="space-y-6">
                      
                      {/* Profile Picture Section */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4 border border-primary/20">
                          <span className="text-2xl font-bold text-primary">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </span>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Full Name
                        </label>
                        <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                          {profile.name || 'Not provided'}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                          {profile.email || 'Not provided'}
                        </div>
                      </div>

                      {/* Phone Field */}
                      {profile.phone && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Phone Number
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {profile.phone}
                          </div>
                        </div>
                      )}

                      {/* Date of Birth */}
                      {profile.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Date of Birth
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {new Date(profile.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Role */}
                      {profile.isAdmin && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Account Type
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium capitalize">
                           Admin Account
                          </div>
                        </div>
                      )}

                      {/* Created Date */}
                      {profile.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-ink-muted mb-2">
                            Member Since
                          </label>
                          <div className="px-4 py-3 bg-bg border border-border rounded-lg text-ink font-medium">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-bg border border-border rounded-2xl mb-4">
                        <svg className="w-8 h-8 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-ink mb-2">No Profile Data</h3>
                      <p className="text-ink-muted">
                        Your profile information is not available at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Profile