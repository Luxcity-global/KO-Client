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
  return (
    <div className="shrink-0 overflow-x-auto border-b border-[#e4e4e7]/60 bg-white/95 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-full items-center justify-center px-6 py-8">
        {groups.map((group, i) => (
          <div key={group.id} className="flex items-center">
            <button
              type="button"
              onClick={() => onSelect(group.id)}
              className={`ff-sg-pill ${group.status === 'active' ? 'ff-active' : group.status === 'done' ? 'ff-done' : 'ff-pending'}`}
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
                className={`ff-sg-connector ${group.status === 'done' ? 'ff-conn-done' : 'ff-conn-pending'}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
