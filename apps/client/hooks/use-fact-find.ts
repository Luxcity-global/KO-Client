'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ffInitForm,
  ffLoadFromStorage,
  ffSaveToStorage,
  type ClientFactFindForm,
} from '@/lib/fact-find/form-state';
import { serializeFactFind } from '@/lib/fact-find/serialize';

export type SaveLabel = 'idle' | 'saving' | 'saved' | 'offline';

export function useFactFind(caseId: string, prefill?: { firstName?: string; lastName?: string; email?: string }) {
  const [form, setForm] = useState<ClientFactFindForm>(() => {
    if (typeof window !== 'undefined') {
      const stored = ffLoadFromStorage(caseId);
      if (stored) return stored;
    }
    return ffInitForm(prefill);
  });
  const [saveLabel, setSaveLabel] = useState<SaveLabel>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = useCallback(
    async (nextForm: ClientFactFindForm, markComplete = false) => {
      ffSaveToStorage(caseId, nextForm);
      setIsSaving(true);
      setSaveLabel('saving');

      const payload = serializeFactFind(nextForm);
      if (markComplete) payload.markComplete = true;

      try {
        if (process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false') {
          await new Promise((r) => setTimeout(r, 400));
        } else {
          // Real API when broker ships
          const { portalFetch } = await import('@/lib/api/client');
          await portalFetch(`/api/portal/cases/${caseId}/fact-find`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        }
        setSaveLabel('saved');
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaveLabel('idle'), 2500);
      } catch {
        setSaveLabel('offline');
      } finally {
        setIsSaving(false);
      }
    },
    [caseId],
  );

  const scheduleSave = useCallback(
    (nextForm: ClientFactFindForm) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => persist(nextForm), 2000);
    },
    [persist],
  );

  const updateField = useCallback(
    (updater: (prev: ClientFactFindForm) => ClientFactFindForm) => {
      setForm((prev) => {
        const next = updater(prev);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const complete = useCallback(() => persist(form, true), [form, persist]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  return { form, updateField, save: complete, isSaving, saveLabel, setForm };
}
