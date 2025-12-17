import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { toast } from "react-toastify";

export default function AddSectionVideo() {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !video) {
      toast.error("Video title and video file are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("sectionId", sectionId);
      formData.append("title", title);
      formData.append("video", video);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await api.post("/user/addSectionVideo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Section video uploaded successfully");
      navigate(-1);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-1">Add Section Video</h1>
        <p className="text-sm text-gray-500 mb-6">
          Upload a video for this section. Thumbnail is optional.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to Graphs"
              className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video File
            </label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files[0])}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: mp4, webm, mov
              </p>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail <span className="text-gray-400">(optional)</span>
            </label>

            <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setThumbnail(file);
                  setPreview(file ? URL.createObjectURL(file) : null);
                }}
                className="w-full"
              />

              {preview && (
                <img
                  src={preview}
                  alt="Thumbnail preview"
                  className="mt-4 rounded-lg max-h-40 border"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Uploading…" : "Upload Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
