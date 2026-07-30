import React, { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import Header from "../components/Header";
import AuthEditorialPanel from "../components/AuthEditorialPanel";
import { UserContextData } from "../context/UserContextData";
import registerEditorial from "../assets/edvance-register-editorial.webp";

const navTopics = [
  { name: "Home", path: "home" },
  { name: "Courses", path: "courses" },
  { name: "About", path: "about" },
];

const Register = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [OTP, setOTP] = React.useState("");
  const [otpSent, setOtpSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { setLoggedIn } = useContext(UserContextData);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  async function sendOTP(event) {
    event?.preventDefault();
    if (!name || !email || !password) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/sendOtp`,
        { email }
      );
      if (response.data.success) {
        toast.success(`Verification code sent to ${email}`);
        setOtpSent(true);
      } else {
        toast.error(response.data.msg || "Could not send the code");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not send the code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTPandRegister(event) {
    event?.preventDefault();
    if (OTP.length !== 6) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/verifyOTPandRegister`,
        { name, email, password, OTP }
      );
      if (response.data.success) {
        localStorage.setItem("edvance_token", response.data.token);
        setLoggedIn(true);
        toast.success("Your Edvance account is ready");
        navigate("/");
      } else {
        toast.error(response.data.msg || "The code could not be verified");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not create your account");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-border bg-bg/55 px-4 py-3.5 text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10";

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
            eyebrow="Begin with curiosity"
            title="Make space for what you want to learn next."
            description="Discover thoughtful courses, learn at your pace, and keep every milestone in one place."
            imageSrc={registerEditorial}
            imageAlt="A learner beginning a fresh notebook in a sunlit studio"
          />

          <div className="flex items-center px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="relative mb-8 h-40 overflow-hidden rounded-2xl lg:hidden">
                <img
                  src={registerEditorial}
                  alt="A learner beginning a fresh notebook in a sunlit studio"
                  className="h-full w-full object-cover object-[50%_45%]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent" />
                <p className="absolute bottom-5 left-5 max-w-[14rem] font-serif text-xl font-bold text-white">
                  Begin with one good question.
                </p>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  {otpSent ? "One final step" : "Join Edvance"}
                </p>
                <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-ink">
                  {otpSent ? "Check your inbox" : "Create your account"}
                </h1>
                <p className="mt-3 leading-7 text-ink-muted">
                  {otpSent
                    ? `Enter the six-digit code sent to ${email}.`
                    : "Set up your learning space in less than a minute."}
                </p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {!otpSent ? (
                  <Motion.form
                    key="details"
                    onSubmit={sendOTP}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-semibold text-ink"
                      >
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-semibold text-ink"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-semibold text-ink"
                      >
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className={inputClass}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        required
                      />
                    </div>

                    <Motion.button
                      type="submit"
                      whileTap={
                        prefersReducedMotion ? undefined : { scale: 0.98 }
                      }
                      disabled={loading || !name || !email || !password}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? "Sending code…" : "Continue with email"}
                      {!loading && (
                        <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6l6 6-6 6" />
                        </svg>
                      )}
                    </Motion.button>
                  </Motion.form>
                ) : (
                  <Motion.form
                    key="verification"
                    onSubmit={verifyOTPandRegister}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm leading-6 text-ink-muted">
                      The code expires shortly. Keep this page open while you
                      check your email.
                    </div>

                    <div>
                      <label
                        htmlFor="otp"
                        className="mb-2 block text-sm font-semibold text-ink"
                      >
                        Verification code
                      </label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={OTP}
                        onChange={(event) =>
                          setOTP(event.target.value.replace(/\D/g, ""))
                        }
                        className={`${inputClass} text-center font-mono text-2xl font-bold tracking-[0.45em]`}
                        placeholder="000000"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOTP("");
                        }}
                        className="flex-1 rounded-full border border-border bg-white px-5 py-3 font-semibold text-ink transition hover:bg-bg"
                      >
                        Back
                      </button>
                      <Motion.button
                        type="submit"
                        whileTap={
                          prefersReducedMotion ? undefined : { scale: 0.98 }
                        }
                        disabled={loading || OTP.length !== 6}
                        className="flex-1 rounded-full bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? "Verifying…" : "Create account"}
                      </Motion.button>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendOTP()}
                      disabled={loading}
                      className="w-full text-center text-sm font-semibold text-primary transition hover:text-primary-hover disabled:opacity-50"
                    >
                      Send another code
                    </button>
                  </Motion.form>
                )}
              </AnimatePresence>

              <p className="mt-8 text-center text-sm text-ink-muted">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-primary transition hover:text-primary-hover"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </Motion.section>
      </main>
    </>
  );
};

export default Register;
