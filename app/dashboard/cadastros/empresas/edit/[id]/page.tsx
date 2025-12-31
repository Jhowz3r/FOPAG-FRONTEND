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
import { DateInput } from "@/components/ui/DateInput";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { CheckedComboBox } from "@/components/ui/CheckedComboBox";
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
  idResponsavel: z.number().optional(),
  dataNascimentoResponsavel: z.string().optional(),
  regime: z.number().min(0).max(1).optional(),
  microEmpresa: z.number().min(0).max(1).optional(),
  capitalSocialSindPatronal: z.number().optional(),
  opcaoSimples: z.number().min(1).max(6).optional(),

  // ABA 2 - Configurações de Folha
  geraSalario: z.number().min(0).max(2).optional(),
  calculoDsrHorista: z.number().min(0).max(1).optional(),
  calculoDsrHoristaProvisao: z.number().min(0).max(1).optional(),
  arredondamento: z.number().optional(),
  fracionarFeriasPorMes: z.number().min(0).max(1).optional(),
  calculaLicencaRemunerada: z.number().min(0).max(1).optional(),
  alteraPeriodoAquisitivo: z.number().min(0).max(1).optional(),
  pagarAbonoAntesFerias: z.number().min(0).max(1).optional(),
  calculaComplDecimoDesc: z.number().min(0).max(1).optional(),
  dsrSabado: z.number().min(0).max(1).optional(),
  mesCompetencia: z.number().min(1).max(12).optional(),
  anoCompetencia: z.number().min(2000).max(2100).optional(),
  competenciaCalculoApuracaoMedias: z.number().min(0).max(1).optional(),
  naoDescontarFaltaFerias: z.number().min(0).max(1).optional(),
  calcularAdicionalNoturnoAutomatico: z.number().min(0).max(1).optional(),
  pagarAjudaCompulsoria: z.number().min(0).max(1).optional(),
  calculoSalarioProporcionalAlteracao: z.number().min(0).max(1).optional(),
  utilizaMaiorSalarioCalculoDecimo: z.number().min(0).max(1).optional(),
  dataPagamentoAutomatica: z.number().min(0).max(1).optional(),
  
  // Provisões
  provisaoFerias: z.number().min(0).max(1).optional(),
  provisaoFeriasINSS: z.number().min(0).max(1).optional(),
  provisaoFeriasFGTS: z.number().min(0).max(1).optional(),
  provisaoFeriasPIS: z.number().min(0).max(1).optional(),
  provisaoDecimo: z.number().min(0).max(1).optional(),
  provisaoDecimoINSS: z.number().min(0).max(1).optional(),
  provisaoDecimoFGTS: z.number().min(0).max(1).optional(),
  provisaoDecimoPIS: z.number().min(0).max(1).optional(),
  
  grupoObrigatoriedadeeSocial: z.number().optional(),

  // ABA 3 - Tributação
  atividadeTributada: z.number().min(0).max(1).optional(),

  // ABA 4 - Contato
  dddResponsavel: z.number().min(11).max(99).optional(),
  telefoneResponsavel: z.string().optional(),

  // ABA 5 - e-Social
  caminhoCertificado: z.string().optional(),
  senhaCertificado: z.string().optional(),
  validadeCertificado: z.string().optional(),
  faseESocial: z.number().optional(),
  eventosTabela: z.array(z.boolean()).optional(),
  eventosNaoPeriodicos: z.array(z.boolean()).optional(),
  eventosSST: z.array(z.boolean()).optional(),
  desativaEnvioAutomatico: z.number().min(0).max(1).optional(),
  desativaConsultaAutomatica: z.number().min(0).max(1).optional(),

  // ABA 6 - Central de Avisos
  avisoFeriasVencer: z.number().optional(),
  diasFeriasVencer: z.number().optional(),
  avisoFeriasVencerSegundoPeriodo: z.number().optional(),
  diasFeriasVencerSegundoPeriodo: z.number().optional(),
  avisoExperienciaPrimeiroPeriodo: z.number().optional(),
  diasExperienciaPrimeiroPeriodo: z.number().optional(),
  avisoExperienciaProrrogacao: z.number().optional(),
  diasExperienciaProrrogacao: z.number().optional(),
  avisoProgramacaoFerias: z.number().optional(),
  diasProgramacaoFerias: z.number().optional(),
  avisoRescisao: z.number().optional(),
  diasRescisao: z.number().optional(),
  avisoVencimentoCertificado: z.number().optional(),
  diasVencimentoCertificado: z.number().optional(),
  avisoTerminoAfastamento: z.number().optional(),
  diasTerminoAfastamento: z.number().optional(),
  avisoAniversariantes: z.number().optional(),
});

