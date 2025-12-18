import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import Course from "./pages/Course.jsx";
import Chapter from "./pages/Chapter.jsx";
import AddCourse from "./pages/AddCourse.jsx";
import EditCourse from "./pages/EditCourse.jsx";
import Login from "./pages/Login.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddChapter from "./pages/AddChapter.jsx";
import EditChapter from "./pages/EditChapter.jsx";
import AddSection from "./pages/AddSection.jsx";
import ProtectedWrapper from "./protectedWrapper/ProtectedWrapper.jsx";
import Footer from "./pages/Footer.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import QuizSection from "./pages/QuizSection.jsx";
import TakeSectionQuiz from "./pages/TakeSectionQuiz.jsx";
import EditSection from "./pages/EditSection.jsx";


const App = () => {
  return (
    <>
      <Routes>
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
        <Route path="/quiz/:type/:id" element={<ProtectedWrapper><QuizSection /></ProtectedWrapper>} />
        <Route path="/takeQuiz/:type/:id" element={<ProtectedWrapper><TakeSectionQuiz /></ProtectedWrapper>} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/editSection/:sectionId" element={<ProtectedWrapper><EditSection /></ProtectedWrapper>} />

      </Routes>
      <Footer/>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
