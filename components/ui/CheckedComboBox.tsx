"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CheckedComboBoxOption {
  value: string | number;
  label: string;
}

interface CheckedComboBoxProps {
  label?: string;
  options: CheckedComboBoxOption[];
  checked?: boolean[];
  onChange?: (checked: boolean[]) => void;
  error?: string;
  className?: string;
  placeholder?: string;
}

export const CheckedComboBox: React.FC<CheckedComboBoxProps> = ({
  label,
  options,
  checked = [],
  onChange,
  error,
  className,
  placeholder = "Selecione...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalChecked, setInternalChecked] = useState<boolean[]>(
    checked.length > 0 ? checked : new Array(options.length).fill(false)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (checked.length > 0) {
      setInternalChecked(checked);
    }
  }, [checked]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = (index: number) => {
    const newChecked = [...internalChecked];
    newChecked[index] = !newChecked[index];
    setInternalChecked(newChecked);
    onChange?.(newChecked);
  };

  const handleSelectAll = () => {
    const allChecked = new Array(options.length).fill(true);
    setInternalChecked(allChecked);
    onChange?.(allChecked);
  };

  const handleDeselectAll = () => {
    const allUnchecked = new Array(options.length).fill(false);
    setInternalChecked(allUnchecked);
    onChange?.(allUnchecked);
  };

  const selectedCount = internalChecked.filter(Boolean).length;
  const displayText =
    selectedCount === 0
      ? placeholder
      : selectedCount === options.length
      ? "Todos selecionados"
      : `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}`;

  return (
    <div className={cn("w-full relative", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white text-left flex items-center justify-between",
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300"
        )}
      >
        <span className={selectedCount === 0 ? "text-gray-400" : "text-gray-900"}>
          {displayText}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200 flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1"
            >
              Marcar todas
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1"
            >
              Desmarcar todas
            </button>
          </div>
          <div className="p-2">
            {options.map((option, index) => (
              <label
                key={option.value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  checked={internalChecked[index] || false}
                  onChange={() => handleToggle(index)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

CheckedComboBox.displayName = "CheckedComboBox";

