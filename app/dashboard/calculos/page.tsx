"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Play, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DateInput } from "@/components/ui/DateInput";
import api from "@/lib/axios";

const processoSchema = z.object({
  tipoProcesso: z.number().min(1, "Tipo de processo é obrigatório"),
  mes: z.number().min(1).max(12, "Mês deve ser entre 1 e 12"),
  ano: z.number().min(2000, "Ano deve ser maior ou igual a 2000"),
  numeroFolha: z.number().min(1, "Número da folha deve ser maior ou igual a 1"),
  tipoFolha: z.number().min(1, "Tipo de folha é obrigatório"),
  dataPagamento: z.string().optional(),
  empresaInicial: z.number().optional(),
  empresaFinal: z.number().optional(),
  filialInicial: z.number().optional(),
  filialFinal: z.number().optional(),
  funcionarioInicial: z.number().optional(),
  funcionarioFinal: z.number().optional(),
});

type ProcessoFormData = z.infer<typeof processoSchema>;

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

export default function CalculosPage() {
  const router = useRouter();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [empresas, setEmpresas] = useState<{ id: number; razaoSocial?: string }[]>([]);
  const [filiais, setFiliais] = useState<{ id: number; descricao?: string }[]>([]);
  const [funcionarios, setFuncionarios] = useState<{ id: number; nomeFuncionario: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [processandoId, setProcessandoId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProcessoFormData>({
    resolver: zodResolver(processoSchema),
    defaultValues: {
      tipoProcesso: 1,
      tipoFolha: 1, // MENSAL
      numeroFolha: 1,
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    loadProcessos();
    loadEmpresas();
    loadFiliais();
    loadFuncionarios();
  }, []);

  const loadProcessos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/processos");
      setProcessos(response.data);
    } catch (error: any) {
      setErrorMessage("Erro ao carregar processos");
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresas").catch(() => ({ data: [] }));
      setEmpresas(response.data);
    } catch (error) {
      setEmpresas([]);
    }
  };

  const loadFiliais = async () => {
    try {
      const response = await api.get("/filiais").catch(() => ({ data: [] }));
      setFiliais(response.data);
    } catch (error) {
      setFiliais([]);
    }
  };

  const loadFuncionarios = async () => {
    try {
      const response = await api.get("/funcionarios").catch(() => ({ data: [] }));
      setFuncionarios(response.data);
    } catch (error) {
      setFuncionarios([]);
    }
  };

  const onSubmit = async (data: ProcessoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        tipoProcesso: data.tipoProcesso,
        mes: data.mes,
        ano: data.ano,
        numeroFolha: data.numeroFolha,
        tipoFolha: data.tipoFolha,
        dataPagamento: data.dataPagamento || undefined,
        empresaInicial: data.empresaInicial || undefined,
        empresaFinal: data.empresaFinal || undefined,
        filialInicial: data.filialInicial || undefined,
        filialFinal: data.filialFinal || undefined,
        funcionarioInicial: data.funcionarioInicial || undefined,
        funcionarioFinal: data.funcionarioFinal || undefined,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.post("/processos", payload);
      setSuccessMessage("Processo criado com sucesso!");
      setShowForm(false);
      reset();
      loadProcessos();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao criar processo"
      );
    }
  };

  const handleProcessar = async (id: number) => {
    if (!confirm("Deseja processar este processo de folha? Esta ação calculará as folhas de todos os funcionários selecionados.")) {
      return;
    }

    try {
      setProcessandoId(id);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await api.post(`/processos/${id}/processar`);
      setSuccessMessage(
        `Processamento concluído! ${response.data.recibosCriados || 0} recibos criados.`
      );
      loadProcessos();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao processar folha"
      );
    } finally {
      setProcessandoId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este processo?")) {
      return;
    }

    try {
      await api.delete(`/processos/${id}`);
      loadProcessos();
    } catch (error: any) {
      setErrorMessage("Erro ao excluir processo");
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
        <h1 className="text-2xl font-bold text-gray-900">Cálculos de Folha</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancelar" : "Novo Processo"}
        </Button>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Criar Novo Processo</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tipo de Processo"
                  type="number"
                  {...register("tipoProcesso", { valueAsNumber: true })}
                  error={errors.tipoProcesso?.message}
                  required
                />
                <Select
                  label="Tipo de Folha"
                  options={[
                    { value: 1, label: "Mensal" },
                    { value: 2, label: "13º Salário" },
                    { value: 3, label: "Férias" },
                    { value: 4, label: "Rescisão" },
                  ]}
                  {...register("tipoFolha", { valueAsNumber: true })}
                  error={errors.tipoFolha?.message}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Mês"
                  type="number"
                  min={1}
                  max={12}
                  {...register("mes", { valueAsNumber: true })}
                  error={errors.mes?.message}
                  required
                />
                <Input
                  label="Ano"
                  type="number"
                  min={2000}
                  {...register("ano", { valueAsNumber: true })}
                  error={errors.ano?.message}
                  required
                />
                <Input
                  label="Número da Folha"
                  type="number"
                  min={1}
                  {...register("numeroFolha", { valueAsNumber: true })}
                  error={errors.numeroFolha?.message}
                  required
                />
              </div>

              <DateInput
                label="Data de Pagamento"
                {...register("dataPagamento")}
                error={errors.dataPagamento?.message}
              />

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros (Opcionais)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Empresa Inicial"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...empresas.map((empresa) => ({
                        value: empresa.id,
                        label: empresa.razaoSocial || `Empresa ${empresa.id}`,
                      })),
                    ]}
                    {...register("empresaInicial", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.empresaInicial?.message}
                  />
                  <Select
                    label="Empresa Final"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...empresas.map((empresa) => ({
                        value: empresa.id,
                        label: empresa.razaoSocial || `Empresa ${empresa.id}`,
                      })),
                    ]}
                    {...register("empresaFinal", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.empresaFinal?.message}
                  />
                  <Select
                    label="Filial Inicial"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...filiais.map((filial) => ({
                        value: filial.id,
                        label: filial.descricao || `Filial ${filial.id}`,
                      })),
                    ]}
                    {...register("filialInicial", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.filialInicial?.message}
                  />
                  <Select
                    label="Filial Final"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...filiais.map((filial) => ({
                        value: filial.id,
                        label: filial.descricao || `Filial ${filial.id}`,
                      })),
                    ]}
                    {...register("filialFinal", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.filialFinal?.message}
                  />
                  <Select
                    label="Funcionário Inicial"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...funcionarios.map((func) => ({
                        value: func.id,
                        label: func.nomeFuncionario,
                      })),
                    ]}
                    {...register("funcionarioInicial", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.funcionarioInicial?.message}
                  />
                  <Select
                    label="Funcionário Final"
                    options={[
                      { value: "", label: "Selecione..." },
                      ...funcionarios.map((func) => ({
                        value: func.id,
                        label: func.nomeFuncionario,
                      })),
                    ]}
                    {...register("funcionarioFinal", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                    error={errors.funcionarioFinal?.message}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Criar Processo
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Competência
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo Folha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nº Folha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Processamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Pagamento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum processo cadastrado
                </td>
              </tr>
            ) : (
              processos.map((processo) => (
                <tr key={processo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {processo.mes.toString().padStart(2, "0")}/{processo.ano}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {processo.tipoFolha === 1
                      ? "Mensal"
                      : processo.tipoFolha === 2
                      ? "13º Salário"
                      : processo.tipoFolha === 3
                      ? "Férias"
                      : processo.tipoFolha === 4
                      ? "Rescisão"
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {processo.numeroFolha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {processo.dataProcessamento
                      ? new Date(processo.dataProcessamento).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {processo.dataPagamento
                      ? new Date(processo.dataPagamento).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleProcessar(processo.id)}
                        disabled={processandoId === processo.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        title="Processar Folha"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/calculos/${processo.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(processo.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
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
