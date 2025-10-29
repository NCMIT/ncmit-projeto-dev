import React, { useState } from 'react';
import type { NotaFiscal } from '../types';
import { SpinnerIcon } from './common/Icon';
import { calculateTaxEstimate } from '../services/taxCalculator';
import type { TaxEstimateResult } from '../services/taxCalculator';

interface NotaFiscalDetailModalProps {
  nota: NotaFiscal;
  onClose: () => void;
}

const DetailCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
        {children}
    </div>
);

const NotaFiscalDetailModal: React.FC<NotaFiscalDetailModalProps> = ({ nota, onClose }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TaxEstimateResult | null>(null);
  
  const handleCalculateEstimate = () => {
    setIsCalculating(true);
    
    // Simula um delay para feedback visual
    setTimeout(() => {
        const { item_nota_fiscal, ...notaCore } = nota;
        const result = calculateTaxEstimate(notaCore, item_nota_fiscal);
        setAnalysisResult(result);
        setIsCalculating(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-brand-surface-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white dark:bg-brand-surface-dark z-10 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detalhes da NF #{nota.numero}</h2>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 break-all">Chave de Acesso: {nota.chave_acesso}</p>
        </div>

        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <DetailCard title="Data de Emissão">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{new Date(nota.data_emissao).toLocaleString()}</p>
                </DetailCard>
                 <DetailCard title="Valor Total">
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">R$ {nota.valor_total.toFixed(2)}</p>
                </DetailCard>
                <DetailCard title="Impostos">
                    <p className="text-lg font-semibold text-red-500 dark:text-red-400">R$ {nota.imposto_total.toFixed(2)}</p>
                </DetailCard>
                <DetailCard title="Itens">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{nota.item_nota_fiscal.length}</p>
                </DetailCard>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600 text-gray-900 dark:text-white">Emitente</h3>
                    <p><strong>Nome:</strong> {nota.nome_emitente}</p>
                    <p><strong>UF:</strong> {nota.uf_emitente}</p>
                </div>
                 <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600 text-gray-900 dark:text-white">Destinatário</h3>
                    <p><strong>Nome:</strong> {nota.nome_destinatario}</p>
                    <p><strong>UF:</strong> {nota.uf_destinatario || 'N/A'}</p>
                    <p><strong>Documento:</strong> {nota.doc_destinatario}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Produtos/Serviços</h3>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cód.</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NCM</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qtd.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vlr. Unit.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vlr. Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-brand-surface-dark divide-y divide-gray-200 dark:divide-gray-600">
                            {nota.item_nota_fiscal.map((p, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{p.codigo}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-300">{p.descricao}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{p.codigo_ncm}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300">{p.quantidade} {p.unidade}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300">R$ {p.valor_unitario.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300">R$ {p.valor_total.toFixed(2)}</td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
                 <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Análise Fiscal</h3>
                 <button 
                    onClick={handleCalculateEstimate} 
                    disabled={isCalculating}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-yellow hover:bg-brand-yellow-dark text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                 >
                    {isCalculating ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Calculando...</> : 'Analisar Impostos (Estimativa)'}
                 </button>
                 
                 {analysisResult && (
                     <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 border dark:border-gray-700">
                         <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">Resultado da Estimativa</h4>
                         <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <span className="font-semibold text-gray-600 dark:text-gray-300">Imposto Declarado (Nota):</span>
                                <span className="text-right font-bold text-red-600 dark:text-red-400">R$ {nota.imposto_total.toFixed(2)}</span>

                                <span className="font-semibold text-gray-600 dark:text-gray-300">Imposto Estimado (Cálculo):</span>
                                <span className="text-right font-bold text-blue-600 dark:text-blue-400">R$ {analysisResult.imposto_estimado_total.toFixed(2)}</span>

                                <span className="font-semibold text-gray-600 dark:text-gray-300">Diferença:</span>
                                <span className={`text-right font-bold ${analysisResult.diferenca_imposto > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                    R$ {analysisResult.diferenca_imposto.toFixed(2)}
                                </span>
                            </div>
                            <div className="border-t dark:border-gray-600 pt-3 mt-3">
                                <h5 className="font-semibold mb-1 text-gray-700 dark:text-gray-200">Detalhes da Estimativa:</h5>
                                <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>PIS/COFINS (Monofásico):</span>
                                    <span className="text-right">R$ {analysisResult.imposto_estimado_pis_cofins.toFixed(2)}</span>
                                    <span>IPI (Itens compatíveis):</span>
                                    <span className="text-right">R$ {analysisResult.imposto_estimado_ipi.toFixed(2)}</span>
                                    <span>ICMS (Total Estimado):</span>
                                    <span className="text-right">R$ {analysisResult.imposto_estimado_icms.toFixed(2)}</span>
                                </div>
                            </div>
                             <div className="border-t dark:border-gray-600 pt-3 mt-3">
                                <h5 className="font-semibold mb-1 text-gray-700 dark:text-gray-200">Premissas do Cálculo:</h5>
                                <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    {analysisResult.calculo_premissas.split('\n').map((premise, i) => <li key={i}>{premise}</li>)}
                                </ul>
                             </div>
                         </div>
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NotaFiscalDetailModal;