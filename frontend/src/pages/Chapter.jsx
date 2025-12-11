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
      className={`bg-white rounded-lg border border-gray-200 select-none transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-4 bg-gray-900' : 'p-6'
      }`}
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none', pointerEvents: 'auto' }}
    >
      {title && !isFullscreen && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {title}
          </h3>
        </div>
      )}

      {/* Top Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${
        isFullscreen ? 'bg-gray-800 rounded-md px-4 py-3' : 'bg-gray-50 rounded-md px-4 py-3 border border-gray-200'
      }`}>
        
        {/* Left Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Mode Toggle */}
          <button
            onClick={toggleScrollMode}
            className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 text-xs sm:text-sm ${
              isScrollMode 
                ? 'bg-[#7A7F3F] text-white' 
                : isFullscreen 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isScrollMode ? (
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 712-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            <span className="hidden sm:inline">{isScrollMode ? 'Scroll Mode' : 'Switch to Scroll Mode'}</span>
            <span className="sm:hidden">{isScrollMode ? 'Scroll' : 'Page'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center justify-center px-3 py-2 rounded-md transition-all duration-200 text-xs sm:text-sm ${
              isFullscreen 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            <span className="sm:hidden">{isFullscreen ? 'Exit' : 'Full'}</span>
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
            className={`p-2 rounded-md transition-all duration-200 ${
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
            className={`p-2 rounded-md transition-all duration-200 ${
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
                    className="shadow-sm rounded-md overflow-hidden"
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
                className="shadow-sm rounded-md overflow-hidden"
                width={Math.min(800 * scale, (isFullscreen ? window.innerWidth - 100 : 800))}
              />
            </div>
          )}
        </Document>

        {/* Navigation Controls */}
        {numPages && !isScrollMode && (
          <div className={`flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mt-6 ${
            isFullscreen ? 'bg-gray-800 rounded-md px-4 py-3' : ''
          }`}>
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex items-center justify-center px-4 py-2 bg-[#7A7F3F] text-white rounded-md hover:bg-[#6B7035] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center justify-center px-4 py-2 bg-[#7A7F3F] text-white rounded-md hover:bg-[#6B7035] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
            >
              Next
              <svg className="w-4 h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const currentVideo = videoDetails[currentVideoIndex];
  const speeds = [0.5, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handlePlayVideo = () => {
    setShowThumbnail(false);
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const nextVideo = () => {
    if (currentVideoIndex < videoDetails.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      setShowThumbnail(true);
      setIsPlaying(false);
    }
  };

  const prevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
      setShowThumbnail(true);
      setIsPlaying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
        <svg className="w-5 h-5 text-red-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Chapter Videos
      </h3>

      {currentVideo && (
        <div className="space-y-6">
          {/* Video Player with Thumbnail Overlay */}
          <div 
            className="relative rounded-lg overflow-hidden shadow-sm group cursor-pointer bg-black border border-gray-200"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Video Element (hidden when thumbnail is shown) */}
            <video
              ref={videoRef}
              src={currentVideo.video}
              controls={!showThumbnail}
              controlsList="nodownload noremoteplaybook"
              className={`w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] transition-opacity duration-300 ${showThumbnail ? 'opacity-0 absolute inset-0' : 'opacity-100'}`}
              style={{ pointerEvents: showThumbnail ? 'none' : 'auto' }}
              onContextMenu={(e) => e.preventDefault()}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  videoRef.current.playbackRate = playbackSpeed;
                }
              }}
            >
              Your browser does not support the video tag.
            </video>

            {/* Thumbnail Overlay */}
            {showThumbnail && currentVideo.videoThumbnail && (
              <div 
                className="relative w-full h-64 md:h-80 lg:h-96 cursor-pointer"
                onClick={handlePlayVideo}
              >
                <img
                  src={currentVideo.videoThumbnail}
                  alt={currentVideo.title || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
                
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/95 hover:bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-200">
                    <svg className="w-6 h-6 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>

                {/* Video Duration Badge (optional) */}
                <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
                  Click to Play
                </div>
              </div>
            )}

            {/* Video Loading State */}
            {!showThumbnail && !currentVideo.videoThumbnail && (
              <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-900 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p>Loading video...</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Title */}
          {currentVideo.title && (
            <div className="flex items-center justify-between mt-4">
              <h4 className="text-lg font-medium text-gray-900">{currentVideo.title}</h4>
              {isPlaying && (
                <div className="flex items-center space-x-2 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Playing</span>
                </div>
              )}
            </div>
          )}

          {/* Video Controls */}
          <div className="bg-gray-50 rounded-md p-4 border border-gray-200 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Speed Control */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm text-gray-700">Speed:</span>
                </div>
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-400 transition-colors duration-200"
                >
                  {speeds.map(speed => (
                    <option key={speed} value={speed}>{speed}x</option>
                  ))}
                </select>
              </div>

              {/* Video Navigation */}
              {videoDetails.length > 1 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={prevVideo}
                    disabled={currentVideoIndex === 0}
                    className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm"
                  >
                    <svg className="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <div className="flex items-center justify-center space-x-2 px-3 py-2 bg-white rounded-md border border-gray-300">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-gray-700">
                      {currentVideoIndex + 1} of {videoDetails.length}
                    </span>
                  </div>
                  
                  <button
                    onClick={nextVideo}
                    disabled={currentVideoIndex === videoDetails.length - 1}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-xs sm:text-sm"
                  >
                    Next
                    <svg className="w-4 h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
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
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A7F3F]"></div>
              <span className="ml-3 text-gray-600">Loading chapter...</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if(!profile.coursePurchased.includes(courseId) && !profile.isAdmin){
    toast.info("You do not have access to this chapter. Please enroll the course to access all chapters.");
    setTimeout(() => {
      navigate(`/course/${courseId}`);
    }, 3000);
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 4h.01M12 7a4 4 0 110 8 4 4 0 010-8z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You do not have access to this chapter.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!chapter) {
    return (
      <>
        <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Chapter not found</h2>
              <p className="text-gray-600">The requested chapter could not be loaded.</p>
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
   <Header topics={[{ name: 'Home', path: 'home' }, { name: 'Courses', path: 'courses' }, { name: 'About', path: 'about' }]} />
   <div className="min-h-screen bg-gray-50 pt-20">
     <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
       
       {/* Chapter Header */}
       <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
         <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
           {chapter.chapterThumbnailImage && (
             <div className="flex-shrink-0 w-full sm:w-auto">
               <img
                 src={chapter.chapterThumbnailImage}
                 alt={chapter.chapterName}
                 className="w-full sm:w-48 h-48 sm:h-32 rounded-md object-cover shadow-sm"
               />
             </div>
           )}
           <div className="flex-1 min-w-0">
             <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 leading-tight">
               {chapter.chapterName}
             </h1>
             {chapter.shortDescription && (
               <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                 {chapter.shortDescription}
               </p>
             )}
           </div>
         </div>
       </div>

       {/* PDF Files Section */}
       {chapter.chapterFile && chapter.chapterFile.length > 0 && (
         <div className="space-y-6">
           <div className="border-t border-gray-200 pt-8">
             <h2 className="text-xl font-medium text-gray-900 flex items-center mb-6">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               Chapter Materials
             </h2>
           </div>

           {chapter.chapterFile.length > 1 && (
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-50 rounded-md p-4 border border-gray-200 mb-6 space-y-3 sm:space-y-0">
               <div className="flex items-center justify-center sm:justify-start space-x-3">
                 <div className="w-2 h-2 bg-[#7A7F3F] rounded-full"></div>
                 <span className="text-gray-900 font-medium text-sm sm:text-base">
                   File {currentFileIndex + 1} of {chapter.chapterFile.length}
                 </span>
               </div>
               <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                 <button
                   onClick={prevFile}
                   disabled={currentFileIndex === 0}
                   className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                 >
                   Previous File
                 </button>
                 <button
                   onClick={nextFile}
                   disabled={currentFileIndex === chapter.chapterFile.length - 1}
                   className="w-full sm:w-auto px-4 py-2 bg-[#7A7F3F] text-white rounded-md hover:bg-[#6B7035] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
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
         <div className="border-t border-gray-200 pt-8">
           <VideoPlayer videoDetails={chapter.chapterVideoDetails} />
         </div>
       )}

       {/* Chapter Summary Section */}
       {chapter.chapterSummary && (
         <div className="border-t border-gray-200 pt-8">
           <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
             <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
               <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
               </svg>
               Chapter Summary
             </h3>
             <div className="max-w-3xl">
               <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                 {chapter.chapterSummary}
               </p>
             </div>
           </div>
         </div>
       )}

     </div>
   </div>
   </>
  )
}

export default Chapter