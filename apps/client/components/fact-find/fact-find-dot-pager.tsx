const MAX_DOTS = 12;

export function FactFindDotPager({ total, current }: { total: number; current: number }) {
  const showOverflow = total > MAX_DOTS;
  const dotCount = showOverflow ? MAX_DOTS - 1 : total;

  return (
    <div className="flex shrink-0 items-center justify-center gap-1 px-6 py-10">
      {Array.from({ length: dotCount }).map((_, i) => {
        let cls = 'ff-dot ff-dot-future';
        if (i === current) cls = 'ff-dot ff-dot-active';
        else if (i < current) cls = 'ff-dot ff-dot-past';
        return <span key={i} className={cls} />;
      })}
      {showOverflow && <span className="text-xs text-[#71717a]">+{total - dotCount}</span>}
    </div>
  );
}
