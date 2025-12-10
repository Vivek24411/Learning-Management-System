import axios from 'axios';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import Header from '../components/Header';
import { Document, Page, pdfjs } from 'react-pdf';
import { useContext } from 'react';
import { UserContextData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// Configure PDF.js worker to use local file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.js';

// PDF Viewer Component
const PDFViewer = ({ pdfUrl, title }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isScrollMode, setIsScrollMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Memoize options to prevent unnecessary reloads
  const options = useMemo(() => ({
    cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/standard_fonts/`,
  }), []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setLoading(false);
    toast.error('Failed to load PDF');
  }

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      
      // Smooth scroll in scroll mode
      if (isScrollMode && scrollContainerRef.current) {
        const pageElement = scrollContainerRef.current.querySelector(`[data-page-number="${newPage}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      
      // Smooth scroll in scroll mode
      if (isScrollMode && scrollContainerRef.current) {
        const pageElement = scrollContainerRef.current.querySelector(`[data-page-number="${newPage}"]`);
        if (pageElement) {
          pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  const toggleScrollMode = () => {
    setIsScrollMode(!isScrollMode);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            goToPrevPage();
            break;
          case 'ArrowRight':
          case 'ArrowDown':
          case ' ':
            e.preventDefault();
            goToNextPage();
            break;
          case 'Escape':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen, pageNumber, numPages]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`bg-white rounded-xl shadow-lg select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-4 bg-gray-900' : 'p-6'
      }`}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', pointerEvents: 'auto' }}
    >
      {title && !isFullscreen && (
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {title}
        </h3>
      )}

      {/* Top Controls */}
      <div className={`flex flex-wrap items-center justify-between gap-4 mb-4 ${
        isFullscreen ? 'bg-gray-800 rounded-lg px-6 py-3' : 'bg-gradient-to-r from-stone-50 to-amber-50/30 rounded-lg px-6 py-3'
      }`}>
        
        {/* Left Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode Toggle */}
          <button
            onClick={toggleScrollMode}
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isScrollMode 
                ? 'bg-[#7A7F3F] text-white' 
                : isFullscreen 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white border border-[#7A7F3F] text-[#7A7F3F] hover:bg-[#7A7F3F] hover:text-white'
            }`}
          >
            {isScrollMode ? (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {isScrollMode ? 'Scroll Mode' : 'Switch to Scroll Mode'}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isFullscreen 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>

        {/* Center - Page Info */}
        {numPages && (
          <div className={`text-center ${isFullscreen ? 'text-white' : 'text-gray-700'}`}>
            <span className="font-medium px-4 py-2">
              Page {pageNumber} of {numPages}
            </span>
          </div>
        )}

        {/* Right Controls - Zoom */}
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isFullscreen 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <span className={`text-sm font-medium px-2 ${isFullscreen ? 'text-white' : 'text-gray-700'}`}>
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={resetZoom}
            className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
              isFullscreen 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Reset
          </button>
          
          <button
            onClick={zoomIn}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isFullscreen 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className={`flex flex-col items-center ${isFullscreen ? 'h-5/6 overflow-hidden' : ''}`}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A7F3F]"></div>
            <span className={`ml-2 ${isFullscreen ? 'text-white' : 'text-gray-600'}`}>Loading PDF...</span>
          </div>
        )}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
          className="max-w-full"
          options={options}
        >
          {isScrollMode ? (
            // Scroll Mode - Show all pages
            <div 
              ref={scrollContainerRef}
              className={`space-y-4 ${isFullscreen ? 'h-full overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}
              style={{ scrollBehavior: 'smooth' }}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} data-page-number={index + 1} className="flex justify-center">
                  <Page
                    pageNumber={index + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                    className="shadow-md rounded-lg overflow-hidden"
                    width={Math.min(800 * scale, (isFullscreen ? window.innerWidth - 100 : 800))}
                  />
                </div>
              ))}
            </div>
          ) : (
            // Page Mode - Show single page
            <div className="flex justify-center">
              <Page
                pageNumber={pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="shadow-md rounded-lg overflow-hidden"
                width={Math.min(800 * scale, (isFullscreen ? window.innerWidth - 100 : 800))}
              />
            </div>
          )}
        </Document>

        {/* Navigation Controls */}
        {numPages && !isScrollMode && (
          <div className={`flex items-center space-x-4 mt-4 rounded-lg px-6 py-3 ${
            isFullscreen ? 'bg-gray-800' : 'bg-gradient-to-r from-stone-50 to-amber-50/30'
          }`}>
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex items-center px-4 py-2 bg-[#7A7F3F] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center px-4 py-2 bg-[#7A7F3F] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Fullscreen Instructions */}
        {isFullscreen && (
          <div className="text-center text-gray-400 text-sm mt-4">
            <p>Use arrow keys or spacebar to navigate • Press ESC to exit fullscreen</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Video Player Component
const VideoPlayer = ({ videoDetails }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);

  const currentVideo = videoDetails[currentVideoIndex];
  const speeds = [0.5, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const nextVideo = () => {
    if (currentVideoIndex < videoDetails.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg className="w-6 h-6 mr-2 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Chapter Videos
      </h3>

      {currentVideo && (
        <div className="space-y-4">
          {/* Video Thumbnail (shown before play) */}
          {currentVideo.videoThumbnail && (
            <div className="relative">
              <img
                src={currentVideo.videoThumbnail}
                alt={currentVideo.title || 'Video thumbnail'}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Video Player */}
          <div 
            className="relative rounded-lg overflow-hidden shadow-md"
            onContextMenu={(e) => e.preventDefault()}
          >
            <video
              ref={videoRef}
              src={currentVideo.video}
              controls
              controlsList="nodownload noremoteplaybook"
              className="w-full h-auto max-h-96"
              style={{ pointerEvents: 'auto' }}
              onContextMenu={(e) => e.preventDefault()}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.playbackRate = playbackSpeed;
                }
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Video Title */}
          {currentVideo.title && (
            <h4 className="text-lg font-medium text-gray-800">{currentVideo.title}</h4>
          )}

          {/* Video Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-stone-50 to-amber-50/30 rounded-lg p-4">
            {/* Speed Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Speed:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="px-3 py-1 border border-[#7A7F3F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7A7F3F]/20"
              >
                {speeds.map(speed => (
                  <option key={speed} value={speed}>{speed}x</option>
                ))}
              </select>
            </div>

            {/* Video Navigation */}
            {videoDetails.length > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevVideo}
                  disabled={currentVideoIndex === 0}
                  className="flex items-center px-3 py-1 border border-[#7A7F3F] text-[#7A7F3F] rounded-lg hover:bg-[#7A7F3F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                
                <span className="text-sm text-gray-600 px-2">
                  {currentVideoIndex + 1} of {videoDetails.length}
                </span>
                
                <button
                  onClick={nextVideo}
                  disabled={currentVideoIndex === videoDetails.length - 1}
                  className="flex items-center px-3 py-1 border border-[#7A7F3F] text-[#7A7F3F] rounded-lg hover:bg-[#7A7F3F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Chapter = () => {
   const [chapter, setChapter] = useState(null);
   const [loading, setLoading] = useState(true);
   const [currentFileIndex, setCurrentFileIndex] = useState(0);
   const {chapterId} = useParams();
   const [courseId, setCourseId] = useState(null);
   const {profile} = useContext(UserContextData)
   const navigate = useNavigate();

   async function getChapter(){
    try{
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/user/getChapter`,{
        params: {
          chapterId
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`
        }
      });
      if(response.data.success){
        setChapter(response.data.chapter);
        setCourseId(response.data.courseId);
      }else{
        toast.error("Failed to fetch chapter");
        console.log("Failed to fetch chapter");
      }
    }catch(error){
      toast.error("An error occurred while fetching chapter");
      console.log("Error fetching chapter:", error);
    }finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    getChapter();
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapterId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7A7F3F]"></div>
              <span className="ml-3 text-xl text-gray-600">Loading chapter...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if(!profile.coursePurchased.includes(courseId)){
    toast.info("You do not have access to this chapter. Please enroll the course to access all chapters.");
    setTimeout(() => {
      navigate(`/course/${courseId}`);
    }, 3000);
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M12 7a4 4 0 110 8 4 4 0 010-8z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Access Denied</h2>
              <p className="text-gray-500">You do not have access to this chapter.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center py-20">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Chapter not found</h2>
              <p className="text-gray-500">The requested chapter could not be loaded.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const nextFile = () => {
    if (currentFileIndex < chapter.chapterFile.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const prevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  return (
   <>
   <Header />
   <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100">
     <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
       
       {/* Chapter Header */}
       <div className="bg-white rounded-xl shadow-lg p-8">
         <div className="flex items-center space-x-4 mb-6">
           {chapter.chapterThumbnailImage && (
             <img
               src={chapter.chapterThumbnailImage}
               alt={chapter.chapterName}
               className="w-20 h-20 rounded-xl object-cover shadow-md"
             />
           )}
           <div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">
               {chapter.chapterName}
             </h1>
             {chapter.shortDescription && (
               <p className="text-lg text-gray-600 leading-relaxed">
                 {chapter.shortDescription}
               </p>
             )}
           </div>
         </div>
       </div>

       {/* PDF Files Section */}
       {chapter.chapterFile && chapter.chapterFile.length > 0 && (
         <div className="space-y-4">
           <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
             <svg className="w-7 h-7 mr-3 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
             </svg>
             Chapter Materials
           </h2>

           {chapter.chapterFile.length > 1 && (
             <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-md">
               <span className="text-gray-700 font-medium">
                 File {currentFileIndex + 1} of {chapter.chapterFile.length}
               </span>
               <div className="flex space-x-2">
                 <button
                   onClick={prevFile}
                   disabled={currentFileIndex === 0}
                   className="px-4 py-2 border border-[#7A7F3F] text-[#7A7F3F] rounded-lg hover:bg-[#7A7F3F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                 >
                   Previous File
                 </button>
                 <button
                   onClick={nextFile}
                   disabled={currentFileIndex === chapter.chapterFile.length - 1}
                   className="px-4 py-2 bg-[#7A7F3F] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                 >
                   Next File
                 </button>
               </div>
             </div>
           )}

           <PDFViewer 
             pdfUrl={chapter.chapterFile[currentFileIndex]}
             title={`Chapter Material ${currentFileIndex + 1}`}
           />
         </div>
       )}

       {/* Videos Section */}
       {chapter.chapterVideoDetails && chapter.chapterVideoDetails.length > 0 && (
         <VideoPlayer videoDetails={chapter.chapterVideoDetails} />
       )}

       {/* Chapter Summary Section */}
       {chapter.chapterSummary && (
         <div className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-xl shadow-lg p-8">
           <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
             <svg className="w-7 h-7 mr-3 text-[#7A7F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
             </svg>
             Chapter Summary
           </h3>
           <div className="prose prose-lg max-w-none">
             <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
               {chapter.chapterSummary}
             </p>
           </div>
         </div>
       )}

     </div>
   </div>
   </>
  )
}

export default Chapter