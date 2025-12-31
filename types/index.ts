export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  qualificacaoResponsavel: string;
  regime: string;
  microempresa: boolean;
  epp: boolean;
  opcaoSimples: boolean;
  capitalSocial?: string;
  sindicatoPatronal?: string;
  geraSalario: boolean;
  calculoDsrHorista?: string;
  arredondamento?: string;
  fracionarFeriasPorMes: boolean;
  calcularLicencaRemunerada: boolean;
  alterarPeriodoAquisitivo: boolean;
  pagarAbonoAntesFerias: boolean;
  calcularComplemento13: boolean;
  dsrSabado: boolean;
  mesAnoCompetencia?: string;
  atividadeTributada?: string;
  sindicatoPatronalId?: string;
  nomeResponsavelContato?: string;
  ddd?: string;
  telefone?: string;
  logotipoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

