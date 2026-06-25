'use client';

import { useCallback, useRef, useState } from 'react';

export type UploadError = 'too-large' | 'unsupported' | null;
export type UploadStatus = 'idle' | 'uploading' | 'success' | 'stalled';

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg']);
const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg']);

export function useFactFindUpload(_caseId: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<UploadError>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [docType, setDocType] = useState('personal');

  const selectFile = useCallback((f: File) => {
    setError(null);
    const ext = (f.name.toLowerCase().match(/\.[^.]+$/) ?? [''])[0];
    if (!ALLOWED_MIME.has(f.type) && !ALLOWED_EXT.has(ext)) {
      setError('unsupported');
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('too-large');
      setFile(null);
      return;
    }
    setFile(f);
    setStatus('idle');
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const triggerBrowse = useCallback(() => inputRef.current?.click(), []);

  const uploadFile = useCallback(
    async (caseId: string): Promise<boolean> => {
      if (!file) return false;
      setStatus('uploading');
      try {
        const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
        if (isMock) {
          await new Promise<void>((r) => setTimeout(r, 900));
          setStatus('success');
          return true;
        }
        const body = new FormData();
        body.append('file', file);
        body.append('docType', docType);
        const res = await fetch(`/api/portal/cases/${caseId}/documents`, {
          method: 'POST',
          body,
        });
        if (!res.ok) throw new Error('Upload failed');
        setStatus('success');
        return true;
      } catch {
        setStatus('stalled');
        return false;
      }
    },
    [file, docType],
  );

  return { file, error, status, docType, setDocType, selectFile, clearFile, triggerBrowse, uploadFile, inputRef };
}
