'use client';

import { useCallback, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Upload, X } from 'lucide-react';
import { useFactFindUpload } from '@/hooks/use-fact-find-upload';

const DOC_TYPE_OPTIONS = [
  { value: 'personal', label: 'Personal details' },
  { value: 'employment', label: 'Employment' },
  { value: 'income', label: 'Income' },
  { value: 'commitments', label: 'Financial commitments' },
  { value: 'property', label: 'Property details' },
  { value: 'adverseCredit', label: 'Adverse credit' },
  { value: 'goals', label: 'Goals & preferences' },
  { value: 'vulnerability', label: 'Vulnerability assessment' },
  { value: 'other', label: 'Other / general' },
];

interface UploadDocumentsModalProps {
  caseId: string;
  onClose: () => void;
}

export function UploadDocumentsModal({ caseId, onClose }: UploadDocumentsModalProps) {
  const { file, error, status, docType, setDocType, selectFile, clearFile, triggerBrowse, uploadFile, inputRef } =
    useFactFindUpload(caseId);

  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) selectFile(dropped);
    },
    [selectFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) selectFile(selected);
    },
    [selectFile],
  );

  const handleUpload = useCallback(async () => {
    const ok = await uploadFile(caseId);
    if (ok) {
      // Brief pause so the user sees the success state, then close
      await new Promise<void>((r) => setTimeout(r, 800));
      onClose();
    }
  }, [uploadFile, caseId, onClose]);

  // Determine dropzone variant
  const dropzoneClass =
    error === 'too-large' || error === 'unsupported'
      ? 'ff-upload-dropzone ff-upload-dropzone--error'
      : status === 'stalled'
        ? 'ff-upload-dropzone ff-upload-dropzone--amber'
        : status === 'success'
          ? 'ff-upload-dropzone ff-upload-dropzone--success'
          : isDragging
            ? 'ff-upload-dropzone ff-upload-dropzone--hover'
            : 'ff-upload-dropzone';

  const isError = error === 'too-large' || error === 'unsupported';
  const isStalled = status === 'stalled';
  const isSuccess = status === 'success';
  const isUploading = status === 'uploading';

  return (
    <div
      className="ff-upload-modal-wrap"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div className="ff-upload-modal">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#f0f0f0] px-5 py-4">
          <div className="ff-upload-dropzone-icon mt-0.5 !mb-0 !h-10 !w-10" style={{ height: 40, width: 40, minWidth: 40 }}>
            <Upload size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="upload-modal-title" className="ff-upload-title">
              Upload supporting documents
            </h2>
            <p className="ff-upload-subtitle mt-1">
              Got payslips, bank statements or ID to hand? Upload them now to help auto-fill this
              fact-find.
            </p>
          </div>
          <button
            type="button"
            className="ff-close-btn mt-0.5"
            onClick={onClose}
            aria-label="Close upload modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {/* Document type select */}
          <p className="ff-upload-section-label">Document relates to</p>
          <div className="relative">
            <select
              className="ff-upload-select"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              aria-label="Document type"
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* chevron icon */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -mt-2"
              width="12" height="8" viewBox="0 0 12 8" fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 1l5 5 5-5" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Dropzone */}
          <div
            className={dropzoneClass}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isError && !isSuccess && !isUploading && !isStalled && triggerBrowse()}
            tabIndex={isError || isSuccess || isStalled ? -1 : 0}
            role={isError || isSuccess || isStalled ? undefined : 'button'}
            aria-label="Drag and drop area"
            onKeyDown={(e) => e.key === 'Enter' && triggerBrowse()}
          >
            {/* Error: too large */}
            {error === 'too-large' && (
              <>
                <div className="ff-upload-dropzone-icon ff-upload-dropzone-icon--error">
                  <AlertTriangle size={18} />
                </div>
                <p className="ff-upload-dropzone-title ff-upload-dropzone-title--error">
                  File exceeds 20 MB limit
                </p>
                <p className="ff-upload-dropzone-desc">
                  Please compress the file or upload a PDF, PNG, or JPEG instead.
                </p>
                <button
                  type="button"
                  className="ff-upload-browse ff-upload-browse--error"
                  onClick={(e) => { e.stopPropagation(); clearFile(); triggerBrowse(); }}
                >
                  Choose a different file
                </button>
              </>
            )}

            {/* Error: unsupported type */}
            {error === 'unsupported' && (
              <>
                <div className="ff-upload-dropzone-icon ff-upload-dropzone-icon--error">
                  <AlertTriangle size={18} />
                </div>
                <p className="ff-upload-dropzone-title ff-upload-dropzone-title--error">
                  Unsupported file type
                </p>
                <p className="ff-upload-dropzone-desc">
                  We can&apos;t read .pages, .heic, or raw image formats. Please upload a PDF, PNG,
                  or JPEG.
                </p>
                <button
                  type="button"
                  className="ff-upload-browse ff-upload-browse--error"
                  onClick={(e) => { e.stopPropagation(); clearFile(); triggerBrowse(); }}
                >
                  Choose a different file
                </button>
              </>
            )}

            {/* Stalled */}
            {isStalled && !isError && (
              <>
                <div className="ff-upload-dropzone-icon ff-upload-dropzone-icon--amber">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <p className="ff-upload-dropzone-title ff-upload-dropzone-title--amber">
                  Upload stalled
                </p>
                <p className="ff-upload-dropzone-desc">
                  We&apos;re having trouble uploading your file. You can continue manually and retry
                  later.
                </p>
              </>
            )}

            {/* Success */}
            {isSuccess && !isError && (
              <>
                <div className="ff-upload-dropzone-icon ff-upload-dropzone-icon--success">
                  <CheckCircle size={18} />
                </div>
                <p className="ff-upload-dropzone-title ff-upload-dropzone-title--success">
                  Uploaded successfully
                </p>
                <p className="ff-upload-dropzone-desc" style={{ wordBreak: 'break-all' }}>
                  {file?.name}
                </p>
              </>
            )}

            {/* Uploading */}
            {isUploading && !isError && (
              <>
                <div className="ff-upload-dropzone-icon">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <p className="ff-upload-dropzone-title">Uploading…</p>
                <p className="ff-upload-dropzone-desc">Please wait</p>
              </>
            )}

            {/* File selected, ready to upload */}
            {file && !isError && !isUploading && !isSuccess && !isStalled && (
              <>
                <div className="ff-upload-dropzone-icon ff-upload-dropzone-icon--success">
                  <CheckCircle size={18} />
                </div>
                <p className="ff-upload-dropzone-title" style={{ color: '#15803d' }}>
                  {file.name}
                </p>
                <p className="ff-upload-dropzone-desc">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB — ready to upload
                </p>
                <button
                  type="button"
                  className="ff-upload-browse"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                >
                  Remove
                </button>
              </>
            )}

            {/* Idle / default */}
            {!file && !isError && !isUploading && !isSuccess && !isStalled && (
              <>
                <div className="ff-upload-dropzone-icon">
                  <Upload size={18} />
                </div>
                <p className="ff-upload-dropzone-title">Drag and drop files here</p>
                <p className="ff-upload-dropzone-desc">PDF, PNG, or JPEG — up to 20 MB</p>
                <button
                  type="button"
                  className="ff-upload-browse"
                  onClick={(e) => { e.stopPropagation(); triggerBrowse(); }}
                >
                  Browse files
                </button>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={inputRef}
            id="ff-upload-file-input"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleInputChange}
            aria-label="Upload file"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#f0f0f0] px-5 py-3">
          <span className="text-[13px] text-[#a1a1aa]">
            {file && !isError ? file.name : 'No documents uploaded yet'}
          </span>
          <div className="flex items-center gap-3">
            {file && !isError && !isSuccess && !isUploading && (
              <button
                type="button"
                className="ff-upload-browse"
                style={{ marginTop: 0 }}
                onClick={() => void handleUpload()}
                disabled={isUploading}
              >
                <Upload size={14} />
                Upload
              </button>
            )}
            {!isSuccess && (
              <button type="button" className="ff-upload-skip" onClick={onClose}>
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
