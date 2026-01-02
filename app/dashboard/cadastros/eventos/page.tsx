"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

interface Evento {
  id: number;
  codEvento: number;
  descricao?: string;
  descricaoAbreviada?: string;
  tipoProventoDesconto?: number;
  idTabelaEvento: number;
  createdAt: string;
}

export default function EventosPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [tabelasEvento, setTabelasEvento] = useState<{ id: number; descricao: string }[]>([]);
  const [filtroTabela, setFiltroTabela] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadTabelasEvento();
    loadEventos();
  }, [filtroTabela]);

  const loadTabelasEvento = async () => {
    try {
      const response = await api.get("/tabela-eventos").catch(() => ({ data: [] }));
      setTabelasEvento(response.data);
    } catch (error) {
      setTabelasEvento([]);
    }
  };

  const loadEventos = async () => {
    try {
      setLoading(true);
      const params = filtroTabela ? { idTabelaEvento: filtroTabela } : {};
      const response = await api.get("/eventos", { params });
      setEventos(response.data);
    } catch (error: any) {
      setError("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
      return;
    }

    try {
      await api.delete(`/eventos/${id}`);
      loadEventos();
    } catch (error: any) {
      setError("Erro ao excluir evento");
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
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <Link href="/dashboard/cadastros/eventos/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Filtrar por Tabela de Eventos"
            options={[
              { value: "", label: "Todas" },
              ...tabelasEvento.map((tabela) => ({
                value: tabela.id.toString(),
                label: tabela.descricao,
              })),
            ]}
            value={filtroTabela}
            onChange={(e) => setFiltroTabela(e.target.value)}
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
                Descrição Abreviada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {eventos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum evento cadastrado
                </td>
              </tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {evento.codEvento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evento.descricao || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evento.descricaoAbreviada || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {evento.tipoProventoDesconto === 1 ? "Provento" : evento.tipoProventoDesconto === 2 ? "Desconto" : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/cadastros/eventos/edit/${evento.id}`)
                        }
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evento.id)}
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
