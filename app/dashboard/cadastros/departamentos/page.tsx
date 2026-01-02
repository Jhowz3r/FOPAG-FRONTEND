"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

interface Departamento {
  id: number;
  codigo: number;
  descricao: string;
  idDivisao: number;
  createdAt: string;
}

export default function DepartamentosPage() {
  const router = useRouter();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [divisoes, setDivisoes] = useState<{ id: number; descricao: string }[]>([]);
  const [filtroDivisao, setFiltroDivisao] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadDivisoes();
    loadDepartamentos();
  }, [filtroDivisao]);

  const loadDivisoes = async () => {
    try {
      const response = await api.get("/divisoes").catch(() => ({ data: [] }));
      setDivisoes(response.data);
    } catch (error) {
      setDivisoes([]);
    }
  };

  const loadDepartamentos = async () => {
    try {
      setLoading(true);
      const params = filtroDivisao ? { idDivisao: filtroDivisao } : {};
      const response = await api.get("/departamentos", { params });
      setDepartamentos(response.data);
    } catch (error: any) {
      setError("Erro ao carregar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este departamento?")) {
      return;
    }

    try {
      await api.delete(`/departamentos/${id}`);
      loadDepartamentos();
    } catch (error: any) {
      setError("Erro ao excluir departamento");
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
        <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
        <Link href="/dashboard/cadastros/departamentos/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Departamento
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Filtrar por Divisão"
            options={[
              { value: "", label: "Todas" },
              ...divisoes.map((divisao) => ({
                value: divisao.id.toString(),
                label: divisao.descricao,
              })),
            ]}
            value={filtroDivisao}
            onChange={(e) => setFiltroDivisao(e.target.value)}
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
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Divisão
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data de Cadastro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departamentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum departamento cadastrado
                </td>
              </tr>
            ) : (
              departamentos.map((departamento) => (
                <tr key={departamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {departamento.codigo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {departamento.descricao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {divisoes.find((d) => d.id === departamento.idDivisao)?.descricao || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(departamento.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/cadastros/departamentos/edit/${departamento.id}`)
                        }
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(departamento.id)}
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

