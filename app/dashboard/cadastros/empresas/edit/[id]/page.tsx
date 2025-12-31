"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import api from "@/lib/axios";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

// Schema de validação alinhado com o backend
const empresaSchema = z.object({
  // Obrigatório
  idTabelaEvento: z.number().min(1, "Tabela de Eventos é obrigatória"),

  // ABA 1 - Identificação
  razaoSocial: z.string().optional(),
  qualificacaoResponsavel: z.string().optional(),
  nomeResponsavel: z.string().optional(),
  cpfResponsavel: z.string().optional(),
  regime: z.number().min(0).max(1).optional(),
  microEmpresa: z.number().min(0).max(1).optional(),
  capitalSocialSindPatronal: z.number().optional(),
  opcaoSimples: z.number().min(1).max(6).optional(),

  // ABA 2 - Configurações de Folha
  geraSalario: z.number().min(0).max(2).optional(),
  calculoDsrHorista: z.number().min(0).max(1).optional(),
  arredondamento: z.number().optional(),
  fracionarFeriasPorMes: z.number().min(0).max(1).optional(),
  calculaLicencaRemunerada: z.number().min(0).max(1).optional(),
  alteraPeriodoAquisitivo: z.number().min(0).max(1).optional(),
  pagarAbonoAntesFerias: z.number().min(0).max(1).optional(),
  calculaComplDecimoDesc: z.number().min(0).max(1).optional(),
  dsrSabado: z.number().min(0).max(1).optional(),
  mesCompetencia: z.number().min(1).max(12).optional(),
  anoCompetencia: z.number().min(2000).max(2100).optional(),

  // ABA 3 - Tributação
  atividadeTributada: z.number().min(0).max(1).optional(),

  // ABA 4 - Contato
  dddResponsavel: z.number().min(11).max(99).optional(),
  telefoneResponsavel: z.string().optional(),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

export default function EditEmpresaPage() {
  const router = useRouter();
  const params = useParams();
  const empresaId = params.id as string;
  const [tabelasEvento, setTabelasEvento] = useState<{ id: number; descricao: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      calculoDsrHorista: 0,
      fracionarFeriasPorMes: 0,
      calculaLicencaRemunerada: 0,
      alteraPeriodoAquisitivo: 0,
      pagarAbonoAntesFerias: 0,
    },
  });

  const opcaoSimples = watch("opcaoSimples");

  useEffect(() => {
    loadTabelasEvento();
    if (empresaId) {
      loadEmpresa(Number(empresaId));
    }
  }, [empresaId]);

  const loadTabelasEvento = async () => {
    try {
      const response = await api.get("/tabela-eventos");
      setTabelasEvento(response.data);
    } catch (error) {
      setTabelasEvento([{ id: 1, descricao: "Tabela Padrão" }]);
    }
  };

  const loadEmpresa = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/empresas/${id}`);
      const data = response.data;
      
      reset({
        idTabelaEvento: data.idTabelaEvento,
        razaoSocial: data.razaoSocial,
        qualificacaoResponsavel: data.qualificacaoResponsavel,
        nomeResponsavel: data.nomeResponsavel,
        cpfResponsavel: data.cpfResponsavel,
        regime: data.regime,
        microEmpresa: data.microEmpresa,
        capitalSocialSindPatronal: data.capitalSocialSindPatronal ? Number(data.capitalSocialSindPatronal) : undefined,
        opcaoSimples: data.opcaoSimples,
        geraSalario: data.geraSalario,
        calculoDsrHorista: data.calculoDsrHorista ?? 0,
        arredondamento: data.arredondamento,
        fracionarFeriasPorMes: data.fracionarFeriasPorMes ?? 0,
        calculaLicencaRemunerada: data.calculaLicencaRemunerada ?? 0,
        alteraPeriodoAquisitivo: data.alteraPeriodoAquisitivo ?? 0,
        pagarAbonoAntesFerias: data.pagarAbonoAntesFerias ?? 0,
        calculaComplDecimoDesc: data.calculaComplDecimoDesc,
        dsrSabado: data.dsrSabado,
        mesCompetencia: data.mesCompetencia,
        anoCompetencia: data.anoCompetencia,
        atividadeTributada: data.atividadeTributada,
        dddResponsavel: data.dddResponsavel,
        telefoneResponsavel: data.telefoneResponsavel,
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar empresa");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Converter dados para o formato do backend
      const payload: any = {
        idTabelaEvento: data.idTabelaEvento,
        razaoSocial: data.razaoSocial,
        qualificacaoResponsavel: data.qualificacaoResponsavel,
        nomeResponsavel: data.nomeResponsavel,
        cpfResponsavel: data.cpfResponsavel?.replace(/\D/g, ""),
        regime: data.regime,
        microEmpresa: data.microEmpresa,
        capitalSocialSindPatronal: data.capitalSocialSindPatronal,
        opcaoSimples: data.opcaoSimples,
        geraSalario: data.geraSalario,
        calculoDsrHorista: data.calculoDsrHorista ?? 0,
        arredondamento: data.arredondamento,
        fracionarFeriasPorMes: data.fracionarFeriasPorMes ?? 0,
        calculaLicencaRemunerada: data.calculaLicencaRemunerada ?? 0,
        alteraPeriodoAquisitivo: data.alteraPeriodoAquisitivo ?? 0,
        pagarAbonoAntesFerias: data.pagarAbonoAntesFerias ?? 0,
        calculaComplDecimoDesc: data.calculaComplDecimoDesc,
        dsrSabado: data.dsrSabado,
        mesCompetencia: data.mesCompetencia,
        anoCompetencia: data.anoCompetencia,
        atividadeTributada: data.atividadeTributada,
        dddResponsavel: data.dddResponsavel,
        telefoneResponsavel: data.telefoneResponsavel?.replace(/\D/g, ""),
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      await api.patch(`/empresas/${empresaId}`, payload);
      setSuccessMessage("Empresa atualizada com sucesso!");
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao salvar empresa"
      );
    }
  };

  const tabs = [
    { id: "identificacao", label: "Identificação" },
    { id: "configuracoes", label: "Configurações de Folha" },
    { id: "tributacao", label: "Tributação" },
    { id: "contato", label: "Contato" },
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
          <Link href="/dashboard/cadastros/empresas">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Editar Empresa</h1>
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

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs tabs={tabs}>
            {(activeTab) => (
              <>
                {/* ABA 1 - Identificação */}
                {activeTab === "identificacao" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Tabela de Eventos"
                        options={tabelasEvento.map((te) => ({
                          value: te.id.toString(),
                          label: te.descricao,
                        }))}
                        {...register("idTabelaEvento", {
                          valueAsNumber: true,
                        })}
                        error={errors.idTabelaEvento?.message}
                        required
                      />

                      <Input
                        label="Razão Social"
                        {...register("razaoSocial")}
                        error={errors.razaoSocial?.message}
                      />

                      <Input
                        label="Nome do Responsável"
                        {...register("nomeResponsavel")}
                        error={errors.nomeResponsavel?.message}
                      />

                      <Input
                        label="CPF do Responsável"
                        {...register("cpfResponsavel")}
                        error={errors.cpfResponsavel?.message}
                        placeholder="000.000.000-00"
                      />

                      <Input
                        label="Qualificação do Responsável"
                        {...register("qualificacaoResponsavel")}
                        error={errors.qualificacaoResponsavel?.message}
                      />

                      <Select
                        label="Regime"
                        options={[
                          { value: "0", label: "Competência" },
                          { value: "1", label: "Caixa" },
                        ]}
                        {...register("regime", {
                          valueAsNumber: true,
                        })}
                        error={errors.regime?.message}
                      />

                      <Input
                        label="Capital Social Sindicato Patronal"
                        {...register("capitalSocialSindPatronal", {
                          valueAsNumber: true,
                        })}
                        error={errors.capitalSocialSindPatronal?.message}
                        type="number"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Checkbox
                          label="Microempresa"
                          {...register("microEmpresa", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />
                      </div>

                      <Select
                        label="Opção pelo Simples"
                        options={[
                          { value: "1", label: "Não Optante" },
                          { value: "2", label: "Optante" },
                          { value: "3", label: "Optante - Suspenso" },
                          { value: "4", label: "Optante - Excluído" },
                          { value: "5", label: "Optante - Cancelado" },
                          { value: "6", label: "Optante - Inapto" },
                        ]}
                        {...register("opcaoSimples", {
                          valueAsNumber: true,
                        })}
                        error={errors.opcaoSimples?.message}
                      />
                    </div>
                  </div>
                )}

                {/* ABA 2 - Configurações de Folha */}
                {activeTab === "configuracoes" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Gera Salário"
                        options={[
                          { value: "0", label: "Horas" },
                          { value: "1", label: "Valor" },
                          { value: "2", label: "Dias" },
                        ]}
                        {...register("geraSalario", {
                          valueAsNumber: true,
                        })}
                        error={errors.geraSalario?.message}
                      />

                      <Select
                        label="Cálculo DSR Horista"
                        options={[
                          { value: "0", label: "Não" },
                          { value: "1", label: "Sim" },
                        ]}
                        {...register("calculoDsrHorista", {
                          valueAsNumber: true,
                        })}
                        error={errors.calculoDsrHorista?.message}
                      />

                      <Input
                        label="Arredondamento"
                        {...register("arredondamento", {
                          valueAsNumber: true,
                        })}
                        error={errors.arredondamento?.message}
                        type="number"
                      />

                      <Input
                        label="Mês de Competência"
                        {...register("mesCompetencia", {
                          valueAsNumber: true,
                        })}
                        error={errors.mesCompetencia?.message}
                        type="number"
                        min={1}
                        max={12}
                      />

                      <Input
                        label="Ano de Competência"
                        {...register("anoCompetencia", {
                          valueAsNumber: true,
                        })}
                        error={errors.anoCompetencia?.message}
                        type="number"
                        min={2000}
                        max={2100}
                      />
                    </div>

                    <div className="space-y-4">
                      <Checkbox
                        label="Fracionar férias por mês"
                        {...register("fracionarFeriasPorMes", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

                      <Checkbox
                        label="Calcular licença remunerada"
                        {...register("calculaLicencaRemunerada", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

                      <Checkbox
                        label="Alterar período aquisitivo"
                        {...register("alteraPeriodoAquisitivo", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

                      <Checkbox
                        label="Pagar abono antes das férias"
                        {...register("pagarAbonoAntesFerias", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

                      <Checkbox
                        label="Calcular complemento 13º"
                        {...register("calculaComplDecimoDesc", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

                      <Checkbox
                        label="DSR sábado"
                        {...register("dsrSabado", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />
                    </div>
                  </div>
                )}

                {/* ABA 3 - Tributação */}
                {activeTab === "tributacao" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Atividade Tributada"
                        options={[
                          { value: "0", label: "Não" },
                          { value: "1", label: "Sim" },
                        ]}
                        {...register("atividadeTributada", {
                          valueAsNumber: true,
                        })}
                        error={errors.atividadeTributada?.message}
                      />
                    </div>
                  </div>
                )}

                {/* ABA 4 - Contato */}
                {activeTab === "contato" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Input
                        label="DDD"
                        {...register("dddResponsavel", {
                          valueAsNumber: true,
                        })}
                        error={errors.dddResponsavel?.message}
                        placeholder="00"
                        type="number"
                        min={11}
                        max={99}
                      />

                      <Input
                        label="Telefone"
                        {...register("telefoneResponsavel")}
                        error={errors.telefoneResponsavel?.message}
                        placeholder="00000-0000"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </Tabs>

          <div className="mt-8 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/cadastros/empresas")}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
