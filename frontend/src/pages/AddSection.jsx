import React from 'react'
import Header from '../components/Header'
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AddSection = () => {
    const [sectionTitle, setSectionTitle] = React.useState('');
    const [sectionDescription, setSectionDescription] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { courseId } = useParams();
    const navigate = useNavigate();

    async function handleAddSection() {
        try{
            if(!sectionTitle){
                toast.error("Section title is required");
                return;
            }
            setIsSubmitting(true);
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/addSection`, {
                sectionTitle,
                sectionDescription,
                courseId
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('edvance_token')}`
                }
            });
            console.log(response.data);
            if(response.data.success){
                toast.success("Section added successfully");
                setSectionTitle('');
                setSectionDescription('');
            } else {
                toast.error(response.data.message || "Failed to add section");
            }
        }catch(error){
            toast.error("An error occurred while adding section");

        }finally{
            setIsSubmitting(false);
        }
    }


  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-yellow-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Page Header */}
          <div className="text-center mb-12">
           
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Add New Section
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create a new section to organize your course content and provide structure for your students' learning journey.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-stone-200 overflow-hidden">
            
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#7A7F3F]/15 via-[#7A7F3F]/10 to-[#7A7F3F]/5 px-8 py-6 border-b border-stone-200 relative overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7A7F3F]/10 to-transparent rounded-full -mt-16 -mr-16"></div>
              
              <div className="relative z-10 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/80 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Section Information</h2>
                  <p className="text-gray-600">Fill in the details for your new course section</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-8">
              
              {/* Section Title Field */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-1.414.586H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                  </svg>
                  Section Title
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="Enter a clear and descriptive section title"
                    className="w-full px-6 py-4 bg-gradient-to-r from-stone-50 to-amber-50/30 border-2 border-stone-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-[#7A7F3F] focus:ring-4 focus:ring-[#7A7F3F]/20 focus:bg-white transition-all duration-300 text-lg font-medium shadow-sm hover:shadow-md"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 ml-1">
                  Choose a title that clearly represents this section's content
                </p>
              </div>

              {/* Section Description Field */}
              <div className="space-y-3">
                <label className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                  <svg className="w-5 h-5 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Section Description
                  <span className="text-gray-400 text-sm font-normal ml-2">(Optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    value={sectionDescription}
                    onChange={(e) => setSectionDescription(e.target.value)}
                    placeholder="Provide a detailed description of what students will learn in this section..."
                    rows={5}
                    className="w-full px-6 py-4 bg-gradient-to-r from-stone-50 to-amber-50/30 border-2 border-stone-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:border-[#7A7F3F] focus:ring-4 focus:ring-[#7A7F3F]/20 focus:bg-white transition-all duration-300 text-lg resize-none shadow-sm hover:shadow-md"
                  />
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-500 ml-1">
                  Help students understand what they'll gain from this section
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleAddSection}
                  disabled={isSubmitting || !sectionTitle.trim()}
                  className={`flex-1 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center ${
                    isSubmitting || !sectionTitle.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Section...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Section
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Section Tips</h3>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• Use clear, descriptive titles that indicate the learning outcome</li>
                  <li>• Group related chapters together in logical sections</li>
                  <li>• Consider the learning progression from basic to advanced concepts</li>
                  <li>• Keep section descriptions concise but informative</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddSection