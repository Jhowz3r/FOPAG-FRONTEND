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
import { Checkbox } from "@/components/ui/Checkbox";
import { Tabs } from "@/components/ui/Tabs";
import api from "@/lib/axios";

const funcionarioSchema = z.object({
  idEmpresa: z.number().min(1, "Empresa é obrigatória"),
  idNacionalidade: z.number().optional(),
  idGps: z.number().optional(),
  idExposicaoAgenteNocivo: z.number().optional(),
  idCategoria: z.number().optional(),
  idAgencia: z.number().optional(),
  idMunicipio: z.number().optional(),
  matricula: z.number().min(1, "Matrícula é obrigatória"),
  nomeFuncionario: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  cpf: z.string().max(18).optional(),
  pis: z.string().max(18).optional(),
  tipoSalario: z.number().optional(),
  dataAdmissao: z.string().optional(),
  dataOpcaoFGTS: z.string().optional(),
  dataNascimento: z.string().optional(),
  carteiraNumero: z.string().max(10).optional(),
  carteiraEstado: z.number().min(1).max(27).optional(),
  carteiraSerie: z.string().max(6).optional(),
  carteiraDataExped: z.string().optional(),
  contaCorrenteOperacao: z.string().max(6).optional(),
  contaCorrenteNumero: z.string().max(12).optional(),
  contaCorrenteDigito: z.string().max(2).optional(),
  contaFGTS: z.string().max(17).optional(),
  digitoContaFGTS: z.string().max(5).optional(),
  percentualAdiantamento: z.number().optional(),
  deficienciaFisica: z.number().min(0).max(1).optional(),
  sexo: z.number().min(1).max(2, "Sexo é obrigatório"),
  escolaridade: z.number().min(1, "Escolaridade é obrigatória"),
  racaFuncionario: z.number().min(1, "Raça/Cor é obrigatória"),
  estadoCivil: z.number().min(1, "Estado Civil é obrigatório"),
  cep: z.string().max(9).optional(),
  ddd: z.number().min(11).max(99).optional(),
  telefone: z.string().max(9).optional(),
  identidade: z.string().max(17).optional(),
  ufIdentidade: z.number().min(1).max(27).optional(),
  tipoSanguineo: z.number().optional(),
  observacao: z.string().max(1500).optional(),

  // Novos Campos
  // Vínculo
  idFuncao: z.number().optional(),
  idHorario: z.number().optional(),
  dataVecToContrExp: z.string().optional(),
  dataAvisoPrevio: z.string().optional(),
  dataAquisicaoFerias: z.string().optional(),
  tipoContrato: z.number().optional(),
  tipoPagamento: z.number().optional(),
  dataEntradaTransferencia: z.string().optional(),
  dataSaidaTransferencia: z.string().optional(),

  // Endereço Completo
  denominacaoCep: z.string().max(100).optional(),
  bairroCep: z.string().max(50).optional(),
  localidadeCep: z.string().max(50).optional(),
  ufCep: z.string().max(2).optional(),
  complementoCep: z.string().max(50).optional(),
  numeroCep: z.string().max(10).optional(),

  // Documentos Adicionais
  dataExpedicaoIdentidade: z.string().optional(),
  orgaoExpedidorIdentidade: z.string().max(20).optional(),
  tituloEleitor: z.string().max(20).optional(),
  tituloEleitorSecao: z.string().max(10).optional(),
  tituloEleitorZona: z.string().max(10).optional(),
  carteiraReservista: z.string().max(20).optional(),
  habilitacaoNumero: z.string().max(20).optional(),
  habilitacaoCategoria: z.string().max(5).optional(),
  habilitacaoValidade: z.string().optional(),
  matriculaINSS: z.string().max(20).optional(),
  registroLivro: z.string().max(20).optional(),

  // Dados Pessoais Adicionais
  naturalidade: z.string().max(50).optional(),
  estadoNaturalidade: z.number().optional(),
  naturalizacao: z.number().optional(),
  naturalizacaoAnoChegada: z.number().optional(),
  nomeConjuge: z.string().max(100).optional(),
  nomePai: z.string().max(100).optional(),
  nomeMae: z.string().max(100).optional(),
  vencimentoExameMedico: z.string().optional(),
  dataEstabilidade: z.string().optional(),

  // Cálculos e Configurações
  imprimeFolha: z.number().optional(),
  calcContribuicaoConf: z.number().optional(),
  descContConfMesAdm: z.number().optional(),
  calcReversaoSalarial: z.number().optional(),
  descRevSalMesAdm: z.number().optional(),
  calcMensalidadeSindical: z.number().optional(),
  descMensSindMesAdm: z.number().optional(),
  calcContribuicaoSindical: z.number().optional(),
  calcularComplementoSalarial: z.number().optional(),
  possuiAlvara: z.number().optional(),
  usaValeTransporte: z.number().optional(),
  complementoFuncao: z.number().optional(),
});

