import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the captured still image blob (JPEG). */
  onCapture: (blob: Blob) => void;
  /** Optional label shown while requesting permission. */
  title?: string;
}

export function CameraCapture({ open, onOpenChange, onCapture, title = 'Take a photo' }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setCaptured(null);
    setCapturedBlob(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera is not supported in this browser. Use the Files button instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStreaming(true);
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError') {
        setError('Camera permission was denied. Allow camera access in your browser, or use the Files button.');
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setError('No camera was found on this device. Use the Files button instead.');
      } else {
        setError('Could not start the camera. Use the Files button instead.');
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      void startCamera();
    } else {
      stopStream();
      setCaptured(null);
      setCapturedBlob(null);
      setError(null);
    }
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !streaming) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);
    canvas.toBlob((blob) => {
      if (blob) setCapturedBlob(blob);
    }, 'image/jpeg', 0.92);
    // Release the camera while the user reviews the shot (battery + indicator UX).
    stopStream();
  }, [streaming, stopStream]);

  const acceptPhoto = useCallback(() => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      onOpenChange(false);
    }
  }, [capturedBlob, onCapture, onOpenChange]);

  const retake = useCallback(() => {
    setCaptured(null);
    setCapturedBlob(null);
    void startCamera();
  }, [startCamera]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" aria-hidden="true" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Point your camera at the hazard, then tap the shutter. The photo is geotagged with your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
          {!captured && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              aria-label="Live camera preview"
            />
          )}
          {captured && (
            <img src={captured} alt="Captured photo preview" className="h-full w-full object-cover" />
          )}
          {!streaming && !captured && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-400" aria-hidden="true" />
              <p className="text-sm text-slate-300">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void startCamera()}>
                <RefreshCw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                Try again
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <AnimatePresence mode="wait">
            {!captured ? (
              <motion.div
                key="shutter"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button
                  type="button"
                  onClick={captureFrame}
                  disabled={!streaming}
                  aria-label="Capture photo"
                  className="h-14 w-14 rounded-full p-0"
                >
                  <Camera className="h-6 w-6" aria-hidden="true" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="actions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3"
              >
                <Button type="button" variant="outline" onClick={retake}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Retake
                </Button>
                <Button type="button" onClick={acceptPhoto} disabled={!capturedBlob}>
                  <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                  Use photo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <X className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Camera frames stay on this device until you attach them to your report.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export default CameraCapture;
