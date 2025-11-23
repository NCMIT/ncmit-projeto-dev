
import React, { useState } from 'react';
import type { EstadoICMS, Toast } from '../types';
import { ALIQUOTAS_DATA, checkTaxUpdatesWithAI } from '../services/taxCalculator';
import { RefreshIcon, SpinnerIcon } from './common/Icon';


interface AliquotaModalProps {
  onClose: () => void;
  onAddToast: (message: string, type: Toast['type']) => void;
}

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

const AliquotaModal: React.FC<AliquotaModalProps> = ({ onClose, onAddToast }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [taxData, setTaxData] = useState(ALIQUOTAS_DATA);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckUpdates = async () => {
    setIsChecking(true);
    try {
        const result = await checkTaxUpdatesWithAI(taxData);
        if (result.hasUpdates && result.updatedData) {
            setTaxData(result.updatedData);
            onAddToast("Novas alíquotas foram encontradas e atualizadas na tabela!", "success");
        } else {
            onAddToast("Não foram encontradas alterações recentes na legislação tributária para os dados listados.", "info");
        }
    } catch (error) {
        onAddToast("Erro ao verificar atualizações.", "error");
    } finally {
        setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-brand-surface-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 shrink-0 bg-white dark:bg-brand-surface-dark z-10 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alíquotas para Autopeças</h2>
                <button 
                    onClick={handleCheckUpdates} 
                    disabled={isChecking}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                    title="Verificar atualizações na legislação via IA"
                >
                    {isChecking ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <RefreshIcon className="w-4 h-4" />}
                    {isChecking ? 'Verificando...' : 'Verificar Atualizações'}
                </button>
             </div>
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
          <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
            {taxData.map((tax, index) => (
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

            {taxData[activeTab] && <TaxCard data={taxData[activeTab]} />}
        </div>
      </div>
    </div>
  );
};

export default AliquotaModal;
