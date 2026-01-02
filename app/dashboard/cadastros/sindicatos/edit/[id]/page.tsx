"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import api from "@/lib/axios";

const sindicatoSchema = z.object({
  descricao: z.string().max(100, "Descrição deve ter no máximo 100 caracteres").optional(),
});

type SindicatoFormData = z.infer<typeof sindicatoSchema>;

export default function EditSindicatoPage() {
  const router = useRouter();
  const params = useParams();
  const sindicatoId = params.id as string;
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SindicatoFormData>({
    resolver: zodResolver(sindicatoSchema),
  });

  useEffect(() => {
    if (sindicatoId) {
      loadSindicato(Number(sindicatoId));
    }
  }, [sindicatoId]);

  const loadSindicato = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/sindicatos/${id}`);
      const sindicato = response.data;
      reset({
        descricao: sindicato.descricao || "",
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar sindicato");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SindicatoFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        descricao: data.descricao || undefined,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.patch(`/sindicatos/${sindicatoId}`, payload);
      setSuccessMessage("Sindicato atualizado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/sindicatos");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao atualizar sindicato"
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Sindicato</h1>
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
          <Input
            label="Descrição"
            {...register("descricao")}
            error={errors.descricao?.message}
            maxLength={100}
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

