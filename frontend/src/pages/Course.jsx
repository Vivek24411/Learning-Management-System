import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContextData } from "../context/UserContextData";
import Header from "../components/Header";
import QuizReview from "../components/QuizReview";
import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";

// Themed placeholder shown on videos that have no creator-supplied thumbnail.
const DEFAULT_VIDEO_POSTER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='360'>
      <rect width='640' height='360' fill='#F2ECDD'/>
      <circle cx='320' cy='168' r='46' fill='#7A1F2B'/>
      <path d='M305 145 l42 23 l-42 23 z' fill='#FFFFFF'/>
      <text x='320' y='255' font-family='Georgia, serif' font-size='24' fill='#6B5F52' text-anchor='middle'>Lesson Video</text>
    </svg>`
  );

const Reveal = ({ children, className = "" }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Motion.div>
  );
};

const EditableCourseContent = ({
  title,
  value,
  emptyText,
  canManage,
  isEditing,
  draft,
  onDraftChange,
  onEdit,
  onSave,
  onCancel,
  saving,
  rows = 5,
}) => (
  <div>
    <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      {canManage && !isEditing && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      )}
    </div>

    <AnimatePresence mode="wait" initial={false}>
      {isEditing ? (
        <Motion.div
          key="editor"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <textarea
            rows={rows}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            maxLength={5000}
            autoFocus
            className="w-full resize-y rounded-2xl border border-border bg-bg/60 px-5 py-4 leading-relaxed text-ink outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
            placeholder={emptyText}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-ink-muted">{draft.length}/5000 characters</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink-muted transition hover:bg-bg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </Motion.div>
      ) : (
        <Motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="whitespace-pre-line text-base leading-8 text-ink-muted"
        >
          {value || (
            <span className="italic text-ink-muted/70">
              {canManage ? `${emptyText} Select Edit to add it.` : "More details coming soon."}
            </span>
          )}
        </Motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SectionVideoCard = ({
  videoUrl,
  videoTitle,
  index,
  canManage,
  onRemove,
  onTitleSave,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(videoTitle || "");
  const [savingTitle, setSavingTitle] = useState(false);

  const startVideo = async () => {
    setIsPlaying(true);
    window.setTimeout(() => videoRef.current?.play().catch(() => {}), 0);
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    const request =
      video.requestFullscreen ||
      video.webkitRequestFullscreen ||
      video.msRequestFullscreen;
    const result = request?.call(video);
    result?.catch?.(() => {});
  };

  const saveTitle = async () => {
    setSavingTitle(true);
    const saved = await onTitleSave(index, titleDraft.trim());
    setSavingTitle(false);
    if (saved) setEditingTitle(false);
  };

  return (
    <Motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_18px_50px_-35px_rgba(34,28,22,0.55)]"
    >
      <div
        className="relative aspect-video overflow-hidden bg-ink"
        onDoubleClick={enterFullscreen}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          controls={isPlaying}
          preload="metadata"
          poster={DEFAULT_VIDEO_POSTER}
          className="protected h-full w-full object-cover"
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onEnded={() => setIsPlaying(false)}
          onContextMenu={(event) => event.preventDefault()}
          onSelectStart={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        />

        {!isPlaying && (
          <button
            type="button"
            onClick={startVideo}
            className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(0deg,rgba(34,28,22,0.72),rgba(34,28,22,0.08)_70%)]"
            aria-label={`Play section video ${index + 1}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/90 text-primary shadow-2xl backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
              <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}

        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-ink/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
          Lesson {String(index + 1).padStart(2, "0")}
        </span>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/15 bg-ink/65 px-3 py-1.5 text-[10px] font-medium text-white/90 backdrop-blur">
          Double tap for fullscreen
        </span>

        {canManage && (
          <button
            type="button"
            onClick={() => onRemove(videoUrl)}
            className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-danger opacity-0 shadow-lg backdrop-blur transition-all hover:bg-white group-hover:opacity-100"
            title="Remove video"
            aria-label={`Remove section video ${index + 1}`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3.5">
        <div>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                maxLength={120}
                autoFocus
                className="min-w-0 rounded-lg border border-border px-2 py-1 text-sm font-semibold text-ink outline-none focus:border-primary"
                placeholder={`Lesson ${index + 1}`}
              />
              <button
                type="button"
                onClick={saveTitle}
                disabled={savingTitle}
                className="text-xs font-bold text-success disabled:opacity-50"
              >
                {savingTitle ? "…" : "Save"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => canManage && setEditingTitle(true)}
              className={`text-left text-sm font-semibold text-ink ${canManage ? "hover:text-primary" : ""}`}
              title={canManage ? "Edit video title" : undefined}
            >
              {videoTitle || `Section lesson ${index + 1}`}
              {canManage && <span className="ml-1.5 text-[10px] text-primary">Edit</span>}
            </button>
          )}
          <p className="mt-0.5 text-xs text-ink-muted">Video · self-paced</p>
        </div>
        <button
          type="button"
          onClick={startVideo}
          className="text-xs font-semibold text-primary transition hover:text-primary-hover"
        >
          Watch
        </button>
      </div>
    </Motion.article>
  );
};

