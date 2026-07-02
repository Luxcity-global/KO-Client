'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ffInitForm,
  ffLoadFromStorage,
  ffSaveToStorage,
  type ClientFactFindForm,
} from '@/lib/fact-find/form-state';
import { deserializeFactFind } from '@/lib/fact-find/deserialize';
import { serializeFactFind } from '@/lib/fact-find/serialize';
import { completeFactFind, fetchFactFind, updateFactFind } from '@/lib/api/portal-data';

export type SaveLabel = 'idle' | 'saving' | 'saved' | 'offline';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export function useFactFind(
  caseId: string,
  prefill?: { firstName?: string; lastName?: string; email?: string },
) {
  const [form, setForm] = useState<ClientFactFindForm>(() => {
    if (typeof window !== 'undefined') {
      const stored = ffLoadFromStorage(caseId);
      if (stored) return stored;
    }
    return ffInitForm(prefill);
  });
  const [saveLabel, setSaveLabel] = useState<SaveLabel>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(USE_MOCK);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (USE_MOCK) return;

    let cancelled = false;

    async function loadFromApi() {
      try {
        const data = await fetchFactFind();
        if (cancelled) return;

        const stored = ffLoadFromStorage(caseId);
        if (!stored && data) {
          const hydrated = deserializeFactFind(data, prefill);
          setForm(hydrated);
          ffSaveToStorage(caseId, hydrated);
        }
      } catch {
        // Keep local draft if API load fails
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void loadFromApi();
    return () => {
      cancelled = true;
    };
  }, [caseId, prefill]);

  const persist = useCallback(
    async (nextForm: ClientFactFindForm, markComplete = false) => {
      ffSaveToStorage(caseId, nextForm);
      setIsSaving(true);
      setSaveLabel('saving');

      const payload = serializeFactFind(nextForm);

      try {
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 400));
        } else if (markComplete) {
          await completeFactFind();
        } else {
          await updateFactFind(payload);
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

  return { form, updateField, save: complete, isSaving, saveLabel, isLoaded, setForm };
}
