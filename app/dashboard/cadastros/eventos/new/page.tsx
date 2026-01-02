"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

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

export default function NewEventoPage() {
  const router = useRouter();
  const [tabelasEvento, setTabelasEvento] = useState<{ id: number; descricao: string }[]>([]);
  const [eventosGrupo, setEventosGrupo] = useState<{ id: number; descricao: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
  });

  useEffect(() => {
    loadTabelasEvento();
    loadEventosGrupo();
  }, []);

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

  const onSubmit = async (data: EventoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        idTabelaEvento: data.idTabelaEvento,
        codEvento: data.codEvento,
        idEventoGrupo: data.idEventoGrupo || undefined,
        descricao: data.descricao || undefined,
        descricaoAbreviada: data.descricaoAbreviada || undefined,
        indiceBase: data.indiceBase || undefined,
        tipoProventoDesconto: data.tipoProventoDesconto || undefined,
        valorMinimo: data.valorMinimo || undefined,
        valorMaximo: data.valorMaximo || undefined,
        tipoEventoEspecial: data.tipoEventoEspecial || undefined,
        referencia: data.referencia || undefined,
        rendimentosAnuais: data.rendimentosAnuais || undefined,
        ordemImpressao: data.ordemImpressao || undefined,
        calculaProporcional: data.calculaProporcional || undefined,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.post("/eventos", payload);
      setSuccessMessage("Evento cadastrado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/eventos");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao salvar evento"
      );
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Novo Evento</h1>
        </div>
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

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <Select
            label="Tabela de Eventos"
            options={tabelasEvento.map((tabela) => ({
              value: tabela.id,
              label: tabela.descricao,
            }))}
            {...register("idTabelaEvento", { valueAsNumber: true })}
            error={errors.idTabelaEvento?.message}
            required
          />

          <Select
            label="Grupo de Eventos"
            options={[
              { value: "", label: "Selecione..." },
              ...eventosGrupo.map((grupo) => ({
                value: grupo.id,
                label: grupo.descricao,
              })),
            ]}
            {...register("idEventoGrupo", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.idEventoGrupo?.message}
          />

          <Input
            label="Código do Evento"
            type="number"
            {...register("codEvento", { valueAsNumber: true })}
            error={errors.codEvento?.message}
            required
          />

          <Input
            label="Descrição"
            {...register("descricao")}
            error={errors.descricao?.message}
            maxLength={260}
          />

          <Input
            label="Descrição Abreviada"
            {...register("descricaoAbreviada")}
            error={errors.descricaoAbreviada?.message}
            maxLength={100}
          />

          <Select
            label="Tipo Provento/Desconto"
            options={[
              { value: "", label: "Selecione..." },
              { value: 1, label: "Provento" },
              { value: 2, label: "Desconto" },
            ]}
            {...register("tipoProventoDesconto", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.tipoProventoDesconto?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Índice Base"
              type="number"
              step="0.01"
              {...register("indiceBase", { valueAsNumber: true })}
              error={errors.indiceBase?.message}
            />
            <Input
              label="Ordem de Impressão"
              type="number"
              {...register("ordemImpressao", { valueAsNumber: true })}
              error={errors.ordemImpressao?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Mínimo"
              type="number"
              step="0.01"
              {...register("valorMinimo", { valueAsNumber: true })}
              error={errors.valorMinimo?.message}
            />
            <Input
              label="Valor Máximo"
              type="number"
              step="0.01"
              {...register("valorMaximo", { valueAsNumber: true })}
              error={errors.valorMaximo?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tipo Evento Especial"
              type="number"
              {...register("tipoEventoEspecial", { valueAsNumber: true })}
              error={errors.tipoEventoEspecial?.message}
            />
            <Input
              label="Referência"
              type="number"
              {...register("referencia", { valueAsNumber: true })}
              error={errors.referencia?.message}
            />
          </div>

          <Select
            label="Rendimentos Anuais"
            options={[
              { value: "", label: "Selecione..." },
              { value: 0, label: "Não" },
              { value: 1, label: "Sim" },
            ]}
            {...register("rendimentosAnuais", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.rendimentosAnuais?.message}
          />

          <Select
            label="Calcula Proporcional"
            options={[
              { value: "", label: "Selecione..." },
              { value: 0, label: "Não" },
              { value: 1, label: "Sim" },
            ]}
            {...register("calculaProporcional", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.calculaProporcional?.message}
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}