type FuncionarioFormData = z.infer<typeof funcionarioSchema>;

export default function NewFuncionarioPage() {
  const router = useRouter();
  const [empresas, setEmpresas] = useState<{ id: number; razaoSocial?: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FuncionarioFormData>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
      deficienciaFisica: 0,
      tipoSanguineo: 0,
      imprimeFolha: 1,
      calcContribuicaoConf: 0,
      descContConfMesAdm: 0,
      calcReversaoSalarial: 0,
      descRevSalMesAdm: 0,
      calcMensalidadeSindical: 0,
      descMensSindMesAdm: 0,
      calcContribuicaoSindical: 0,
      calcularComplementoSalarial: 0,
      possuiAlvara: 0,
      usaValeTransporte: 0,
    },
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresas").catch(() => ({ data: [] }));
      setEmpresas(response.data);
    } catch (error) {
      setEmpresas([]);
    }
  };

  const onSubmit = async (data: FuncionarioFormData) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const payload: any = {
        ...data,
        // Campos que precisam de tratamento especial se houver
        idNacionalidade: data.idNacionalidade || undefined,
        idGps: data.idGps || undefined,
        idExposicaoAgenteNocivo: data.idExposicaoAgenteNocivo || undefined,
        idCategoria: data.idCategoria || undefined,
        idAgencia: data.idAgencia || undefined,
        idMunicipio: data.idMunicipio || undefined,

        // IDs de chaves estrangeiras opcionais
        idFuncao: data.idFuncao || undefined,
        idHorario: data.idHorario || undefined,
        estadoNaturalidade: data.estadoNaturalidade || undefined,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
          delete payload[key];
        }
      });

      await api.post("/funcionarios", payload);
      setSuccessMessage("Funcionário cadastrado com sucesso!");
      setTimeout(() => {
        router.push("/dashboard/cadastros/funcionarios");
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Erro ao salvar funcionário"
      );
    }
  };

  const tabs = [
    { id: "dadosPessoais", label: "Dados Pessoais" },
    { id: "documentos", label: "Documentos" },
    { id: "vinculo", label: "Vínculo" },
    { id: "bancarios", label: "Bancários" },
    { id: "endereco", label: "Endereço/Contato" },
    { id: "calculos", label: "Cálculos/Config" },
    { id: "outros", label: "Outros" },
  ];

  const ufs = [
    { value: 1, label: "AC" }, { value: 2, label: "AL" }, { value: 3, label: "AP" },
    { value: 4, label: "AM" }, { value: 5, label: "BA" }, { value: 6, label: "CE" },
    { value: 7, label: "DF" }, { value: 8, label: "ES" }, { value: 9, label: "GO" },
    { value: 10, label: "MA" }, { value: 11, label: "MT" }, { value: 12, label: "MS" },
    { value: 13, label: "MG" }, { value: 14, label: "PA" }, { value: 15, label: "PB" },
    { value: 16, label: "PR" }, { value: 17, label: "PE" }, { value: 18, label: "PI" },
    { value: 19, label: "RJ" }, { value: 20, label: "RN" }, { value: 21, label: "RS" },
    { value: 22, label: "RO" }, { value: 23, label: "RR" }, { value: 24, label: "SC" },
    { value: 25, label: "SP" }, { value: 26, label: "SE" }, { value: 27, label: "TO" },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Novo Funcionário</h1>
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
              {activeTab === "dadosPessoais" && (
                <div className="space-y-6">
                  <Input
                    label="Nome do Funcionário"
                    {...register("nomeFuncionario")}
                    error={errors.nomeFuncionario?.message}
                    maxLength={100}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="CPF"
                      {...register("cpf")}
                      error={errors.cpf?.message}
                      maxLength={18}
                      placeholder="000.000.000-00"
                    />
                    <Input
                      label="PIS"
                      {...register("pis")}
                      error={errors.pis?.message}
                      maxLength={18}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data de Nascimento"
                      {...register("dataNascimento")}
                      error={errors.dataNascimento?.message}
                    />
                    <Select
                      label="Sexo"
                      options={[
                        { value: 1, label: "Masculino" },
                        { value: 2, label: "Feminino" },
                      ]}
                      {...register("sexo", { valueAsNumber: true })}
                      error={errors.sexo?.message}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Estado Civil"
                      options={[
                        { value: 1, label: "Solteiro(a)" },
                        { value: 2, label: "Casado(a)" },
                        { value: 3, label: "Divorciado(a)" },
                        { value: 4, label: "Viúvo(a)" },
                        { value: 5, label: "União Estável" },
                      ]}
                      {...register("estadoCivil", { valueAsNumber: true })}
                      error={errors.estadoCivil?.message}
                      required
                    />
                    <Select
                      label="Escolaridade"
                      options={[
                        { value: 1, label: "Analfabeto" },
                        { value: 2, label: "Ensino Fundamental Incompleto" },
                        { value: 3, label: "Ensino Fundamental Completo" },
                        { value: 4, label: "Ensino Médio Incompleto" },
                        { value: 5, label: "Ensino Médio Completo" },
                        { value: 6, label: "Ensino Superior Incompleto" },
                        { value: 7, label: "Ensino Superior Completo" },
                      ]}
                      {...register("escolaridade", { valueAsNumber: true })}
                      error={errors.escolaridade?.message}
                      required
                    />
                  </div>

                  <Select
                    label="Raça/Cor"
                    options={[
                      { value: 1, label: "Branca" },
                      { value: 2, label: "Preta" },
                      { value: 3, label: "Parda" },
                      { value: 4, label: "Amarela" },
                      { value: 5, label: "Indígena" },
                      { value: 6, label: "Não Informado" },
                    ]}
                    {...register("racaFuncionario", { valueAsNumber: true })}
                    error={errors.racaFuncionario?.message}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Naturalidade"
                      {...register("naturalidade")}
                      error={errors.naturalidade?.message}
                    />
                    <Select
                      label="Estado Naturalidade"
                      options={[{ value: 0, label: "Selecione..." }, ...ufs]}
                      {...register("estadoNaturalidade", { valueAsNumber: true })}
                      error={errors.estadoNaturalidade?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nome do Pai"
                      {...register("nomePai")}
                      error={errors.nomePai?.message}
                    />
                    <Input
                      label="Nome da Mãe"
                      {...register("nomeMae")}
                      error={errors.nomeMae?.message}
                    />
                  </div>

                  <Input
                    label="Nome do Cônjuge"
                    {...register("nomeConjuge")}
                    error={errors.nomeConjuge?.message}
                  />

                </div>
              )}

              {activeTab === "documentos" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Carteira de Trabalho
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Número"
                      {...register("carteiraNumero")}
                      error={errors.carteiraNumero?.message}
                      maxLength={10}
                    />
                    <Input
                      label="Série"
                      {...register("carteiraSerie")}
                      error={errors.carteiraSerie?.message}
                      maxLength={6}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Estado"
                      options={[{ value: 0, label: "Selecione..." }, ...ufs]}
                      {...register("carteiraEstado", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                      error={errors.carteiraEstado?.message}
                    />
                    <DateInput
                      label="Data de Expedição CTPS"
                      {...register("carteiraDataExped")}
                      error={errors.carteiraDataExped?.message}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                    RG/Identidade
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Número"
                      {...register("identidade")}
                      error={errors.identidade?.message}
                      maxLength={17}
                    />
                    <Select
                      label="UF"
                      options={[{ value: 0, label: "Selecione..." }, ...ufs]}
                      {...register("ufIdentidade", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                      error={errors.ufIdentidade?.message}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data Expedição RG"
                      {...register("dataExpedicaoIdentidade")}
                      error={errors.dataExpedicaoIdentidade?.message}
                    />
                    <Input
                      label="Órgão Expedidor"
                      {...register("orgaoExpedidorIdentidade")}
                      error={errors.orgaoExpedidorIdentidade?.message}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                    Outros Documentos
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Título de Eleitor"
                      {...register("tituloEleitor")}
                      error={errors.tituloEleitor?.message}
                    />
                    <Input
                      label="Seção"
                      {...register("tituloEleitorSecao")}
                      error={errors.tituloEleitorSecao?.message}
                    />
                    <Input
                      label="Zona"
                      {...register("tituloEleitorZona")}
                      error={errors.tituloEleitorZona?.message}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Reservista"
                      {...register("carteiraReservista")}
                      error={errors.carteiraReservista?.message}
                    />
                    <Input
                      label="Matrícula INSS"
                      {...register("matriculaINSS")}
                      error={errors.matriculaINSS?.message}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Habilitacao (CNH)"
                      {...register("habilitacaoNumero")}
                      error={errors.habilitacaoNumero?.message}
                    />
                    <Input
                      label="Categoria CNH"
                      {...register("habilitacaoCategoria")}
                      error={errors.habilitacaoCategoria?.message}
                    />
                    <DateInput
                      label="Validade CNH"
                      {...register("habilitacaoValidade")}
                      error={errors.habilitacaoValidade?.message}
                    />
                  </div>

                  <Input
                    label="Registro Livro"
                    {...register("registroLivro")}
                    error={errors.registroLivro?.message}
                  />

                </div>
              )}

              {activeTab === "vinculo" && (
                <div className="space-y-6">
                  <Select
                    label="Empresa"
                    options={empresas.map((empresa) => ({
                      value: empresa.id,
                      label: empresa.razaoSocial || `Empresa ${empresa.id}`,
                    }))}
                    {...register("idEmpresa", { valueAsNumber: true })}
                    error={errors.idEmpresa?.message}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Matrícula"
                      type="number"
                      {...register("matricula", { valueAsNumber: true })}
                      error={errors.matricula?.message}
                      required
                    />
                    <Input
                      label="ID Função"
                      type="number"
                      {...register("idFuncao", { valueAsNumber: true })}
                      error={errors.idFuncao?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data de Admissão"
                      {...register("dataAdmissao")}
                      error={errors.dataAdmissao?.message}
                    />
                    <Input
                      label="ID Horário"
                      type="number"
                      {...register("idHorario", { valueAsNumber: true })}
                      error={errors.idHorario?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Tipo Salário"
                      options={[
                        { value: "", label: "Selecione..." },
                        { value: 1, label: "Mensal" },
                        { value: 2, label: "Horista" },
                        { value: 3, label: "Diário" },
                      ]}
                      {...register("tipoSalario", { valueAsNumber: true, setValueAs: (v) => v === "" ? undefined : Number(v) })}
                      error={errors.tipoSalario?.message}
                    />
                    <Select
                      label="Tipo Contrato"
                      options={[
                        { value: 0, label: "Selecione..." },
                        { value: 1, label: "Prazo Indeterminado" },
                        { value: 2, label: "Prazo Determinado" },
                        { value: 3, label: "Experiência" },
                      ]}
                      {...register("tipoContrato", { valueAsNumber: true })}
                      error={errors.tipoContrato?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data Opção FGTS"
                      {...register("dataOpcaoFGTS")}
                      error={errors.dataOpcaoFGTS?.message}
                    />
                    <DateInput
                      label="Venc. Contrato Exp."
                      {...register("dataVecToContrExp")}
                      error={errors.dataVecToContrExp?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data Aviso Prévio"
                      {...register("dataAvisoPrevio")}
                      error={errors.dataAvisoPrevio?.message}
                    />
                    <DateInput
                      label="Aquisição Férias"
                      {...register("dataAquisicaoFerias")}
                      error={errors.dataAquisicaoFerias?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Data Entrada Transferência"
                      {...register("dataEntradaTransferencia")}
                      error={errors.dataEntradaTransferencia?.message}
                    />
                    <DateInput
                      label="Data Saída Transferência"
                      {...register("dataSaidaTransferencia")}
                      error={errors.dataSaidaTransferencia?.message}
                    />
                  </div>

                </div>
              )}

              {activeTab === "bancarios" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Conta Corrente
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Operação"
                      {...register("contaCorrenteOperacao")}
                      error={errors.contaCorrenteOperacao?.message}
                      maxLength={6}
                    />
                    <Input
                      label="Número"
                      {...register("contaCorrenteNumero")}
                      error={errors.contaCorrenteNumero?.message}
                      maxLength={12}
                    />
                    <Input
                      label="Dígito"
                      {...register("contaCorrenteDigito")}
                      error={errors.contaCorrenteDigito?.message}
                      maxLength={2}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">
                    Conta FGTS
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Número"
                      {...register("contaFGTS")}
                      error={errors.contaFGTS?.message}
                      maxLength={17}
                    />
                    <Input
                      label="Dígito"
                      {...register("digitoContaFGTS")}
                      error={errors.digitoContaFGTS?.message}
                      maxLength={5}
                    />
                  </div>

                  <Input
                    label="Percentual Adiantamento"
                    type="number"
                    step="0.01"
                    {...register("percentualAdiantamento", { valueAsNumber: true })}
                    error={errors.percentualAdiantamento?.message}
                  />

                  <Select
                    label="Tipo Pagamento"
                    options={[
                      { value: 0, label: "Selecione..." },
                      { value: 1, label: "Dinheiro" },
                      { value: 2, label: "Cheque" },
                      { value: 3, label: "Crédito em Conta" },
                    ]}
                    {...register("tipoPagamento", { valueAsNumber: true })}
                    error={errors.tipoPagamento?.message}
                  />
                </div>
              )}

              {activeTab === "endereco" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="CEP"
                      {...register("cep")}
                      error={errors.cep?.message}
                      maxLength={9}
                      placeholder="00000-000"
                    />
                    <Input
                      label="Denominação CEP"
                      {...register("denominacaoCep")}
                      error={errors.denominacaoCep?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Localidade (Cidade)"
                      {...register("localidadeCep")}
                      error={errors.localidadeCep?.message}
                    />
                    <Input
                      label="Bairro"
                      {...register("bairroCep")}
                      error={errors.bairroCep?.message}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="UF"
                      {...register("ufCep")}
                      error={errors.ufCep?.message}
                      maxLength={2}
                    />
                    <Input
                      label="Número"
                      {...register("numeroCep")}
                      error={errors.numeroCep?.message}
                    />
                    <Input
                      label="Complemento"
                      {...register("complementoCep")}
                      error={errors.complementoCep?.message}
                    />
                  </div>

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
                </div>
              )}

              {activeTab === "calculos" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Checkbox
                      label="Imprime na Folha"
                      {...register("imprimeFolha", { setValueAs: (v) => (v ? 1 : 0) })}
                    />
                    <Checkbox
                      label="Possui Alvará"
                      {...register("possuiAlvara", { setValueAs: (v) => (v ? 1 : 0) })}
                    />
                    <Checkbox
                      label="Usa Vale Transporte"
                      {...register("usaValeTransporte", { setValueAs: (v) => (v ? 1 : 0) })}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Contribuições e Descontos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Checkbox label="Calc. Contrib. Confederativa" {...register("calcContribuicaoConf", { setValueAs: (v) => v ? 1 : 0 })} />
                    <Checkbox label="Desc. Cont. Conf. Mês Adm" {...register("descContConfMesAdm", { setValueAs: (v) => v ? 1 : 0 })} />

                    <Checkbox label="Calc. Reversão Salarial" {...register("calcReversaoSalarial", { setValueAs: (v) => v ? 1 : 0 })} />
                    <Checkbox label="Desc. Rev. Sal. Mês Adm" {...register("descRevSalMesAdm", { setValueAs: (v) => v ? 1 : 0 })} />

                    <Checkbox label="Calc. Mensalidade Sindical" {...register("calcMensalidadeSindical", { setValueAs: (v) => v ? 1 : 0 })} />
                    <Checkbox label="Desc. Mens. Sind. Mês Adm" {...register("descMensSindMesAdm", { setValueAs: (v) => v ? 1 : 0 })} />

                    <Checkbox label="Calc. Contribuição Sindical" {...register("calcContribuicaoSindical", { setValueAs: (v) => v ? 1 : 0 })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Checkbox label="Calcular Complemento Salarial" {...register("calcularComplementoSalarial", { setValueAs: (v) => v ? 1 : 0 })} />
                    <Input
                      label="Valor Complemento Função"
                      type="number"
                      step="0.01"
                      {...register("complementoFuncao", { valueAsNumber: true })}
                      error={errors.complementoFuncao?.message}
                    />
                  </div>
                </div>
              )}

              {activeTab === "outros" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Tipo Sanguíneo"
                      options={[
                        { value: 0, label: "Não Informado" },
                        { value: 1, label: "A+" },
                        { value: 2, label: "A-" },
                        { value: 3, label: "B+" },
                        { value: 4, label: "B-" },
                        { value: 5, label: "AB+" },
                        { value: 6, label: "AB-" },
                        { value: 7, label: "O+" },
                        { value: 8, label: "O-" },
                      ]}
                      {...register("tipoSanguineo", { valueAsNumber: true })}
                      error={errors.tipoSanguineo?.message}
                    />
                    <Checkbox
                      label="Deficiência Física"
                      {...register("deficienciaFisica", {
                        setValueAs: (v: boolean) => (v ? 1 : 0),
                      })}
                      error={errors.deficienciaFisica?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <DateInput
                      label="Vencimento Exame Médico"
                      {...register("vencimentoExameMedico")}
                      error={errors.vencimentoExameMedico?.message}
                    />
                    <DateInput
                      label="Data Estabilidade"
                      {...register("dataEstabilidade")}
                      error={errors.dataEstabilidade?.message}
                    />
                  </div>

                  <Input
                    label="Observação"
                    multiline
                    rows={6}
                    {...register("observacao")}
                    error={errors.observacao?.message}
                    maxLength={1500}
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
