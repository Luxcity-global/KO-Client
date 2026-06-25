'use client';

import { useCallback, useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import '@/app/fact-find.css';
import { FactFindCompletion } from '@/components/fact-find/fact-find-completion';
import { FactFindDotPager } from '@/components/fact-find/fact-find-dot-pager';
import { FactFindQuestionCard } from '@/components/fact-find/fact-find-question-card';
import { FactFindSaveStatus } from '@/components/fact-find/fact-find-save-status';
import { FactFindSectionStrip } from '@/components/fact-find/fact-find-section-strip';
import { UploadDocumentsModal } from '@/components/fact-find/modals/upload-documents-modal';
import { MissingFieldsModal } from '@/components/fact-find/modals/missing-fields-modal';
import { useFactFindNavigation } from '@/components/fact-find/questions/use-fact-find-navigation';
import { useFactFind } from '@/hooks/use-fact-find';
import { validateQuestion, collectMissingFields } from '@/lib/fact-find/validation';

type FactFindWizardProps = {
  caseId: string;
  caseReference?: string;
  prefill?: { firstName?: string; lastName?: string; email?: string };
  preview?: boolean;
  onComplete?: () => void;
};

export function FactFindWizard({
  caseId,
  caseReference = 'KOF-2025-0042',
  prefill,
  preview = false,
  onComplete,
}: FactFindWizardProps) {
  const { form, updateField, save, isSaving, saveLabel } = useFactFind(caseId, prefill);
  const {
    visibleQuestions,
    index,
    current,
    progressPct,
    sectionGroups,
    direction,
    goNext,
    goBack,
    goToSection,
    isComplete,
    setIndex,
  } = useFactFindNavigation(form);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [missingFields, setMissingFields] = useState<ReturnType<typeof collectMissingFields>>([]);

  const handleNext = useCallback(() => {
    if (!current || preview) return;
    const err = validateQuestion(current, form);
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError(null);

    if (index === visibleQuestions.length - 1) {
      // Last question — check ALL required fields before submitting
      const missing = collectMissingFields(visibleQuestions, form);
      if (missing.length > 0) {
        setMissingFields(missing);
        return;
      }
      void save().then(() => {
        setFinished(true);
        onComplete?.();
      });
      return;
    }
    goNext();
  }, [current, preview, form, index, visibleQuestions, save, goNext, onComplete]);

  const handleBack = useCallback(() => {
    setFieldError(null);
    goBack();
  }, [goBack]);

  const handleSkip = useCallback(() => {
    setFieldError(null);
    goNext();
  }, [goNext]);

  const handleFixField = useCallback(
    (questionIndex: number) => {
      setIndex(questionIndex);
      setMissingFields([]);
      setFieldError(null);
    },
    [setIndex],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (preview || finished || showUpload || missingFields.length > 0) return;
      if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleBack();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handleBack, preview, finished, showUpload, missingFields.length]);

  if (finished) {
    return (
      <div className="relative flex min-h-full flex-col bg-[#FAFBFC]">
        <FactFindCompletion caseReference={caseReference} sectionsCompleted={8} />
      </div>
    );
  }

  if (!current) {
    return null;
  }

  return (
    <div
      className={`relative flex min-h-full flex-col bg-gradient-to-br from-[#FAFBFC] via-[#FAFBFC] to-brand-teal-50/30 ${preview ? 'pointer-events-none select-none' : ''}`}
      aria-hidden={preview}
    >
      {/* Progress bar */}
      <div className="fixed top-0 right-0 left-0 z-50 h-[3px] bg-[#e4e4e7] lg:left-[254px]">
        <div
          className="h-full bg-brand-teal-700 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-end border-b border-[#e4e4e7]/60 bg-white/95 px-6 py-3 pt-4 backdrop-blur-sm">
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {!preview && <FactFindSaveStatus label={saveLabel} saving={isSaving} />}
          <span>
            {index + 1} / {visibleQuestions.length}
          </span>
        </div>
      </header>

      <FactFindSectionStrip
        groups={sectionGroups}
        onSelect={(id) => !preview && goToSection(id as never)}
      />

      {/* Question */}
      <div className="mx-auto w-full max-w-[672px] flex-1 px-6 py-8">
        <FactFindQuestionCard
          key={current.id}
          question={current}
          questionNumber={index + 1}
          form={form}
          onChange={updateField}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={index === 0}
          isLast={isComplete}
          error={fieldError}
          direction={direction}
        />
      </div>

      <FactFindDotPager total={visibleQuestions.length} current={index} />

      {/* Upload documents FAB */}
      {!preview && (
        <button
          type="button"
          className="ff-upload-fab"
          onClick={() => setShowUpload(true)}
          aria-label="Upload supporting documents"
        >
          <Paperclip className="h-4 w-4" aria-hidden />
          Upload documents
        </button>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadDocumentsModal caseId={caseId} onClose={() => setShowUpload(false)} />
      )}

      {/* Missing fields modal */}
      {missingFields.length > 0 && (
        <MissingFieldsModal
          fields={missingFields}
          onFix={handleFixField}
          onDismiss={() => setMissingFields([])}
        />
      )}
    </div>
  );
}
