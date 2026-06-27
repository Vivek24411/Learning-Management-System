import axios from 'axios';
import React from 'react'
import { useContext } from 'react';
import { toast } from 'react-toastify';
import { UserContextData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'framer-motion';

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
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 pt-24"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-2xl overflow-hidden border border-border">
            <div className="lg:flex">
              
              {/* Left Side — Dark illustration panel */}
              <div className="hidden lg:flex lg:w-1/2 relative bg-bg items-center justify-center p-12"
                style={{
                  backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
              >
                {/* TODO: optionally add illustration */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                  </div>
                  <h2 className="brand text-3xl font-bold text-ink mb-3">Join Edvance</h2>
                  <p className="text-ink-muted text-base max-w-xs mx-auto">Start your learning journey today</p>
                </div>
              </div>

              {/* Right Side — Registration Form */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="brand text-3xl font-bold text-ink mb-2">
                      {otpSent ? 'Verify Your Email' : 'Create Account'}
                    </h1>
                    <p className="text-ink-muted">
                      {otpSent ? 'We sent a 6-digit code to your email' : 'Sign up to start learning'}
                    </p>
                  </div>

                  {/* Registration Form */}
                  {!otpSent ? (
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-ink-muted mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-ink placeholder-[#475569] focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none"
                            placeholder="Enter your full name"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-ink-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-ink-muted mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-ink placeholder-[#475569] focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none"
                            placeholder="Enter your email"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-ink-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-ink-muted mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-ink placeholder-[#475569] focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 outline-none"
                            placeholder="Create a strong password"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-ink-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={sendOTP}
                        disabled={loading || !name || !email || !password}
                        className="w-full bg-primary hover:bg-primary-hover text-surface py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-surface" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      </motion.button>
                    </div>
                  ) : (
                    /* OTP Verification Form */
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-ink-muted">
                          Enter the 6-digit verification code sent to
                          <br />
                          <strong className="text-primary">{email}</strong>
                        </p>
                      </div>

                      <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-ink-muted mb-2">
                          Verification Code
                        </label>
                        <input
                          id="otp"
                          type="text"
                          maxLength={6}
                          value={OTP}
                          onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-ink placeholder-[#475569] focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 text-center text-2xl tracking-widest font-mono outline-none"
                          placeholder="000000"
                          required
                        />
                      </div>

                      <div className="flex space-x-3">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setOtpSent(false)}
                          className="flex-1 bg-surface text-ink-muted py-3 px-6 rounded-lg font-semibold hover:bg-[#2A2A38] transition-all duration-200 flex items-center justify-center space-x-2 border border-border"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                          <span>Back</span>
                        </motion.button>
                        
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={verifyOTPandRegister}
                          disabled={loading || OTP.length !== 6}
                          className="flex-1 bg-primary hover:bg-primary-hover text-surface py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-surface" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                        </motion.button>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => {
                            sendOTP();
                          }}
                          className="text-primary hover:text-primary-hover font-medium transition-colors duration-200 text-sm"
                        >
                          Didn't receive the code? Resend OTP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-8 text-center text-sm text-ink-muted">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary hover:text-primary-hover font-medium transition-colors duration-200">
                      Sign in here
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Register