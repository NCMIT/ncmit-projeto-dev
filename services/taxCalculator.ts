
import { GoogleGenAI, Type } from '@google/genai';
import type { NotaFiscal, ItemNotaFiscal, EstadoICMS } from '../types';

// ====================================================================
// TAX DATA (Consolidated)
// ====================================================================

export const ESTADOS_ICMS: EstadoICMS[] = [
    { uf: 'AC', aliquota: 19, fcp: 0 }, { uf: 'AL', aliquota: 19, fcp: 2 }, { uf: 'AP', aliquota: 18, fcp: 0 },
    { uf: 'AM', aliquota: 20, fcp: 2 }, { uf: 'BA', aliquota: 20.5, fcp: 2 }, { uf: 'CE', aliquota: 20, fcp: 2 },
    { uf: 'DF', aliquota: 20, fcp: 2 }, { uf: 'ES', aliquota: 17, fcp: 0 }, { uf: 'GO', aliquota: 19, fcp: 2 },
    { uf: 'MA', aliquota: 22, fcp: 2 }, { uf: 'MT', aliquota: 17, fcp: 2 }, { uf: 'MS', aliquota: 17, fcp: 2 },
    { uf: 'MG', aliquota: 18, fcp: 2 }, { uf: 'PA', aliquota: 19, fcp: 0 }, { uf: 'PB', aliquota: 20, fcp: 2 },
    { uf: 'PR', aliquota: 19.5, fcp: 0 }, { uf: 'PE', aliquota: 20.5, fcp: 2 }, { uf: 'PI', aliquota: 21, fcp: 2 },
    { uf: 'RJ', aliquota: 20, fcp: 2 }, { uf: 'RN', aliquota: 20, fcp: 2 }, { uf: 'RS', aliquota: 17, fcp: 2 },
    { uf: 'RO', aliquota: 19.5, fcp: 0 }, { uf: 'RR', aliquota: 20, fcp: 0 }, { uf: 'SC', aliquota: 17, fcp: 0 },
    { uf: 'SP', aliquota: 18, fcp: 0 }, { uf: 'SE', aliquota: 19, fcp: 2 }, { uf: 'TO', aliquota: 20, fcp: 2 },
];

const MVA_AUTOPECAS_PADRAO_FALLBACK = 71.78;

const regioes = {
    SUL: ['PR', 'RS', 'SC'],
    SUDESTE: ['ES', 'MG', 'RJ', 'SP'],
    NORTE: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    NORDESTE: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    CENTRO_OESTE: ['DF', 'GO', 'MT', 'MS'],
};

export const getAliquotaInterestadual = (ufOrigem: string, ufDestino: string): number => {
    if (!ufOrigem || !ufDestino || ufOrigem === ufDestino) return 0;

    const isOrigemSulSudeste = [...regioes.SUL, ...regioes.SUDESTE].filter(uf => uf !== 'ES').includes(ufOrigem);
    const isDestinoNorteNordesteCentroOesteES = [...regioes.NORTE, ...regioes.NORDESTE, ...regioes.CENTRO_OESTE, 'ES'].includes(ufDestino);
    
    if (isOrigemSulSudeste && isDestinoNorteNordesteCentroOesteES) {
        return 7;
    }
    return 12;
};

