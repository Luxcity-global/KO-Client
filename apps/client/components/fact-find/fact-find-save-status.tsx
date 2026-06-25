import type { SaveLabel } from '@/hooks/use-fact-find';

export function FactFindSaveStatus({
  label,
  saving,
}: {
  label: SaveLabel;
  saving: boolean;
}) {
  if (label === 'offline') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-2.5 py-1 text-xs font-semibold text-[#B45309]">
        Offline
      </span>
    );
  }

  if (saving || label === 'saving') {
    return <span className="text-xs font-medium text-[#f59e0b]">Saving…</span>;
  }

  if (label === 'saved') {
    return <span className="text-xs font-medium text-brand-teal-700">Saved</span>;
  }

  return null;
}
