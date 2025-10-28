import { NotaFiscal, ItemNotaFiscal } from '../types';

const NFE_NAMESPACE = "http://www.portalfiscal.inf.br/nfe";

function getElement(context: Element | Document, tagName: string): Element | null {
    const elements = context.getElementsByTagNameNS(NFE_NAMESPACE, tagName);
    return elements.length > 0 ? elements[0] : context.getElementsByTagName(tagName)[0] || null;
}

function getTagValue(element: Element | null, tagName: string): string {
    if (!element) return '';
    const tag = getElement(element, tagName);
    return tag?.textContent || '';
}

export function parseNFeXML(xmlString: string): Omit<NotaFiscal, 'item_nota_fiscal'> & { items: Omit<ItemNotaFiscal, 'id' | 'fk_nota_fiscal_chave_acesso'>[] } {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  
  const errorNode = xmlDoc.querySelector('parsererror');
  if (errorNode) throw new Error(`Falha ao parsear XML: ${errorNode.textContent}`);

  let NFe = getElement(xmlDoc, 'NFe');
  if (!NFe) {
      const nfeProc = getElement(xmlDoc, 'nfeProc');
      if (nfeProc) NFe = getElement(nfeProc, 'NFe');
  }

  if (!NFe) throw new Error("Estrutura de NFe inválida: tag <NFe> não encontrada.");

  const infNFe = getElement(NFe, 'infNFe');
  if (!infNFe) throw new Error("Estrutura de NFe inválida: tag <infNFe> não encontrada.");
  
  // Validações robustas para tags essenciais
  const ide = getElement(infNFe, 'ide');
  if (!ide) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <ide>.");

  const emit = getElement(infNFe, 'emit');
  if (!emit) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <emit>.");
  
  const enderEmit = getElement(emit, 'enderEmit');
  if (!enderEmit) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <enderEmit> dentro de <emit>.");

  const dest = getElement(infNFe, 'dest');
  if (!dest) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <dest>.");

  const total = getElement(infNFe, 'total');
  if (!total) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <total>.");

  const ICMSTot = getElement(total, 'ICMSTot');
  if (!ICMSTot) throw new Error("Estrutura de NFe inválida: Faltando tag obrigatória <ICMSTot> dentro de <total>.");


  const items: Omit<ItemNotaFiscal, 'id' | 'fk_nota_fiscal_chave_acesso'>[] = [];
  const detElements = Array.from(infNFe.getElementsByTagNameNS(NFE_NAMESPACE, 'det'));

  for (const det of detElements) {
    const prod = getElement(det, 'prod');
    if (prod) {
        items.push({
            codigo: getTagValue(prod, 'cProd'),
            codigo_ncm: getTagValue(prod, 'NCM'),
            descricao: getTagValue(prod, 'xProd'),
            quantidade: parseFloat(getTagValue(prod, 'qCom') || '0'),
            unidade: getTagValue(prod, 'uCom'),
            valor_unitario: parseFloat(getTagValue(prod, 'vUnCom') || '0'),
            valor_total: parseFloat(getTagValue(prod, 'vProd') || '0'),
        });
    }
  }

  const impostoTotal = 
      parseFloat(getTagValue(ICMSTot, 'vICMS') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vST') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vFCPST') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vII') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vIPI') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vPIS') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vCOFINS') || '0') +
      parseFloat(getTagValue(ICMSTot, 'vOutro') || '0');

  const chaveAcesso = infNFe.getAttribute('Id')?.replace('NFe', '').trim() || '';
  if (!chaveAcesso) throw new Error("Estrutura de NFe inválida: Atributo 'Id' da tag <infNFe> não encontrado, não foi possível extrair a chave de acesso.");

  return {
    chave_acesso: chaveAcesso,
    numero: getTagValue(ide, 'nNF') || '0',
    data_emissao: getTagValue(ide, 'dhEmi'),
    valor_total: parseFloat(getTagValue(ICMSTot, 'vNF') || '0'),
    imposto_total: impostoTotal,
    nome_emitente: getTagValue(emit, 'xNome'),
    // FIX: Corrected typo from getTaggValue to getTagValue.
    uf_emitente: getTagValue(enderEmit, 'UF'),
    nome_destinatario: getTagValue(dest, 'xNome'),
    doc_destinatario: getTagValue(dest, 'CNPJ') || getTagValue(dest, 'CPF') || '',
    items: items,
  };
}