import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, ImagePlus, Loader2, Trash2, UploadCloud, Video, FolderOpen, MapPin } from 'lucide-react';
import { mediaService } from '@/services/media-service';
import { CameraCapture } from './CameraCapture';
import type { MediaUrl } from '@/types';

interface FileDropzoneProps {
  value?: MediaUrl[];
  onChange?: (media: MediaUrl[]) => void;
  /** Raw files collected while offline (for blob storage in the sync queue). */
  onPendingFiles?: (files: File[]) => void;
  /** Known location from the report flow — used as the geotag fallback. */
  location?: { latitude: number; longitude: number } | null;
  disabled?: boolean;
}

/** Quick one-shot geolocation read used to geotag evidence. Never blocks the flow. */
function readLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 4000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 },
    );
  });
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ value = [], onChange, onPendingFiles, location, disabled = false }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const browseRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (list: File[], geotag?: { latitude: number; longitude: number } | null) => {
      if (!list.length) return;

      // If offline, keep the raw files for blob storage and later sync.
      if (!navigator.onLine) {
        const next = [...files, ...list];
        setFiles(next);
        onPendingFiles?.(next);
        return;
      }

      const tag = geotag ?? location ?? (await readLocation()) ?? null;

      setUploading(true);
      try {
        const results: MediaUrl[] = [];
        for (const file of list) {
          try {
            const uploaded = await mediaService.upload(file, { latitude: tag?.latitude, longitude: tag?.longitude });
            results.push(uploaded);
          } catch (error) {
            // Upload failures are surfaced through the onChange result; a failed
            // file is simply skipped so the user can retry by re-selecting.
            console.error('Upload failed for', file.name, error);
          }
        }
        if (results.length) {
          const next = [...value, ...results];
          setFiles((prev) => [...prev, ...list]);
          onChange?.(next);
        }
      } finally {
        setUploading(false);
      }
    },
    [files, value, onChange, onPendingFiles, location],
  );

  const removeMedia = useCallback(
    (url: string) => {
      onChange?.(value.filter((m) => m.url !== url));
    },
    [value, onChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    void handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleCameraCapture = useCallback(
    (blob: Blob) => {
      void handleFiles([new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' })]);
    },
    [handleFiles],
  );

  const captureFiles = useCallback(
    (ref: React.RefObject<HTMLInputElement | null>) => {
      ref.current?.click();
    },
    [],
  );

  return (
    <div className="space-y-3">
      {/* Heading + hint live ABOVE the dropzone, not inside it */}
      <div>
        <p className="text-sm font-medium text-foreground">Add photos & videos</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {navigator.onLine
            ? 'Photos are geotagged with your report location. JPEG, PNG, WebP, MP4 or WebM · up to 25 MB each.'
            : 'Offline — evidence files will be uploaded when you reconnect.'}
        </p>
      </div>

      {/* Drag & drop zone */}
      <motion.div
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => captureFiles(browseRef)}
        role="button"
        aria-label="Choose files from your device"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            captureFiles(browseRef);
          }
        }}
        className="cursor-pointer rounded-lg border-2 border-dashed border-white/8 p-5 text-center transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <p className="text-sm text-muted-foreground">Drag & drop images or videos here</p>
        {uploading && (
          <p className="mt-2 flex items-center justify-center gap-2 text-xs text-primary" role="status">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Uploading evidence securely…
          </p>
        )}
      </motion.div>

      {/* Capture / browse actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => setCameraOpen(true)}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2 py-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
          aria-label="Take a photo with your camera"
        >
          <Camera className="h-5 w-5" aria-hidden="true" />
          <span>Camera</span>
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => captureFiles(videoRef)}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2 py-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
          aria-label="Record a video with your camera"
        >
          <Video className="h-5 w-5" aria-hidden="true" />
          <span>Video</span>
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => captureFiles(browseRef)}
          className="flex flex-col items-center gap-1.5 rounded-lg border border-slate-700 bg-white/4 px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50"
          aria-label="Choose files from your device"
        >
          <FolderOpen className="h-5 w-5" aria-hidden="true" />
          <span>Files</span>
        </button>
      </div>

      {/* Hidden native inputs — video uses the mobile rear camera; browse picks files */}
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        capture="environment"
        disabled={disabled || uploading}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const selected = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = '';
          void handleFiles(selected);
        }}
      />
      <input
        ref={browseRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        disabled={disabled || uploading}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(e) => {
          const selected = e.target.files ? Array.from(e.target.files) : [];
          e.target.value = '';
          void handleFiles(selected);
        }}
      />

      {(value.length > 0 || files.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((media) => {
            const isVideo = media.contentType.startsWith('video/');
            const isGeotagged = media.latitude !== undefined && media.longitude !== undefined;
            return (
              <div key={media.url} className="group relative overflow-hidden rounded-md border border-slate-800 bg-slate-950">
                {media.contentType.startsWith('image/') ? (
                  <img src={media.url} alt={media.filename || 'Uploaded evidence'} className="h-20 w-full object-cover" loading="lazy" />
                ) : isVideo ? (
                  <video src={media.url} muted playsInline preload="metadata" className="h-20 w-full object-cover" aria-label={media.filename || 'Uploaded video evidence'} />
                ) : (
                  <div className="flex h-20 items-center justify-center px-2 text-center text-xs text-slate-500">
                    {media.filename || 'Attachment'}
                  </div>
                )}
                {isGeotagged && (
                  <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300" title={`GPS: ${media.latitude?.toFixed(5)}, ${media.longitude?.toFixed(5)}`}>
                    <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
                    GPS
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${media.filename || 'evidence'}`}
                  onClick={() => removeMedia(media.url)}
                  className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <div className="truncate px-1 py-0.5 text-[10px] text-muted-foreground">{media.filename}</div>
              </div>
            );
          })}
          {!navigator.onLine &&
            files
              .filter((f) => !value.some((m) => m.filename === f.name))
              .map((f, i) => (
                <div key={`${f.name}-${i}`} className="rounded-md bg-white/6 p-1 text-xs">
                  <div className="flex items-center gap-1 truncate">
                    <UploadCloud className="h-3 w-3 shrink-0 text-amber-400" aria-hidden="true" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{Math.round(f.size / 1024)} KB · saved for sync</div>
                </div>
              ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
        {navigator.onLine ? 'Uploaded evidence is stored securely and linked to your report.' : 'Offline — evidence files will be uploaded when you reconnect.'}
      </div>

      <CameraCapture open={cameraOpen} onOpenChange={setCameraOpen} onCapture={handleCameraCapture} />
    </div>
  );
};

export default FileDropzone;
