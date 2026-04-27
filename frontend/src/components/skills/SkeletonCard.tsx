interface SkeletonCardProps {
  index: number;
}

export function SkeletonCard({ index }: SkeletonCardProps) {
  return (
    <div
      className="skeleton-pulse h-28 rounded-2xl ring-1 ring-[var(--border-subtle)]"
      style={{
        background: "var(--surface-ghost)",
        animationDelay: `${index * 80}ms`,
      }}
    />
  );
}
