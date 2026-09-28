export type Perfil = 'ADMIN' | 'GESTOR' | 'FUNCIONARIO';

export type StatusAdmissao =
  | 'PRE_ADMISSAO'
  | 'AGUARDANDO_APROVACAO'
  | 'ATIVO'
  | 'DESLIGADO';

export type StatusDocumento = 'PENDENTE' | 'APROVADO' | 'REPROVADO';

export type TipoDocumento =
  | 'CPF'
  | 'COMPROVANTE_RESIDENCIA'
  | 'CARTEIRA_TRABALHO'
  | 'OUTRO';

export type TipoBeneficio =
  | 'VALE_REFEICAO'
  | 'VALE_ALIMENTACAO'
  | 'VALE_TRANSPORTE'
  | 'PLANO_SAUDE'
  | 'PLANO_ODONTOLOGICO'
  | 'SEGURO_VIDA'
  | 'AUXILIO_CRECHE'
  | 'OUTRO';

export type ClassificacaoSaldo = 'POSITIVO' | 'NEGATIVO' | 'NEUTRO';

export type StatusAvaliacao = 'RASCUNHO' | 'FINALIZADA';
export type Genero = 'HOMEM' | 'MULHER' | 'OUTRO';
export type EstadoCivil =
  | 'SOLTEIRO'
  | 'CASADO'
  | 'UNIAO_ESTAVEL'
  | 'SEPARADO'
  | 'DIVORCIADO'
  | 'VIUVO';
export type UfBrasil =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO'
  | 'MA' | 'MT' | 'MS' | 'MG' | 'PA' | 'PB' | 'PR' | 'PE' | 'PI'
  | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO';
export type TipoContaBancaria = 'CORRENTE' | 'POUPANCA' | 'SALARIO' | 'PAGAMENTO';
export type Escolaridade =
  | 'ENSINO_FUNDAMENTAL'
  | 'ENSINO_MEDIO'
  | 'TECNICO'
  | 'TECNOLOGO'
  | 'GRADUACAO'
  | 'POS_GRADUACAO'
  | 'MBA'
  | 'MESTRADO'
  | 'DOUTORADO'
  | 'POS_DOUTORADO';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface FuncionarioResumo {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEmMs: number;
  trocaSenhaObrigatoria: boolean;
  funcionario: FuncionarioResumo;
}

