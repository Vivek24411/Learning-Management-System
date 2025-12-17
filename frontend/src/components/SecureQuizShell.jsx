import { useEffect, useRef, useState } from "react";

/**
 * SecureQuizShell
 * - Mandatory fullscreen + camera before quiz start
 * - Live camera preview (NOT recorded)
 * - Blur / visibility / escape / fullscreen-exit enforcement
 * - Psychological deterrence only (no data stored)
 */

export default function SecureQuizShell({ children, onDisqualify }) {
  const [started, setStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [disqualified, setDisqualified] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /* ---------- camera helpers ---------- */

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    } catch (_) {
      // ignore
    } finally {
      setCameraActive(false);
    }
  };

  const requestFullscreen = async () => {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch (_) {
      // fullscreen failure is handled later
    }
  };

  const startCamera = async () => {
    setPermissionError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionError("Camera API not supported in this browser.");
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        videoRef.current.srcObject = stream;

        try {
          await videoRef.current.play();
        } catch (_) {
          // autoplay might be blocked but stream exists
        }
      }

      setCameraActive(true);
      return stream;
    } catch (err) {
      if (err?.name === "NotAllowedError") {
        setPermissionError(
          "Camera access was blocked. Please allow camera permission and reload."
        );
      } else if (err?.name === "NotFoundError") {
        setPermissionError("No camera found on this device.");
      } else {
        setPermissionError("Failed to access camera.");
      }
      return null;
    }
  };

  /* ---------- enforcement ---------- */

  const triggerWarning = (reason) => {
    console.warn("suspicious event:", reason);

    setWarnings((prev) => {
      const next = prev + 1;

      if (next === 1) {
        alert(
          "⚠ Warning: Do not switch tabs, press Escape, or leave fullscreen. Next violation will disqualify you."
        );
      }

      if (next >= 2) {
        setDisqualified(true);
        stopCamera();
        try {
          document.exitFullscreen?.();
        } catch (_) {}
        onDisqualify?.();
      }

      return next;
    });
  };

  /* ---------- lifecycle enforcement ---------- */

  useEffect(() => {
    if (!started || disqualified) return;

    const handleBlur = () => triggerWarning("window-blur");

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        triggerWarning("visibility-hidden");
      }
    };

    // fullscreen exit = instant disqualification
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        setDisqualified(true);
        stopCamera();
        onDisqualify?.();
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, [started, disqualified]);

  // Escape key detection
  useEffect(() => {
    if (!started || disqualified) return;

    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        triggerWarning("escape-pressed");
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started, disqualified]);

  // cleanup
  useEffect(() => {
    return () => stopCamera();
  }, []);

  /* ---------- start flow ---------- */

  const handleStart = async () => {
    setPermissionError("");

    await requestFullscreen();

    const stream = await startCamera();
    if (!stream) return; // HARD REQUIRE camera

    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500)); // fake verification delay
    setVerifying(false);

    setStarted(true);
  };

  /* ---------- render ---------- */

  if (disqualified) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-center text-red-200">
        <h2 className="text-2xl font-bold mb-2">🚫 Disqualified</h2>
        <p>
          Multiple violations detected (tab switching / fullscreen exit).
          Your attempt has been locked.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mt-4">
        <h2 className="text-xl font-semibold text-indigo-300 mb-3">
          Proctored Exam Environment
        </h2>

        <ul className="text-gray-300 text-sm list-disc list-inside mb-4 space-y-1">
          <li>Quiz runs in fullscreen.</li>
          <li>Camera access is mandatory (no recording).</li>
          <li>Leaving fullscreen or switching tabs may disqualify you.</li>
        </ul>

        {permissionError && (
          <p className="text-red-400 mb-3">{permissionError}</p>
        )}

        {verifying ? (
          <p className="text-indigo-300 text-sm">
            Verifying camera feed…
          </p>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300"
            >
              Start Quiz
            </button>

            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 rounded-lg text-gray-200 border border-gray-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[300px,1fr] gap-6 mt-6">
      {/* Camera panel */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-400">
            Camera Preview
          </p>
          <span
            className={`w-3 h-3 rounded-full ${
              cameraActive ? "bg-green-400" : "bg-red-500"
            }`}
          ></span>
        </div>

        <div className="w-full min-h-[260px] bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover"
            style={{ minHeight: 260 }}
          />
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Warnings:{" "}
          <span className="text-yellow-300 font-semibold">
            {warnings}
          </span>{" "}
          / 2
        </div>
      </div>

      {/* Quiz content */}
      <div
        className="flex flex-col"
        onCopy={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
      >
        {children}
      </div>
    </div>
  );
}
