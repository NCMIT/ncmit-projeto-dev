import React, { useState } from 'react';

interface AliquotaModalProps {
  onClose: () => void;
}

export interface EstadoICMS {
    uf: string;
    aliquota: number;
    fcp: number;
}

// Dados estruturados para uso programático e exibição
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

// MVA ST original para autopeças (Convênio ICMS 199/17), um bom padrão para estimativa.
export const MVA_AUTOPECAS_PADRAO = 71.78;

const regioes = {
    SUL: ['PR', 'RS', 'SC'],
    SUDESTE: ['ES', 'MG', 'RJ', 'SP'],
    NORTE: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
    NORDESTE: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
    CENTRO_OESTE: ['DF', 'GO', 'MT', 'MS'],
};

export const getAliquotaInterestadual = (ufOrigem: string, ufDestino: string): number => {
    if (!ufOrigem || !ufDestino || ufOrigem === ufDestino) return 0; // Não é interestadual ou UFs inválidas

    const isOrigemSulSudeste = [...regioes.SUL, ...regioes.SUDESTE].filter(uf => uf !== 'ES').includes(ufOrigem);
    const isDestinoNorteNordesteCentroOesteES = [...regioes.NORTE, ...regioes.NORDESTE, ...regioes.CENTRO_OESTE, 'ES'].includes(ufDestino);
    
    if (isOrigemSulSudeste && isDestinoNorteNordesteCentroOesteES) {
        return 7;
    }
    return 12; // Regra geral para as demais operações
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

const renderSectionContent = (section: (typeof ALIQUOTAS_DATA[0])['sections'][0]) => {
    switch (section.type) {
        case 'text':
            return <p className="text-gray-600 dark:text-gray-300">{section.content as string}</p>;
        case 'list':
            return (
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    {(section.content as string[]).map((item, i) => {
                        const parts = item.split(':');
                        return(
                            <li key={i}>
                                {parts.length > 1 ? (
                                    <>
                                        <strong className="font-semibold text-gray-700 dark:text-gray-200">{parts[0]}:</strong>
                                        {parts.slice(1).join(':')}
                                    </>
                                ) : (
                                    item
                                )}
                            </li>
                        )
                    })}
                </ul>
            );
        case 'list-highlight':
             return (
                <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                    {(section.content as string[]).map((item, i) => {
                        const parts = item.split(':');
                        return (
                            <li key={i}>
                                <code className="font-mono bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded px-1 py-0.5 text-xs">{parts[0]}</code>
                                <span className="ml-2">{parts[1]}</span>
                            </li>
                        )
                    })}
                </ul>
            );
        case 'table':
            const columns = 3;
            const items = section.content as EstadoICMS[];
            const rows = Math.ceil(items.length / columns);
            const tableData = Array.from({ length: rows }, (_, rowIndex) => 
                Array.from({ length: columns }, (_, colIndex) => items[rowIndex * columns + colIndex])
            );

            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                {[...Array(columns)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="px-2 py-1 font-semibold">UF</th>
                                        <th className="px-2 py-1 font-semibold text-right">Alíq.</th>
                                        <th className="px-2 py-1 font-semibold text-right" title="Alíquota Padrão + Fundo de Combate à Pobreza (FCP)">Alíq.+FCP</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t border-gray-200 dark:border-gray-700">
                                    {row.map((item, cellIndex) => (
                                        item ? (
                                            <React.Fragment key={cellIndex}>
                                                <td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-200">{item.uf}</td>
                                                <td className="px-2 py-1 text-right">{item.aliquota.toFixed(2)}%</td>
                                                <td className="px-2 py-1 text-right font-bold text-brand-yellow-dark">{(item.aliquota + item.fcp).toFixed(2)}%</td>
                                            </React.Fragment>
                                        ) : (
                                            <React.Fragment key={cellIndex}><td className="px-2 py-1"></td><td className="px-2 py-1"></td><td className="px-2 py-1"></td></React.Fragment>
                                        )
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default:
            return null;
    }
}


const TaxCard: React.FC<{ data: typeof ALIQUOTAS_DATA[0] }> = ({ data }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{data.name}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{data.description}</p>
        
        <div className="mt-4 space-y-4 text-sm">
            {data.sections.map((section, index) => (
                <div key={index}>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{section.title}</h4>
                    {renderSectionContent(section)}
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center text-xs italic mt-4 pt-3 border-t dark:border-gray-700/50 text-gray-500 dark:text-gray-400">
            <p>
                Fonte: <a href={data.source.url} target="_blank" rel="noopener noreferrer" className="text-brand-yellow-dark hover:underline">{data.source.text}</a>
            </p>
            <p>
                Atualizado em: {data.lastUpdated}
            </p>
        </div>
    </div>
);

const AliquotaModal: React.FC<AliquotaModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-brand-surface-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 shrink-0 bg-white dark:bg-brand-surface-dark z-10 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alíquotas para Autopeças</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Fechar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 shrink-0">
          <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            {ALIQUOTAS_DATA.map((tax, index) => (
              <button
                key={tax.shortName}
                onClick={() => setActiveTab(index)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold transition-colors duration-200 focus:outline-none ${
                  activeTab === index
                    ? 'border-brand-yellow-dark text-brand-yellow-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                aria-current={activeTab === index ? 'page' : undefined}
              >
                {tax.shortName}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-300">
                A seguir estão as alíquotas e regras gerais para os principais impostos sobre <strong>peças automotivas</strong> no Brasil.
                <br />
                <strong className="text-brand-red-dark">Atenção:</strong> A tributação pode variar com base no produto (NCM), estado de origem/destino e regime tributário da empresa. Esta é uma referência rápida.
            </p>

            {ALIQUOTAS_DATA[activeTab] && <TaxCard data={ALIQUOTAS_DATA[activeTab]} />}
        </div>
      </div>
    </div>
  );
};

export default AliquotaModal;