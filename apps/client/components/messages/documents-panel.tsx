'use client';

import { useRef } from 'react';
import { Check, FileText, Upload, X } from 'lucide-react';
import type { PortalDocumentTask } from '@/lib/api/portal-data';
import { cn } from '@/lib/utils';

export function DocumentsPanel({
  documents,
  onUpload,
  onRemove,
}: {
  documents: PortalDocumentTask[];
  onUpload: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} onUpload={onUpload} onRemove={onRemove} />
        ))}
      </div>
      <p className="text-xs text-[#71717a]">
        * Required documents. Files are uploaded securely to your broker&apos;s encrypted storage.
      </p>
    </div>
  );
}

function DocumentCard({
  doc,
  onUpload,
  onRemove,
}: {
  doc: PortalDocumentTask;
  onUpload: (id: string, file: File) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        'rounded-xl p-5 transition-colors',
        doc.completed
          ? 'border border-[#bbf7d0] bg-[#f0fdf4]/40'
          : 'border border-dashed border-[#d4d4d8] bg-white',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            doc.completed
              ? 'border-brand-teal-700 bg-brand-teal-700 text-white'
              : 'border-[#d4d4d8] bg-white',
          )}
        >
          {doc.completed && <Check className="h-3 w-3" strokeWidth={3} />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#18181b]">
            {doc.title}
            {doc.required && <span className="text-red-500">*</span>}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[#71717a]">{doc.description}</p>

          {doc.completed && doc.fileName ? (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f4f4f5] px-3 py-2">
              <FileText className="h-4 w-4 shrink-0 text-[#71717a]" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#18181b]">
                {doc.fileName}
              </span>
              <button
                type="button"
                onClick={() => onRemove(doc.id)}
                className="text-[#71717a] hover:text-red-600"
                aria-label={`Remove ${doc.fileName}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(doc.id, file);
                }}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#378add] hover:underline"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden />
                Click to upload or drag & drop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
