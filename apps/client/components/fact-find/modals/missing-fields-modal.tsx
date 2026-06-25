'use client';

import { ArrowRight, X } from 'lucide-react';
import type { MissingField } from '@/lib/fact-find/validation';

interface MissingFieldsModalProps {
  fields: MissingField[];
  onFix: (questionIndex: number) => void;
  onDismiss: () => void;
}

export function MissingFieldsModal({ fields, onFix, onDismiss }: MissingFieldsModalProps) {
  return (
    <div
      className="ff-missing-modal-wrap"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onDismiss()}
    >
      <div className="ff-missing-modal">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f0f0f0] px-6 py-5">
          <div>
            <h2
              id="missing-modal-title"
              className="font-heading text-xl font-bold text-[#18181b]"
            >
              Required fields missing
            </h2>
            <p className="mt-1 text-sm text-[#71717a]">
              {fields.length} field{fields.length === 1 ? '' : 's'} must be completed before this
              fact-find can be submitted.
            </p>
          </div>
          <button
            type="button"
            className="ff-close-btn ml-4 mt-0.5"
            onClick={onDismiss}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Field list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-3">
            {fields.map((f) => (
              <div key={f.questionIndex} className="ff-missing-item">
                <div className="min-w-0 flex-1">
                  <p className="ff-missing-item-label" style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                    {f.sectionLabel}: {f.fieldLabel}
                  </p>
                  <p className="ff-missing-item-reason" style={{ fontSize: 12, color: '#a16207', marginTop: 2 }}>
                    {f.reason}
                  </p>
                </div>
                <button
                  type="button"
                  className="ff-missing-fix"
                  onClick={() => {
                    onFix(f.questionIndex);
                    onDismiss();
                  }}
                  aria-label={`Fix ${f.fieldLabel}`}
                >
                  Fix
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#f0f0f0] px-6 py-4">
          <p className="text-[13px] text-[#71717a]">Complete all fields to enable submission</p>
          <button type="button" className="ff-review-later" onClick={onDismiss}>
            Review later
          </button>
        </div>
      </div>
    </div>
  );
}
