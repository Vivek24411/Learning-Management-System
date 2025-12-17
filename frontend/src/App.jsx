import React from "react";
import { Routes, Route } from "react-router-dom";

/* ---------- Pages ---------- */
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Course from "./pages/Course.jsx";
import Chapter from "./pages/Chapter.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import AddSection from "./pages/AddSection.jsx";
import AddChapter from "./pages/AddChapter.jsx";
import EditChapter from "./pages/EditChapter.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import Footer from "./pages/Footer.jsx";
import AddSectionVideo from "./pages/AddSectionVideo";
import SectionVideoPlayer from "./pages/SectionVideoPlayer";



/* ---------- Components ---------- */
import AdminQuizEditor from "./components/AdminQuizEditor.jsx";

/* ---------- Auth Wrapper ---------- */
import ProtectedWrapper from "./protectedWrapper/ProtectedWrapper.jsx";

/* ---------- Toast ---------- */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Routes>
        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />

        {/* ================= USER ================= */}
        <Route
          path="/profile"
          element={
            <ProtectedWrapper>
              <Profile />
            </ProtectedWrapper>
          }
        />
        <Route
  path="/section/video/:videoId"
  element={<SectionVideoPlayer />}
/>

        <Route
  path="/admin/section/:sectionId/video"
  element={<AddSectionVideo />}
/>

        <Route
          path="/course/:courseId"
          element={
            <ProtectedWrapper>
              <Course />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/chapter/:chapterId"
          element={
            <ProtectedWrapper>
              <Chapter />
            </ProtectedWrapper>
          }
        />

        {/* ================= QUIZ (USER) ================= */}
        {/* Chapter Quiz */}
        <Route
          path="/quiz/:chapterId"
          element={
            <ProtectedWrapper>
              <QuizPage />
            </ProtectedWrapper>
          }
        />

        {/* Section Quiz */}
        <Route
          path="/quiz/section/:sectionId"
          element={
            <ProtectedWrapper>
              <QuizPage />
            </ProtectedWrapper>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/addCourse"
          element={
            <ProtectedWrapper>
              <AddCourse />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/editCourse/:courseId"
          element={
            <ProtectedWrapper>
              <EditCourse />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/addSection/:courseId"
          element={
            <ProtectedWrapper>
              <AddSection />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/addChapter/:sectionId"
          element={
            <ProtectedWrapper>
              <AddChapter />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/editChapter/:chapterId"
          element={
            <ProtectedWrapper>
              <EditChapter />
            </ProtectedWrapper>
          }
        />

        {/* ================= ADMIN QUIZ EDITOR ================= */}
        <Route
          path="/admin/quiz/chapter/:chapterId"
          element={
            <ProtectedWrapper>
              <AdminQuizEditor mode="chapter" />
            </ProtectedWrapper>
          }
        />

        <Route
          path="/admin/quiz/section/:sectionId"
          element={
            <ProtectedWrapper>
              <AdminQuizEditor mode="section" />
            </ProtectedWrapper>
          }
        />
      </Routes>

      {/* Footer always visible */}
      <Footer />

      {/* Toast notifications */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
