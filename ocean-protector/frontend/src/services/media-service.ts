import { API_URL } from './api-client';
import { supabase } from '@/lib/supabase';
import type { MediaUrl } from '@/types';

export interface UploadResult {
  url: string;
  mimeType: string;
  size: number;
}

const uploadBlob = async (blob: Blob, filename: string, contentType: string): Promise<UploadResult> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const form = new FormData();
  form.append('file', blob, filename);

  const response = await fetch(`${API_URL}/api/v1/media`, {
    method: 'POST',
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
    body: form,
  });

  if (!response.ok) {
    let message = 'Upload failed';
    try {
      const body = await response.json();
      message = body?.error?.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const body = await response.json();
  return { url: body.data.mediaUrl, mimeType: body.data.mimeType || contentType, size: body.data.size || blob.size };
};

export const mediaService = {
  async upload(file: File, geotag?: { latitude?: number; longitude?: number }): Promise<MediaUrl> {
    const result = await uploadBlob(file, file.name, file.type);
    return {
      url: result.url,
      filename: file.name,
      contentType: result.mimeType || file.type,
      size: result.size || file.size,
      uploadedAt: new Date().toISOString(),
      latitude: geotag?.latitude,
      longitude: geotag?.longitude,
    };
  },

  async uploadBlob(blob: Blob, filename: string, contentType: string): Promise<UploadResult> {
    return uploadBlob(blob, filename, contentType);
  },
};
