"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TimeInput } from "./TimeInput";

interface QuadroHorarioItem {
  diaSemana: number;
  entrada1?: string;
  saida1?: string;
  entrada2?: string;
  saida2?: string;
  entrada3?: string;
  saida3?: string;
  totalHoras?: string;
}

interface QuadroHorarioProps {
  label?: string;
  value?: QuadroHorarioItem[];
  onChange?: (value: QuadroHorarioItem[]) => void;
  error?: string;
  className?: string;
}

const DIAS_SEMANA = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

export const QuadroHorario: React.FC<QuadroHorarioProps> = ({
  label,
  value = [],
  onChange,
  error,
  className,
}) => {
  const [items, setItems] = useState<QuadroHorarioItem[]>(() => {
    if (value.length > 0) {
      return value;
    }
    // Inicializar com todos os dias da semana
    return DIAS_SEMANA.map((dia) => ({
      diaSemana: dia.value,
    }));
  });

  useEffect(() => {
    if (value.length > 0) {
      setItems(value);
    }
  }, [value]);

  const updateItem = (diaSemana: number, field: keyof QuadroHorarioItem, newValue: string) => {
    const newItems = items.map((item) => {
      if (item.diaSemana === diaSemana) {
        return { ...item, [field]: newValue || undefined };
      }
      return item;
    });
    setItems(newItems);
    onChange && onChange(newItems);
  };

  const getItem = (diaSemana: number): QuadroHorarioItem => {
    return items.find((item) => item.diaSemana === diaSemana) || { diaSemana };
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dia
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada 1
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saída 1
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada 2
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saída 2
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrada 3
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saída 3
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Horas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {DIAS_SEMANA.map((dia) => {
                const item = getItem(dia.value);
                return (
                  <tr key={dia.value} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dia.label}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.entrada1 || ""}
                        onChange={(e) => updateItem(dia.value, "entrada1", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.saida1 || ""}
                        onChange={(e) => updateItem(dia.value, "saida1", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.entrada2 || ""}
                        onChange={(e) => updateItem(dia.value, "entrada2", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.saida2 || ""}
                        onChange={(e) => updateItem(dia.value, "saida2", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.entrada3 || ""}
                        onChange={(e) => updateItem(dia.value, "entrada3", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.saida3 || ""}
                        onChange={(e) => updateItem(dia.value, "saida3", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="time"
                        step="1"
                        value={item.totalHoras || ""}
                        onChange={(e) => updateItem(dia.value, "totalHoras", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

