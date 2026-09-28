import type { DocumentoResponse, TipoBeneficio, TipoDocumento } from '@/api/types';

/** Nomes legíveis para os enums da API, usados em listas e notificações. */
export const ROTULOS_BENEFICIO: Record<TipoBeneficio, string> = {
  VALE_REFEICAO: 'Vale-refeição',
  VALE_ALIMENTACAO: 'Vale-alimentação',
  VALE_TRANSPORTE: 'Vale-transporte',
  PLANO_SAUDE: 'Plano de saúde',
  PLANO_ODONTOLOGICO: 'Plano odontológico',
  SEGURO_VIDA: 'Seguro de vida',
  AUXILIO_CRECHE: 'Auxílio-creche',
  OUTRO: 'Outro',
};

export const ROTULOS_DOCUMENTO: Record<TipoDocumento, string> = {
  CPF: 'CPF',
  COMPROVANTE_RESIDENCIA: 'Comprovante de residência',
  CARTEIRA_TRABALHO: 'Carteira de Trabalho',
  OUTRO: 'Documento',
};

export function rotuloBeneficio(tipo: TipoBeneficio): string {
  return ROTULOS_BENEFICIO[tipo] ?? tipo.replace(/_/g, ' ');
}

export function rotuloDocumento(documento: Pick<DocumentoResponse, 'tipo' | 'tituloPersonalizado'>): string {
  return documento.tituloPersonalizado || ROTULOS_DOCUMENTO[documento.tipo] || documento.tipo.replace(/_/g, ' ');
}
