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
  user_id?: string;
  // Esta propriedade será populada pelo join do Supabase
  item_nota_fiscal: ItemNotaFiscal[];
}

export interface Filtros {
  dataInicio: string;
  dataFim: string;
  emitente: string;
  valorMin: number;
  valorMax: number;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}