"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TimeInput } from "@/components/ui/TimeInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Tabs } from "@/components/ui/Tabs";
import { QuadroHorario } from "@/components/ui/QuadroHorario";
import api from "@/lib/axios";

const horarioSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória").max(100, "Descrição deve ter no máximo 100 caracteres"),
  horaTexto1: z.string().max(30).optional(),
  horaTexto2: z.string().max(30).optional(),
  horaTexto3: z.string().max(30).optional(),
  horaTexto4: z.string().max(30).optional(),
  horaTexto5: z.string().max(30).optional(),
  horaTexto6: z.string().max(30).optional(),
  horaTexto7: z.string().max(30).optional(),
  horaTexto8: z.string().max(30).optional(),
  percHeNoturna: z.number().optional(),
  percHeDomingo: z.number().optional(),
  percHeFeriado: z.number().optional(),
  toleranciaFaltas: z.string().optional(),
  toleranciaHoraExtra: z.string().optional(),
  toleranciaEntrada: z.string().optional(),
  toleranciaSaida: z.string().optional(),
  diasTrabalhadosSemana: z.number().optional(),
  horasTrabalhadasDia: z.number().optional(),
  horasTrabalhadasMes: z.number().max(220, "Horas trabalhadas no mês não pode ultrapassar 220h").optional(),
  horasTrabalhadasSemana: z.number().optional(),
  horarioFlexivel: z.boolean().optional(),
  possuiHorarioNoturno: z.boolean().optional(),
});

type HorarioFormData = z.infer<typeof horarioSchema>;

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

export default function EditHorarioPage() {
  const router = useRouter();
  const params = useParams();
  const horarioId = params.id as string;
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [quadroHorario, setQuadroHorario] = useState<QuadroHorarioItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HorarioFormData>({
    resolver: zodResolver(horarioSchema),
    defaultValues: {
      horarioFlexivel: false,
      possuiHorarioNoturno: false,
    },
  });

  useEffect(() => {
    if (horarioId) {
      loadHorario(Number(horarioId));
    }
  }, [horarioId]);

  const loadHorario = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/horarios/${id}`);
      const horario = response.data;
      
      reset({
        descricao: horario.descricao,
        horaTexto1: horario.horaTexto1 || undefined,
        horaTexto2: horario.horaTexto2 || undefined,
        horaTexto3: horario.horaTexto3 || undefined,
        horaTexto4: horario.horaTexto4 || undefined,
        horaTexto5: horario.horaTexto5 || undefined,
        horaTexto6: horario.horaTexto6 || undefined,
        horaTexto7: horario.horaTexto7 || undefined,
        horaTexto8: horario.horaTexto8 || undefined,
        percHeNoturna: horario.percHeNoturna || undefined,
        percHeDomingo: horario.percHeDomingo || undefined,
        percHeFeriado: horario.percHeFeriado || undefined,
        toleranciaFaltas: horario.toleranciaFaltas || undefined,
        toleranciaHoraExtra: horario.toleranciaHoraExtra || undefined,
        toleranciaEntrada: horario.toleranciaEntrada || undefined,
        toleranciaSaida: horario.toleranciaSaida || undefined,
        diasTrabalhadosSemana: horario.diasTrabalhadosSemana || undefined,
        horasTrabalhadasDia: horario.horasTrabalhadasDia || undefined,
        horasTrabalhadasMes: horario.horasTrabalhadasMes || undefined,
        horasTrabalhadasSemana: horario.horasTrabalhadasSemana || undefined,
        horarioFlexivel: horario.horarioFlexivel || false,
        possuiHorarioNoturno: horario.possuiHorarioNoturno || false,
      });

      // Carregar quadro de horários
      const quadroResponse = await api.get(`/horarios/${id}/quadro`).catch(() => ({ data: [] }));
      setQuadroHorario(quadroResponse.data);
    } catch (error: any) {
      setErrorMessage("Erro ao carregar horário");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HorarioFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        descricao: data.descricao,
        horaTexto1: data.horaTexto1 || undefined,
        horaTexto2: data.horaTexto2 || undefined,
        horaTexto3: data.horaTexto3 || undefined,
        horaTexto4: data.horaTexto4 || undefined,
        horaTexto5: data.horaTexto5 || undefined,
        horaTexto6: data.horaTexto6 || undefined,
        horaTexto7: data.horaTexto7 || undefined,
        horaTexto8: data.horaTexto8 || undefined,
        percHeNoturna: data.percHeNoturna || undefined,
        percHeDomingo: data.percHeDomingo || undefined,
        percHeFeriado: data.percHeFeriado || undefined,
        toleranciaFaltas: data.toleranciaFaltas || undefined,
        toleranciaHoraExtra: data.toleranciaHoraExtra || undefined,
        toleranciaEntrada: data.toleranciaEntrada || undefined,
        toleranciaSaida: data.toleranciaSaida || undefined,
        diasTrabalhadosSemana: data.diasTrabalhadosSemana || undefined,
        horasTrabalhadasDia: data.horasTrabalhadasDia || undefined,
        horasTrabalhadasMes: data.horasTrabalhadasMes || undefined,
        horasTrabalhadasSemana: data.horasTrabalhadasSemana || undefined,
        horarioFlexivel: data.horarioFlexivel || false,
        possuiHorarioNoturno: data.possuiHorarioNoturno || false,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.patch(`/horarios/${horarioId}`, payload);

      // Atualizar quadro de horários
      const quadroResponse = await api.get(`/horarios/${horarioId}/quadro`).catch(() => ({ data: [] }));
      const quadroExistente = quadroResponse.data;

      // Deletar todos os quadros existentes e criar novos
      for (const item of quadroExistente) {
        await api.delete(`/horarios/${horarioId}/quadro/${item.id}`).catch(() => {});
      }

      // Criar novos quadros
      for (const item of quadroHorario) {
        if (item.entrada1 || item.saida1 || item.entrada2 || item.saida2 || item.entrada3 || item.saida3) {
          await api.post(`/horarios/${horarioId}/quadro`, {
            diaSemana: item.diaSemana,
            entrada1: item.entrada1 || undefined,
            saida1: item.saida1 || undefined,
            entrada2: item.entrada2 || undefined,
            saida2: item.saida2 || undefined,
            entrada3: item.entrada3 || undefined,
            saida3: item.saida3 || undefined,
            totalHoras: item.totalHoras || undefined,
          });
        }
      }

      setSuccessMessage("Horário atualizado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/horarios");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao atualizar horário"
      );
    }
  };

  const tabs = [
    { id: "principal", label: "Principal" },
    { id: "quadro", label: "Quadro de Horário" },
  ];

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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Horário</h1>
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
        <Tabs tabs={tabs}>
          {(activeTab) => (
            <>
              {activeTab === "principal" && (
                <div className="space-y-6">
                  <Input
                    label="Descrição"
                    {...register("descricao")}
                    error={errors.descricao?.message}
                    maxLength={100}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Percentual Hora Extra Noturna"
                      type="number"
                      step="0.01"
                      {...register("percHeNoturna", { valueAsNumber: true })}
                      error={errors.percHeNoturna?.message}
                    />
                    <Input
                      label="Percentual Hora Extra Domingo"
                      type="number"
                      step="0.01"
                      {...register("percHeDomingo", { valueAsNumber: true })}
                      error={errors.percHeDomingo?.message}
                    />
                    <Input
                      label="Percentual Hora Extra Feriado"
                      type="number"
                      step="0.01"
                      {...register("percHeFeriado", { valueAsNumber: true })}
                      error={errors.percHeFeriado?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TimeInput
                      label="Tolerância Faltas"
                      {...register("toleranciaFaltas")}
                      error={errors.toleranciaFaltas?.message}
                    />
                    <TimeInput
                      label="Tolerância Hora Extra"
                      {...register("toleranciaHoraExtra")}
                      error={errors.toleranciaHoraExtra?.message}
                    />
                    <TimeInput
                      label="Tolerância Entrada"
                      {...register("toleranciaEntrada")}
                      error={errors.toleranciaEntrada?.message}
                    />
                    <TimeInput
                      label="Tolerância Saída"
                      {...register("toleranciaSaida")}
                      error={errors.toleranciaSaida?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Dias Trabalhados Semana"
                      type="number"
                      step="0.01"
                      {...register("diasTrabalhadosSemana", { valueAsNumber: true })}
                      error={errors.diasTrabalhadosSemana?.message}
                    />
                    <Input
                      label="Horas Trabalhadas Dia"
                      type="number"
                      step="0.01"
                      {...register("horasTrabalhadasDia", { valueAsNumber: true })}
                      error={errors.horasTrabalhadasDia?.message}
                    />
                    <Input
                      label="Horas Trabalhadas Mês"
                      type="number"
                      step="0.01"
                      {...register("horasTrabalhadasMes", { valueAsNumber: true })}
                      error={errors.horasTrabalhadasMes?.message}
                    />
                    <Input
                      label="Horas Trabalhadas Semana"
                      type="number"
                      step="0.01"
                      {...register("horasTrabalhadasSemana", { valueAsNumber: true })}
                      error={errors.horasTrabalhadasSemana?.message}
                    />
                  </div>

                  <Checkbox
                    label="Horário Flexível"
                    {...register("horarioFlexivel")}
                    error={errors.horarioFlexivel?.message}
                  />

                  <Checkbox
                    label="Possui Horário Noturno"
                    {...register("possuiHorarioNoturno")}
                    error={errors.possuiHorarioNoturno?.message}
                  />
                </div>
              )}

              {activeTab === "quadro" && (
                <div>
                  <QuadroHorario
                    value={quadroHorario}
                    onChange={setQuadroHorario}
                    error={errors.descricao?.message}
                  />
                </div>
              )}
            </>
          )}
        </Tabs>

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

