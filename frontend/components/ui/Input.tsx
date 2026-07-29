import type { ReactNode } from "react";
import clsx from "clsx";

interface InputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export default function Input({
  label,
  error,
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
  disabled = false,
  className = "",
  name,
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={clsx(
            "w-full px-4 py-2 rounded-lg border-2 bg-white transition-colors",
            "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            icon ? "pl-10" : "pl-4",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-slate-200 hover:border-slate-300",
            disabled && "bg-slate-50 text-slate-500 cursor-not-allowed",
            className
          )}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
