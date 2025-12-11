import React from 'react'
import Header from '../components/Header'
import { UserContextData } from '../context/UserContext';
import { useContext } from 'react';


const Profile = () => {
  const { profile } = useContext(UserContextData);

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-screen bg-gradient-to-br from-stone-200 via-amber-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8 mt-18">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mt-10">
            <div className="lg:flex lg:flex-row-reverse">
              
              {/* Right Side - Yoga Illustration */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100">
                <div className="max-w-md w-full">
                  <img
                    src="/src/assets/EdvanceLogo.png"
                    alt="Profile Illustration"
                    className="w-full h-auto rounded-3xl shadow-2xl object-cover"
                  />
                </div>
              </div>

              {/* Left Side - Profile Information */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      My Profile
                    </h1>
                    <p className="text-gray-600">
                      Your account details and information
                    </p>
                  </div>

                  {/* Profile Information */}
                  {profile ? (
                    <div className="space-y-6">
                      
                      {/* Profile Picture Section */}
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/70 rounded-full mb-4 shadow-lg">
                          <span className="text-2xl font-bold text-white">
                            {profile.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </span>
                        </div>
                      </div>

                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                          {profile.name || 'Not provided'}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                          {profile.email || 'Not provided'}
                        </div>
                      </div>

                      {/* Phone Field (if available) */}
                      {profile.phone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                            {profile.phone}
                          </div>
                        </div>
                      )}

                      {/* Date of Birth (if available) */}
                      {profile.dateOfBirth && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                            {new Date(profile.dateOfBirth).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Role (if available) */}
                      {profile.isAdmin && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Type
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 capitalize">
                           Admin Account
                          </div>
                        </div>
                      )}

                      {/* Created Date (if available) */}
                      {profile.createdAt && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Member Since
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900">
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Loading or No Profile State */
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data</h3>
                      <p className="text-gray-600">
                        Your profile information is not available at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile