import axios from 'axios';
import React from 'react'
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { UserContextData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Register = () => {

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [OTP, setOTP] = React.useState('');
    const [otpSent, setOtpSent] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const {setLoggedIn} = useContext(UserContextData);
    const navigate = useNavigate();

    const sendOTP = async()=>{
        try{
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/sendOtp`,{email});
           console.log(response);
            if(response.data.success){
                toast.success("OTP Sent to your email: " + email);
                setOtpSent(true);
                setLoggedIn(true);
            }
        }catch(error){
            console.log(error);
            toast.error("Error in sending OTP: " + error.message);
        }finally{
            setLoading(false);
        }
    }

    const verifyOTPandRegister = async()=>{
        try{
            setLoading(true);
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/verifyOTPandRegister`,{
                name,
                email,
                password,
                OTP
            });
            console.log(response);
            if(response.data.success){
              localStorage.setItem("edvance_token", response.data.token);
                setLoggedIn(true);
                toast.success("Registration Successful");
                navigate("/")
            }
        }catch(error){
            console.log(error);
            toast.error("Error in Registration: " + error.message);
        }finally{
            setLoading(false);
        }
    }




  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
      
      <div className="min-h-80 mt-18 bg-gradient-to-br from-stone-200 via-amber-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="lg:flex">
              
              {/* Left Side - Yoga Hero Image (Hidden on mobile) */}
              <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7A7F3F]-400/20 to-[#7A7F3F]-600/30"></div>
                <img
                  src="/src/assets/edvanceRegister.png"
                  alt="Yoga Meditation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">Find Your Inner Peace</h2>
                  <p className="text-lg opacity-90">Join our yoga community and transform your life</p>
                </div>
              </div>

              {/* Right Side - Registration Form */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                   
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {otpSent ? 'Verify Your Email' : 'Join Edvance'}
                    </h1>
                    <p className="text-gray-600">
                      {otpSent ? 'We sent a 6-digit code to your email' : 'Create your account to start your yoga journey'}
                    </p>
                  </div>

                  {/* Registration Form */}
                  {!otpSent ? (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm outline-none "
                            placeholder="Enter your full name"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm outline-none "
                            placeholder="Enter your email"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm outline-none"
                            placeholder="Create a strong password"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={sendOTP}
                        disabled={loading || !name || !email || !password}
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-90 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>Send OTP</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    /* OTP Verification Form */
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mb-4">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-600">
                          Enter the 6-digit verification code sent to
                          <br />
                          <strong className="text-green-600">{email}</strong>
                        </p>
                      </div>

                      <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                          Verification Code
                        </label>
                        <input
                          id="otp"
                          type="text"
                          maxLength={6}
                          value={OTP}
                          onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm text-center text-2xl tracking-widest font-mono"
                          placeholder="000000"
                          required
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setOtpSent(false)}
                          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          <span>Back</span>
                        </button>
                        
                        <button
                          onClick={verifyOTPandRegister}
                          disabled={loading || OTP.length !== 6}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Verify & Register</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => {
                            sendOTP();
                          }}
                          className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                        >
                          Didn't receive the code? Resend OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-8 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <a href="/login" className="text-yellow-800 hover:text-yellow-700 font-medium transition-colors duration-200">
                      Sign in here
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register