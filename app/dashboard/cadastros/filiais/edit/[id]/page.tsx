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
import { Checkbox } from "@/components/ui/Checkbox";
import api from "@/lib/axios";

const filialSchema = z.object({
  idEmpresa: z.number().optional(),
  idCnae: z.number().optional(),
  idNaturezaEstab: z.number().optional(),
  idSindicatoPatronal: z.number().optional(),
  idMunicipio: z.number().optional(),
  idAliquotaFPAS: z.number().optional(),
  idGps: z.number().optional(),
  idAgencia: z.number().optional(),
  idRAT: z.number().optional(),
  tipoInscricao: z.number().min(1).max(3).optional(),
  inscricao: z.string().max(18).optional(),
  cep: z.string().max(9).regex(/^\d{5}-?\d{3}$/, "CEP inválido").optional(),
  denominacaoCep: z.string().max(50).optional(),
  localidadeCep: z.string().max(50).optional(),
  bairroCep: z.string().max(50).optional(),
  ufCep: z.number().min(1).max(27).optional(),
  complementoCep: z.string().max(35).optional(),
  numeroCep: z.string().max(11).optional(),
  ddd: z.number().min(11).max(99).optional(),
  telefone: z.string().max(9).optional(),
  ufInscricaoEstadual: z.number().min(1).max(27).optional(),
  inscricaoEstadual: z.string().max(17).optional(),
  matriculaInss: z.string().max(14).optional(),
  email: z.string().email("Email inválido").max(100).optional(),
  observacao: z.string().max(1500).optional(),
  statusProcessar: z.boolean().optional(),
});

type FilialFormData = z.infer<typeof filialSchema>;