// ... (ALIQUOTAS_DATA permanece o mesmo, usado para o modal informativo)
export const ALIQUOTAS_DATA = [
    {
        name: 'ICMS (Imposto sobre Circulação de Mercadorias e Serviços)',
        shortName: 'ICMS',
        description: 'Principal imposto estadual para autopeças, com regras complexas que variam por estado e tipo de operação. A Substituição Tributária (ICMS-ST) é muito comum neste setor.',
        sections: [
            {
                title: 'Substituição Tributária (ICMS-ST)',
                content: 'No setor de autopeças, o ICMS-ST é a regra geral. O imposto de toda a cadeia (fabricante, distribuidor, varejista) é recolhido antecipadamente pela indústria ou importador. Isso significa que o imposto já está embutido no preço de compra das peças pelo varejista. A base de cálculo usa uma Margem de Valor Agregado (MVA) definida em convênios entre os estados.',
                type: 'text'
            },
            {
                title: 'Alíquotas Internas por Estado (Operações dentro do mesmo UF)',
                content: ESTADOS_ICMS,
                type: 'table'
            },
            {
                title: 'Fundo de Combate à Pobreza (FCP)',
                content: 'Muitos estados adicionam um percentual (geralmente 1% a 2%) à alíquota de ICMS para financiar o FCP. Isso aumenta a carga tributária efetiva sobre as autopeças. É crucial verificar a legislação do estado de destino para saber se o FCP se aplica ao produto.',
                type: 'text'
            },
            {
                title: 'DIFAL (Diferencial de Alíquota)',
                content: 'Nas vendas interestaduais para consumidor final não contribuinte do ICMS, o remetente deve recolher a diferença entre a alíquota interna do estado de destino (incluindo FCP, se houver) e a alíquota interestadual. Esse valor é devido ao estado de destino.',
                type: 'text'
            },
             {
                title: 'Alíquotas Interestaduais (Vendas para contribuintes de ICMS)',
                content: [
                    'De S/SE (exceto ES) para N/NE/CO/ES: 7%',
                    'De S/SE (exceto ES) para S/SE: 12%',
                    'Produtos Importados (com Conteúdo de Importação > 40%): 4%',
                ],
                type: 'list'
            }
        ],
        source: {
            url: 'https://www.confaz.fazenda.gov.br/legislacao/convenios/2017/cv201_17',
            text: 'Convênio ICMS 201/17 e Legislações Estaduais'
        },
        lastUpdated: '25/08/2024'
    },
    {
        name: 'IPI (Imposto sobre Produtos Industrializados)',
        shortName: 'IPI',
        description: 'Imposto federal sobre produtos industrializados. A alíquota é específica para cada código NCM do produto. Consulte sempre a Tabela de Incidência do IPI (TIPI) mais recente, pois as alíquotas são alteradas com frequência por decreto.',
        sections: [
            {
                title: 'Princípio da Não Cumulatividade',
                content: 'O IPI é um imposto não cumulativo, o que significa que a empresa pode abater (creditar) o valor do imposto pago na compra de matérias-primas ou produtos intermediários do valor a ser pago na venda do produto final. Isso evita o "imposto em cascata".',
                type: 'text'
            },
            {
                title: 'Exemplos de Alíquotas de IPI para Autopeças',
                content: [
                    'NCM 8708.29.99 (Outros acessórios de carroçaria): 4.88%',
                    'NCM 8708.70.90 (Rodas e suas partes): 4.88%',
                    'NCM 4016.99.90 (Outras obras de borracha vulcanizada): 4.23%',
                    'NCM 8409.91.12 (Pistões): 3.25%',
                    'NCM 8511.10.00 (Velas de ignição): 3.25%',
                    'NCM 8421.23.00 (Filtros de óleo): 3.25%',
                    'NCM 8708.30.90 (Outras partes de freios): 3.25%',
                ],
                type: 'list-highlight'
            }
        ],
        source: {
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/D11158.htm',
            text: 'Tabela de Incidência do IPI (TIPI) - Decreto nº 11.158/2022'
        },
        lastUpdated: '29/07/2022'
    },
    {
        name: 'PIS e COFINS (Contribuições Federais)',
        shortName: 'PIS/COFINS',
        description: 'Para autopeças, estas contribuições frequentemente seguem o Regime Monofásico, onde a tributação é concentrada no início da cadeia produtiva.',
        sections: [
            {
                title: 'Regime Monofásico (Regra geral para Autopeças)',
                content: 'O fabricante ou importador recolhe o PIS/COFINS com alíquotas maiores (ex: 2,3% PIS e 10,8% COFINS). Como resultado, as etapas seguintes da cadeia (distribuidores e varejistas) são desoneradas, realizando vendas com alíquota zero e simplificando a apuração.',
                type: 'text'
            },
            {
                title: 'Alíquotas Padrão (Caso não se aplique o monofásico)',
                content: [
                    'Regime Cumulativo (Lucro Presumido): PIS 0,65% | COFINS 3,00%',
                    'Regime Não-Cumulativo (Lucro Real): PIS 1,65% | COFINS 7,60%',
                ],
                type: 'list'
            }
        ],
        source: {
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l10485.htm',
            text: 'Lei nº 10.485/02 (Regime Monofásico)'
        },
        lastUpdated: '20/05/2024'
    },
    {
        name: 'IRPJ e CSLL (Imposto de Renda e Contribuição Social)',
        shortName: 'IRPJ/CSLL',
        description: 'Impostos federais que incidem sobre o lucro da empresa. As alíquotas e bases de cálculo dependem diretamente do regime tributário adotado (Lucro Real, Presumido ou Simples Nacional).',
        sections: [
            {
                title: 'Principais Regimes Tributários',
                content: [
                    'Lucro Real: IRPJ (15% + 10% adicional sobre lucro > R$20k/mês) e CSLL (9%) são calculados sobre o lucro contábil ajustado. Obrigatório para empresas com faturamento anual > R$ 78 milhões.',
                    'Lucro Presumido: Impostos calculados sobre uma presunção de lucro definida por lei (para indústria/comércio, a base é 8% para IRPJ e 12% para CSLL). Sobre essa base, aplicam-se 15% de IRPJ e 9% de CSLL.',
                    'Simples Nacional: Regime unificado para micro e pequenas empresas. Todos os impostos (incluindo IRPJ, CSLL, PIS, COFINS, IPI e ICMS) são recolhidos em uma guia única (DAS) com alíquotas progressivas baseadas no faturamento.',
                ],
                type: 'list'
            }
        ],
        source: {
            url: 'http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm',
            text: 'Lei Complementar nº 123/06 (Simples Nacional)'
        },
        lastUpdated: '01/01/2024'
    },
    {
        name: 'Siglas de Unidades Comerciais',
        shortName: 'Unidades',
        description: 'Abaixo estão algumas das siglas de unidades de medida mais comuns encontradas em notas fiscais e seus significados.',
        sections: [
            {
                title: 'Unidades Comuns',
                type: 'list-highlight',
                content: [
                    'UN | UNID: Unidade',
                    'PC | PÇ: Peça',
                    'CX: Caixa',
                    'KG: Quilograma',
                    'G: Grama',
                    'L: Litro',
                    'M: Metro',
                    'M2: Metro Quadrado',
                    'M3: Metro Cúbico',
                    'PAR: Par',
                    'KIT: Kit',
                    'RL: Rolo',
                    'JG: Jogo',
                ],
            }
        ],
        source: {
            url: 'https://www.portaldaauditoria.com.br/tabela-unidade-de-medida-comercial-e-tributavel/',
            text: 'Tabela de Unidades de Medida'
        },
        lastUpdated: '26/08/2024'
    }
];


