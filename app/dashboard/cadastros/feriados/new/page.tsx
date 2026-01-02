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
import { DateInput } from "@/components/ui/DateInput";
import { TimeInput } from "@/components/ui/TimeInput";
import { Checkbox } from "@/components/ui/Checkbox";
import api from "@/lib/axios";

const feriadoSchema = z.object({
  idFilial: z.number().optional(),
  dataFeriado: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().min(1, "Descrição é obrigatória").max(100, "Descrição deve ter no máximo 100 caracteres"),
  tipoFeriado: z.number().min(1, "Tipo de Feriado é obrigatório"),
  idMunicipio: z.number().optional(),
  tipoAdicaoFeriado: z.number().optional(),
  feriadoParcial: z.boolean().optional(),
  horaInicio: z.string().optional(),
  horaFinal: z.string().optional(),
  descontaFeriasColetivas: z.boolean().optional(),
  descontaFerias: z.boolean().optional(),
});

type FeriadoFormData = z.infer<typeof feriadoSchema>;

export default function NewFeriadoPage() {
  const router = useRouter();
  const [filiais, setFiliais] = useState<{ id: number; descricao: string }[]>([]);
  const [municipios, setMunicipios] = useState<{ id: number; nome: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FeriadoFormData>({
    resolver: zodResolver(feriadoSchema),
    defaultValues: {
      feriadoParcial: false,
      descontaFeriasColetivas: false,
      descontaFerias: false,
    },
  });

  const feriadoParcial = watch("feriadoParcial");

  useEffect(() => {
    loadFiliais();
    loadMunicipios();
  }, []);

  const loadFiliais = async () => {
    try {
      const response = await api.get("/filiais").catch(() => ({ data: [] }));
      setFiliais(response.data);
    } catch (error) {
      setFiliais([]);
    }
  };

  const loadMunicipios = async () => {
    try {
      const response = await api.get("/municipios").catch(() => ({ data: [] }));
      setMunicipios(response.data);
    } catch (error) {
      setMunicipios([]);
    }
  };

  const onSubmit = async (data: FeriadoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        dataFeriado: data.dataFeriado,
        descricao: data.descricao,
        tipoFeriado: data.tipoFeriado,
        idFilial: data.idFilial || undefined,
        idMunicipio: data.idMunicipio || undefined,
        tipoAdicaoFeriado: data.tipoAdicaoFeriado || undefined,
        feriadoParcial: data.feriadoParcial || false,
        horaInicio: data.horaInicio || undefined,
        horaFinal: data.horaFinal || undefined,
        descontaFeriasColetivas: data.descontaFeriasColetivas || false,
        descontaFerias: data.descontaFerias || false,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.post("/feriados", payload);
      setSuccessMessage("Feriado cadastrado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/feriados");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao salvar feriado"
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
          <h1 className="text-2xl font-bold text-gray-900">Novo Feriado</h1>
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
            label="Filial"
            options={[
              { value: "", label: "Todas" },
              ...filiais.map((filial) => ({
                value: filial.id,
                label: filial.descricao,
              })),
            ]}
            {...register("idFilial", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.idFilial?.message}
          />

          <DateInput
            label="Data do Feriado"
            {...register("dataFeriado")}
            error={errors.dataFeriado?.message}
            required
          />

          <Input
            label="Descrição"
            {...register("descricao")}
            error={errors.descricao?.message}
            maxLength={100}
            required
          />

          <Select
            label="Tipo de Feriado"
            options={[
              { value: 1, label: "Nacional" },
              { value: 2, label: "Estadual" },
              { value: 3, label: "Municipal" },
            ]}
            {...register("tipoFeriado", { valueAsNumber: true })}
            error={errors.tipoFeriado?.message}
            required
          />

          <Select
            label="Município"
            options={[
              { value: "", label: "Selecione..." },
              ...municipios.map((municipio) => ({
                value: municipio.id,
                label: municipio.nome,
              })),
            ]}
            {...register("idMunicipio", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.idMunicipio?.message}
          />

          <Select
            label="Tipo de Adição"
            options={[
              { value: 0, label: "Fixo" },
              { value: 1, label: "Variável" },
            ]}
            {...register("tipoAdicaoFeriado", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.tipoAdicaoFeriado?.message}
          />

          <Checkbox
            label="Feriado Parcial"
            {...register("feriadoParcial")}
            error={errors.feriadoParcial?.message}
          />

          {feriadoParcial && (
            <>
              <TimeInput
                label="Hora de Início"
                {...register("horaInicio")}
                error={errors.horaInicio?.message}
              />
              <TimeInput
                label="Hora Final"
                {...register("horaFinal")}
                error={errors.horaFinal?.message}
              />
            </>
          )}

          <Checkbox
            label="Desconta Férias Coletivas"
            {...register("descontaFeriasColetivas")}
            error={errors.descontaFeriasColetivas?.message}
          />

          <Checkbox
            label="Desconta Férias"
            {...register("descontaFerias")}
            error={errors.descontaFerias?.message}
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

