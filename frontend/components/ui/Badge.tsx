import clsx from "clsx";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "default";
  label: string;
  className?: string;
}

export default function Badge({
  variant = "default",
  label,
  className = "",
}: BadgeProps) {
  const variantClasses = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
