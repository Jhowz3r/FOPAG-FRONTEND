"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import api from "@/lib/axios";

const funcaoSchema = z
  .object({
    idCbo: z.number().min(1, "CBO é obrigatório"),
    descricao: z.string().min(1, "Descrição é obrigatória").max(100, "Descrição deve ter no máximo 100 caracteres"),
    pisoSalarial: z.number().optional(),
    tetoSalarial: z.number().optional(),
  })
  .refine((data) => {
    if (data.pisoSalarial && data.tetoSalarial) {
      return data.pisoSalarial <= data.tetoSalarial;
    }
    return true;
  }, {
    message: "Piso salarial deve ser menor ou igual ao teto salarial",
    path: ["pisoSalarial"],
  });

type FuncaoFormData = z.infer<typeof funcaoSchema>;

export default function EditFuncaoPage() {
  const router = useRouter();
  const params = useParams();
  const funcaoId = params.id as string;
  const [cbos, setCbos] = useState<{ id: number; codigo: string; descricao: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FuncaoFormData>({
    resolver: zodResolver(funcaoSchema),
  });

  useEffect(() => {
    loadCbos();
    if (funcaoId) {
      loadFuncao(Number(funcaoId));
    }
  }, [funcaoId]);

  const loadCbos = async () => {
    try {
      const response = await api.get("/cbos").catch(() => ({ data: [] }));
      setCbos(response.data);
    } catch (error) {
      setCbos([]);
    }
  };

  const loadFuncao = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/funcoes/${id}`);
      const funcao = response.data;
      reset({
        idCbo: funcao.idCbo,
        descricao: funcao.descricao,
        pisoSalarial: funcao.pisoSalarial || undefined,
        tetoSalarial: funcao.tetoSalarial || undefined,
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar função");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FuncaoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        idCbo: data.idCbo,
        descricao: data.descricao,
        pisoSalarial: data.pisoSalarial || undefined,
        tetoSalarial: data.tetoSalarial || undefined,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.patch(`/funcoes/${funcaoId}`, payload);
      setSuccessMessage("Função atualizada com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/funcoes");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao atualizar função"
      );
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Editar Função</h1>
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
            label="CBO"
            options={cbos.map((cbo) => ({
              value: cbo.id,
              label: `${cbo.codigo} - ${cbo.descricao}`,
            }))}
            {...register("idCbo", { valueAsNumber: true })}
            error={errors.idCbo?.message}
            required
          />

          <Input
            label="Descrição"
            {...register("descricao")}
            error={errors.descricao?.message}
            maxLength={100}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Piso Salarial"
              type="number"
              step="0.01"
              {...register("pisoSalarial", { valueAsNumber: true })}
              error={errors.pisoSalarial?.message}
            />
            <Input
              label="Teto Salarial"
              type="number"
              step="0.01"
              {...register("tetoSalarial", { valueAsNumber: true })}
              error={errors.tetoSalarial?.message}
            />
          </div>
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

