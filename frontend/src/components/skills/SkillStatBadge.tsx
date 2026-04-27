const colorMap = {
  amber: "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  sky: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  red: "bg-red-500/10 text-red-400 ring-red-500/20",
} as const;

interface SkillStatBadgeProps {
  icon: string;
  value: string | number;
  label: string;
  color: keyof typeof colorMap;
}

export function SkillStatBadge({ icon, value, label, color }: SkillStatBadgeProps) {
  return (
    <span
      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${colorMap[color]}`}
    >
      <span aria-hidden>{icon}</span>
      {value} {label}
    </span>
  );
}
