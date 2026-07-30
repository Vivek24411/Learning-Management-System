import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Course from "./pages/Course.jsx";
import Chapter from "./pages/Chapter.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import Login from "./pages/Login.jsx";
import { Slide, ToastContainer } from "react-toastify";
import AddChapter from "./pages/AddChapter.jsx";
import EditChapter from "./pages/EditChapter.jsx";
import AddSection from "./pages/AddSection.jsx";
import ProtectedWrapper from "./protectedWrapper/ProtectedWrapper.jsx";
import Footer from "./pages/Footer.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import QuizSection from "./pages/QuizSection.jsx";
import TakeSectionQuiz from "./pages/TakeSectionQuiz.jsx";
import EditSection from "./pages/EditSection.jsx";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import ScrollToTop from "./components/ScrollToTop.jsx";


const App = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Motion.div
          key={location.pathname}
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedWrapper><Profile /></ProtectedWrapper>} />
          <Route path="/course/:courseId" element={<ProtectedWrapper><Course /></ProtectedWrapper>} />
          <Route path="/chapter/:chapterId" element={<ProtectedWrapper><Chapter /></ProtectedWrapper>} />
          <Route path="/addCourse" element={<ProtectedWrapper><AddCourse /></ProtectedWrapper>} />
          <Route path="/editCourse/:courseId" element={<ProtectedWrapper><EditCourse /></ProtectedWrapper>} />
          <Route path="/login" element={<Login />} />
          <Route path="/addChapter/:sectionId" element={<ProtectedWrapper><AddChapter /></ProtectedWrapper>} />
          <Route path="/editChapter/:chapterId" element={<ProtectedWrapper><EditChapter /></ProtectedWrapper>} />
          <Route path="/addSection/:courseId" element={<ProtectedWrapper><AddSection /></ProtectedWrapper>} />
          <Route path="/quiz/:type/:id/:quizId" element={<ProtectedWrapper><QuizSection /></ProtectedWrapper>} />
          <Route path="/quiz/:type/:id" element={<ProtectedWrapper><QuizSection /></ProtectedWrapper>} />
          <Route path="/takeQuiz/:type/:id/:quizId" element={<ProtectedWrapper><TakeSectionQuiz /></ProtectedWrapper>} />
          <Route path="/takeQuiz/:type/:id" element={<ProtectedWrapper><TakeSectionQuiz /></ProtectedWrapper>} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/editSection/:sectionId" element={<ProtectedWrapper><EditSection /></ProtectedWrapper>} />
        </Routes>
        </Motion.div>
      </AnimatePresence>
      <Footer/>

      <ToastContainer
        position="top-right"
        autoClose={3600}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
        transition={Slide}
        theme="light"
        toastClassName="edvance-toast"
        bodyClassName="edvance-toast__body"
        progressClassName="edvance-toast__progress"
      />
    </>
  );
};

export default App;
