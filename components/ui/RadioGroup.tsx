"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string | number;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  className?: string;
  columns?: number;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  className,
  columns = 1,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex gap-4",
          columns === 2 && "grid grid-cols-2 gap-4",
          columns === 3 && "grid grid-cols-3 gap-4"
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

RadioGroup.displayName = "RadioGroup";


