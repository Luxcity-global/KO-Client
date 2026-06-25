'use client';

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

type SectionGroup = {
  id: string;
  stripLabel: string;
  status: 'active' | 'done' | 'pending';
};

export function FactFindSectionStrip({
  groups,
  onSelect,
}: {
  groups: SectionGroup[];
  onSelect: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active section pill into view whenever the active section changes
  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;

    const containerLeft = container.scrollLeft;
    const containerWidth = container.offsetWidth;
    const buttonLeft = active.offsetLeft;
    const buttonWidth = active.offsetWidth;
    const targetScroll = buttonLeft - containerWidth / 2 + buttonWidth / 2;

    container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }, [groups]);

  return (
    <div
      ref={scrollRef}
      className="shrink-0 overflow-x-auto border-b border-[#e4e4e7]/60 bg-white/95 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Mobile: left-aligned scrollable strip. Desktop: centred, full-width. */}
      <div className="flex w-max items-center gap-1 px-6 py-4 lg:min-w-full lg:w-auto lg:justify-center lg:gap-0 lg:py-8">
        {groups.map((group, i) => (
          <div key={group.id} className="flex items-center">
            <button
              ref={group.status === 'active' ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(group.id)}
              className={`ff-sg-pill ${
                group.status === 'active'
                  ? 'ff-active'
                  : group.status === 'done'
                    ? 'ff-done'
                    : 'ff-pending'
              }`}
            >
              {group.status === 'done' ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <span className="text-[9px] font-bold">{i + 1}</span>
              )}
              {group.stripLabel}
            </button>
            {i < groups.length - 1 && (
              <span
                className={`ff-sg-connector ${
                  group.status === 'done' ? 'ff-conn-done' : 'ff-conn-pending'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
