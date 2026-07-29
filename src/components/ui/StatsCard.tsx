import type { ReactNode } from "react";
import clsx from "clsx";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "red";
  subtitle?: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
  loading = false,
}: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div
          className={clsx(
            "w-12 h-12 rounded-lg flex items-center justify-center text-xl",
            colorClasses[color]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