// Chapter Item Component
const ChapterItem = ({ chapter, onViewChapter, sectionId, canManage, canView }) => {
  const handleChapterClick = () => {
    onViewChapter(chapter._id);
  };

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleDeleteChapter(chapterId) {
    if (
      !window.confirm(
        "Are you sure you want to delete this chapter? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/deleteChapter`,
        {
          params: {
            chapterId,
            sectionId,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        toast.success("Chapter deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(
          "Failed to delete chapter: " + (response.data.msg || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Failed to delete chapter: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="premium-card bg-surface rounded-2xl border border-border/80 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer min-h-0 sm:min-h-[32rem] flex flex-col">
      {/* Chapter Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-surface-muted flex-shrink-0">
        {chapter.chapterThumbnailImage ? (
          <img
            src={chapter.chapterThumbnailImage}
            alt={chapter.chapterName}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          /* Themed default placeholder using the brand palette */
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-hover flex flex-col items-center justify-center relative overflow-hidden px-5 text-center">
            <div className="absolute inset-0 opacity-[0.08]">
              <div className="absolute top-0 left-0 w-40 h-40 bg-surface rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-28 h-28 bg-accent rounded-full translate-x-10 translate-y-10"></div>
              <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-surface rounded-full"></div>
            </div>
            <svg className="w-10 h-10 text-accent mb-2 relative" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="relative text-surface/95 font-serif text-sm leading-snug line-clamp-2">
              {chapter.chapterName}
            </span>
          </div>
        )}

        {/* Chapter Status Badge */}
        <div className="absolute top-3 right-3">
          {canView ? (
            <div className="bg-success text-surface px-2.5 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Available
            </div>
          ) : (
            <div className="bg-ink/80 text-surface px-2.5 py-1 rounded-full text-xs font-medium flex items-center shadow-sm backdrop-blur-sm">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </div>
          )}
        </div>
      </div>

      {/* Chapter Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h4 className="text-lg font-semibold text-ink mb-2 leading-snug">
          {chapter.chapterName}
        </h4>
        <p className="text-ink-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-shrink-0">
          {chapter.shortDescription ||
            "Explore this chapter to deepen your understanding and practice."}
        </p>

        {/* External Links Indicator */}
        <div className="flex-grow">
          {chapter.externalLinks && chapter.externalLinks.length > 0 && (
            <div className="mb-3">
              <div className="inline-flex items-center bg-primary/5 border border-primary/20 rounded-full px-3 py-1">
                <svg
                  className="w-3 h-3 text-primary mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                <span className="text-xs font-medium text-primary">
                  {chapter.externalLinks.length} Resource
                  {chapter.externalLinks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions - Fixed at bottom */}
        <div className="mt-auto flex flex-col gap-2">
          {canManage && (
            <div className="mb-4">
              <button
                onClick={() => navigate(`/editChapter/${chapter._id}`)}
                className="w-full bg-primary/5 text-primary py-2.5 px-4 rounded-md font-medium hover:bg-primary/10 transition-colors duration-200 flex items-center justify-center border border-primary/20"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Chapter
              </button>
              <button
                onClick={() => handleDeleteChapter(chapter._id)}
                disabled={submitting}
                className="w-full bg-red-50 text-red-700 py-2.5 px-4 rounded-md font-medium hover:bg-red-100 transition-colors duration-200 flex items-center justify-center border border-red-200 mt-2"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Chapter
              </button>
            </div>
          )}

          {/* Chapter Action Button */}
          {canView ? (
            <button
              onClick={handleChapterClick}
              className="w-full bg-primary text-surface py-2.5 px-4 rounded-md font-medium hover:bg-primary-hover transition-colors duration-200"
            >
              Start Learning
            </button>
          ) : (
            <div className="w-full bg-bg border border-border rounded p-3 text-center">
              <div className="flex items-center justify-center mb-1">
                <svg
                  className="w-4 h-4 text-ink-muted/50 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-ink-muted font-medium text-sm">
                  Requires enrollment
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Section Item Component
const SectionItem = ({
  section,
  onViewChapter,
  canManage,
  canView,
  onAddChapter,
  sectionVideoInput,
  setSectionVideoInput,
  sectionVideoFiles,
  setSectionVideoFiles,
  sectionVideoPreview,
  setSectionVideoPreview,
  sectionVideoTitles,
  setSectionVideoTitles,
  handleSectionVideoFiles,
  addSectionVideos,
  removeSectionVideo,
  updateSectionVideoTitle,
  updatingThumbnail,
  setCourse,
  quizState,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [sectionLink, setSectionLink] = useState([{
    label: "",
    url: "",
  }]);
  const [showSectionLinkInput, setShowSectionLinkInput] = useState(false);
  const quizzes =
    section.sectionQuizzes?.length > 0
      ? section.sectionQuizzes
      : section.sectionQuiz?.length > 0
        ? [{
            _id: section._id,
            title:
              section.sectionQuizTitle || `${section.sectionTitle} quiz`,
            questions: section.sectionQuiz,
            questionCount: section.sectionQuiz.length,
          }]
        : [];
  async function handleDeleteSection(sectionId) {
    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/user/deleteSection`,
      {
        params: { sectionId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
        },
      }
    );
    console.log(response);
    if (response.data.success) {
      toast.success("Section deleted successfully");
      setTimeout(() => {
        // Refresh the page or update the UI as needed
        window.location.reload();
      }, 2000);
    } else {
      toast.error("Failed to delete section");
    }
  }

  async function handleDeleteQuiz(quizId) {
    if (
      !window.confirm(
        "Delete this published quiz? Existing learner attempt history will be kept."
      )
    ) {
      return;
    }
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/deleteSectionQuiz`,
        { id: section._id, quizId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setCourse((previous) => ({
          ...previous,
          sections: previous.sections.map((item) =>
            item._id === section._id
              ? {
                  ...item,
                  sectionQuizzes: (item.sectionQuizzes || []).filter(
                    (quiz) => String(quiz._id) !== String(quizId)
                  ),
                  sectionQuiz:
                    String(quizId) === String(item._id)
                      ? []
                      : item.sectionQuiz,
                  sectionQuizTitle:
                    String(quizId) === String(item._id)
                      ? ""
                      : item.sectionQuizTitle,
                }
              : item
          ),
        }));
        toast.success("Quiz deleted successfully");
      } else {
        toast.error(response.data.msg || "Could not delete the quiz");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not delete the quiz");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeSectionLink(label) {
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/deleteSectionLink`,
        {
          sectionId: section._id,
          label,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        setCourse((prev) => {
          const oldCourse = { ...prev };
          console.log(oldCourse)
          console.log(section._id)
          oldCourse.sections = oldCourse.sections.map((sec) => {
            return sec._id === section._id
              ? { ...sec, externalLinks: response.data.externalLinks }
              : sec;
          });
        
          console.log(oldCourse);
          return oldCourse;
        });
        toast.success("Section link removed successfully");
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function addSection() {
    try {
      if (!sectionLink[0].url) {
        return toast.error("Please add atleast One Link");
      }
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addSectionLink`,
        {
          sectionId: section._id,
          sectionLink,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        setCourse((prev) => {
          const oldCourse = { ...prev };
          oldCourse.sections = oldCourse.sections.map((sec) => {
            return sec._id === section._id
              ? { ...sec, externalLinks: response.data.externalLinks }
              : sec;
          });
          return oldCourse;
        });
        setSectionLink([{ label: "", url: "" }]);
        setShowSectionLinkInput(false);
        toast.success("Section links added successfully");
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function addSectionInput() {
    setSectionLink((prev) => {
      return [...prev, { label: "", url: "" }];
    });
  }

  function removeSectionInput(index){
    const secLink = [...sectionLink];
    const updatedSecLink = secLink.filter((sec, i)=>{
      if(index!==i){
        return sec
      }
    })
    setSectionLink(updatedSecLink);
  }

  return (
    <div className="premium-card bg-surface rounded-2xl border border-border/80 overflow-hidden">
      {/* Section Header */}
      <div className="border-b border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-grow">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-5 h-5 text-ink"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-ink">
                {section.sectionTitle}
              </h3>
            </div>

            {section.sectionDescription && (
              <p className="mb-3 ml-0 text-ink-muted leading-relaxed sm:ml-14">
                {section.sectionDescription}
              </p>
            )}

            {/* Section Info Indicators */}
            <div className="ml-0 space-y-3 sm:ml-14">
              {/* Count chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-bg border border-border rounded-full px-3 py-1 flex items-center">
                  <svg
                    className="w-4 h-4 text-ink-muted/70 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-ink-muted">
                    {section.chapters ? section.chapters.length : 0}
                    {section.chapters?.length === 1 ? " Chapter" : " Chapters"}
                  </span>
                </div>

                {/* Video count indicator */}
                {section.sectionVideoUrl &&
                  section.sectionVideoUrl.length > 0 && (
                    <div className="bg-accent/10 border border-accent/30 rounded-full px-3 py-1 flex items-center">
                      <svg
                        className="w-4 h-4 text-accent mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-accent">
                        {section.sectionVideoUrl.length}
                        {section.sectionVideoUrl.length === 1
                          ? " Video"
                          : " Videos"}
                      </span>
                    </div>
                  )}

                {/* External Links indicator */}
                {section.externalLinks && section.externalLinks.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-full px-3 py-1 flex items-center">
                    <svg
                      className="w-4 h-4 text-primary mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      {section.externalLinks.length}
                      {section.externalLinks.length === 1 ? " Link" : " Links"}
                    </span>
                  </div>
                )}
              </div>

              {quizzes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-success">
                      Section quizzes
                    </p>
                    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                      {quizzes.length}
                    </span>
                  </div>
                  {quizzes.map((quiz, quizIndex) => {
                    const state = quizState?.[quiz._id] || {};
                    const questionCount =
                      quiz.questionCount ?? quiz.questions?.length ?? 0;
                    return (
                      <Motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: quizIndex * 0.06 }}
                        className="rounded-2xl border border-success/20 bg-success/5 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {quiz.title}
                            </p>
                            <p className="mt-1 text-xs text-ink-muted">
                              {questionCount} {questionCount === 1 ? "question" : "questions"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {canView && !canManage && (
                              <button
                                onClick={() =>
                                  navigate(`/takeQuiz/section/${section._id}/${quiz._id}`)
                                }
                                className="rounded-full bg-success px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                              >
                                {state.attemptCount > 0
                                  ? state.canAttempt
                                    ? "Start retake"
                                    : "View results"
                                  : "Take quiz"}
                              </button>
                            )}
                            {canManage && (
                              <>
                                <button
                                  onClick={() =>
                                    navigate(`/takeQuiz/section/${section._id}/${quiz._id}`)
                                  }
                                  className="rounded-full border border-success/30 bg-white px-3 py-2 text-xs font-semibold text-success transition hover:bg-success/10"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() =>
                                    navigate(`/quiz/section/${section._id}/${quiz._id}`)
                                  }
                                  className="rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:bg-bg"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz._id)}
                                  disabled={submitting}
                                  className="rounded-full border border-danger/25 bg-white px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </Motion.div>
                    );
                  })}
                </div>
              )}

              {/* Manage: grouped action buttons */}
              {canManage && (
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
                  <button
                    onClick={() => navigate(`/quiz/section/${section._id}`)}
                    className="bg-surface border border-border text-ink-muted rounded-md px-3 py-2 text-sm font-medium hover:bg-bg hover:text-ink transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Add Quiz
                  </button>
                  <button
                    onClick={() => navigate(`/editSection/${section._id}`)}
                    className="bg-surface border border-border text-ink-muted rounded-md px-3 py-2 text-sm font-medium hover:bg-bg hover:text-ink transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Section
                  </button>
                  <button
                    onClick={() =>
                      setSectionVideoInput((prev) => ({
                        ...prev,
                        [section._id]: !prev[section._id],
                      }))
                    }
                    className="bg-surface border border-border text-ink-muted rounded-md px-3 py-2 text-sm font-medium hover:bg-bg hover:text-ink transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Manage Videos
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section._id)}
                    className="bg-surface border border-danger/30 text-danger rounded-md px-3 py-2 text-sm font-medium hover:bg-danger/10 transition-colors duration-200 flex items-center sm:ml-auto"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            {/* Admin Add Chapter Button */}
            {canManage && (
              <button
                onClick={() => onAddChapter(section._id)}
                className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-surface transition-colors duration-200 hover:bg-primary-hover sm:flex-none"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Chapter
              </button>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-bg transition-colors duration-200 ${
                isExpanded ? "text-primary" : "text-ink-muted/70"
              }`}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Chapters List with Smooth Animation */}
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Section Videos */}
          {canView && section.sectionVideoUrl && section.sectionVideoUrl.length > 0 && (
            <div className="mb-8">
              <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                    Watch & learn
                  </p>
                  <h4 className="text-xl font-semibold text-ink">Section videos</h4>
                </div>
                <span className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-semibold text-ink-muted">
                  {section.sectionVideoUrl.length} {section.sectionVideoUrl.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {section.sectionVideoUrl.map((videoUrl, index) => (
                  <SectionVideoCard
                    key={videoUrl}
                    videoUrl={videoUrl}
                    videoTitle={section.sectionVideoTitles?.[index]}
                    index={index}
                    canManage={canManage}
                    onRemove={(url) => removeSectionVideo(section._id, url)}
                    onTitleSave={(videoIndex, title) =>
                      updateSectionVideoTitle(section._id, videoIndex, title)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section Video Management - Admin Only */}
          {canManage && (
            <div className="mb-6">
              <div className="rounded-lg border border-border bg-gradient-to-r from-primary/5 to-surface p-4 sm:p-6">
                <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-ink"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-ink">
                      Section Video Gallery
                    </h3>
                  </div>
                  <div className="text-sm text-ink-muted bg-surface px-3 py-1 rounded-full border">
                    {section.sectionVideoUrl
                      ? section.sectionVideoUrl.length
                      : 0}{" "}
                    videos
                  </div>
                </div>

                {!sectionVideoInput[section._id] ? (
                  <button
                    onClick={() =>
                      setSectionVideoInput((prev) => ({
                        ...prev,
                        [section._id]: true,
                      }))
                    }
                    className="flex items-center bg-primary text-surface px-4 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Section Videos
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-surface rounded-lg p-4 border-2 border-dashed border-primary/30">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-primary/40 mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <p className="text-lg font-medium text-ink mb-1">
                          Upload section videos
                        </p>
                        <p className="text-sm text-ink-muted/70 mb-4">
                          Select multiple video files to add to this section
                        </p>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={(e) =>
                            handleSectionVideoFiles(e, section._id)
                          }
                          className="hidden"
                          id={`sectionVideo-${section._id}`}
                        />
                        <label
                          htmlFor={`sectionVideo-${section._id}`}
                          className="inline-flex items-center px-4 py-2 bg-primary text-surface rounded-lg font-medium hover:bg-primary-hover cursor-pointer transition-colors duration-200"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Choose Videos
                        </label>
                      </div>
                    </div>

                    {/* Video Preview Grid */}
                    {sectionVideoFiles[section._id] &&
                      sectionVideoFiles[section._id].length > 0 && (
                        <div className="bg-surface rounded-lg p-4 border">
                          <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                            <h4 className="text-lg font-medium text-ink">
                              Preview ({sectionVideoFiles[section._id].length}{" "}
                              videos selected)
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            {sectionVideoPreview[section._id]?.map(
                              (videoSrc, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                                    <video
                                      src={videoSrc}
                                      className="w-full h-full object-cover"
                                      controls={false}
                                      muted
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                      <div className="bg-surface/90 text-ink px-3 py-1 rounded-full text-sm font-medium">
                                        Video {index + 1}
                                      </div>
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    maxLength={120}
                                    value={sectionVideoTitles[section._id]?.[index] || ""}
                                    onChange={(event) =>
                                      setSectionVideoTitles((previous) => {
                                        const titles = [
                                          ...(previous[section._id] || []),
                                        ];
                                        titles[index] = event.target.value;
                                        return {
                                          ...previous,
                                          [section._id]: titles,
                                        };
                                      })
                                    }
                                    placeholder={`Title for video ${index + 1}`}
                                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                  />
                                </div>
                              )
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              onClick={() => addSectionVideos(section._id)}
                              disabled={updatingThumbnail}
                              className="flex-1 bg-primary text-surface px-4 py-2 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                            >
                              {updatingThumbnail ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-ink"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  Upload Videos
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSectionVideoInput((prev) => ({
                                  ...prev,
                                  [section._id]: false,
                                }));
                                setSectionVideoFiles((prev) => ({
                                  ...prev,
                                  [section._id]: null,
                                }));
                                setSectionVideoPreview((prev) => ({
                                  ...prev,
                                  [section._id]: null,
                                }));
                                setSectionVideoTitles((prev) => ({
                                  ...prev,
                                  [section._id]: [],
                                }));
                              }}
                              className="px-4 py-2 bg-gray-100 text-ink-muted rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Link Management - Admin Only */}
          {canManage && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/20">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-ink"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-ink">
                      Section External Links
                    </h3>
                  </div>
                  <div className="text-sm text-ink-muted bg-surface px-3 py-1 rounded-full border">
                    {section.externalLinks ? section.externalLinks.length : 0} links
                  </div>
                </div>

                {!showSectionLinkInput ? (
                  <button
                    onClick={() => setShowSectionLinkInput(true)}
                    className="flex items-center bg-surface border border-border text-ink-muted px-4 py-2 rounded-lg font-medium hover:bg-bg transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Section Links
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-surface rounded-lg p-4 border-2 border-dashed border-primary/30">
                      <div className="space-y-4">
                        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                          <h4 className="text-lg font-medium text-ink">Add External Links</h4>
                          <button
                            onClick={() => addSectionInput()}
                            className="text-primary hover:text-primary font-medium text-sm flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add More Links
                          </button>
                        </div>

                        {sectionLink.map((link, index) => (
                          <div key={index} className="bg-bg rounded-lg p-4 border">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-ink">Link {index + 1}</h5>
                              {sectionLink.length > 1 && (
                                <button
                                  onClick={() => removeSectionInput(index)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Remove this link"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">
                                  Link Label
                                </label>
                                <input
                                  type="text"
                                  value={link.label}
                                  onChange={(e) => {
                                    const newLinks = [...sectionLink];
                                    newLinks[index].label = e.target.value;
                                    setSectionLink(newLinks);
                                  }}
                                  placeholder="Enter link label (e.g., Documentation, Tutorial)"
                                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-ink-muted mb-1">
                                  Link URL
                                </label>
                                <input
                                  type="url"
                                  value={link.url}
                                  onChange={(e) => {
                                    const newLinks = [...sectionLink];
                                    newLinks[index].url = e.target.value;
                                    setSectionLink(newLinks);
                                  }}
                                  placeholder="https://example.com"
                                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                          <button
                            onClick={addSection}
                            disabled={submitting}
                            className="flex-1 bg-surface border border-border text-ink-muted px-4 py-2 rounded-lg font-medium hover:bg-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-ink"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Adding Links...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                  />
                                </svg>
                                Add Section Links
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowSectionLinkInput(false);
                              setSectionLink([{ label: "", url: "" }]);
                            }}
                            className="px-4 py-2 bg-gray-100 text-ink-muted rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* External Links Display */}
          {canView && section.externalLinks && section.externalLinks.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-ink mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                External Resources ({section.externalLinks.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.externalLinks.map((link, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20 hover:from-primary/10 hover:to-primary/20 hover:shadow-md transition-all duration-200 group relative"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            <svg
                              className="w-5 h-5 text-ink"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-5 5"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-semibold text-ink group-hover:text-primary-hover transition-colors duration-200 mb-1">
                            {link.label || `External Link ${index + 1}`}
                          </h5>
                          <p className="text-sm text-primary truncate font-medium">
                            {link.url}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-primary">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7l-5 5"
                              />
                            </svg>
                            <span>Opens in new tab</span>
                          </div>
                        </div>
                      </div>
                    </a>
                    
                    {/* Admin Remove Button */}
                    {canManage && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeSectionLink(link.label);
                        }}
                        className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        title="Remove link"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section.chapters && section.chapters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.chapters.map((chapter, index) => (
                <div
                  key={chapter._id}
                  className={`transform transition-all duration-500 ${
                    isExpanded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isExpanded ? `${index * 150}ms` : "0ms",
                  }}
                >
                  <ChapterItem
                    chapter={chapter}
                    onViewChapter={onViewChapter}
                    sectionId={section._id}
                    canManage={canManage}
                    canView={canView}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ink-muted/70">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                <svg
                  className="w-8 h-8 text-ink-muted/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-ink-muted mb-2">
                No chapters available yet
              </h4>
              <p className="text-ink-muted/70 mb-4">
                This section is waiting for content to be added.
              </p>
              {canManage && (
                <button
                  onClick={() => onAddChapter(section._id)}
                  className="inline-flex items-center bg-primary text-surface px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add First Chapter
                </button>
              )}
            </div>
          )}
          </div>
      </div>
      </div>
    </div>
  );
};

const Course = () => {
  const prefersReducedMotion = useReducedMotion();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showThumbnailInput, setShowThumbnailInput] = useState(false);
  const [courseThumbnailFile, setCourseThumbnailFile] = useState(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState(null);
  const [updatingThumbnail, setUpdatingThumbnail] = useState(false);
  const [introductionImageInput, setIntroductionImageInput] = useState(false);
  const [introductionImageFiles, setIntroductionImageFiles] = useState(null);
  const [introductionImagePreview, setIntroductionImagePreview] =
    useState(null);
  const [introductionImageCaptions, setIntroductionImageCaptions] = useState([]);
  const [editingCaptionIndex, setEditingCaptionIndex] = useState(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [savingCaptionIndex, setSavingCaptionIndex] = useState(null);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState(null);
  const [courseThumbnailExpanded, setCourseThumbnailExpanded] = useState(false);

  // Inline course-page content editing
  const [editingCourseField, setEditingCourseField] = useState(null);
  const [courseContentDraft, setCourseContentDraft] = useState("");
  const [savingCourseField, setSavingCourseField] = useState(false);

  // Section Video Management States
  const [sectionVideoInput, setSectionVideoInput] = useState({});
  const [sectionVideoFiles, setSectionVideoFiles] = useState({});
  const [sectionVideoPreview, setSectionVideoPreview] = useState({});
  const [sectionVideoTitles, setSectionVideoTitles] = useState({});

  // Course Access Management States
  const [showAccessManagement, setShowAccessManagement] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Admin Access Management States
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState("");
  const [grantingAdminAccess, setGrantingAdminAccess] = useState(false);

  // Request-access enrollment states
  const [enrollmentRequestStatus, setEnrollmentRequestStatus] = useState("none");
  const [enrollmentRequests, setEnrollmentRequests] = useState([]);
  const [handlingRequestId, setHandlingRequestId] = useState(null);

  // Quiz attempt and retake states
  const [sectionQuizStates, setSectionQuizStates] = useState({});
  const [retakeRequests, setRetakeRequests] = useState([]);
  const [handlingRetakeId, setHandlingRetakeId] = useState(null);

  // Learners who currently have access
  const [courseLearners, setCourseLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [removingLearnerId, setRemovingLearnerId] = useState(null);
  const [showLearnerList, setShowLearnerList] = useState(false);

  // Student scores (owner / admin view)
  const [studentScores, setStudentScores] = useState([]);
  const [showStudentScores, setShowStudentScores] = useState(false);
  const [loadingScores, setLoadingScores] = useState(false);
  const [expandedAttempt, setExpandedAttempt] = useState(null);

  const { courseId } = useParams();
  const { profile, fetchProfile } = useContext(UserContextData);
  const navigate = useNavigate();

  async function fetchCourse() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCourse`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);
      if (response.data.success) {
        setCourse(response.data.course);
        setEnrollmentRequestStatus(response.data.enrollmentRequestStatus || "none");
        setSectionQuizStates(response.data.sectionQuizStates || {});
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Error fetching course:", err);
      toast.error("An error occurred while fetching the course.");
    } finally {
      setLoading(false);
    }
  }

  // Student asks the instructor for access to a "request access" course
  async function requestEnrollment() {
    try {
      setEnrolling(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/requestEnrollment`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.msg);
        setEnrollmentRequestStatus("pending");
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEnrolling(false);
    }
  }

  // Owner: load pending enrollment requests for this course
  async function fetchEnrollmentRequests() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getEnrollmentRequests`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setEnrollmentRequests(response.data.requests);
      }
    } catch (error) {
      console.error("Error fetching enrollment requests:", error);
    }
  }

  // Owner: approve or reject a single request
  async function handleEnrollmentRequest(requestId, decision) {
    try {
      setHandlingRequestId(requestId);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/handleEnrollmentRequest`,
        { requestId, decision },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.msg);
        setEnrollmentRequests((prev) => prev.filter((r) => r._id !== requestId));
        if (decision === "approve") {
          fetchCourseLearners();
        }
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setHandlingRequestId(null);
    }
  }

  async function fetchRetakeRequests() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getQuizRetakeRequests`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setRetakeRequests(response.data.requests || []);
      }
    } catch (error) {
      console.error("Error fetching retake requests:", error);
    }
  }

  async function handleRetakeRequest(requestId, decision) {
    try {
      setHandlingRetakeId(requestId);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/handleQuizRetakeRequest`,
        { requestId, decision },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setRetakeRequests((previous) =>
          previous.filter((request) => request._id !== requestId)
        );
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setHandlingRetakeId(null);
    }
  }

  async function fetchCourseLearners() {
    try {
      setLoadingLearners(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCourseLearners`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setCourseLearners(response.data.learners || []);
      }
    } catch (error) {
      console.error("Error fetching course learners:", error);
    } finally {
      setLoadingLearners(false);
    }
  }

  async function removeLearnerAccess(learner) {
    if (
      !window.confirm(
        `Remove ${learner.name || learner.email}'s access to this course?`
      )
    ) {
      return;
    }
    try {
      setRemovingLearnerId(learner._id);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/removeCourseAccess`,
        { courseId, userId: learner._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setCourseLearners((previous) =>
          previous.filter((item) => item._id !== learner._id)
        );
        setRetakeRequests((previous) =>
          previous.filter((request) => request.user?._id !== learner._id)
        );
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setRemovingLearnerId(null);
    }
  }

  // Owner/Admin: load student quiz scores for this course
  async function fetchStudentScores() {
    try {
      setLoadingScores(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/user/getCourseStudentScores`,
        {
          params: { courseId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (response.data.success) {
        setStudentScores(response.data.report);
        setShowStudentScores(true);
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingScores(false);
    }
  }

  const handleViewChapter = (chapterId) => {
    navigate(`/chapter/${chapterId}`);
  };

  const handleAddSection = () => {
    navigate(`/addSection/${courseId}`);
  };

  const handleAddChapter = (sectionId) => {
    navigate(`/addChapter/${sectionId}`);
  };

  async function enrollCourse() {
    try {
      setEnrolling(true);
      if (course.price === 0) {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/enrollCourse`,
          { courseId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );

        if (response.data.success) {
          toast.success("Course added to your library");
          await fetchProfile();
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/createOrder`,
          {
            courseId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );
        console.log(response);
        if (response.data.success) {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: response.data.order.amount,
            currency: "INR",
            name: "Edvance Learning",
            description: "Course Purchase",
            order_id: response.data.order.id,
            handler: async function (responseData) {
              const verifyResponse = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/user/verifyOrder`,
                {
                  orderId: response.data.order.id,
                  paymentId: responseData.razorpay_payment_id,
                  signature: responseData.razorpay_signature,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "edvance_token"
                    )}`,
                  },
                }
              );
              console.log(verifyResponse);
              if (verifyResponse.data.success) {
                toast.success("Payment received — course added to your library");
                await fetchProfile();
              } else {
                toast.error(verifyResponse.data.message);
              }
            },
            prefill: {
              name: profile.name,
              email: profile.email,
            },
            notes: {
              address: "APJ Lecture Hall",
            },
            theme: {
              color: "#3399cc",
            },
          };

          console.log("Initializing Razorpay with options:", options);

          const rzp = new window.Razorpay(options);

          rzp.on("payment.failed", function (responseData) {
            toast.error(
              "Payment failed: " +
                responseData.error.description +
                " Please try again."
            );
          });

          rzp.open();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEnrolling(false);
    }
  }

  function inputThumbnailFile(e) {
    const file = e.target.files[0];
    setCourseThumbnailFile(file);
    setCourseThumbnailPreview(URL.createObjectURL(file));
  }

  async function updateCourseThumbnail() {
    try {
      if (!courseThumbnailFile) {
        toast.error("Please select a thumbnail image to upload.");
        return;
      }
      setUpdatingThumbnail(true);
      const formData = new FormData();
      formData.append("courseThumbnailImage", courseThumbnailFile);
      formData.append("courseId", courseId);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/updateCourseThumbnail`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      console.log(response);

      if (response.data.success) {
        toast.success(response.data.msg);
        setCourse((previousCourse) => ({
          ...previousCourse,
          courseThumbnailImage: response.data.course.courseThumbnailImage,
        }));
        setShowThumbnailInput(false);
        setCourseThumbnailFile(null);
        setCourseThumbnailPreview(null);
      } else {
        toast.error(response.data.msg);
      }
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
      toast.error("An error occurred while uploading the thumbnail.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  const startEditingCourseField = (field) => {
    setEditingCourseField(field);
    setCourseContentDraft(course?.[field] || "");
  };

  const cancelEditingCourseField = () => {
    setEditingCourseField(null);
    setCourseContentDraft("");
  };

  async function saveCourseContent() {
    if (!editingCourseField || !course) return;

    try {
      setSavingCourseField(true);
      const nextCourse = {
        ...course,
        [editingCourseField]: courseContentDraft.trim(),
      };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/editCourse`,
        {
          courseId: course._id,
          courseName: course.courseName,
          shortDescription: nextCourse.shortDescription || "",
          longDescription: nextCourse.longDescription || "",
          courseIntroduction: nextCourse.courseIntroduction || "",
          enrollmentType: course.enrollmentType || "paid",
          price: Number(course.price) || 0,
          googleFormLink: course.googleFormLink || "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (!response.data.success) {
        toast.error(response.data.msg || "Could not update course content");
        return;
      }

      setCourse((previousCourse) => ({
        ...previousCourse,
        [editingCourseField]: courseContentDraft.trim(),
      }));
      toast.success(`${editingCourseField === "shortDescription" ? "Course overview" : editingCourseField === "courseIntroduction" ? "Course introduction" : "Course details"} updated`);
      cancelEditingCourseField();
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setSavingCourseField(false);
    }
  }

  useEffect(() => {
    fetchCourse();

    // Additional video protection
    const protectVideos = () => {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        // Disable right-click
        video.addEventListener("contextmenu", (e) => e.preventDefault());

        // Disable text selection
        video.addEventListener("selectstart", (e) => e.preventDefault());

        // Disable drag
        video.addEventListener("dragstart", (e) => e.preventDefault());

        // Disable keyboard shortcuts that might allow download
        video.addEventListener("keydown", (e) => {
          // Disable F12, Ctrl+Shift+I, Ctrl+S, etc.
          if (
            e.key === "F12" ||
            (e.ctrlKey && e.shiftKey && e.key === "I") ||
            (e.ctrlKey && e.key === "s") ||
            (e.ctrlKey && e.key === "S") ||
            (e.ctrlKey && e.key === "u") ||
            (e.ctrlKey && e.key === "U")
          ) {
            e.preventDefault();
            return false;
          }
        });

        // Handle fullscreen changes to maintain protection
        video.addEventListener("fullscreenchange", () => {
          if (document.fullscreenElement === video) {
            // Video is now in fullscreen - reapply protection
            setTimeout(() => {
              video.addEventListener("contextmenu", (e) => e.preventDefault());
              video.addEventListener("selectstart", (e) => e.preventDefault());
              video.addEventListener("dragstart", (e) => e.preventDefault());
            }, 100);
          }
        });

        // Handle webkit fullscreen
        video.addEventListener("webkitfullscreenchange", () => {
          if (document.webkitFullscreenElement === video) {
            setTimeout(() => {
              video.addEventListener("contextmenu", (e) => e.preventDefault());
              video.addEventListener("selectstart", (e) => e.preventDefault());
              video.addEventListener("dragstart", (e) => e.preventDefault());
            }, 100);
          }
        });
      });
    };

    // Apply protection initially and whenever DOM changes
    protectVideos();
    const observer = new MutationObserver(protectVideos);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  // Course managers see access and quiz requests straight away.
  useEffect(() => {
    if (!course || !profile) return;
    const owner =
      course.creator && String(course.creator) === String(profile._id);
    if (owner && course.enrollmentType === "request") {
      fetchEnrollmentRequests();
    }
    if (owner || profile.isAdmin) {
      fetchRetakeRequests();
      fetchCourseLearners();
    }
  }, [course, profile]);

  useEffect(() => {
    if (galleryLightboxIndex === null) return undefined;

    const imageCount = course?.courseIntroductionImages?.length || 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleLightboxKeydown = (event) => {
      if (event.key === "Escape") {
        setGalleryLightboxIndex(null);
      } else if (event.key === "ArrowLeft" && imageCount > 1) {
        setGalleryLightboxIndex((current) =>
          current === 0 ? imageCount - 1 : current - 1
        );
      } else if (event.key === "ArrowRight" && imageCount > 1) {
        setGalleryLightboxIndex((current) => (current + 1) % imageCount);
      }
    };

    window.addEventListener("keydown", handleLightboxKeydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleLightboxKeydown);
    };
  }, [galleryLightboxIndex, course?.courseIntroductionImages?.length]);

  useEffect(() => {
    if (!courseThumbnailExpanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event) => {
      if (event.key === "Escape") setCourseThumbnailExpanded(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [courseThumbnailExpanded]);

  if (localStorage.getItem("edvance_token") === null) {
    toast.info("Please login to access the course details.");
    navigate("/login");
  }

  if (loading) {
    return (
      <>
        <Header
          topics={[
            { name: "Home", path: "home" },
            { name: "Courses", path: "courses" },
            { name: "About", path: "about" },
          ]}
        />
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
          <div className="text-center bg-surface rounded-lg p-8 shadow-sm border border-border max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200"></div>
            </div>
            <h3 className="text-xl font-semibold text-ink mb-2">
              Loading Course
            </h3>
            <p className="text-ink-muted">
              Please wait while we load the course content...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header
          topics={[
            { name: "Home", path: "home" },
            { name: "Courses", path: "courses" },
            { name: "About", path: "about" },
          ]}
        />
        <div className="min-h-screen bg-bg pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-ink mb-3">
              Course Not Found
            </h3>
            <p className="text-ink-muted mb-6">
              The course you're looking for doesn't exist or has been moved.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full bg-primary text-surface px-6 py-3 rounded font-semibold hover:bg-primary-hover transition-colors duration-200"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("/#courses")}
                className="w-full bg-surface text-ink-muted px-6 py-3 rounded font-medium border border-border hover:bg-bg transition-colors duration-200"
              >
                Browse All Courses
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // A course can be managed by any admin or by the creator who owns it.
  const isOwner =
    profile && course && course.creator && String(course.creator) === String(profile._id);
  const canManage = Boolean(profile && (profile.isAdmin || isOwner));
  const canView = Boolean(
    canManage || (profile && profile.coursePurchased.includes(courseId))
  );

  const handleRemoveImage = async (imageIndex) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/removeCourseIntroductionImage`,
        {
          courseId,
          imageIndex,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Image Removed");
        setCourse((previousCourse) => ({
          ...previousCourse,
          courseIntroductionImages:
            response.data.course.courseIntroductionImages,
          courseIntroductionImageCaptions:
            response.data.course.courseIntroductionImageCaptions || [],
        }));
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  function handleIntroductionImageFiles(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    if (e.target.files.length > 5) {
      toast.info("You can upload up to 5 gallery images at a time.");
    }
    setIntroductionImageFiles(files);
    setIntroductionImagePreview(files.map((file) => URL.createObjectURL(file)));
    setIntroductionImageCaptions(files.map(() => ""));
  }

  function updatePendingImageCaption(index, caption) {
    setIntroductionImageCaptions((previousCaptions) =>
      previousCaptions.map((currentCaption, i) =>
        i === index ? caption : currentCaption
      )
    );
  }

  async function addIntroductionImages() {
    try {
      if (!introductionImageFiles || introductionImageFiles.length === 0) {
        toast.error("Please select introduction images to upload.");
        return;
      }

      setUpdatingThumbnail(true);
      const formData = new FormData();
      introductionImageFiles.forEach((file) => {
        formData.append("courseIntroductionImages", file);
      });
      formData.append("courseId", courseId);
      formData.append(
        "courseIntroductionImageCaptions",
        JSON.stringify(introductionImageCaptions)
      );

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/addIntroductionImages`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success("Introduction Images Added Successfully");
        setCourse((previousCourse) => ({
          ...previousCourse,
          courseIntroductionImages:
            response.data.course.courseIntroductionImages,
          courseIntroductionImageCaptions:
            response.data.course.courseIntroductionImageCaptions || [],
        }));
        setIntroductionImageInput(false);
        setIntroductionImageFiles(null);
        setIntroductionImagePreview(null);
        setIntroductionImageCaptions([]);
      }
    } catch (err) {
      console.error("Error uploading introduction images:", err);
      toast.error("An error occurred while uploading the introduction images.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  function startEditingCaption(index) {
    setEditingCaptionIndex(index);
    setCaptionDraft(course.courseIntroductionImageCaptions?.[index] || "");
  }

  async function saveImageCaption(index) {
    try {
      setSavingCaptionIndex(index);
      const captions = [
        ...(course.courseIntroductionImageCaptions || []),
      ];
      while (captions.length < course.courseIntroductionImages.length) {
        captions.push("");
      }
      captions[index] = captionDraft.trim();

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/editCourse`,
        {
          courseId: course._id,
          courseName: course.courseName,
          shortDescription: course.shortDescription || "",
          longDescription: course.longDescription || "",
          courseIntroduction: course.courseIntroduction || "",
          enrollmentType: course.enrollmentType || "paid",
          price: Number(course.price) || 0,
          googleFormLink: course.googleFormLink || "",
          courseIntroductionImageCaptions: captions,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (!response.data.success) {
        toast.error(response.data.msg || "Could not update caption");
        return;
      }

      setCourse((previousCourse) => {
        return {
          ...previousCourse,
          courseIntroductionImageCaptions: captions,
        };
      });
      setEditingCaptionIndex(null);
      setCaptionDraft("");
      toast.success("Image caption updated");
    } catch (error) {
      toast.error(error.response?.data?.msg || error.message);
    } finally {
      setSavingCaptionIndex(null);
    }
  }

  // Section Video Management Functions
  function handleSectionVideoFiles(e, sectionId) {
    const files = Array.from(e.target.files);
    setSectionVideoFiles((prev) => ({
      ...prev,
      [sectionId]: files,
    }));
    setSectionVideoPreview((prev) => ({
      ...prev,
      [sectionId]: files.map((file) => URL.createObjectURL(file)),
    }));
    setSectionVideoTitles((previous) => ({
      ...previous,
      [sectionId]: files.map((file) =>
        file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ")
      ),
    }));
  }

  async function addSectionVideos(sectionId) {
    try {
      if (
        !sectionVideoFiles[sectionId] ||
        sectionVideoFiles[sectionId].length === 0
      ) {
        toast.error("Please select section videos to upload.");
        return;
      }

      setUpdatingThumbnail(true);
      let updatedSection = null;
      for (let index = 0; index < sectionVideoFiles[sectionId].length; index += 1) {
        const file = sectionVideoFiles[sectionId][index];
        const signedUrlResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/user/generateUrl`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
            params: { fileName: file.name, fileType: file.type },
          }
        );
        if (!signedUrlResponse.data.success) {
          throw new Error(signedUrlResponse.data.msg || "Could not prepare upload");
        }

        const { uploadUrl, fileKey } = signedUrlResponse.data.data;
        await axios.put(uploadUrl, file, {
          headers: { "Content-Type": file.type },
        });
        const videoUrl = `https://${import.meta.env.VITE_BUCKETNAME}.s3.${import.meta.env.VITE_REGION}.amazonaws.com/${fileKey}`;
        const saveResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/user/saveSectionVideoUrl`,
          {
            videoUrl,
            sectionId,
            videoTitle: sectionVideoTitles[sectionId]?.[index] || "",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
            },
          }
        );
        if (!saveResponse.data.success) {
          throw new Error(saveResponse.data.msg || "Could not save video");
        }
        updatedSection = saveResponse.data.section;
      }

      if (updatedSection) {
        setCourse((previous) => ({
          ...previous,
          sections: previous.sections.map((section) =>
            section._id === sectionId ? { ...section, ...updatedSection } : section
          ),
        }));
      }
      setSectionVideoInput((previous) => ({ ...previous, [sectionId]: false }));
      setSectionVideoFiles((previous) => ({ ...previous, [sectionId]: null }));
      setSectionVideoPreview((previous) => ({ ...previous, [sectionId]: null }));
      setSectionVideoTitles((previous) => ({ ...previous, [sectionId]: [] }));
      toast.success(
        `${sectionVideoFiles[sectionId].length} video${sectionVideoFiles[sectionId].length === 1 ? "" : "s"} added`
      );
    } catch (err) {
      console.error("Error uploading section videos:", err);
      toast.error("An error occurred while uploading the section videos.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  async function removeSectionVideo(sectionId, videoURL) {
    if (!window.confirm("Are you sure you want to remove this video?")) {
      return;
    }

    try {
      setUpdatingThumbnail(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/removeSectionVideo`,
        {
          sectionId,
          videoURL,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Section Video Removed Successfully");
        // Update the course state with the updated section
        setCourse((prev) => ({
          ...prev,
          sections: prev.sections.map((section) =>
            section._id === sectionId
              ? {
                  ...section,
                  sectionVideoUrl: response.data.section.sectionVideoUrl,
                  sectionVideoTitles:
                    response.data.section.sectionVideoTitles || [],
                }
              : section
          ),
        }));
      }
    } catch (err) {
      console.error("Error removing section video:", err);
      toast.error("An error occurred while removing the section video.");
    } finally {
      setUpdatingThumbnail(false);
    }
  }

  async function updateSectionVideoTitle(sectionId, videoIndex, title) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/updateSectionVideoTitle`,
        { sectionId, videoIndex, title },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      if (!response.data.success) {
        toast.error(response.data.msg || "Could not update the video title");
        return false;
      }
      setCourse((previous) => ({
        ...previous,
        sections: previous.sections.map((section) =>
          section._id === sectionId
            ? {
                ...section,
                sectionVideoTitles:
                  response.data.section.sectionVideoTitles || [],
              }
            : section
        ),
      }));
      toast.success("Video title updated");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.msg || "Could not update the video title");
      return false;
    }
  }

  // Course Access Management Function
  async function grantCourseAccess() {
    if (!emailInput.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    try {
      setGrantingAccess(true);

      // Parse comma-separated emails and clean them
      const emailArray = emailInput
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
        .filter((email) => {
          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            toast.error(`Invalid email format: ${email}`);
            return false;
          }
          return true;
        });

      if (emailArray.length === 0) {
        toast.error("No valid email addresses found");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/giveCourseAccess`,
        {
          courseId: courseId,
          emailArray: emailArray,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );
      console.log(response);
      if (response.data.success) {
        toast.success(
          `Course access granted to ${emailArray.length} user${
            emailArray.length !== 1 ? "s" : ""
          }`
        );
        setEmailInput("");
        setShowAccessManagement(false);
        fetchCourseLearners();
        if (response.data.notFound?.length) {
          toast.info(
            `No account found for: ${response.data.notFound.join(", ")}`
          );
        }
      } else {
        toast.error(response.data.msg || "Failed to grant course access");
      }
    } catch (error) {
      console.error("Error granting course access:", error);
      toast.error("An error occurred while granting course access");
    } finally {
      setGrantingAccess(false);
    }
  }

  // Admin Access Management Function
  async function grantAdminAccess() {
    if (!adminEmailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setGrantingAdminAccess(true);

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(adminEmailInput.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/giveAdminAccess`,
        {
          email: adminEmailInput.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("edvance_token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(`Admin access granted to ${adminEmailInput.trim()}`);
        setAdminEmailInput("");
        setShowAdminManagement(false);
      } else {
        toast.error(response.data.msg || "Failed to grant admin access");
      }
    } catch (error) {
      console.error("Error granting admin access:", error);
      toast.error("An error occurred while granting admin access");
    } finally {
      setGrantingAdminAccess(false);
    }
  }

  return (
    <>
      <Header
        topics={[
          { name: "Home", path: "home" },
          { name: "Courses", path: "courses" },
          { name: "About", path: "about" },
        ]}
      />

      <div className="min-h-screen bg-bg">
        {/* Course cover and identity are deliberately separated so uploaded artwork stays uncluttered. */}
        <section className="relative bg-bg px-3 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24">
          <Motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="premium-card mx-auto grid max-w-[1500px] overflow-hidden rounded-[1.75rem] border border-border/80 bg-surface sm:rounded-[2.25rem] lg:grid-cols-[minmax(0,1.45fr)_minmax(390px,0.72fr)]"
          >
            <div className="group relative min-h-[260px] overflow-hidden bg-ink sm:min-h-[420px] lg:min-h-[540px]">
              <img
                src={
                  course.courseThumbnailImage ||
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                }
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
              <Motion.img
                src={
                  course.courseThumbnailImage ||
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                }
                alt={course.courseName}
                className="absolute inset-0 z-[1] h-full w-full object-contain"
                initial={
                  prefersReducedMotion ? false : { opacity: 0.72 }
                }
                animate={{ opacity: 1 }}
                transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
              <button
                type="button"
                onClick={() => setCourseThumbnailExpanded(true)}
                className="absolute inset-0 z-[3] flex cursor-zoom-in items-end justify-end p-4 text-white sm:p-5"
                aria-label="Enlarge course cover image"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink/65 px-4 py-2 text-xs font-semibold opacity-0 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" />
                  </svg>
                  View cover
                </span>
              </button>
            </div>

            <Motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.12,
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-10 lg:p-11"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative">
                <div className="mb-7 flex flex-wrap gap-2.5">
                  <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {course.enrollmentType === "request"
                      ? "Curated enrollment"
                      : Number(course.price) > 0
                        ? "Premium course"
                        : "Free course"}
                  </span>
                  {canView && (
                    <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-ink">
                      In your library
                    </span>
                  )}
                </div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-muted">
                  Edvance course
                </p>
                <h1 className="text-[clamp(2.15rem,3vw,3.6rem)] font-bold leading-[1.06] tracking-[-0.025em] text-ink">
                  {course.courseName}
                </h1>
              </div>

              <div className="relative mt-10">
                {course.creatorName && (
                  <div className="flex items-center gap-3 border-t border-border/80 pt-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md shadow-primary/15">
                      {course.creatorName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted">
                        Created by
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-ink">
                        {course.creatorName}
                      </p>
                    </div>
                  </div>
                )}
                {canManage && (
                  <button
                    type="button"
                    onClick={() => navigate(`/editCourse/${courseId}`)}
                    className="mt-6 inline-flex items-center rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-8.5a2.1 2.1 0 013 3L12 14l-4 1 1-4 8.5-8.5z" />
                    </svg>
                    Course settings
                  </button>
                )}
              </div>
            </Motion.div>
          </Motion.div>
        </section>

        {/* Enrollment Requests — course owner only */}
        {isOwner && course.enrollmentType === "request" && (
          <section className="bg-bg py-3">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-accent"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        Enrollment Requests
                      </h3>
                      <p className="text-sm text-ink-muted">
                        Approve or reject learners asking to join this course
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-bold text-ink">
                    {enrollmentRequests.length} pending
                  </span>
                </div>

                {enrollmentRequests.length === 0 ? (
                  <p className="text-sm text-ink-muted py-4 text-center">
                    No pending requests right now.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {enrollmentRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-border rounded-lg p-4"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {request.user?.name || "Unknown learner"}
                          </div>
                          <div className="text-sm text-ink-muted">
                            {request.user?.email}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleEnrollmentRequest(request._id, "approve")
                            }
                            disabled={handlingRequestId === request._id}
                            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-50"
                          >
                            Give Access
                          </button>
                          <button
                            onClick={() =>
                              handleEnrollmentRequest(request._id, "reject")
                            }
                            disabled={handlingRequestId === request._id}
                            className="bg-surface border border-border text-danger px-4 py-2 rounded-md text-sm font-semibold hover:bg-bg transition-colors duration-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {canManage && (
          <section className="bg-bg px-4 pb-2 pt-7 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                Course workspace
              </p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="font-serif text-3xl font-bold text-ink">
                  Creator tools
                </h2>
                <p className="text-sm text-ink-muted">
                  Content, access, and learner activity in one place.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Quiz retake approvals — owner / admin */}
        {canManage && (
          <section className="bg-bg py-3">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Quiz management
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-ink">
                      Retake requests
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      Each approval unlocks one additional attempt.
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-bold text-ink">
                    {retakeRequests.length} pending
                  </span>
                </div>

                {retakeRequests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-bg/50 px-5 py-7 text-center text-sm text-ink-muted">
                    No learners are waiting for a retake decision.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {retakeRequests.map((request) => (
                      <div
                        key={request._id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">
                            {request.user?.name || "Unknown learner"}
                          </p>
                          <p className="truncate text-sm text-ink-muted">
                            {request.user?.email}
                          </p>
                          <p className="mt-2 text-sm font-medium text-primary">
                            {request.quizTitle}
                            <span className="ml-2 text-xs font-normal uppercase tracking-wide text-ink-muted">
                              {request.quizType}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleRetakeRequest(request._id, "approve")
                            }
                            disabled={handlingRetakeId === request._id}
                            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
                          >
                            Approve retake
                          </button>
                          <button
                            onClick={() =>
                              handleRetakeRequest(request._id, "reject")
                            }
                            disabled={handlingRetakeId === request._id}
                            className="rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Current course access — owner / admin */}
        {canManage && (
          <section className="bg-bg py-3">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                      Course access
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-ink">
                      Learners with access
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      View everyone in this course and revoke access when needed.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLearnerList((visible) => !visible)}
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"
                    aria-expanded={showLearnerList}
                  >
                    {courseLearners.length} learners
                    <svg
                      className={`h-4 w-4 transition-transform duration-300 ${showLearnerList ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {showLearnerList && (
                    <Motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      {loadingLearners ? (
                        <div className="h-20 animate-pulse rounded-xl bg-bg" />
                      ) : courseLearners.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-bg/50 px-5 py-7 text-center text-sm text-ink-muted">
                          No learners currently have access.
                        </div>
                      ) : (
                        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
                          {courseLearners.map((learner) => (
                            <div
                              key={learner._id}
                              className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-ink">{learner.name}</p>
                                <p className="truncate text-sm text-ink-muted">
                                  {learner.email}
                                </p>
                              </div>
                              <button
                                onClick={() => removeLearnerAccess(learner)}
                                disabled={removingLearnerId === learner._id}
                                className="w-fit rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-50"
                              >
                                {removingLearnerId === learner._id
                                  ? "Removing…"
                                  : "Remove access"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}

        {/* Student Test Scores — owner / admin */}
        {canManage && (
          <section className="bg-bg py-3">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        Student Test Scores
                      </h3>
                      <p className="text-sm text-ink-muted">
                        See how your students performed on this course's quizzes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      showStudentScores
                        ? setShowStudentScores(false)
                        : fetchStudentScores()
                    }
                    disabled={loadingScores}
                    className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:opacity-50 sm:w-auto"
                  >
                    {loadingScores
                      ? "Loading..."
                      : showStudentScores
                      ? "Hide Scores"
                      : "View Scores"}
                  </button>
                </div>

                {showStudentScores &&
                  (studentScores.length === 0 ? (
                    <p className="text-sm text-ink-muted py-4 text-center">
                      No students have attempted a quiz in this course yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {studentScores.map((student, i) => (
                        <div
                          key={i}
                          className="bg-surface border border-border rounded-lg p-4"
                        >
                          <div className="font-semibold text-ink">
                            {student.name}
                          </div>
                          <div className="text-sm text-ink-muted mb-3">
                            {student.email}
                          </div>
                          <div className="space-y-2">
                            {student.attempts.map((attempt, j) => {
                              const key = `${i}-${j}`;
                              const open = expandedAttempt === key;
                              const pct = attempt.total
                                ? Math.round((attempt.score / attempt.total) * 100)
                                : 0;
                              return (
                                <div
                                  key={j}
                                  className="border border-border rounded-lg overflow-hidden"
                                >
                                  <button
                                    onClick={() =>
                                      setExpandedAttempt(open ? null : key)
                                    }
                                    className="w-full flex items-center justify-between gap-3 px-3 py-2 hover:bg-bg transition-colors duration-200 text-left"
                                  >
                                    <span className="text-sm text-ink-muted min-w-0 truncate">
                                      <span className="text-xs uppercase tracking-wide text-accent mr-2">
                                        {attempt.type}
                                      </span>
                                      {attempt.title}
                                    </span>
                                    <span className="flex items-center gap-2 shrink-0">
                                      <span
                                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                          pct >= 70
                                            ? "bg-success/10 text-success"
                                            : "bg-danger/10 text-danger"
                                        }`}
                                      >
                                        {attempt.score}
                                        {attempt.total ? `/${attempt.total}` : ""}
                                      </span>
                                      <svg
                                        className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </span>
                                  </button>
                                  {open && (
                                    <div className="p-3 bg-bg border-t border-border">
                                      <QuizReview review={attempt.review} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* Admin Thumbnail Update Section */}
        {canManage && (
          <section className="bg-bg py-3">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        Course Thumbnail
                      </h3>
                      <p className="text-sm text-ink-muted">
                        Update the course thumbnail image
                      </p>
                    </div>
                  </div>

                  {!showThumbnailInput && (
                    <button
                      onClick={() => setShowThumbnailInput(true)}
                      className="inline-flex w-full items-center justify-center rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-primary/5 hover:text-primary sm:w-auto"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Update Thumbnail
                    </button>
                  )}
                </div>

                {/* Thumbnail Upload Interface */}
                {showThumbnailInput && (
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 text-center hover:border-primary/30 transition-colors duration-200">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-ink mb-1">
                            Upload new thumbnail
                          </p>
                          <p className="text-sm text-ink-muted">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                        <div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => inputThumbnailFile(e)}
                              className="hidden"
                            />
                            <span className="bg-surface border border-border text-ink-muted px-6 py-2 rounded-md font-medium hover:bg-bg transition-colors duration-200 inline-flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Choose File
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {courseThumbnailFile && (
                      <div className="bg-surface rounded-lg border border-border p-6">
                        <div className="flex items-center mb-4">
                          <svg
                            className="w-5 h-5 text-primary mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h4 className="text-lg font-medium text-ink">
                            Preview
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Current Thumbnail */}
                          <div>
                            <p className="text-sm font-medium text-ink-muted mb-2">
                              Current Thumbnail
                            </p>
                            <div className="relative">
                              <img
                                src={
                                  course.courseThumbnailImage ||
                                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                }
                                alt="Current Course Thumbnail"
                                className="w-full h-48 object-contain bg-gray-100 rounded-lg border border-border"
                              />
                              <div className="absolute left-2 top-2 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                                Current
                              </div>
                            </div>
                          </div>

                          {/* New Thumbnail Preview */}
                          <div>
                            <p className="text-sm font-medium text-ink-muted mb-2">
                              New Thumbnail
                            </p>
                            <div className="relative">
                              <img
                                src={courseThumbnailPreview}
                                alt="New Course Thumbnail Preview"
                                className="h-48 w-full rounded-lg border border-border bg-surface-muted object-contain"
                              />
                              <div className="absolute top-2 left-2 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-semibold text-white">
                                New
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <button
                            onClick={updateCourseThumbnail}
                            disabled={updatingThumbnail}
                            className="flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingThumbnail ? (
                              <>
                                <svg
                                  className="animate-spin w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                Upload Thumbnail
                              </>
                            )}
                          </button>

                          {!updatingThumbnail && (
                            <button
                              onClick={() => {
                                setShowThumbnailInput(false);
                                setCourseThumbnailFile(null);
                                setCourseThumbnailPreview(null);
                              }}
                              className="px-6 py-3 border border-border text-ink-muted rounded-lg font-medium hover:bg-bg transition-colors duration-200 flex items-center justify-center"
                            >
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Admin Course Access Management Section */}
        {canManage && (
          <section className="bg-bg py-3">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.196-2.121L17 20zM9 3a4 4 0 100 8 4 4 0 000-8zM3 20a6 6 0 0112 0H3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-ink">
                        Grant Course Access
                      </h3>
                      <p className="text-sm text-ink-muted">
                        Give specific users access to this course by email
                      </p>
                    </div>
                  </div>

                  {!showAccessManagement && (
                    <button
                      onClick={() => setShowAccessManagement(true)}
                      className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover sm:w-auto"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Grant Access
                    </button>
                  )}
                </div>

                {showAccessManagement && (
                  <div className="space-y-6">
                    {/* Email Input Section */}
                    <div className="rounded-2xl border border-border bg-bg/45 p-4 sm:p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-ink-muted mb-2">
                          Email Addresses
                        </label>
                        <p className="text-xs text-ink-muted/70 mb-3">
                          Enter email addresses separated by commas. Users with
                          these emails will get access to this course.
                        </p>
                        <textarea
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="user1@example.com, user2@example.com, user3@example.com"
                          rows={4}
                          className="w-full resize-none rounded-2xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                      </div>

                      {/* Email Preview */}
                      {emailInput.trim() && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-ink-muted mb-2">
                            Email Preview (
                            {
                              emailInput
                                .split(",")
                                .filter((email) => email.trim().length > 0)
                                .length
                            }{" "}
                            emails):
                          </p>
                          <div className="bg-bg rounded-md p-3 max-h-32 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                              {emailInput
                                .split(",")
                                .map((email) => email.trim())
                                .filter((email) => email.length > 0)
                                .map((email, index) => (
                                  <span
                                    key={index}
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                                        ? "bg-primary/5 text-primary border border-primary/15"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                    }`}
                                  >
                                    {email}
                                    {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                      email
                                    ) ? (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-3 h-3 ml-1"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={grantCourseAccess}
                          disabled={!emailInput.trim() || grantingAccess}
                          className="flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {grantingAccess ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-ink"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Granting Access...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Grant Access
                            </>
                          )}
                        </button>

                        {!grantingAccess && (
                          <button
                            onClick={() => {
                              setShowAccessManagement(false);
                              setEmailInput("");
                            }}
                            className="px-6 py-3 border border-border text-ink-muted rounded-lg font-medium hover:bg-bg transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Admin Access Management Section */}
        {profile.isAdmin && (
          <section className="bg-bg py-3">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-7">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-ink">
                        Admin Access Management
                      </h3>
                      <p className="text-ink-muted text-sm">
                        Grant admin privileges to specific users
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAdminManagement(!showAdminManagement)}
                    className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 sm:w-auto ${
                      showAdminManagement
                        ? "border border-border bg-bg text-ink-muted hover:bg-surface-muted"
                        : "bg-primary text-white shadow-md shadow-primary/15 hover:-translate-y-0.5 hover:bg-primary-hover"
                    }`}
                  >
                    {showAdminManagement ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Close
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Manage Admin Access
                      </>
                    )}
                  </button>
                </div>

                {showAdminManagement && (
                  <div className="mt-6 rounded-2xl border border-border bg-bg/45 p-4 sm:p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-ink mb-2">
                        Grant Admin Access
                      </h4>
                      <p className="text-ink-muted text-sm">
                        Enter an email address to grant admin privileges. The
                        user will be able to manage courses, sections, and
                        chapters.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="adminEmail"
                          className="block text-sm font-medium text-ink-muted mb-2"
                        >
                          User Email Address
                        </label>
                        <input
                          id="adminEmail"
                          type="email"
                          value={adminEmailInput}
                          onChange={(e) => setAdminEmailInput(e.target.value)}
                          placeholder="user@example.com"
                          className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                          disabled={grantingAdminAccess}
                        />
                        {adminEmailInput && (
                          <div className="mt-2 flex items-center">
                            {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              adminEmailInput
                            ) ? (
                              <div className="flex items-center text-success">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Valid email address
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center text-danger">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-sm">
                                  Invalid email format
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-accent/25 bg-accent/10 p-4">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-accent mt-0.5 mr-3 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <div>
                            <h5 className="text-sm font-semibold text-ink mb-1">
                              Important Notice
                            </h5>
                            <p className="text-sm leading-6 text-ink-muted">
                              Admin privileges grant full access to the platform
                              including course management, user management, and
                              system settings. Only grant admin access to
                              trusted users.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                        <button
                          onClick={grantAdminAccess}
                          disabled={
                            !adminEmailInput.trim() ||
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              adminEmailInput
                            ) ||
                            grantingAdminAccess
                          }
                          className="flex flex-1 items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-md shadow-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {grantingAdminAccess ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-ink"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Granting Admin Access...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                              </svg>
                              Grant Admin Access
                            </>
                          )}
                        </button>

                        {!grantingAdminAccess && (
                          <button
                            onClick={() => {
                              setShowAdminManagement(false);
                              setAdminEmailInput("");
                            }}
                            className="px-6 py-3 border border-border text-ink-muted rounded-lg font-medium hover:bg-bg transition-colors duration-200 flex items-center justify-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Course Overview Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8">
              <div className="mb-6">
                {course.creatorName && (
                  <div className="flex items-center gap-2 mb-5 text-sm">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold">
                      {course.creatorName.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-ink-muted">
                      Taught by{" "}
                      <span className="font-semibold text-ink">
                        {course.creatorName}
                      </span>
                    </span>
                  </div>
                )}
                <EditableCourseContent
                  title="Course Overview"
                  value={course.shortDescription}
                  emptyText="Add a concise overview so learners know what to expect."
                  canManage={canManage}
                  isEditing={editingCourseField === "shortDescription"}
                  draft={courseContentDraft}
                  onDraftChange={setCourseContentDraft}
                  onEdit={() => startEditingCourseField("shortDescription")}
                  onSave={saveCourseContent}
                  onCancel={cancelEditingCourseField}
                  saving={savingCourseField}
                  rows={4}
                />
              </div>

              {/* Price and Enroll Section */}
              {canView ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-[linear-gradient(135deg,rgba(242,236,221,0.7),rgba(255,255,255,0.95))] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/15">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Course access is active
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        Continue whenever you are ready.
                      </p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Enrolled
                  </span>
                </div>
              ) : course.enrollmentType === "request" ? (
                /* Request-access course: ask the instructor for approval */
                <div className="bg-surface border border-border rounded-lg p-6">
                  <div className="space-y-4">
                    {enrollmentRequestStatus === "pending" ? (
                      <div className="flex items-center justify-center text-center py-1">
                        <svg
                          className="w-6 h-6 text-amber-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-lg font-semibold text-amber-600">
                          Request Pending — awaiting instructor approval
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-center sm:text-left">
                          <div className="text-2xl font-bold text-ink mb-1">
                            {course.price > 0
                              ? `₹${Number(course.price).toFixed(2)}`
                              : "Request Access"}
                          </div>
                          <div className="text-sm text-ink-muted">
                            {enrollmentRequestStatus === "rejected"
                              ? "Your previous request was declined. You may request again."
                              : course.price > 0
                              ? "Fee payable via the enrollment form. Access is granted by the instructor once confirmed."
                              : "The instructor reviews and approves each learner."}
                          </div>
                        </div>

                        <button
                          onClick={requestEnrollment}
                          disabled={enrolling}
                          className="bg-primary text-surface px-6 py-3 rounded font-semibold hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {enrolling ? "Sending..." : "Request Enrollment"}
                        </button>
                      </div>
                    )}

                    {/* Enrollment form stays visible even after requesting */}
                    {course.googleFormLink && (
                      <a
                        href={course.googleFormLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-surface border border-primary text-primary px-6 py-3 rounded font-semibold hover:bg-primary/5 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Fill the enrollment form
                        {course.price > 0 ? " & pay" : ""}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-surface border border-border rounded-lg p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-ink mb-1">
                        {course.price === 0
                          ? "Free"
                          : `₹${Number(course.price || 0).toFixed(2)}`}
                      </div>
                      <div className="text-sm text-ink-muted">
                        {course.price === 0
                          ? "No cost to enroll"
                          : "One-time payment"}
                      </div>
                    </div>

                    <button
                      onClick={enrollCourse}
                      disabled={enrolling}
                      className="bg-primary text-surface px-6 py-3 rounded font-semibold hover:bg-primary-hover transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {enrolling ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Enroll Now
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </Reveal>
          </div>
        </section>

        {/* Course Introduction Section */}
        {(course.courseIntroduction ||
          course.courseIntroductionImages?.length > 0 ||
          canManage) && (
          <section className="py-12 bg-bg">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <Reveal className="premium-card mb-8 rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8">
                <EditableCourseContent
                  title="Course Introduction"
                  value={course.courseIntroduction}
                  emptyText="Add a welcoming introduction for your learners."
                  canManage={canManage}
                  isEditing={editingCourseField === "courseIntroduction"}
                  draft={courseContentDraft}
                  onDraftChange={setCourseContentDraft}
                  onEdit={() => startEditingCourseField("courseIntroduction")}
                  onSave={saveCourseContent}
                  onCancel={cancelEditingCourseField}
                  saving={savingCourseField}
                  rows={6}
                />
              </Reveal>

              {/* Course Gallery Section */}
              {(course.courseIntroductionImages?.length > 0 || canManage) && (
                <Reveal className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-ink">
                        Course Gallery
                      </h3>
                      <p className="text-sm text-ink-muted">
                        Visual introduction to the course content
                      </p>
                    </div>
                  </div>

                  {/* Admin Add Images Button */}
                  {canManage && !introductionImageInput && (
                    <button
                      onClick={() => setIntroductionImageInput(true)}
                      className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 font-medium text-white shadow-lg shadow-primary/15 transition-all duration-300 hover:bg-primary-hover sm:w-auto"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Images
                    </button>
                  )}
                </div>

                {/* Image Upload Interface */}
                {canManage && introductionImageInput && (
                  <div className="space-y-6 mb-8">
                    {/* File Upload Area */}
                    <div className="rounded-2xl border-2 border-dashed border-primary/20 p-6 text-center transition-colors duration-300 hover:border-primary/40">
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-ink mb-1">
                            Upload course gallery images
                          </p>
                          <p className="text-sm text-ink-muted">
                            Select multiple images to showcase your course
                          </p>
                        </div>
                        <div>
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleIntroductionImageFiles}
                              className="hidden"
                            />
                            <span className="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-primary-hover transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center shadow-lg shadow-primary/15">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              Choose Images
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Preview Section */}
                    {introductionImageFiles &&
                      introductionImageFiles.length > 0 && (
                        <div className="bg-bg rounded-lg border border-border p-6">
                          <div className="flex items-center mb-4">
                            <svg
                              className="w-5 h-5 text-primary mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h4 className="text-lg font-medium text-ink">
                              Preview ({introductionImageFiles.length} images
                              selected)
                            </h4>
                          </div>

                          {/* Image Previews Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {introductionImagePreview &&
                              introductionImagePreview.map((preview, index) => (
                                <div key={index} className="relative rounded-2xl border border-border bg-white p-3">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="h-36 w-full rounded-xl bg-surface-muted object-contain"
                                  />
                                  <div className="absolute top-5 left-5 bg-ink/75 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur">
                                    {index + 1}
                                  </div>
                                  <label className="mt-3 block">
                                    <span className="text-xs font-semibold text-ink-muted">
                                      Caption <span className="font-normal">(Optional)</span>
                                    </span>
                                    <input
                                      type="text"
                                      maxLength={240}
                                      value={introductionImageCaptions[index] || ""}
                                      onChange={(event) =>
                                        updatePendingImageCaption(index, event.target.value)
                                      }
                                      placeholder="Describe this image"
                                      className="mt-1.5 w-full rounded-xl border border-border bg-bg/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                  </label>
                                </div>
                              ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={addIntroductionImages}
                              disabled={updatingThumbnail}
                              className="flex-1 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
                            >
                              {updatingThumbnail ? (
                                <>
                                  <svg
                                    className="animate-spin w-4 h-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Uploading Images...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                  </svg>
                                  Upload Images
                                </>
                              )}
                            </button>

                            {!updatingThumbnail && (
                              <button
                                onClick={() => {
                                  setIntroductionImageInput(false);
                                  setIntroductionImageFiles(null);
                                  setIntroductionImagePreview(null);
                                  setIntroductionImageCaptions([]);
                                }}
                                className="px-6 py-3 border border-border text-ink-muted rounded-lg font-medium hover:bg-bg transition-colors duration-200 flex items-center justify-center"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}

                {/* Current Gallery Images */}
                {course.courseIntroductionImages &&
                course.courseIntroductionImages.length > 0 ? (
                  <div>
                    <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-sm text-ink-muted">
                        {course.courseIntroductionImages.length}{" "}
                        {course.courseIntroductionImages.length === 1
                          ? "image"
                          : "images"}{" "}
                        in gallery
                      </p>
                      {canManage && (
                        <span className="text-xs text-ink-muted/70">
                          Add or edit a caption for each image
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {course.courseIntroductionImages.map((image, index) => (
                        <Motion.figure
                          key={index}
                          layout
                          whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                          transition={{ duration: 0.25 }}
                          className="group overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={image}
                              alt={
                                course.courseIntroductionImageCaptions?.[index] ||
                                `Course gallery ${index + 1}`
                              }
                              role="button"
                              tabIndex={0}
                              onClick={() => setGalleryLightboxIndex(index)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  setGalleryLightboxIndex(index);
                                }
                              }}
                              className="h-52 w-full cursor-zoom-in bg-surface-muted object-contain"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-70"></div>
                            <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur">
                              {String(index + 1).padStart(2, "0")}
                            </div>
                            <button
                              type="button"
                              onClick={() => setGalleryLightboxIndex(index)}
                              className={`absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-ink group-hover:opacity-100 ${
                                canManage ? "" : "group-hover:opacity-100"
                              }`}
                              aria-label={`Enlarge gallery image ${index + 1}`}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7" />
                              </svg>
                              View
                            </button>
                            {canManage && (
                              <button
                                type="button"
                                aria-label={`Remove gallery image ${index + 1}`}
                                onClick={() => handleRemoveImage(index)}
                                className="absolute right-3 top-3 rounded-full bg-danger p-2 text-white opacity-0 shadow-lg transition-all duration-300 hover:scale-105 group-hover:opacity-100"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          <figcaption className="p-4">
                            {editingCaptionIndex === index ? (
                              <div className="space-y-3">
                                <textarea
                                  rows={2}
                                  maxLength={240}
                                  autoFocus
                                  value={captionDraft}
                                  onChange={(event) => setCaptionDraft(event.target.value)}
                                  placeholder="Add a short image caption"
                                  className="w-full resize-none rounded-xl border border-border bg-bg/60 px-3 py-2 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingCaptionIndex(null);
                                      setCaptionDraft("");
                                    }}
                                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-bg"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => saveImageCaption(index)}
                                    disabled={savingCaptionIndex === index}
                                    className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                                  >
                                    {savingCaptionIndex === index ? "Saving…" : "Save caption"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex min-h-10 items-start justify-between gap-3">
                                <p className="text-sm leading-6 text-ink-muted">
                                  {course.courseIntroductionImageCaptions?.[index] ||
                                    (canManage ? "No caption yet" : `Course image ${index + 1}`)}
                                </p>
                                {canManage && (
                                  <button
                                    type="button"
                                    onClick={() => startEditingCaption(index)}
                                    className="shrink-0 rounded-full p-2 text-primary transition hover:bg-primary/10"
                                    aria-label={`Edit caption for image ${index + 1}`}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )}
                          </figcaption>
                        </Motion.figure>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* No Images State */
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                      <svg
                        className="w-8 h-8 text-ink-muted/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-ink-muted mb-2">
                      No Gallery Images
                    </h4>
                    <p className="text-ink-muted/70 mb-4">
                      Add some images to showcase your course visually
                    </p>
                    {canManage && !introductionImageInput && (
                      <button
                        onClick={() => setIntroductionImageInput(true)}
                        className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-hover transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add First Images
                      </button>
                    )}
                  </div>
                )}
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* Course Details Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="premium-card rounded-[1.75rem] border border-border/80 bg-surface p-6 sm:p-8">
              <EditableCourseContent
                title="Course Details"
                value={course.longDescription}
                emptyText="Add learning outcomes, prerequisites, structure, or any other useful details."
                canManage={canManage}
                isEditing={editingCourseField === "longDescription"}
                draft={courseContentDraft}
                onDraftChange={setCourseContentDraft}
                onEdit={() => startEditingCourseField("longDescription")}
                onSave={saveCourseContent}
                onCancel={cancelEditingCourseField}
                saving={savingCourseField}
                rows={8}
              />
            </Reveal>
          </div>
        </section>

        {/* Sections & Chapters Display */}
        <section className="py-12 bg-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-ink mb-2">
                  Course Content
                </h2>
                <p className="text-ink-muted">
                  Explore the structured learning path designed for your
                  success.
                </p>
              </div>

              {/* Admin Add Section Button */}
              {canManage && (
                <button
                  onClick={handleAddSection}
                  className="bg-primary text-surface px-4 py-2 rounded font-medium hover:bg-primary-hover transition-colors duration-200 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Section
                </button>
              )}
            </div>

            {/* Sections List */}
            <div className="space-y-6">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section) => (
                  <SectionItem
                    key={section._id}
                    section={section}
                    onViewChapter={handleViewChapter}
                    canManage={canManage}
                    canView={canView}
                    onAddChapter={handleAddChapter}
                    sectionVideoInput={sectionVideoInput}
                    setSectionVideoInput={setSectionVideoInput}
                    sectionVideoFiles={sectionVideoFiles}
                    setSectionVideoFiles={setSectionVideoFiles}
                    sectionVideoPreview={sectionVideoPreview}
                    setSectionVideoPreview={setSectionVideoPreview}
                    sectionVideoTitles={sectionVideoTitles}
                    setSectionVideoTitles={setSectionVideoTitles}
                    handleSectionVideoFiles={handleSectionVideoFiles}
                    addSectionVideos={addSectionVideos}
                    removeSectionVideo={removeSectionVideo}
                    updateSectionVideoTitle={updateSectionVideoTitle}
                    updatingThumbnail={updatingThumbnail}
                    setCourse={setCourse}
                    quizState={sectionQuizStates[section._id]}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-border bg-surface p-6 text-center shadow-sm sm:p-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="w-8 h-8 text-ink-muted/50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-ink mb-3">
                    No Content Available Yet
                  </h3>
                  <p className="text-ink-muted mb-6 max-w-md mx-auto">
                    This course is currently being prepared. Content will be
                    available soon.
                  </p>
                  {canManage && (
                    <div>
                      <p className="text-sm text-ink-muted/70 mb-4">
                        As an admin, you can start building this course:
                      </p>
                      <button
                        onClick={handleAddSection}
                        className="bg-primary text-surface px-6 py-3 rounded font-semibold hover:bg-primary-hover transition-colors duration-200 flex items-center mx-auto"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create First Section
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {courseThumbnailExpanded && (
          <Motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110e0b]/95 px-4 py-8 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setCourseThumbnailExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Course cover image viewer"
          >
            <button
              type="button"
              onClick={() => setCourseThumbnailExpanded(false)}
              className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-white/20"
              aria-label="Close course cover"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Motion.figure
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, scale: 0.96, y: 14 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="flex max-h-full max-w-[94vw] flex-col items-center"
            >
              <img
                src={
                  course.courseThumbnailImage ||
                  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                }
                alt={course.courseName}
                className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <figcaption className="mt-4 text-center text-sm text-white/65">
                Course cover
              </figcaption>
            </Motion.figure>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {galleryLightboxIndex !== null &&
          course.courseIntroductionImages?.[galleryLightboxIndex] && (
            <Motion.div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#110e0b]/95 px-4 py-8 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setGalleryLightboxIndex(null)}
              role="dialog"
              aria-modal="true"
              aria-label="Course gallery image viewer"
            >
              <button
                type="button"
                onClick={() => setGalleryLightboxIndex(null)}
                className="absolute right-5 top-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:rotate-90 hover:bg-white/20"
                aria-label="Close image viewer"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {course.courseIntroductionImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setGalleryLightboxIndex((current) =>
                        current === 0
                          ? course.courseIntroductionImages.length - 1
                          : current - 1
                      );
                    }}
                    className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:left-6"
                    aria-label="Previous gallery image"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setGalleryLightboxIndex(
                        (current) =>
                          (current + 1) % course.courseIntroductionImages.length
                      );
                    }}
                    className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 sm:right-6"
                    aria-label="Next gallery image"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <Motion.figure
                key={galleryLightboxIndex}
                initial={
                  prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onClick={(event) => event.stopPropagation()}
                className="flex max-h-full max-w-[92vw] flex-col items-center"
              >
                <img
                  src={course.courseIntroductionImages[galleryLightboxIndex]}
                  alt={
                    course.courseIntroductionImageCaptions?.[
                      galleryLightboxIndex
                    ] || `Course gallery ${galleryLightboxIndex + 1}`
                  }
                  className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
                <figcaption className="mt-4 max-w-2xl text-center text-sm leading-6 text-white/75 sm:text-base">
                  {course.courseIntroductionImageCaptions?.[
                    galleryLightboxIndex
                  ] || `Course gallery · ${galleryLightboxIndex + 1} of ${course.courseIntroductionImages.length}`}
                </figcaption>
              </Motion.figure>
            </Motion.div>
          )}
      </AnimatePresence>
    </>
  );
};

export default Course;
