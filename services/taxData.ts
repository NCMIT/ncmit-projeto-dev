
// services/taxData.ts
import type { EstadoICMS } from '../types';

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

export const MVA_AUTOPECAS_PADRAO = 71.78;

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
    }
];