export default function EditFilialPage() {
  const router = useRouter();
  const params = useParams();
  const filialId = params.id as string;
  const [empresas, setEmpresas] = useState<{ id: number; razaoSocial?: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FilialFormData>({
    resolver: zodResolver(filialSchema),
    defaultValues: {
      statusProcessar: true,
    },
  });

  useEffect(() => {
    loadEmpresas();
    if (filialId) {
      loadFilial(Number(filialId));
    }
  }, [filialId]);

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresas").catch(() => ({ data: [] }));
      setEmpresas(response.data);
    } catch (error) {
      setEmpresas([]);
    }
  };

  const loadFilial = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/filiais/${id}`);
      const filial = response.data;
      reset({
        idEmpresa: filial.idEmpresa || undefined,
        idCnae: filial.idCnae || undefined,
        idNaturezaEstab: filial.idNaturezaEstab || undefined,
        idSindicatoPatronal: filial.idSindicatoPatronal || undefined,
        idMunicipio: filial.idMunicipio || undefined,
        idAliquotaFPAS: filial.idAliquotaFPAS || undefined,
        idGps: filial.idGps || undefined,
        idAgencia: filial.idAgencia || undefined,
        idRAT: filial.idRAT || undefined,
        tipoInscricao: filial.tipoInscricao || undefined,
        inscricao: filial.inscricao || undefined,
        cep: filial.cep || undefined,
        denominacaoCep: filial.denominacaoCep || undefined,
        localidadeCep: filial.localidadeCep || undefined,
        bairroCep: filial.bairroCep || undefined,
        ufCep: filial.ufCep || undefined,
        complementoCep: filial.complementoCep || undefined,
        numeroCep: filial.numeroCep || undefined,
        ddd: filial.ddd || undefined,
        telefone: filial.telefone || undefined,
        ufInscricaoEstadual: filial.ufInscricaoEstadual || undefined,
        inscricaoEstadual: filial.inscricaoEstadual || undefined,
        matriculaInss: filial.matriculaInss || undefined,
        email: filial.email || undefined,
        observacao: filial.observacao || undefined,
        statusProcessar: filial.statusProcessar !== undefined ? filial.statusProcessar : true,
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar filial");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FilialFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        idEmpresa: data.idEmpresa || undefined,
        idCnae: data.idCnae || undefined,
        idNaturezaEstab: data.idNaturezaEstab || undefined,
        idSindicatoPatronal: data.idSindicatoPatronal || undefined,
        idMunicipio: data.idMunicipio || undefined,
        idAliquotaFPAS: data.idAliquotaFPAS || undefined,
        idGps: data.idGps || undefined,
        idAgencia: data.idAgencia || undefined,
        idRAT: data.idRAT || undefined,
        tipoInscricao: data.tipoInscricao || undefined,
        inscricao: data.inscricao || undefined,
        cep: data.cep || undefined,
        denominacaoCep: data.denominacaoCep || undefined,
        localidadeCep: data.localidadeCep || undefined,
        bairroCep: data.bairroCep || undefined,
        ufCep: data.ufCep || undefined,
        complementoCep: data.complementoCep || undefined,
        numeroCep: data.numeroCep || undefined,
        ddd: data.ddd || undefined,
        telefone: data.telefone || undefined,
        ufInscricaoEstadual: data.ufInscricaoEstadual || undefined,
        inscricaoEstadual: data.inscricaoEstadual || undefined,
        matriculaInss: data.matriculaInss || undefined,
        email: data.email || undefined,
        observacao: data.observacao || undefined,
        statusProcessar: data.statusProcessar !== undefined ? data.statusProcessar : true,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.patch(`/filiais/${filialId}`, payload);
      setSuccessMessage("Filial atualizada com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/filiais");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao atualizar filial"
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Filial</h1>
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
            label="Empresa"
            options={[
              { value: "", label: "Selecione..." },
              ...empresas.map((empresa) => ({
                value: empresa.id,
                label: empresa.razaoSocial || `Empresa ${empresa.id}`,
              })),
            ]}
            {...register("idEmpresa", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.idEmpresa?.message}
          />

          <Select
            label="Tipo Inscrição"
            options={[
              { value: "", label: "Selecione..." },
              { value: 1, label: "CNPJ" },
              { value: 2, label: "CEI" },
              { value: 3, label: "CPF" },
            ]}
            {...register("tipoInscricao", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
            error={errors.tipoInscricao?.message}
          />

          <Input
            label="Inscrição (CNPJ/CEI/CPF)"
            {...register("inscricao")}
            error={errors.inscricao?.message}
            maxLength={18}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CEP"
              {...register("cep")}
              error={errors.cep?.message}
              maxLength={9}
              placeholder="00000-000"
            />
            <Input
              label="Número"
              {...register("numeroCep")}
              error={errors.numeroCep?.message}
              maxLength={11}
            />
          </div>

          <Input
            label="Logradouro"
            {...register("denominacaoCep")}
            error={errors.denominacaoCep?.message}
            maxLength={50}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bairro"
              {...register("bairroCep")}
              error={errors.bairroCep?.message}
              maxLength={50}
            />
            <Input
              label="Localidade"
              {...register("localidadeCep")}
              error={errors.localidadeCep?.message}
              maxLength={50}
            />
          </div>

          <Input
            label="Complemento"
            {...register("complementoCep")}
            error={errors.complementoCep?.message}
            maxLength={35}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="DDD"
              type="number"
              {...register("ddd", { valueAsNumber: true })}
              error={errors.ddd?.message}
            />
            <Input
              label="Telefone"
              {...register("telefone")}
              error={errors.telefone?.message}
              maxLength={9}
            />
          </div>

          <Input
            label="Inscrição Estadual"
            {...register("inscricaoEstadual")}
            error={errors.inscricaoEstadual?.message}
            maxLength={17}
          />

          <Input
            label="Matrícula INSS"
            {...register("matriculaInss")}
            error={errors.matriculaInss?.message}
            maxLength={14}
          />

          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            maxLength={100}
          />

          <Input
            label="Observação"
            {...register("observacao")}
            error={errors.observacao?.message}
            maxLength={1500}
            multiline
            rows={4}
          />

          <Checkbox
            label="Status Processar"
            {...register("statusProcessar")}
            error={errors.statusProcessar?.message}
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

