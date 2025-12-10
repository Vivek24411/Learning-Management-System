import React from 'react'
import axios from 'axios';
import Header from '../components/Header'
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { UserContextData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const {setLoggedIn} = useContext(UserContextData);

  async function handleLogin(){
       try{
           setLoading(true);
           const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/user/login`, {
               email,
               password
           });
           console.log(response);
           if(response.data.success){
               localStorage.setItem("edvance_token", response.data.token);
               setLoggedIn(true);
               toast.success("Login Successful");
               navigate("/");
           }
       }catch(error){
           console.log(error);
           toast.error("Error in Login: " + error.message);
       }finally{
           setLoading(false);
       }
  }

  return (
    <>
      <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />

      <div className="min-h-80 bg-gradient-to-br from-stone-200 via-amber-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="lg:flex">
              
              {/* Left Side - Yoga Hero Image (Hidden on mobile) */}
              <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7A7F3F]/20 to-[#7A7F3F]/30"></div>
                <img
                  src="/src/assets/edvanceRegister.png"
                  alt="Yoga Meditation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-lg opacity-90">Continue your yoga journey with us</p>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#7A7F3F] to-[#7A7F3F]/80 rounded-full mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Sign In to Edvance
                    </h1>
                    <p className="text-gray-600">
                      Welcome back! Please sign in to your account
                    </p>
                  </div>

                  {/* Login Form */}
                  <div className="space-y-6">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm outline-none"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7A7F3F] focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm outline-none"
                          placeholder="Enter your password"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                      <a href="#" className="text-sm text-[#7A7F3F] hover:text-[#7A7F3F]/80 font-medium transition-colors duration-200">
                        Forgot your password?
                      </a>
                    </div>

                    <button
                      onClick={handleLogin}
                      disabled={loading || !email || !password}
                      className="w-full bg-gradient-to-r from-[#7A7F3F] to-[#7A7F3F]/80 text-white py-3 px-6 rounded-xl font-semibold hover:from-[#7A7F3F]/90 hover:to-[#7A7F3F]/70 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign In</span>
                        </>
                      )}
                    </button>

                    {/* Or Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    {/* Social Login Buttons
                    <div className="grid grid-cols-2 gap-3">
                      <button className="inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 transition-colors duration-200">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="ml-2">Google</span>
                      </button>
                      
                      <button className="inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 transition-colors duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="ml-2">Facebook</span>
                      </button>
                    </div> */}
                  </div>

                  {/* Footer */}
                  <div className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/register" className="text-[#7A7F3F] hover:text-[#7A7F3F]/80 font-medium transition-colors duration-200">
                      Sign up here
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

export default Login