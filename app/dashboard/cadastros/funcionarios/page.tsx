"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

interface Funcionario {
  id: number;
  matricula: number;
  nomeFuncionario: string;
  cpf?: string;
  idEmpresa: number;
  dataAdmissao?: string;
  createdAt: string;
}

export default function FuncionariosPage() {
  const router = useRouter();
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [empresas, setEmpresas] = useState<{ id: number; razaoSocial?: string }[]>([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadEmpresas();
    loadFuncionarios();
  }, [filtroEmpresa]);

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresas").catch(() => ({ data: [] }));
      setEmpresas(response.data);
    } catch (error) {
      setEmpresas([]);
    }
  };

  const loadFuncionarios = async () => {
    try {
      setLoading(true);
      const params = filtroEmpresa ? { idEmpresa: filtroEmpresa } : {};
      const response = await api.get("/funcionarios", { params });
      setFuncionarios(response.data);
    } catch (error: any) {
      setError("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este funcionário?")) {
      return;
    }

    try {
      await api.delete(`/funcionarios/${id}`);
      loadFuncionarios();
    } catch (error: any) {
      setError("Erro ao excluir funcionário");
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
        <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
        <Link href="/dashboard/cadastros/funcionarios/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Funcionário
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Filtrar por Empresa"
            options={[
              { value: "", label: "Todas" },
              ...empresas.map((empresa) => ({
                value: empresa.id.toString(),
                label: empresa.razaoSocial || `Empresa ${empresa.id}`,
              })),
            ]}
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
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
                Matrícula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Admissão
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {funcionarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum funcionário cadastrado
                </td>
              </tr>
            ) : (
              funcionarios.map((funcionario) => (
                <tr key={funcionario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {funcionario.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {funcionario.nomeFuncionario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {funcionario.cpf || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {empresas.find((e) => e.id === funcionario.idEmpresa)?.razaoSocial || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {funcionario.dataAdmissao
                      ? new Date(funcionario.dataAdmissao).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/cadastros/funcionarios/edit/${funcionario.id}`)
                        }
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(funcionario.id)}
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
