"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";

interface Processo {
  id: number;
  tipoProcesso: number;
  mes: number;
  ano: number;
  numeroFolha: number;
  tipoFolha: number;
  dataProcessamento?: string;
  dataPagamento?: string;
  empresaInicial?: number;
  empresaFinal?: number;
  filialInicial?: number;
  filialFinal?: number;
  funcionarioInicial?: number;
  funcionarioFinal?: number;
}

interface Recibo {
  id: number;
  idProcesso: number;
  idFuncionario: number;
  funcionario?: {
    nomeFuncionario: string;
    matricula: number;
  };
  mes: number;
  ano: number;
  numeroFolha: number;
  totalProventos?: number;
  totalDescontos?: number;
  totalLiquido?: number;
}

export default function ProcessoDetalhesPage() {
  const router = useRouter();
  const params = useParams();
  const processoId = params.id as string;
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (processoId) {
      loadProcesso(Number(processoId));
      loadRecibos(Number(processoId));
    }
  }, [processoId]);

  const loadProcesso = async (id: number) => {
    try {
      const response = await api.get(`/processos/${id}`);
      setProcesso(response.data);
    } catch (error: any) {
      setError("Erro ao carregar processo");
    }
  };

  const loadRecibos = async (idProcesso: number) => {
    try {
      // Tentar buscar recibos do processo
      // Se não houver endpoint específico, buscar todos e filtrar
      const response = await api.get(`/recibos?idProcesso=${idProcesso}`).catch(() => ({ data: [] }));
      setRecibos(response.data);
    } catch (error) {
      setRecibos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!processo) {
    return (
      <div>
        <p className="text-red-600">Processo não encontrado</p>
      </div>
    );
  }

  const totalProventos = recibos.reduce((sum, r) => sum + (r.totalProventos || 0), 0);
  const totalDescontos = recibos.reduce((sum, r) => sum + (r.totalDescontos || 0), 0);
  const totalLiquido = recibos.reduce((sum, r) => sum + (r.totalLiquido || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Processo {processo.mes.toString().padStart(2, "0")}/{processo.ano}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Processo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Competência:</span>
              <span className="font-medium">
                {processo.mes.toString().padStart(2, "0")}/{processo.ano}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo de Folha:</span>
              <span className="font-medium">
                {processo.tipoFolha === 1
                  ? "Mensal"
                  : processo.tipoFolha === 2
                  ? "13º Salário"
                  : processo.tipoFolha === 3
                  ? "Férias"
                  : processo.tipoFolha === 4
                  ? "Rescisão"
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Número da Folha:</span>
              <span className="font-medium">{processo.numeroFolha}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Processamento:</span>
              <span className="font-medium">
                {processo.dataProcessamento
                  ? new Date(processo.dataProcessamento).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Pagamento:</span>
              <span className="font-medium">
                {processo.dataPagamento
                  ? new Date(processo.dataPagamento).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Totais</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de Recibos:</span>
              <span className="font-medium">{recibos.length}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Total Proventos:</span>
              <span className="font-bold">
                R$ {totalProventos.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Total Descontos:</span>
              <span className="font-bold">
                R$ {totalDescontos.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between text-primary-600 border-t pt-2 mt-2">
              <span className="font-semibold">Total Líquido:</span>
              <span className="font-bold text-lg">
                R$ {totalLiquido.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recibos Gerados</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matrícula
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proventos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descontos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Líquido
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recibos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhum recibo gerado ainda. Processe o processo para gerar recibos.
                </td>
              </tr>
            ) : (
              recibos.map((recibo) => (
                <tr key={recibo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {recibo.funcionario?.nomeFuncionario || `Funcionário ${recibo.idFuncionario}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {recibo.funcionario?.matricula || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    R$ {(recibo.totalProventos || 0).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    R$ {(recibo.totalDescontos || 0).toFixed(2).replace(".", ",")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                    R$ {(recibo.totalLiquido || 0).toFixed(2).replace(".", ",")}
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

