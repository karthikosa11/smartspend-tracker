import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageSrc = canvas.toDataURL('image/jpeg');
      stopCamera();
      onCapture(imageSrc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white backdrop-blur-sm">
          <X size={24} />
        </button>
      </div>

      {error ? (
        <div className="text-white p-4 text-center">
          <p>{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-white text-black rounded">Close</button>
        </div>
      ) : (
        <>
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
             {/* Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute bottom-8 w-full flex justify-center items-center gap-8">
             {/* Controls */}
             <button onClick={() => { stopCamera(); startCamera(); }} className="p-3 bg-white/10 rounded-full text-white backdrop-blur">
                <RefreshCcw size={20} />
             </button>
             
             <button 
              onClick={takePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 backdrop-blur-sm active:scale-95 transition-transform"
             >
                <div className="w-12 h-12 bg-white rounded-full"></div>
             </button>

             <div className="w-12 h-12"></div> {/* Spacer for balance */}
          </div>
        </>
      )}
    </div>
  );
};

