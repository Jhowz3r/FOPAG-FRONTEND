"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

interface Feriado {
  id: number;
  dataFeriado: string;
  descricao: string;
  tipoFeriado: number;
  idFilial?: number;
  feriadoParcial?: boolean;
  horaInicio?: string;
  horaFinal?: string;
  createdAt: string;
}

export default function FeriadosPage() {
  const router = useRouter();
  const [feriados, setFeriados] = useState<Feriado[]>([]);
  const [filiais, setFiliais] = useState<{ id: number; descricao: string }[]>([]);
  const [filtroFilial, setFiltroFilial] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadFiliais();
    loadFeriados();
  }, [filtroFilial]);

  const loadFiliais = async () => {
    try {
      const response = await api.get("/filiais").catch(() => ({ data: [] }));
      setFiliais(response.data);
    } catch (error) {
      setFiliais([]);
    }
  };

  const loadFeriados = async () => {
    try {
      setLoading(true);
      const params = filtroFilial ? { idFilial: filtroFilial } : {};
      const response = await api.get("/feriados", { params });
      setFeriados(response.data);
    } catch (error: any) {
      setError("Erro ao carregar feriados");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este feriado?")) {
      return;
    }

    try {
      await api.delete(`/feriados/${id}`);
      loadFeriados();
    } catch (error: any) {
      setError("Erro ao excluir feriado");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feriados</h1>
        <Link href="/dashboard/cadastros/feriados/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Feriado
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Filtrar por Filial"
            options={[
              { value: "", label: "Todas" },
              ...filiais.map((filial) => ({
                value: filial.id.toString(),
                label: filial.descricao,
              })),
            ]}
            value={filtroFilial}
            onChange={(e) => setFiltroFilial(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filial
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parcial
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feriados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum feriado cadastrado
                </td>
              </tr>
            ) : (
              feriados.map((feriado) => (
                <tr key={feriado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(feriado.dataFeriado).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feriado.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feriado.tipoFeriado === 1 ? "Nacional" : feriado.tipoFeriado === 2 ? "Estadual" : feriado.tipoFeriado === 3 ? "Municipal" : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feriado.idFilial ? filiais.find((f) => f.id === feriado.idFilial)?.descricao || "-" : "Todas"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {feriado.feriadoParcial ? "Sim" : "Não"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/cadastros/feriados/edit/${feriado.id}`)
                        }
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(feriado.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

