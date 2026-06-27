import React from 'react'
import axios from 'axios';
import Header from '../components/Header'
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { UserContextData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
           if(response.data.success){
               localStorage.setItem("edvance_token", response.data.token);
               setLoggedIn(true);
               toast.success("Login Successful");
               navigate("/");
           }else{
            toast.error("Login Failed: " + response.data.msg);  
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                    </svg>
                  </div>
                  <h2 className="brand text-3xl font-bold text-ink mb-3">Welcome Back</h2>
                  <p className="text-ink-muted text-base max-w-xs mx-auto">Continue learning where you left off</p>
                </div>
              </div>

              {/* Right Side — Login Form */}
              <div className="w-full lg:w-1/2 p-8 lg:p-12">
                <div className="max-w-md mx-auto">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <h1 className="brand text-3xl font-bold text-ink mb-2">
                      Sign In to Edvance
                    </h1>
                    <p className="text-ink-muted">
                      Welcome back! Please sign in to your account
                    </p>
                  </div>

                  {/* Login Form */}
                  <div className="space-y-6">
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
                          placeholder="Enter your password"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <svg className="w-5 h-5 text-ink-muted/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex items-center justify-end">
                      <Link to={'/forgotPassword'} className="text-sm text-primary hover:text-primary-hover font-medium transition-colors duration-200">
                        Forgot your password?
                      </Link>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLogin}
                      disabled={loading || !email || !password}
                      className="w-full bg-primary hover:bg-primary-hover text-surface py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-surface" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                    </motion.button>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 text-center text-sm text-ink-muted">
                    Don't have an account?{' '}
                    <a href="/edvance/register" className="text-primary hover:text-primary-hover font-medium transition-colors duration-200">
                      Sign up here
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

export default Login