"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Edit, Trash2, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import api from "@/lib/axios";

// --- Schemas & Interfaces ---

const eventoSchema = z.object({
  idTabelaEvento: z.number().min(1, "Tabela de Eventos é obrigatória"),
  idEventoGrupo: z.number().optional(),
  codEvento: z.number().min(1, "Código do Evento é obrigatório"),
  descricao: z.string().max(260).optional(),
  descricaoAbreviada: z.string().max(100).optional(),
  indiceBase: z.number().optional(),
  tipoProventoDesconto: z.number().min(1).max(2).optional(),
  valorMinimo: z.number().optional(),
  valorMaximo: z.number().optional(),
  tipoEventoEspecial: z.number().optional(),
  referencia: z.number().optional(),
  rendimentosAnuais: z.number().min(0).max(1).optional(),
  ordemImpressao: z.number().optional(),
  calculaProporcional: z.number().min(0).max(1).optional(),
});

type EventoFormData = z.infer<typeof eventoSchema>;

interface Incidencia {
  id: number;
  idEvento: number;
  idTipoIncidencia: number;
  idBaseCalculo: number;
  tipoIncidenciaDescricao?: string; // Optional for display if backend sends joined data
  baseCalculoDescricao?: string;   // Optional for display
  percentual?: number;
  valorFixo?: number;
  ativo: boolean;
}

interface TipoIncidencia {
  id: number;
  descricao: string;
}

interface BaseCalculo {
  id: number;
  descricao: string;
}

// --- Main Component ---

