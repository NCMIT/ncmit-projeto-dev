import React from 'react';

interface AliquotaModalProps {
  onClose: () => void;
}

const ALIQUOTAS_DATA = [
    {
        name: 'ICMS (Imposto sobre Circulação de Mercadorias e Serviços)',
        description: 'Principal imposto estadual. As alíquotas variam por estado e tipo de operação.',
        rules: [
            { label: 'Operações Internas', value: 'Geralmente entre 17% a 20%, dependendo do estado.' },
            { 
                label: 'Operações Interestaduais', 
                value: '7% (N, NE, CO, ES), 12% (S, SE) ou 4% (importados).'
            },
        ],
        source: {
            url: 'http://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
            text: 'Lei Kandir (Lei Complementar 87/96)'
        }
    },
    {
        name: 'IPI (Imposto sobre Produtos Industrializados)',
        description: 'Imposto federal sobre produtos industrializados. A alíquota depende do código NCM do produto e é definida na TIPI.',
        rules: [
            { label: 'Alíquotas', value: 'Variáveis (de 0% a mais de 300%). Produtos essenciais podem ter alíquota zero.' },
        ],
        source: {
            url: 'http://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/decreto/D11158.htm',
            text: 'Tabela de Incidência do IPI (TIPI) - Decreto nº 11.158/2022'
        }
    },
    {
        name: 'PIS e COFINS (Contribuições Federais)',
        description: 'Incidem sobre o faturamento da empresa. As alíquotas dependem do regime tributário do emitente.',
        rules: [
            { label: 'Regime Cumulativo (Lucro Presumido)', value: 'PIS: 0,65% | COFINS: 3,00%' },
            { label: 'Regime Não-Cumulativo (Lucro Real)', value: 'PIS: 1,65% | COFINS: 7,60%' },
        ],
        source: {
            url: 'https://www.planalto.gov.br/ccivil_03/leis/l9718.htm',
            text: 'Leis nº 9.718/98, 10.637/02 e 10.833/03'
        }
    }
];

const TaxCard: React.FC<{ data: typeof ALIQUOTAS_DATA[0] }> = ({ data }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{data.name}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{data.description}</p>
        <div className="mt-3 space-y-2 text-sm">
            {data.rules.map((rule, index) => (
                <div key={index}>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">{rule.label}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">{rule.value}</span>
                </div>
            ))}
        </div>
        <p className="text-xs italic mt-3 text-gray-500 dark:text-gray-400">
            Fonte: <a href={data.source.url} target="_blank" rel="noopener noreferrer" className="text-brand-yellow-dark hover:underline">{data.source.text}</a>
        </p>
    </div>
);

const AliquotaModal: React.FC<AliquotaModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-brand-surface-dark rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white dark:bg-brand-surface-dark z-10 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consulta de Alíquotas Padrão</h2>
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

        <div className="p-6 space-y-6">
            <p className="text-gray-600 dark:text-gray-300">
                A seguir estão as alíquotas e regras gerais para os principais impostos encontrados em notas fiscais de produtos no Brasil.
                <br />
                <strong className="text-sm text-brand-red-dark">Atenção:</strong> A tributação pode variar com base no produto (NCM), estado e regime tributário da empresa. Esta é uma referência rápida.
            </p>

            <div className="space-y-4">
                {ALIQUOTAS_DATA.map(tax => (
                    <TaxCard key={tax.name} data={tax} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AliquotaModal;
