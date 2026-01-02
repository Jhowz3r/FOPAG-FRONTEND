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

const departamentoSchema = z.object({
  idDivisao: z.number().min(1, "Divisão é obrigatória"),
  codigo: z.number().min(1, "Código é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória").max(100, "Descrição deve ter no máximo 100 caracteres"),
});

type DepartamentoFormData = z.infer<typeof departamentoSchema>;

export default function NewDepartamentoPage() {
  const router = useRouter();
  const [divisoes, setDivisoes] = useState<{ id: number; descricao: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DepartamentoFormData>({
    resolver: zodResolver(departamentoSchema),
  });

  useEffect(() => {
    loadDivisoes();
  }, []);

  const loadDivisoes = async () => {
    try {
      const response = await api.get("/divisoes").catch(() => ({ data: [] }));
      setDivisoes(response.data);
    } catch (error) {
      setDivisoes([]);
    }
  };

  const onSubmit = async (data: DepartamentoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        idDivisao: data.idDivisao,
        codigo: data.codigo,
        descricao: data.descricao,
      };

      await api.post("/departamentos", payload);
      setSuccessMessage("Departamento cadastrado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/departamentos");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao salvar departamento"
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
          <h1 className="text-2xl font-bold text-gray-900">Novo Departamento</h1>
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
            label="Divisão"
            options={divisoes.map((divisao) => ({
              value: divisao.id,
              label: divisao.descricao,
            }))}
            {...register("idDivisao", { valueAsNumber: true })}
            error={errors.idDivisao?.message}
            required
          />

          <Input
            label="Código"
            type="number"
            {...register("codigo", { valueAsNumber: true })}
            error={errors.codigo?.message}
            required
          />

          <Input
            label="Descrição"
            {...register("descricao")}
            error={errors.descricao?.message}
            maxLength={100}
            required
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

