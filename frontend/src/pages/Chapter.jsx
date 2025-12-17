import axios from "axios";
import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { Document, Page, pdfjs } from "react-pdf";
import { UserContextData } from "../context/UserContext";

// PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

/* ===================== PDF VIEWER ===================== */
const PDFViewer = ({ pdfUrl, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const options = useMemo(
    () => ({
      cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
    }),
    []
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}

      <Document
        file={pdfUrl}
        options={options}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {isScrollMode ? (
          [...Array(numPages)].map((_, i) => (
            <Page key={i} pageNumber={i + 1} scale={scale} />
          ))
        ) : (
          <Page pageNumber={pageNumber} scale={scale} />
        )}
      </Document>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
          disabled={pageNumber === 1}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>

        <button
          onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
          disabled={pageNumber === numPages}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/* ===================== VIDEO PLAYER ===================== */
const VideoPlayer = ({ videoDetails }) => {
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const video = videoDetails[index];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Chapter Videos</h3>

      <video
        ref={videoRef}
        src={video.video}
        controls
        className="w-full rounded"
      />

      <div className="flex justify-between mt-4">
        <button
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Prev
        </button>

        <button
          disabled={index === videoDetails.length - 1}
          onClick={() => setIndex(index + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/* ===================== CHAPTER PAGE ===================== */
const Chapter = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { profile } = useContext(UserContextData);

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState(null);
  const [fileIndex, setFileIndex] = useState(0);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/getChapter`,
          {
            params: { chapterId },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );

        if (res.data.success) {
          setChapter(res.data.chapter);
          setCourseId(res.data.courseId);
        } else {
          toast.error("Failed to load chapter");
        }
      } catch (err) {
        toast.error("Error loading chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return <div className="text-center mt-40">Loading...</div>;
  }

  if (!chapter) {
    return <div className="text-center mt-40">Chapter not found</div>;
  }

  if (!profile.isAdmin && !profile.coursePurchased.includes(courseId)) {
    toast.info("Enroll course to access this chapter");
    navigate(`/course/${courseId}`);
    return null;
  }

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 space-y-10">

          {/* HEADER */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h1 className="text-2xl font-bold">{chapter.chapterName}</h1>
            <p className="text-gray-600 mt-2">{chapter.shortDescription}</p>

            {profile.isAdmin && (
              <button
                onClick={() => navigate(`/admin/quiz/${chapterId}`)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
              >
                Add / Edit Quiz
              </button>
            )}
          </div>

          {/* FILES */}
          {chapter.chapterFile?.length > 0 && (
            <PDFViewer
              pdfUrl={chapter.chapterFile[fileIndex]}
              title={`Material ${fileIndex + 1}`}
            />
          )}

          {/* VIDEOS */}
          {chapter.chapterVideoDetails?.length > 0 && (
            <VideoPlayer videoDetails={chapter.chapterVideoDetails} />
          )}

          {/* SUMMARY */}
          {chapter.chapterSummary && (
            <div className="bg-white rounded-lg p-6 shadow">
              <h3 className="text-xl font-semibold mb-3">Summary</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {chapter.chapterSummary}
              </p>
            </div>
          )}

          {/* QUIZ SECTION */}
          {chapter.quiz?.questions?.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow text-center">
              <h3 className="text-xl font-bold mb-3">Chapter Quiz</h3>
              <p className="text-gray-600 mb-6">
                Test your understanding before moving ahead.
              </p>

              <button
                onClick={() => navigate(`/quiz/${chapterId}`)}
                className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
              >
                Start Quiz
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Chapter;
