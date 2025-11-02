// types.ts

export interface ItemNotaFiscal {
  id?: number;
  fk_nota_fiscal_chave_acesso: string;
  codigo: string;
  codigo_ncm: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valor_unitario: number;
  valor_total: number;
  cst_icms?: string;
}

export interface NotaFiscal {
  chave_acesso: string;
  numero: string;
  data_emissao: string;
  valor_total: number;
  imposto_total: number;
  nome_emitente: string;
  nome_destinatario: string;
  doc_destinatario: string;
  uf_emitente: string;
  uf_destinatario: string;
  indicador_ie_destinatario?: string;
  regime_tributario_emitente?: string;
  user_id?: string;
  // Campos da análise fiscal automática
  imposto_estimado_total?: number;
  diferenca_imposto?: number;
  calculo_premissas?: string;
  data_calculo?: string;
  possui_ncm_desconhecido?: boolean;
  // Propriedade populada pelo join do Supabase
  item_nota_fiscal: ItemNotaFiscal[];
}

export interface Filtros {
  dataInicio: string;
  dataFim: string;
  emitente: string;
  valorMin: number;
  valorMax: number;
  ufDestino: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface EstadoICMS {
    uf: string;
    aliquota: number;
    fcp: number;
}