type EmpresaFormData = z.infer<typeof empresaSchema>;

export default function EditEmpresaPage() {
  const router = useRouter();
  const params = useParams();
  const empresaId = params.id as string;
  const [tabelasEvento, setTabelasEvento] = useState<{ id: number; descricao: string }[]>([]);
  const [responsaveis, setResponsaveis] = useState<{ id: number; nome: string }[]>([]);
  const [certificados, setCertificados] = useState<string[]>([]);
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
      calculoDsrHoristaProvisao: 0,
      fracionarFeriasPorMes: 0,
      calculaLicencaRemunerada: 0,
      alteraPeriodoAquisitivo: 0,
      pagarAbonoAntesFerias: 0,
      faseESocial: 0,
      eventosTabela: [false, false, false, false, false],
      eventosNaoPeriodicos: [false, false, false, false, false, false],
      eventosSST: [false, false, false],
    },
  });

  const opcaoSimples = watch("opcaoSimples");
  const calculoDsrHorista = watch("calculoDsrHorista");
  const calculoDsrHoristaProvisao = watch("calculoDsrHoristaProvisao");
  const faseESocial = watch("faseESocial");
  const avisoFeriasVencer = watch("avisoFeriasVencer");
  const avisoFeriasVencerSegundoPeriodo = watch("avisoFeriasVencerSegundoPeriodo");
  const avisoExperienciaPrimeiroPeriodo = watch("avisoExperienciaPrimeiroPeriodo");
  const avisoExperienciaProrrogacao = watch("avisoExperienciaProrrogacao");
  const avisoProgramacaoFerias = watch("avisoProgramacaoFerias");
  const avisoRescisao = watch("avisoRescisao");
  const avisoVencimentoCertificado = watch("avisoVencimentoCertificado");
  const avisoTerminoAfastamento = watch("avisoTerminoAfastamento");

  useEffect(() => {
    loadTabelasEvento();
    loadResponsaveis();
    loadCertificados();
    if (empresaId) {
      loadEmpresa(Number(empresaId));
    }
  }, [empresaId]);

  // Lógica condicional: DSR Horista e DSR Provisão são mutuamente exclusivos
  useEffect(() => {
    if (calculoDsrHoristaProvisao === 1) {
      setValue("calculoDsrHorista", 0);
    }
  }, [calculoDsrHoristaProvisao, setValue]);

  useEffect(() => {
    if (calculoDsrHorista === 1) {
      setValue("calculoDsrHoristaProvisao", 0);
    }
  }, [calculoDsrHorista, setValue]);

  const loadTabelasEvento = async () => {
    try {
      const response = await api.get("/tabela-eventos");
      setTabelasEvento(response.data);
    } catch (error) {
      setTabelasEvento([{ id: 1, descricao: "Tabela Padrão" }]);
    }
  };

  const loadResponsaveis = async () => {
    try {
      const response = await api.get("/responsaveis");
      setResponsaveis(response.data);
    } catch (error) {
      setResponsaveis([]);
    }
  };

  const loadCertificados = async () => {
    try {
      const response = await api.get("/certificados");
      setCertificados(response.data || []);
    } catch (error) {
      setCertificados([]);
    }
  };

  const loadEmpresa = async (id: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/empresas/${id}`);
      const data = response.data;
      
      // Converter data de nascimento se existir
      let dataNascimento = undefined;
      if (data.dataNascimentoResponsavel) {
        const date = new Date(data.dataNascimentoResponsavel);
        dataNascimento = date.toISOString().split('T')[0];
      }

      // Converter validade certificado se existir
      let validadeCertificado = undefined;
      if (data.validadeCertificado) {
        const date = new Date(data.validadeCertificado);
        validadeCertificado = date.toISOString().split('T')[0];
      }
      
      reset({
        idTabelaEvento: data.idTabelaEvento,
        razaoSocial: data.razaoSocial,
        qualificacaoResponsavel: data.qualificacaoResponsavel,
        nomeResponsavel: data.nomeResponsavel,
        cpfResponsavel: data.cpfResponsavel,
        idResponsavel: data.idResponsavel,
        dataNascimentoResponsavel: dataNascimento,
        regime: data.regime,
        microEmpresa: data.microEmpresa,
        capitalSocialSindPatronal: data.capitalSocialSindPatronal ? Number(data.capitalSocialSindPatronal) : undefined,
        opcaoSimples: data.opcaoSimples,
        geraSalario: data.geraSalario,
        calculoDsrHorista: data.calculoDsrHorista ?? 0,
        calculoDsrHoristaProvisao: data.calculoDsrHoristaProvisao ?? 0,
        arredondamento: data.arredondamento,
        fracionarFeriasPorMes: data.fracionarFeriasPorMes ?? 0,
        calculaLicencaRemunerada: data.calculaLicencaRemunerada ?? 0,
        alteraPeriodoAquisitivo: data.alteraPeriodoAquisitivo ?? 0,
        pagarAbonoAntesFerias: data.pagarAbonoAntesFerias ?? 0,
        calculaComplDecimoDesc: data.calculaComplDecimoDesc,
        dsrSabado: data.dsrSabado,
        mesCompetencia: data.mesCompetencia,
        anoCompetencia: data.anoCompetencia,
        competenciaCalculoApuracaoMedias: data.competenciaCalculoApuracaoMedias,
        naoDescontarFaltaFerias: data.naoDescontarFaltaFerias,
        calcularAdicionalNoturnoAutomatico: data.calcularAdicionalNoturnoAutomatico,
        pagarAjudaCompulsoria: data.pagarAjudaCompulsoria,
        calculoSalarioProporcionalAlteracao: data.calculoSalarioProporcionalAlteracao,
        utilizaMaiorSalarioCalculoDecimo: data.utilizaMaiorSalarioCalculoDecimo,
        dataPagamentoAutomatica: data.dataPagamentoAutomatica,
        provisaoFerias: data.provisaoFerias,
        provisaoFeriasINSS: data.provisaoFeriasINSS,
        provisaoFeriasFGTS: data.provisaoFeriasFGTS,
        provisaoFeriasPIS: data.provisaoFeriasPIS,
        provisaoDecimo: data.provisaoDecimo,
        provisaoDecimoINSS: data.provisaoDecimoINSS,
        provisaoDecimoFGTS: data.provisaoDecimoFGTS,
        provisaoDecimoPIS: data.provisaoDecimoPIS,
        grupoObrigatoriedadeeSocial: data.grupoObrigatoriedadeeSocial,
        atividadeTributada: data.atividadeTributada,
        dddResponsavel: data.dddResponsavel,
        telefoneResponsavel: data.telefoneResponsavel,
        caminhoCertificado: data.caminhoCertificado,
        senhaCertificado: data.senhaCertificado,
        validadeCertificado: validadeCertificado,
        faseESocial: data.faseESocial ?? 0,
        desativaEnvioAutomatico: data.desativaEnvioAutomatico,
        desativaConsultaAutomatica: data.desativaConsultaAutomatica,
        avisoFeriasVencer: data.avisoFeriasVencer,
        diasFeriasVencer: data.diasFeriasVencer,
        avisoFeriasVencerSegundoPeriodo: data.avisoFeriasVencerSegundoPeriodo,
        diasFeriasVencerSegundoPeriodo: data.diasFeriasVencerSegundoPeriodo,
        avisoExperienciaPrimeiroPeriodo: data.avisoExperienciaPrimeiroPeriodo,
        diasExperienciaPrimeiroPeriodo: data.diasExperienciaPrimeiroPeriodo,
        avisoExperienciaProrrogacao: data.avisoExperienciaProrrogacao,
        diasExperienciaProrrogacao: data.diasExperienciaProrrogacao,
        avisoProgramacaoFerias: data.avisoProgramacaoFerias,
        diasProgramacaoFerias: data.diasProgramacaoFerias,
        avisoRescisao: data.avisoRescisao,
        diasRescisao: data.diasRescisao,
        avisoVencimentoCertificado: data.avisoVencimentoCertificado,
        diasVencimentoCertificado: data.diasVencimentoCertificado,
        avisoTerminoAfastamento: data.avisoTerminoAfastamento,
        diasTerminoAfastamento: data.diasTerminoAfastamento,
        avisoAniversariantes: data.avisoAniversariantes,
      });
    } catch (error: any) {
      setErrorMessage("Erro ao carregar empresa");
    } finally {
      setLoading(false);
    }
  };

  const eventosTabelaOptions = [
    { value: "S1000", label: "S1000 - Informações do Empregador/Contribuinte/Órgão Público" },
    { value: "S1005", label: "S1005 - Tabela de Estabelecimentos, Obras ou Unidades de Órgãos Públicos" },
    { value: "S1010", label: "S1010 - Tabela de Rubricas" },
    { value: "S1020", label: "S1020 - Tabela de Lotações Tributárias" },
    { value: "S1070", label: "S1070 - Tabela de Processos Administrativos/Judiciais" },
  ];

  const eventosNaoPeriodicosOptions = [
    { value: "S2190", label: "S2190 - Admissão de Trabalhador" },
    { value: "S2200", label: "S2200 - Cadastramento Inicial do Vínculo e Admissão/Ingresso de Trabalhador" },
    { value: "S2205", label: "S2205 - Alteração de Dados Cadastrais do Trabalhador" },
    { value: "S2206", label: "S2206 - Alteração de Contrato de Trabalho" },
    { value: "S2300", label: "S2300 - Trabalhador Sem Vínculo de Emprego/Estatutário - Início" },
    { value: "S2306", label: "S2306 - Trabalhador Sem Vínculo de Emprego/Estatutário - Alteração Contratual" },
  ];

  const eventosSSTOptions = [
    { value: "S2210", label: "S2210 - Comunicação de Acidente de Trabalho" },
    { value: "S2220", label: "S2220 - Monitoramento da Saúde do Trabalhador em Situação de Risco" },
    { value: "S2240", label: "S2240 - Condições Ambientais do Trabalho - Fatores de Risco" },
  ];

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
        idResponsavel: data.idResponsavel,
        dataNascimentoResponsavel: data.dataNascimentoResponsavel,
        regime: data.regime,
        microEmpresa: data.microEmpresa,
        capitalSocialSindPatronal: data.capitalSocialSindPatronal,
        opcaoSimples: data.opcaoSimples,
        geraSalario: data.geraSalario,
        calculoDsrHorista: data.calculoDsrHorista ?? 0,
        calculoDsrHoristaProvisao: data.calculoDsrHoristaProvisao ?? 0,
        arredondamento: data.arredondamento,
        fracionarFeriasPorMes: data.fracionarFeriasPorMes ?? 0,
        calculaLicencaRemunerada: data.calculaLicencaRemunerada ?? 0,
        alteraPeriodoAquisitivo: data.alteraPeriodoAquisitivo ?? 0,
        pagarAbonoAntesFerias: data.pagarAbonoAntesFerias ?? 0,
        calculaComplDecimoDesc: data.calculaComplDecimoDesc,
        dsrSabado: data.dsrSabado,
        mesCompetencia: data.mesCompetencia,
        anoCompetencia: data.anoCompetencia,
        competenciaCalculoApuracaoMedias: data.competenciaCalculoApuracaoMedias,
        naoDescontarFaltaFerias: data.naoDescontarFaltaFerias,
        calcularAdicionalNoturnoAutomatico: data.calcularAdicionalNoturnoAutomatico,
        pagarAjudaCompulsoria: data.pagarAjudaCompulsoria,
        calculoSalarioProporcionalAlteracao: data.calculoSalarioProporcionalAlteracao,
        utilizaMaiorSalarioCalculoDecimo: data.utilizaMaiorSalarioCalculoDecimo,
        dataPagamentoAutomatica: data.dataPagamentoAutomatica,
        provisaoFerias: data.provisaoFerias,
        provisaoFeriasINSS: data.provisaoFeriasINSS,
        provisaoFeriasFGTS: data.provisaoFeriasFGTS,
        provisaoFeriasPIS: data.provisaoFeriasPIS,
        provisaoDecimo: data.provisaoDecimo,
        provisaoDecimoINSS: data.provisaoDecimoINSS,
        provisaoDecimoFGTS: data.provisaoDecimoFGTS,
        provisaoDecimoPIS: data.provisaoDecimoPIS,
        grupoObrigatoriedadeeSocial: data.grupoObrigatoriedadeeSocial,
        atividadeTributada: data.atividadeTributada,
        dddResponsavel: data.dddResponsavel,
        telefoneResponsavel: data.telefoneResponsavel?.replace(/\D/g, ""),
        caminhoCertificado: data.caminhoCertificado,
        senhaCertificado: data.senhaCertificado,
        validadeCertificado: data.validadeCertificado,
        faseESocial: data.faseESocial,
        desativaEnvioAutomatico: data.desativaEnvioAutomatico,
        desativaConsultaAutomatica: data.desativaConsultaAutomatica,
        avisoFeriasVencer: data.avisoFeriasVencer,
        diasFeriasVencer: data.diasFeriasVencer,
        avisoFeriasVencerSegundoPeriodo: data.avisoFeriasVencerSegundoPeriodo,
        diasFeriasVencerSegundoPeriodo: data.diasFeriasVencerSegundoPeriodo,
        avisoExperienciaPrimeiroPeriodo: data.avisoExperienciaPrimeiroPeriodo,
        diasExperienciaPrimeiroPeriodo: data.diasExperienciaPrimeiroPeriodo,
        avisoExperienciaProrrogacao: data.avisoExperienciaProrrogacao,
        diasExperienciaProrrogacao: data.diasExperienciaProrrogacao,
        avisoProgramacaoFerias: data.avisoProgramacaoFerias,
        diasProgramacaoFerias: data.diasProgramacaoFerias,
        avisoRescisao: data.avisoRescisao,
        diasRescisao: data.diasRescisao,
        avisoVencimentoCertificado: data.avisoVencimentoCertificado,
        diasVencimentoCertificado: data.diasVencimentoCertificado,
        avisoTerminoAfastamento: data.avisoTerminoAfastamento,
        diasTerminoAfastamento: data.diasTerminoAfastamento,
        avisoAniversariantes: data.avisoAniversariantes,
      };

      // Processar eventos e-Social
      if (data.eventosTabela) {
        // Processar eventos de tabela selecionados
      }
      if (data.eventosNaoPeriodicos) {
        // Processar eventos não periódicos selecionados
      }
      if (data.eventosSST) {
        // Processar eventos SST selecionados
      }

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
    { id: "identificacao", label: "Dados Empresa" },
    { id: "parametros", label: "Parâmetros da Empresa" },
    { id: "tributacao", label: "Tributação" },
    { id: "contato", label: "Contato" },
    { id: "esocial", label: "e-Social" },
    { id: "centralAvisos", label: "Central de Avisos" },
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

                      <Select
                        label="Responsável pelas informações geradas"
                        options={responsaveis.map((r) => ({
                          value: r.id.toString(),
                          label: r.nome,
                        }))}
                        {...register("idResponsavel", {
                          valueAsNumber: true,
                        })}
                        error={errors.idResponsavel?.message}
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

                      <DateInput
                        label="Data de Nascimento do Responsável"
                        {...register("dataNascimentoResponsavel")}
                        error={errors.dataNascimentoResponsavel?.message}
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
                      <Checkbox
                        label="Microempresa"
                        {...register("microEmpresa", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                      />

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

                {/* ABA 2 - Parâmetros da Empresa */}
                {activeTab === "parametros" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Select
                        label="Arredondamento"
                        options={[
                          { value: "0", label: "Sem Arredondamento" },
                          { value: "1", label: "Arredondar para cima" },
                          { value: "2", label: "Arredondar para baixo" },
                        ]}
                        {...register("arredondamento", {
                          valueAsNumber: true,
                        })}
                        error={errors.arredondamento?.message}
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

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Configurações de Cálculo
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Checkbox
                          label="Descanso semanal remunerado horista"
                          {...register("calculoDsrHorista", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                          disabled={calculoDsrHoristaProvisao === 1}
                        />

                        <Checkbox
                          label="Considera DSR Horista no cálculo da provisão"
                          {...register("calculoDsrHoristaProvisao", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                          disabled={calculoDsrHorista === 1}
                        />

                        <Checkbox
                          label="Micro empresa"
                          {...register("microEmpresa", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Calcular licença remunerada para func. com menos de 1 ano"
                          {...register("calculaLicencaRemunerada", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Alterar o período aquisitivo de férias p/ func. com licença rem."
                          {...register("alteraPeriodoAquisitivo", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Pagar abono pecuniário antes das férias"
                          {...register("pagarAbonoAntesFerias", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Considerar competência do cálculo para apuração das médias da última parcela do 13º"
                          {...register("competenciaCalculoApuracaoMedias", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Levar em consideração os Sábados para o cálculo do DSR"
                          {...register("dsrSabado", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Não descontar falta nas férias"
                          {...register("naoDescontarFaltaFerias", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Calcular adicional noturno automático"
                          {...register("calcularAdicionalNoturnoAutomatico", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Pagar ajuda compulsória para contrato suspenso"
                          {...register("pagarAjudaCompulsoria", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Cálculo do salário base proporcional a data de alteração"
                          {...register("calculoSalarioProporcionalAlteracao", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Utiliza maior Salário base do ano para cálculo do 13º Salário"
                          {...register("utilizaMaiorSalarioCalculoDecimo", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Data de Pagamento Automática"
                          {...register("dataPagamentoAutomatica", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Eventos de Provisão
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Férias
                          </label>
                          <CheckedComboBox
                            options={[
                              { value: "ferias", label: "Férias" },
                              { value: "inss", label: "INSS" },
                              { value: "fgts", label: "FGTS" },
                              { value: "pis", label: "PIS" },
                            ]}
                            checked={[
                              watch("provisaoFerias") === 1,
                              watch("provisaoFeriasINSS") === 1,
                              watch("provisaoFeriasFGTS") === 1,
                              watch("provisaoFeriasPIS") === 1,
                            ]}
                            onChange={(checked) => {
                              setValue("provisaoFerias", checked[0] ? 1 : 0);
                              setValue("provisaoFeriasINSS", checked[1] ? 1 : 0);
                              setValue("provisaoFeriasFGTS", checked[2] ? 1 : 0);
                              setValue("provisaoFeriasPIS", checked[3] ? 1 : 0);
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Décimo Terceiro
                          </label>
                          <CheckedComboBox
                            options={[
                              { value: "decimo", label: "Décimo Terceiro" },
                              { value: "inss", label: "INSS" },
                              { value: "fgts", label: "FGTS" },
                              { value: "pis", label: "PIS" },
                            ]}
                            checked={[
                              watch("provisaoDecimo") === 1,
                              watch("provisaoDecimoINSS") === 1,
                              watch("provisaoDecimoFGTS") === 1,
                              watch("provisaoDecimoPIS") === 1,
                            ]}
                            onChange={(checked) => {
                              setValue("provisaoDecimo", checked[0] ? 1 : 0);
                              setValue("provisaoDecimoINSS", checked[1] ? 1 : 0);
                              setValue("provisaoDecimoFGTS", checked[2] ? 1 : 0);
                              setValue("provisaoDecimoPIS", checked[3] ? 1 : 0);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Select
                        label="Grupo Obrigatoriedade e-Social"
                        options={[
                          { value: "1", label: "Grupo 1" },
                          { value: "2", label: "Grupo 2" },
                          { value: "3", label: "Grupo 3" },
                          { value: "4", label: "Grupo 4" },
                          { value: "5", label: "Grupo 5" },
                        ]}
                        {...register("grupoObrigatoriedadeeSocial", {
                          valueAsNumber: true,
                        })}
                        error={errors.grupoObrigatoriedadeeSocial?.message}
                      />
                    </div>
                  </div>
                )}

                {/* ABA 3 - Tributação */}
                {activeTab === "tributacao" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Checkbox
                        label="Optante com Atividades Tributadas"
                        {...register("atividadeTributada", {
                          setValueAs: (v: boolean) => (v ? 1 : 0),
                        })}
                        disabled={opcaoSimples !== 2}
                      />
                    </div>
                    {opcaoSimples !== 2 && (
                      <p className="text-sm text-gray-500">
                        Este campo só é habilitado quando a Opção pelo Simples é "Optante"
                      </p>
                    )}
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

                {/* ABA 5 - e-Social */}
                {activeTab === "esocial" && (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Configuração Certificado
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="Caminho do Certificado"
                          options={certificados.map((cert) => ({
                            value: cert,
                            label: cert,
                          }))}
                          {...register("caminhoCertificado")}
                          error={errors.caminhoCertificado?.message}
                        />

                        <DateInput
                          label="Validade Certificado"
                          {...register("validadeCertificado")}
                          error={errors.validadeCertificado?.message}
                          disabled
                        />

                        <Input
                          label="Senha"
                          type="password"
                          {...register("senhaCertificado")}
                          error={errors.senhaCertificado?.message}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Parametrização Envio Automático
                      </h3>
                      
                      <RadioGroup
                        label="Fases do e-Social"
                        name="faseESocial"
                        options={[
                          { value: 0, label: "Eventos de Tabela" },
                          { value: 1, label: "Eventos Não Periódicos" },
                          { value: 2, label: "Eventos SST" },
                        ]}
                        value={faseESocial}
                        onChange={(value) => setValue("faseESocial", Number(value))}
                        columns={3}
                      />

                      <div className="mt-4">
                        {faseESocial === 0 && (
                          <CheckedComboBox
                            label="Eventos de Tabela"
                            options={eventosTabelaOptions}
                            checked={watch("eventosTabela") || []}
                            onChange={(checked) => setValue("eventosTabela", checked)}
                          />
                        )}
                        {faseESocial === 1 && (
                          <CheckedComboBox
                            label="Eventos Não Periódicos"
                            options={eventosNaoPeriodicosOptions}
                            checked={watch("eventosNaoPeriodicos") || []}
                            onChange={(checked) => setValue("eventosNaoPeriodicos", checked)}
                          />
                        )}
                        {faseESocial === 2 && (
                          <CheckedComboBox
                            label="Eventos SST"
                            options={eventosSSTOptions}
                            checked={watch("eventosSST") || []}
                            onChange={(checked) => setValue("eventosSST", checked)}
                          />
                        )}
                      </div>

                      <div className="mt-6 space-y-4">
                        <Checkbox
                          label="Desativa Envio Automático"
                          {...register("desativaEnvioAutomatico", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />

                        <Checkbox
                          label="Desativa Consulta Automática"
                          {...register("desativaConsultaAutomatica", {
                            setValueAs: (v: boolean) => (v ? 1 : 0),
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 6 - Central de Avisos */}
                {activeTab === "centralAvisos" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        Selecione abaixo a situação e a quantidade de dias de antecedência que deseja receber a notificação.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Experiência primeiro período"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoExperienciaPrimeiroPeriodo", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoExperienciaPrimeiroPeriodo?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasExperienciaPrimeiroPeriodo", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasExperienciaPrimeiroPeriodo?.message}
                          type="number"
                          disabled={avisoExperienciaPrimeiroPeriodo !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Experiência prorrogação"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoExperienciaProrrogacao", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoExperienciaProrrogacao?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasExperienciaProrrogacao", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasExperienciaProrrogacao?.message}
                          type="number"
                          disabled={avisoExperienciaProrrogacao !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Programação de férias"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoProgramacaoFerias", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoProgramacaoFerias?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasProgramacaoFerias", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasProgramacaoFerias?.message}
                          type="number"
                          disabled={avisoProgramacaoFerias !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Aviso de rescisão"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoRescisao", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoRescisao?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasRescisao", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasRescisao?.message}
                          type="number"
                          disabled={avisoRescisao !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Vencimento certificado digital"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoVencimentoCertificado", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoVencimentoCertificado?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasVencimentoCertificado", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasVencimentoCertificado?.message}
                          type="number"
                          disabled={avisoVencimentoCertificado !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Término afastamento"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoTerminoAfastamento", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoTerminoAfastamento?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasTerminoAfastamento", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasTerminoAfastamento?.message}
                          type="number"
                          disabled={avisoTerminoAfastamento !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Férias a vencer"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoFeriasVencer", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoFeriasVencer?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasFeriasVencer", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasFeriasVencer?.message}
                          type="number"
                          disabled={avisoFeriasVencer !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Segundo período de férias a vencer"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoFeriasVencerSegundoPeriodo", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoFeriasVencerSegundoPeriodo?.message}
                        />
                        <Input
                          label="Dias"
                          {...register("diasFeriasVencerSegundoPeriodo", {
                            valueAsNumber: true,
                          })}
                          error={errors.diasFeriasVencerSegundoPeriodo?.message}
                          type="number"
                          disabled={avisoFeriasVencerSegundoPeriodo !== 1}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Select
                          label="Aniversariantes"
                          options={[
                            { value: "0", label: "Não" },
                            { value: "1", label: "Sim" },
                          ]}
                          {...register("avisoAniversariantes", {
                            valueAsNumber: true,
                          })}
                          error={errors.avisoAniversariantes?.message}
                        />
                      </div>
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