// ====================================================================
// GEMINI AI SERVICE FOR TAX RATES
// ====================================================================
interface NcmTaxRates {
    ipi_aliquota: number;
    mva_st_ajustada: number;
}

const getTaxRatesFromAI = async (ncm: string, ufOrigem: string, ufDestino: string, isNaoContribuinte: boolean): Promise<NcmTaxRates | null> => {
    try {
        // A API Key (process.env.API_KEY) é injetada automaticamente pelo ambiente de execução.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const tipoDestinatario = isNaoContribuinte ? "consumidor final não contribuinte de ICMS" : "contribuinte de ICMS (revenda)";
        const prompt = `Você é um especialista em tributação de autopeças no Brasil. Para o NCM '${ncm}', numa venda de '${ufOrigem}' para '${ufDestino}' destinada a um '${tipoDestinatario}', forneça a alíquota de IPI e a MVA-ST ajustada. Se for venda a não contribuinte (DIFAL), a MVA-ST é 0. Responda APENAS com o objeto JSON.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                ipi_aliquota: { type: Type.NUMBER, description: "Alíquota de IPI em porcentagem. Ex: 4.88" },
                mva_st_ajustada: { type: Type.NUMBER, description: "MVA-ST ajustada para a operação, em porcentagem. Ex: 71.78" },
            },
            required: ["ipi_aliquota", "mva_st_ajustada"],
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as NcmTaxRates;

    } catch (error) {
        console.error(`AI tax rate query failed for NCM ${ncm}:`, error);
        return null;
    }
};

export const checkTaxUpdatesWithAI = async (currentData: typeof ALIQUOTAS_DATA): Promise<{ hasUpdates: boolean, updatedData?: typeof ALIQUOTAS_DATA }> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const currentDate = new Date().toLocaleDateString('pt-BR');
        
        const prompt = `
            Você é um assistente tributário especializado em legislação brasileira de autopeças.
            Analise a data de hoje (${currentDate}) e verifique se houve alterações significativas nas alíquotas de ICMS (interestadual), IPI (TIPI) ou regras de PIS/COFINS para autopeças desde as datas de 'lastUpdated' informadas abaixo.
            
            Dados atuais: ${JSON.stringify(currentData.map(d => ({ name: d.name, lastUpdated: d.lastUpdated })))}

            Se houver novas leis ou decretos federais importantes publicados após essas datas que alterem as alíquotas padrão mostradas, retorne 'hasUpdates': true e forneça o array de dados completo atualizado (mantendo a estrutura exata original) com a nova data em 'lastUpdated' e as descrições ajustadas.
            Se não houver mudanças relevantes ou se as datas forem recentes, retorne 'hasUpdates': false.
        `;

        // Using a loose schema to allow flexible return of the complex object structure if needed, 
        // but focusing on the boolean primarily.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                // We define a simplified schema to ensure we get the boolean and potentially the data
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        hasUpdates: { type: Type.BOOLEAN },
                        updatedData: { 
                            type: Type.ARRAY, 
                            items: { type: Type.OBJECT, properties: {}, nullable: true }, // Loose schema for the complex data
                            description: "O array completo de ALIQUOTAS_DATA com as atualizações, se houver.",
                            nullable: true
                        }
                    },
                    required: ["hasUpdates"]
                }
            }
        });
        
        const result = JSON.parse(response.text);
        
        // Validate if updatedData matches the structure roughly if returned
        if (result.hasUpdates && result.updatedData && Array.isArray(result.updatedData)) {
             return { hasUpdates: true, updatedData: result.updatedData as typeof ALIQUOTAS_DATA };
        }

        return { hasUpdates: false };

    } catch (error) {
        console.error("Failed to check tax updates:", error);
        return { hasUpdates: false };
    }
}


// ====================================================================
// TAX CALCULATION LOGIC
// ====================================================================

type NotaCoreData = Omit<NotaFiscal, 'item_nota_fiscal' | 'user_id' >;

export interface TaxEstimateResult {
    imposto_estimado_total: number;
    imposto_estimado_icms: number;
    imposto_estimado_ipi: number;
    imposto_estimado_pis_cofins: number;
    diferenca_imposto: number;
    possui_ncm_desconhecido: boolean;
    calculo_premissas: string;
    data_calculo: string;
}

export interface ItemTaxValues {
    ipi: number;
    icms: number;
    pis: number;
    cofins: number;
}

export interface FullTaxEstimateResult {
    analysis: TaxEstimateResult;
    itemTaxes: ItemTaxValues[];
}

const IPI_RATES_FALLBACK: ReadonlyMap<string, number> = new Map([
    ['87082999', 4.88], ['87087090', 4.88], ['40169990', 4.23],
    ['84099112', 3.25], ['85111000', 3.25], ['84212300', 3.25],
    ['87083090', 3.25]
]);

export const calculateTaxEstimate = async (notaCore: NotaCoreData, items: Pick<ItemNotaFiscal, 'valor_total' | 'codigo_ncm' | 'codigo' | 'descricao' | 'cst_icms' | 'quantidade' | 'valor_unitario'>[]): Promise<FullTaxEstimateResult> => {
    let totalIcms = 0;
    let totalIpi = 0;
    let totalPisCofins = 0;
    let possui_ncm_desconhecido = false;
    const details: string[] = [];
    const ncmRatesCache = new Map<string, NcmTaxRates | null>();
    const ncmWarningDetails: string[] = [];
    const isentosWarningAdded = new Set<string>();
    const itemTaxes: ItemTaxValues[] = [];

    const cstsIsentosOuNaoTributados = new Set(['40', '41', '50', '51', '102', '103', '300', '400', '500']);

    const getEstado = (uf: string): EstadoICMS => {
        return ESTADOS_ICMS.find(e => e.uf === uf) || { uf, aliquota: 18, fcp: 0 };
    };

    const isSimplesNacional = notaCore.regime_tributario_emitente === '1';
    const isRegimeNormal = notaCore.regime_tributario_emitente === '3';

    if (isSimplesNacional) {
        details.push('- Análise considera que o emitente é optante pelo Simples Nacional.');
    } else if (isRegimeNormal) {
        details.push('- Análise considera que o emitente está no Regime Normal (Lucro Presumido/Real).');
    }

    const estadoOrigem = getEstado(notaCore.uf_emitente);
    const estadoDestino = notaCore.uf_destinatario ? getEstado(notaCore.uf_destinatario) : estadoOrigem;
    const isOperationInterestadual = !!notaCore.uf_destinatario && notaCore.uf_emitente !== notaCore.uf_destinatario;
    const isDestinatarioNaoContribuinte = notaCore.indicador_ie_destinatario === '9';

    for (const item of items) {
        const valorBase = item.quantidade && item.valor_unitario ? item.quantidade * item.valor_unitario : item.valor_total || 0;
        const ncmLimpo = (item.codigo_ncm || '').replace(/\./g, '');
        let valorIpiItem = 0;
        let icmsItem = 0;
        let pisItem = 0;
        let cofinsItem = 0;
        let mvaParaCalculo = MVA_AUTOPECAS_PADRAO_FALLBACK;
        
        if (ncmLimpo && !isSimplesNacional) { // IPI is not calculated for Simples Nacional
            if (!ncmRatesCache.has(ncmLimpo)) {
                const rates = await getTaxRatesFromAI(ncmLimpo, estadoOrigem.uf, estadoDestino.uf, isDestinatarioNaoContribuinte);
                ncmRatesCache.set(ncmLimpo, rates);
            }
            const aiRates = ncmRatesCache.get(ncmLimpo);
            
            if (aiRates) {
                valorIpiItem = valorBase * (aiRates.ipi_aliquota / 100);
                mvaParaCalculo = aiRates.mva_st_ajustada;
                if (!details.some(d => d.includes(`(Consulta IA NCM ${ncmLimpo})`))) {
                     details.push(`- IPI (${aiRates.ipi_aliquota}%) e MVA (${aiRates.mva_st_ajustada}%) aplicados. (Consulta IA NCM ${ncmLimpo})`);
                }
            } else {
                 if (IPI_RATES_FALLBACK.has(ncmLimpo)) {
                    const ipiRate = IPI_RATES_FALLBACK.get(ncmLimpo)!;
                    valorIpiItem = valorBase * (ipiRate / 100);
                 } else {
                    possui_ncm_desconhecido = true;
                    ncmWarningDetails.push(`- Item (Cód: ${item.codigo}): NCM '${item.codigo_ncm}' desconhecido na base, IPI não calculado.`);
                 }
                 if (!details.some(d => d.includes(`(Fallback NCM ${ncmLimpo})`))) {
                    details.push(`- IPI/MVA aplicados com base em alíquotas padrão. (Fallback NCM ${ncmLimpo})`);
                 }
            }
        } else if (!ncmLimpo) {
            possui_ncm_desconhecido = true;
            ncmWarningDetails.push(`- Item (Cód: ${item.codigo}): NCM não informado, IPI não calculado.`);
        }

        // PIS/COFINS Calculation
        if (isRegimeNormal) {
            // Assuming Lucro Presumido (Cumulative) as a default for Regime Normal,
            // unless it's a monofasic product, which is very common for auto parts.
            // The safest general assumption for a revendedor is 0. But for a more complete analysis:
            pisItem = valorBase * 0.0065; // 0.65%
            cofinsItem = valorBase * 0.03;   // 3.00%
        }

        totalIpi += valorIpiItem;
        totalPisCofins += pisItem + cofinsItem;
        const baseCalculoIcms = valorBase + valorIpiItem;
        
        if (isSimplesNacional) {
            // ICMS is not calculated here for Simples Nacional as it's paid via DAS
        } else if (item.cst_icms && cstsIsentosOuNaoTributados.has(item.cst_icms)) {
            // Add premise only once per CST type to avoid clutter
            if (!isentosWarningAdded.has(item.cst_icms)) {
                details.push(`- Itens com CST/CSOSN ${item.cst_icms} tiveram ICMS estimado como zero (Operação isenta/não tributada).`);
                isentosWarningAdded.add(item.cst_icms);
            }
        } else {
            if (!isOperationInterestadual) {
                const aliquotaEfetiva = estadoOrigem.aliquota + estadoOrigem.fcp;
                icmsItem = baseCalculoIcms * (aliquotaEfetiva / 100);
            } else {
                const aliquotaInterestadual = getAliquotaInterestadual(estadoOrigem.uf, estadoDestino.uf);
                
                if (isDestinatarioNaoContribuinte) {
                    // Lógica de DIFAL para não contribuinte (cálculo "por dentro")
                    const aliquotaInternaDestinoEfetiva = estadoDestino.aliquota + estadoDestino.fcp;
                    const baseCalculoDifal = baseCalculoIcms / (1 - (aliquotaInternaDestinoEfetiva / 100));
                    const icmsDestinoTotal = baseCalculoDifal * (aliquotaInternaDestinoEfetiva / 100);
                    const icmsInterestadual = baseCalculoIcms * (aliquotaInterestadual / 100);
                    const valorDifal = Math.max(0, icmsDestinoTotal - icmsInterestadual);
                    icmsItem = icmsInterestadual + valorDifal;
                } else {
                    // Lógica de ICMS-ST para contribuinte
                    const icmsProprio = baseCalculoIcms * (aliquotaInterestadual / 100);
                    const baseCalculoST = baseCalculoIcms * (1 + mvaParaCalculo / 100);
                    const aliquotaInternaDestinoEfetiva = estadoDestino.aliquota + estadoDestino.fcp;
                    const icmsTotalST = baseCalculoST * (aliquotaInternaDestinoEfetiva / 100);
                    const icmsSTaRecolher = Math.max(0, icmsTotalST - icmsProprio);
                    icmsItem = icmsProprio + icmsSTaRecolher;
                }
            }
        }
        totalIcms += icmsItem;
        itemTaxes.push({ ipi: valorIpiItem, icms: icmsItem, pis: pisItem, cofins: cofinsItem });
    }

    if (ncmWarningDetails.length > 0) {
        details.push(...ncmWarningDetails);
    }

    const totalEstimado = totalIcms + totalIpi + totalPisCofins;
    const diferenca = totalEstimado - notaCore.imposto_total;
    
    if (isRegimeNormal) {
        details.unshift('- PIS/COFINS (0.65%/3.00%) calculado com base no Regime Normal (presumindo Lucro Presumido).');
    } else if (isSimplesNacional) {
        details.unshift('- PIS/COFINS estimado em 0% (Recolhimento unificado via DAS).');
    } else {
        // Fallback for other regimes like CRT 2
        details.unshift('- PIS/COFINS estimado em 0%. Premissa: Regime Monofásico ou Simples Nacional (excesso de sublimite).');
    }
    
    if (isSimplesNacional) {
        details.unshift('- IPI: Estimado em R$ 0,00 (Regra do Simples Nacional).');
        details.unshift('- ICMS: Estimado em R$ 0,00 (Recolhimento unificado via DAS).');
    } else if (!isOperationInterestadual) {
        details.unshift(`- ICMS calculado como Operação Interna em ${estadoOrigem.uf} (Alíquota ${(estadoOrigem.aliquota + estadoOrigem.fcp).toFixed(2)}%).`);
    } else {
        if (isDestinatarioNaoContribuinte) {
            details.unshift(`- ICMS calculado com DIFAL de ${estadoOrigem.uf} para ${estadoDestino.uf} (venda a não contribuinte, com base "por dentro").`);
        } else {
            details.unshift(`- ICMS-ST calculado de ${estadoOrigem.uf} para ${estadoDestino.uf} (venda a contribuinte).`);
        }
    }
    
    if (!isSimplesNacional) {
       details.unshift(`- O valor do IPI foi somado à base de cálculo do ICMS.`);
    }
    details.push(`- Cálculo não considera regimes especiais ou benefícios fiscais.`);

    const analysis: TaxEstimateResult = {
        imposto_estimado_total: totalEstimado,
        imposto_estimado_icms: totalIcms,
        imposto_estimado_ipi: totalIpi,
        imposto_estimado_pis_cofins: totalPisCofins,
        diferenca_imposto: diferenca,
        possui_ncm_desconhecido,
        calculo_premissas: details.join('\n'),
        data_calculo: new Date().toISOString()
    };

    return {
        analysis,
        itemTaxes,
    };
};
