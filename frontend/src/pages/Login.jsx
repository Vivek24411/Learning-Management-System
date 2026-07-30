import React, { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import AuthEditorialPanel from "../components/AuthEditorialPanel";
import { UserContextData } from "../context/UserContextData";
import loginEditorial from "../assets/edvance-login-editorial.webp";

const navTopics = [
  { name: "Home", path: "home" },
  { name: "Courses", path: "courses" },
  { name: "About", path: "about" },
];

const Login = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { setLoggedIn } = useContext(UserContextData);
  const prefersReducedMotion = useReducedMotion();

  async function handleLogin(event) {
    event?.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/login`,
        { email, password }
      );
      if (response.data.success) {
        localStorage.setItem("edvance_token", response.data.token);
        setLoggedIn(true);
        toast.success("Welcome back");
        navigate("/");
      } else {
        toast.error(response.data.msg || "Sign in failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header topics={navTopics} />
      <main className="min-h-screen bg-[radial-gradient(circle_at_15%_12%,rgba(183,136,49,0.13),transparent_30%),var(--color-bg)] px-4 pb-14 pt-24 sm:px-6 sm:pt-28">
        <Motion.section
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="premium-card mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-border/80 bg-surface lg:grid-cols-[0.96fr_1.04fr]"
        >
          <AuthEditorialPanel
            eyebrow="Return to your practice"
            title="Pick up exactly where you left off."
            description="Your courses, saved progress, and assessments are ready when you are."
            imageSrc={loginEditorial}
            imageAlt="A learner returning to study in a quiet library"
          />

          <div className="flex items-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="relative mb-8 h-40 overflow-hidden rounded-2xl lg:hidden">
                <img
                  src={loginEditorial}
                  alt="A learner returning to study in a quiet library"
                  className="h-full w-full object-cover object-[50%_45%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent" />
                <p className="absolute bottom-5 left-5 max-w-[14rem] font-serif text-xl font-bold text-white">
                  Learning that fits the life you lead.
                </p>
              </div>

              <div className="mb-9">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Welcome back
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink">
                  Sign in to Edvance
                </h1>
                <p className="mt-3 leading-7 text-ink-muted">
                  Continue your courses and keep your momentum moving.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-ink"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-bg/55 px-4 py-3.5 pr-11 text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                    <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7l8.1 5.4a1.6 1.6 0 001.8 0L21 7m-16 12h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-ink"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgotPassword"
                      className="text-xs font-semibold text-primary transition hover:text-primary-hover"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-2xl border border-border bg-bg/55 px-4 py-3.5 pr-11 text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                    <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 10V8a5 5 0 0110 0v2m-11 0h12a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2z" />
                    </svg>
                  </div>
                </div>

                <Motion.button
                  type="submit"
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  disabled={loading || !email || !password}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </Motion.button>
              </form>

              <p className="mt-8 text-center text-sm text-ink-muted">
                New to Edvance?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary transition hover:text-primary-hover"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </Motion.section>
      </main>
    </>
  );
};

export default Login;
