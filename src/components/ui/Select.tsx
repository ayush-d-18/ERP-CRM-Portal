import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}

export default function Select({
  label,
  error,
  placeholder,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = "",
  name,
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={clsx(
            "w-full px-4 py-2 rounded-lg border-2 bg-white appearance-none transition-colors",
            "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-slate-200 hover:border-slate-300",
            disabled && "bg-slate-50 text-slate-500 cursor-not-allowed",
            className
          )}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
