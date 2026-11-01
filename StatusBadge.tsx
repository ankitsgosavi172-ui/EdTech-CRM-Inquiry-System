const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  contacted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  interested: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  follow_up_scheduled: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  application_submitted: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  admission_confirmed: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  not_interested: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  unreachable: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  on_hold: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  lost: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {label}
    </span>
  );
}
