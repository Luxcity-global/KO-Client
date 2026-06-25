'use client';

import { useCallback, useMemo, useState } from 'react';
import type { ClientFactFindForm, FactFindSectionId } from '@/lib/fact-find/form-state';
import {
  getVisibleQuestions,
  SECTION_GROUPS,
} from '@/components/fact-find/questions/question-registry';

export function useFactFindNavigation(form: ClientFactFindForm) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const visibleQuestions = useMemo(() => getVisibleQuestions(form), [form]);
  const total = visibleQuestions.length;
  const current = visibleQuestions[index];
  const progressPct = total > 0 ? ((index + 1) / total) * 100 : 0;

  const sectionGroups = useMemo(() => {
    return SECTION_GROUPS.map((group) => {
      const questions = visibleQuestions.filter((q) => q.section === group.id);
      const firstIndex = visibleQuestions.findIndex((q) => q.section === group.id);
      const lastIndex = questions.length
        ? visibleQuestions.reduce((acc, q, idx) => (q.section === group.id ? idx : acc), -1)
        : -1;

      let status: 'active' | 'done' | 'pending' = 'pending';
      if (current?.section === group.id) status = 'active';
      else if (lastIndex >= 0 && index > lastIndex) status = 'done';
      else if (firstIndex >= 0 && index > firstIndex) status = 'done';

      return { ...group, status, firstIndex };
    });
  }, [visibleQuestions, current, index]);

  const goNext = useCallback(() => {
    setDirection('forward');
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goBack = useCallback(() => {
    setDirection('back');
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToSection = useCallback(
    (sectionId: FactFindSectionId) => {
      const target = visibleQuestions.findIndex((q) => q.section === sectionId);
      if (target >= 0) {
        setDirection(target > index ? 'forward' : 'back');
        setIndex(target);
      }
    },
    [visibleQuestions, index],
  );

  const isComplete = index === total - 1 && total > 0;

  return {
    visibleQuestions,
    index,
    current,
    total,
    progressPct,
    sectionGroups,
    direction,
    goNext,
    goBack,
    goToSection,
    isComplete,
    setIndex,
  };
}