export default function EditEventoPage() {
  const router = useRouter();
  const params = useParams();
  const eventoId = params.id as string;

  // Evento State
  const [tabelasEvento, setTabelasEvento] = useState<{ id: number; descricao: string }[]>([]);
  const [eventosGrupo, setEventosGrupo] = useState<{ id: number; descricao: string }[]>([]);

  // Incidencias State
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [tiposIncidencia, setTiposIncidencia] = useState<TipoIncidencia[]>([]);
  const [basesCalculo, setBasesCalculo] = useState<BaseCalculo[]>([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncidencia, setEditingIncidencia] = useState<Incidencia | null>(null);
  const [modalError, setModalError] = useState("");

  // Feedback
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form for Evento
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
  });

  // Form State for Incidence Modal (Manual handling for simplicity/dynamic behavior)
  const [incidenciaForm, setIncidenciaForm] = useState<{
    idTipoIncidencia: string;
    idBaseCalculo: string;
    percentual: string;
    valorFixo: string;
    ativo: boolean;
  }>({
    idTipoIncidencia: "",
    idBaseCalculo: "",
    percentual: "",
    valorFixo: "",
    ativo: true,
  });

  useEffect(() => {
    loadTabelasEvento();
    loadEventosGrupo();
    loadTiposIncidencia();
    loadBasesCalculo();
    if (eventoId) {
      loadEvento(Number(eventoId));
      loadIncidencias(Number(eventoId));
    }
  }, [eventoId]);

  // --- Loaders ---

  const loadTabelasEvento = async () => {
    try {
      const response = await api.get("/tabela-eventos").catch(() => ({ data: [] }));
      setTabelasEvento(response.data);
    } catch (error) {
      setTabelasEvento([]);
    }
  };

  const loadEventosGrupo = async () => {
    try {
      const response = await api.get("/evento-grupos").catch(() => ({ data: [] }));
      setEventosGrupo(response.data);
    } catch (error) {
      setEventosGrupo([]);
    }
  };

  const loadTiposIncidencia = async () => {
    try {
      const response = await api.get("/tipos-incidencia").catch(() => ({ data: [] }));
      setTiposIncidencia(response.data);
    } catch (error) {
      setTiposIncidencia([]);
    }
  };

  const loadBasesCalculo = async () => {
    try {
      const response = await api.get("/bases-calculo").catch(() => ({ data: [] }));
      setBasesCalculo(response.data);
    } catch (error) {
      setBasesCalculo([]);
    }
  };

  const loadEvento = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/eventos/${id}`);
      const evento = response.data;
      reset({
        idTabelaEvento: evento.idTabelaEvento,
        idEventoGrupo: evento.idEventoGrupo || undefined,
        codEvento: evento.codEvento,
        descricao: evento.descricao || undefined,
        descricaoAbreviada: evento.descricaoAbreviada || undefined,
        indiceBase: evento.indiceBase || undefined,
        tipoProventoDesconto: evento.tipoProventoDesconto || undefined,
        valorMinimo: evento.valorMinimo || undefined,
        valorMaximo: evento.valorMaximo || undefined,
        tipoEventoEspecial: evento.tipoEventoEspecial || undefined,
        referencia: evento.referencia || undefined,
        rendimentosAnuais: evento.rendimentosAnuais || undefined,
        ordemImpressao: evento.ordemImpressao || undefined,
        calculaProporcional: evento.calculaProporcional || undefined,
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const loadIncidencias = async (id: number) => {
    try {
      setLoadingIncidencias(true);
      const response = await api.get(`/eventos/${id}/incidencias`);
      setIncidencias(response.data);
    } catch (error) {
      // Ignore error if endpoint doesn't exist yet or returns 404
      console.error("Erro ao carregar incidências", error);
    } finally {
      setLoadingIncidencias(false);
    }
  };

  // --- Evento Handlers ---

  const onSubmit = async (data: EventoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      const payload: any = { ...data };
      // Cleanup undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });
      await api.patch(`/eventos/${eventoId}`, payload);
      setSuccessMessage("Evento atualizado com sucesso!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erro ao atualizar evento");
    }
  };

  // --- Incidencia Modal Handlers ---

  const openNewIncidencia = () => {
    setEditingIncidencia(null);
    setIncidenciaForm({
      idTipoIncidencia: "",
      idBaseCalculo: "",
      percentual: "",
      valorFixo: "",
      ativo: true,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const openEditIncidencia = (incidencia: Incidencia) => {
    setEditingIncidencia(incidencia);
    setIncidenciaForm({
      idTipoIncidencia: incidencia.idTipoIncidencia.toString(),
      idBaseCalculo: incidencia.idBaseCalculo.toString(),
      percentual: incidencia.percentual !== undefined && incidencia.percentual !== null ? incidencia.percentual.toString() : "",
      valorFixo: incidencia.valorFixo !== undefined && incidencia.valorFixo !== null ? incidencia.valorFixo.toString() : "",
      ativo: incidencia.ativo,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleIncidenciaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!incidenciaForm.idTipoIncidencia) {
      setModalError("Selecione um Tipo de Incidência");
      return;
    }
    if (!incidenciaForm.idBaseCalculo) {
      setModalError("Selecione uma Base de Cálculo");
      return;
    }

    try {
      const payload = {
        idEvento: Number(eventoId),
        idTipoIncidencia: Number(incidenciaForm.idTipoIncidencia),
        idBaseCalculo: Number(incidenciaForm.idBaseCalculo),
        percentual: incidenciaForm.percentual ? Number(incidenciaForm.percentual) : undefined,
        valorFixo: incidenciaForm.valorFixo ? Number(incidenciaForm.valorFixo) : undefined,
        ativo: incidenciaForm.ativo,
      };

      if (editingIncidencia) {
        await api.put(`/incidencias/${editingIncidencia.id}`, payload);
      } else {
        await api.post("/incidencias", payload);
      }

      setIsModalOpen(false);
      loadIncidencias(Number(eventoId));
    } catch (error: any) {
      setModalError(error.response?.data?.message || "Erro ao salvar incidência");
    }
  };

  const handleDeleteIncidencia = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover esta incidência?")) return;
    try {
      await api.delete(`/incidencias/${id}`);
      loadIncidencias(Number(eventoId));
    } catch (error: any) {
      alert("Erro ao excluir incidência");
    }
  };

  // --- Dynamic Form Behavior ---
  const handlePercentChange = (val: string) => {
    setIncidenciaForm(prev => ({
      ...prev,
      percentual: val,
      valorFixo: val ? "" : prev.valorFixo // Clear fixed value if percent is entered
    }));
  };

  const handleValueChange = (val: string) => {
    setIncidenciaForm(prev => ({
      ...prev,
      valorFixo: val,
      percentual: val ? "" : prev.percentual // Clear percent if value is entered
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* --- Main Evento Form --- */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Evento</h1>
        </div>
      </div>

      {successMessage && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{successMessage}</div>}
      {errorMessage && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Tabela de Eventos"
              options={tabelasEvento.map((t) => ({ value: t.id, label: t.descricao }))}
              {...register("idTabelaEvento", { valueAsNumber: true })}
              error={errors.idTabelaEvento?.message}
              required
            />
            <Select
              label="Grupo de Eventos"
              options={[{ value: "", label: "Selecione..." }, ...eventosGrupo.map((g) => ({ value: g.id, label: g.descricao }))]}
              {...register("idEventoGrupo", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
              error={errors.idEventoGrupo?.message}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input label="Código do Evento" type="number" {...register("codEvento", { valueAsNumber: true })} error={errors.codEvento?.message} required />
            <Input label="Descrição" {...register("descricao")} error={errors.descricao?.message} maxLength={260} className="col-span-2" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input label="Descrição Abreviada" {...register("descricaoAbreviada")} error={errors.descricaoAbreviada?.message} maxLength={100} />
            <Select
              label="Tipo Provento/Desconto"
              options={[{ value: "", label: "Selecione..." }, { value: 1, label: "Provento" }, { value: 2, label: "Desconto" }]}
              {...register("tipoProventoDesconto", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
              error={errors.tipoProventoDesconto?.message}
            />
            <Input label="Índice Base" type="number" step="0.01" {...register("indiceBase", { valueAsNumber: true })} error={errors.indiceBase?.message} />
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Input label="Ordem" type="number" {...register("ordemImpressao", { valueAsNumber: true })} />
            <Input label="Min" type="number" step="0.01" {...register("valorMinimo", { valueAsNumber: true })} />
            <Input label="Max" type="number" step="0.01" {...register("valorMaximo", { valueAsNumber: true })} />
            <Input label="Ref" type="number" {...register("referencia", { valueAsNumber: true })} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input label="Tipo Evento Especial" type="number" {...register("tipoEventoEspecial", { valueAsNumber: true })} error={errors.tipoEventoEspecial?.message} />
            <Select
              label="Rendimentos Anuais"
              options={[{ value: "", label: "Selecione..." }, { value: 0, label: "Não" }, { value: 1, label: "Sim" }]}
              {...register("rendimentosAnuais", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
              error={errors.rendimentosAnuais?.message}
            />
            <Select
              label="Calcula Proporcional"
              options={[{ value: "", label: "Selecione..." }, { value: 0, label: "Não" }, { value: 1, label: "Sim" }]}
              {...register("calculaProporcional", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
              error={errors.calculaProporcional?.message}
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            <Button type="submit" isLoading={isSubmitting}>Salvar Alterações do Evento</Button>
          </div>
        </div>
      </form>

      {/* --- Incidências Section --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Incidências do Evento</h2>
          <Button size="sm" onClick={openNewIncidencia}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Incidência
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Incidência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Cálculo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Fixo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ativo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incidencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma incidência cadastrada.</td>
                </tr>
              ) : (
                incidencias.map((inc) => {
                  const tipo = tiposIncidencia.find(t => t.id === inc.idTipoIncidencia)?.descricao || inc.tipoIncidenciaDescricao || inc.idTipoIncidencia;
                  const base = basesCalculo.find(b => b.id === inc.idBaseCalculo)?.descricao || inc.baseCalculoDescricao || inc.idBaseCalculo;
                  return (
                    <tr key={inc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tipo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{base}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{inc.percentual ? `${inc.percentual}%` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{inc.valorFixo ? `R$ ${inc.valorFixo}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {inc.ativo ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <XCircle className="w-5 h-5 text-red-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditIncidencia(inc)} className="text-primary-600 hover:text-primary-900"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteIncidencia(inc.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Modal Incidência --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{editingIncidencia ? 'Editar Incidência' : 'Nova Incidência'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleIncidenciaSubmit} className="p-6 space-y-4">
              {modalError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 mb-4">{modalError}</div>}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo de Incidência *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={incidenciaForm.idTipoIncidencia}
                  onChange={e => setIncidenciaForm({ ...incidenciaForm, idTipoIncidencia: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {tiposIncidencia.map(t => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Base de Cálculo *</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={incidenciaForm.idBaseCalculo}
                  onChange={e => setIncidenciaForm({ ...incidenciaForm, idBaseCalculo: e.target.value })}
                  required
                >
                  <option value="">Selecione...</option>
                  {basesCalculo.map(b => <option key={b.id} value={b.id}>{b.descricao}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Percentual (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                    value={incidenciaForm.percentual}
                    onChange={e => handlePercentChange(e.target.value)}
                    disabled={!!incidenciaForm.valorFixo}
                    placeholder={!!incidenciaForm.valorFixo ? "Bloqueado" : "0.00"}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Valor Fixo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400"
                    value={incidenciaForm.valorFixo}
                    onChange={e => handleValueChange(e.target.value)}
                    disabled={!!incidenciaForm.percentual}
                    placeholder={!!incidenciaForm.percentual ? "Bloqueado" : "0.00"}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="incidencia-ativo"
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  checked={incidenciaForm.ativo}
                  onChange={e => setIncidenciaForm({ ...incidenciaForm, ativo: e.target.checked })}
                />
                <label htmlFor="incidencia-ativo" className="text-sm font-medium text-gray-700">Ativo</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Incidência</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