export interface FuncionarioResponse {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  perfil: Perfil;
  statusAdmissao: StatusAdmissao;
  telefone: string | null;
  dataNascimento: string | null;
  dataAdmissao: string | null;
  dataDesligamento: string | null;
  motivoDesligamento: string | null;
  desligadoPorId: number | null;
  desligadoPorNome: string | null;
  nacionalidades: string[];
  ufNatal: UfBrasil | null;
  cidadeNatal: string | null;
  genero: Genero | null;
  nomeSocial: string | null;
  estadoCivil: EstadoCivil | null;
  ativo: boolean;
  departamentoId: number | null;
  departamentoNome: string | null;
  cargoId: number | null;
  cargoNome: string | null;
  gestorId: number | null;
  gestorNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DepartamentoResponse {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export interface CargoResponse {
  id: number;
  nome: string;
  descricao: string | null;
  departamentoId: number | null;
  departamentoNome: string | null;
  liderDiretoId: number | null;
  liderDiretoNome: string | null;
  ativo: boolean;
}

export interface HistoricoAlteracaoFuncionarioResponse {
  id: number;
  funcionarioId: number;
  alteradoPorId: number;
  alteradoPorNome: string;
  campo: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  alteradoEm: string;
}

export interface DadosBancariosResponse {
  id: number | null;
  banco: string | null;
  tipoConta: TipoContaBancaria | null;
  agencia: string | null;
  conta: string | null;
  chavePix: string | null;
}

export interface FormacaoAcademicaResponse {
  id: number;
  escolaridade: Escolaridade;
  instituicaoEnsino: string;
  curso: string;
  anoConclusao: number;
}

export interface DocumentoResponse {
  id: number;
  funcionarioId: number;
  requisitoId: number | null;
  tipo: TipoDocumento;
  tituloPersonalizado: string | null;
  nomeArquivo: string;
  contentType: string | null;
  tamanhoBytes: number;
  status: StatusDocumento;
  motivoReprovacao: string | null;
  criadoEm: string;
}

export interface RequisitoDocumentoResponse {
  id: number;
  titulo: string;
  tipo: TipoDocumento;
  descricao: string | null;
}

export interface NotificacaoFuncionarioResponse {
  id: number;
  titulo: string;
  descricao: string;
  aba: string;
  criadoEm: string;
}

export interface DocumentosPessoaisResponse {
  cpf: string;
  ctpsNumero: string | null;
  ctpsSerie: string | null;
  ctpsUfEmissor: UfBrasil | null;
  pis: string | null;
  ctpsDigital: boolean | null;
}

export interface HoleriteResponse {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  departamentoNome: string | null;
  mes: number;
  ano: number;
  nomeArquivo: string;
  contentType: string | null;
  tamanhoBytes: number;
  criadoEm: string;
}

export interface DemonstrativoHoleriteResponse {
  funcionarioId: number;
  funcionarioNome: string;
  departamentoNome: string | null;
  cargoNome: string | null;
  mes: number;
  ano: number;
  salarioBase: number;
  comissao: number;
  adicionalInsalubridade: number;
  adicionalPericulosidade: number;
  adicionalNoturno: number;
  horaExtra: number;
  salarioBruto: number;
  descontoInss: number;
  qtdDiasFalta: number;
  diasFalta: string[];
  descontoFaltas: number;
  descontoIrrf: number;
  salarioLiquido: number;
  fgts: number;
  resumoCalculo: string;
  alertaPrincipal: string;
  arquivo: HoleriteResponse | null;
}

export interface AtestadoResponse {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  cargoNome: string | null;
  departamentoNome: string | null;
  dataInicio: string;
  dataFim: string;
  diasCobertos: number;
  observacao: string | null;
  status: StatusDocumento;
  nomeArquivo: string;
  contentType: string | null;
  tamanhoBytes: number;
  motivoReprovacao: string | null;
  criadoEm: string;
}

export interface AvaliacaoItemRequest {
  criterio: string;
  nota: number;
  comentario: string | null;
}

export interface AvaliacaoRequest {
  avaliadoId: number;
  periodo: string;
  comentarioGeral: string | null;
  itens: AvaliacaoItemRequest[];
}

export interface BeneficioResponse {
  id: number;
  funcionarioId: number;
  tipo: TipoBeneficio;
  valor: number | null;
  descricao: string | null;
  criadoEm: string;
}

export interface BeneficioAdminResponse extends BeneficioResponse {
  funcionarioNome: string;
}

export interface BeneficioRequest {
  tipo: TipoBeneficio;
  valor: number | null;
  descricao: string | null;
}

export interface BeneficioLoteRequest extends BeneficioRequest {
  funcionarioIds: number[];
}

export interface EspelhoPontoResponse {
  id: number;
  funcionarioId: number;
  funcionarioNome: string;
  departamentoNome: string | null;
  ano: number;
  mes: number;
  diasUteis: number | null;
  horasPrevistasMinutos: number;
  horasTrabalhadasMinutos: number;
  saldoMinutos: number;
  horasExtrasMinutos: number;
  horasFaltantesMinutos: number;
  saldoFormatado: string;
  classificacao: ClassificacaoSaldo;
  origem: string;
  atualizadoEm: string;
}

export interface AvaliacaoItemResponse {
  id: number;
  criterio: string;
  nota: number;
  comentario: string | null;
}

export interface AvaliacaoResponse {
  id: number;
  avaliadoId: number;
  avaliadoNome: string;
  avaliadorId: number;
  avaliadorNome: string;
  periodo: string;
  comentarioGeral: string | null;
  notaFinal: number | null;
  status: StatusAvaliacao;
  itens: AvaliacaoItemResponse[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface FuncionarioFeedbackResumo {
  id: number;
  nome: string;
  departamentoId: number | null;
  departamentoNome: string | null;
  cargoNome: string | null;
}

export interface FeedbackRequest {
  destinatarioId: number;
  periodo: string;
  comentario: string;
  criterios: {
    criterio: string;
    nota: number;
    comentario: string | null;
  }[];
}

export interface ConsentimentoResponse {
  id: number;
  funcionarioId: number;
  versaoTermo: string;
  urlTermo: string | null;
  aceito: boolean;
  registradoEm: string;
}

export interface TermoLgpdResponse {
  versao: string;
  url: string;
  atualizadoEm: string;
}

export interface OrganogramaNode {
  id: number;
  nome: string;
  cargoNome: string | null;
  departamentoNome: string | null;
  perfil: Perfil;
  subordinados: OrganogramaNode[];
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fields?: { field: string; message: string }[] | null;
}
