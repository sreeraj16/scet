import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo Evidence'
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setLoading(false);
    } catch (err) {
      console.warn('Camera access error:', err);
      // Generate a mock photo preview if camera is not accessible in browser environment
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 640;
      mockCanvas.height = 480;
      const ctx = mockCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 640, 480);
        ctx.fillStyle = '#10b981';
        ctx.font = '20px sans-serif';
        ctx.fillText('WasteLoop Camera Preview (Simulated)', 140, 240);
      }
      setCapturedImage(mockCanvas.toDataURL('image/jpeg'));
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-500" />
              <p className="text-xs">Initializing Camera...</p>
            </div>
          )}

          {errorMsg && (
            <div className="p-6 text-center text-rose-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-semibold">{errorMsg}</p>
            </div>
          )}

          {/* Video Stream */}
          {!capturedImage && !errorMsg && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* Captured Image Display */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured evidence"
              className="w-full h-full object-cover"
            />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Target Reticle */}
          {!capturedImage && !loading && (
            <div className="absolute inset-8 border-2 border-emerald-500/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-500 absolute top-0 left-0" />
              <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-500 absolute top-0 right-0" />
              <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-500 absolute bottom-0 left-0" />
              <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-500 absolute bottom-0 right-0" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Use Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={takePhoto}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
              >
                <Camera className="w-4 h-4" />
                <span>Capture</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
