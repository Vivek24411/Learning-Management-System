import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

export default function SectionVideoPlayer() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideo = async () => {
      try {
        /**
         * We already have course → sections → videos
         * So easiest + safest:
         * reuse getCourse, then find video by ID
         */
        const res = await api.get("/user/getCourse", {
          params: { courseId: window.location.pathname.split("/")[2] }
        });

        const course = res.data.course;

        let found = null;
        course.sections.forEach((section) => {
          section.videos?.forEach((v) => {
            if (v._id === videoId) found = v;
          });
        });

        if (!found) {
          toast.error("Video not found");
          navigate(-1);
          return;
        }

        setVideo(found);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [videoId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading video…
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center gap-4 p-4 bg-black text-white">
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-3 py-1 border border-gray-600 rounded"
        >
          ← Back
        </button>
        <h1 className="font-semibold">{video.title}</h1>
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center bg-black">
        <video
          src={video.videoUrl}
          controls
          autoPlay
          className="max-w-full max-h-full"
        />
      </div>
    </div>
  );
}
