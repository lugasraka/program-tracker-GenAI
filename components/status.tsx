export type StatusTone = "green" | "amber" | "red" | "slate";

export function statusTone(status: string): StatusTone {
  switch (status) {
    case "On track":
    case "Accelerating":
      return "green";
    case "At risk":
    case "Steady":
    case "Medium":
      return "amber";
    case "Off track":
    case "Blocked":
    case "Slowing":
    case "High":
      return "red";
    default:
      return "slate";
  }
}

export const toneClasses: Record<StatusTone, string> = {
  green: "bg-ggreen-tint text-ggreen-dark border-ggreen-tint",
  amber: "bg-gyellow-tint text-gyellow-dark border-gyellow-tint",
  red: "bg-gred-tint text-gred-dark border-gred-tint",
  slate: "bg-[#f1f3f4] text-gmuted border-[#f1f3f4]",
};

export function Badge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
