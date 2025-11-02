import React, { useState } from 'react';
import type { NotaFiscal } from '../types';
import { SpinnerIcon, WarningIcon } from './common/Icon';
import { calculateTaxEstimate } from '../services/taxCalculator';
import { supabase } from '../services/supabaseClient';


interface NotaFiscalDetailModalProps {
  nota: NotaFiscal;
  onClose: () => void;
  onUpdateNota: (updatedNota: NotaFiscal) => void;
}

const DetailCard: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">{title}</h4>
        {children}
    </div>
);

const NotaFiscalDetailModal: React.FC<NotaFiscalDetailModalProps> = ({ nota, onClose, onUpdateNota }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecalculate = async () => {
    setIsCalculating(true);
    setError(null);
    try {
        const { item_nota_fiscal, ...notaCore } = nota;

        const impostoDeclaradoOriginal = (nota.diferenca_imposto != null) 
            ? (nota.imposto_total - nota.diferenca_imposto) 
            : nota.imposto_total;
            
        const valorTotalOriginal = (nota.diferenca_imposto != null)
            ? (nota.valor_total - (nota.imposto_estimado_total! - impostoDeclaradoOriginal))
            : nota.valor_total;

        const notaCoreParaCalculo = { ...notaCore, imposto_total: impostoDeclaradoOriginal, valor_total: valorTotalOriginal };

        const { analysis: analysisResult, itemTaxes } = await calculateTaxEstimate(notaCoreParaCalculo, item_nota_fiscal);
        
        const updatedItems = nota.item_nota_fiscal.map((item, index) => {
            const taxes = itemTaxes[index];
            const valorBase = item.quantidade * item.valor_unitario;
            return {
                ...item,
                valor_total: valorBase + taxes.ipi + taxes.icms + taxes.pis + taxes.cofins,
            };
        });

        const novoImpostoEstimado = analysisResult.imposto_estimado_total;
        const novoValorTotal = valorTotalOriginal - impostoDeclaradoOriginal + novoImpostoEstimado;

        const { error: updateError } = await supabase
            .from('nota_fiscal')
            .update({
                imposto_total: novoImpostoEstimado,
                valor_total: novoValorTotal,
                imposto_estimado_total: analysisResult.imposto_estimado_total,
                diferenca_imposto: analysisResult.diferenca_imposto,
                calculo_premissas: analysisResult.calculo_premissas,
                data_calculo: analysisResult.data_calculo,
                possui_ncm_desconhecido: analysisResult.possui_ncm_desconhecido,
            })
            .eq('chave_acesso', nota.chave_acesso);
        
        if (updateError) throw updateError;
        
        const { error: itemsUpdateError } = await supabase
            .from('item_nota_fiscal')
            .upsert(updatedItems);
        
        if (itemsUpdateError) throw itemsUpdateError;

        const updatedNota: NotaFiscal = {
            ...nota,
            imposto_total: novoImpostoEstimado,
            valor_total: novoValorTotal,
            item_nota_fiscal: updatedItems,
            ...analysisResult,
        };
        onUpdateNota(updatedNota);

    } catch (err: any) {
        setError(err.message || 'Falha ao calcular e salvar a análise.');
    } finally {
        setIsCalculating(false);
    }
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
                <DetailCard title="Impostos (Estimado)">
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
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Imposto Item</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Vlr. Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-brand-surface-dark divide-y divide-gray-200 dark:divide-gray-600">
                            {nota.item_nota_fiscal.map((p, index) => {
                                const valorBase = p.quantidade * p.valor_unitario;
                                const impostoItem = p.valor_total - valorBase;

                                return (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{p.codigo}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-300">{p.descricao}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">{p.codigo_ncm}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300">{p.quantidade} {p.unidade}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300">R$ {p.valor_unitario.toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-red-500 dark:text-red-400">R$ {Math.max(0, impostoItem).toFixed(2)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-800 dark:text-gray-300 font-bold">R$ {p.valor_total.toFixed(2)}</td>
                                 </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Análise Fiscal
                        {nota.possui_ncm_desconhecido && <WarningIcon className="w-5 h-5 text-yellow-500" title="O cálculo pode estar impreciso pois alguns NCMs não foram encontrados na base de referência." />}
                     </h3>
                     <button 
                        onClick={handleRecalculate}
                        disabled={isCalculating}
                        className="bg-brand-yellow hover:bg-brand-yellow-dark text-white font-bold py-2 px-4 rounded-lg inline-flex items-center gap-2 disabled:opacity-50"
                    >
                        {isCalculating ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                                Recalculando...
                            </>
                        ) : 'Recalcular Análise com IA'}
                    </button>
                </div>
                 
                {error && <p className="text-red-500 text-sm mt-2 text-right">{error}</p>}

                 {nota.imposto_estimado_total != null && nota.diferenca_imposto != null ? (
                     <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 border dark:border-gray-700">
                         <div className="space-y-3 text-sm">
                             {nota.calculo_premissas && (
                                <div>
                                    <h5 className="font-semibold mb-1 text-gray-700 dark:text-gray-200">Premissas do Cálculo:</h5>
                                    <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                        {nota.calculo_premissas.split('\n').map((premise, i) => <li key={i}>{premise}</li>)}
                                    </ul>
                                </div>
                             )}
                             {nota.data_calculo && (
                                <p className="text-xs text-right text-gray-400 dark:text-gray-500 pt-2 border-t dark:border-gray-600 mt-3">
                                    Análise gerada em: {new Date(nota.data_calculo).toLocaleString()}
                                </p>
                             )}
                         </div>
                     </div>
                 ) : (
                    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 text-center text-gray-500 dark:text-gray-400">
                        <p>Análise fiscal não disponível. Clique em "Recalcular" para gerar uma.</p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NotaFiscalDetailModal;