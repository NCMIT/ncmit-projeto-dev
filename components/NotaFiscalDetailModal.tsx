import React, { useState } from 'react';
import { NotaFiscal } from '../types';

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
  const [expandedItemIndex, setExpandedItemIndex] = useState<number | null>(null);

  const handleToggleExpand = (index: number) => {
    setExpandedItemIndex(prevIndex => (prevIndex === index ? null : index));
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
                    <p className="text-lg font-semibold dark:text-white">{new Date(nota.data_emissao).toLocaleString()}</p>
                </DetailCard>
                 <DetailCard title="Valor Total">
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">R$ {nota.valor_total.toFixed(2)}</p>
                </DetailCard>
                <DetailCard title="Impostos">
                    <p className="text-lg font-semibold text-red-500 dark:text-red-400">R$ {nota.imposto_total.toFixed(2)}</p>
                </DetailCard>
                <DetailCard title="Itens">
                    <p className="text-lg font-semibold dark:text-white">{nota.item_nota_fiscal.length}</p>
                </DetailCard>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600">Emitente</h3>
                    <p><strong>Nome:</strong> {nota.nome_emitente}</p>
                </div>
                 <div className="space-y-2">
                    <h3 className="text-lg font-semibold border-b pb-2 dark:border-gray-600">Destinatário</h3>
                    <p><strong>Nome:</strong> {nota.nome_destinatario}</p>
                    <p><strong>Documento:</strong> {nota.doc_destinatario}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Produtos/Serviços</h3>
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
                                <React.Fragment key={index}>
                                    <tr onClick={() => handleToggleExpand(index)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/40">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{p.codigo}</td>
                                        <td className="px-4 py-2 text-sm">{p.descricao}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{p.codigo_ncm}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">{p.quantidade} {p.unidade}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">R$ {p.valor_unitario.toFixed(2)}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right">R$ {p.valor_total.toFixed(2)}</td>
                                     </tr>
                                     {expandedItemIndex === index && (
                                        <tr className="bg-gray-100 dark:bg-gray-900">
                                            <td colSpan={6} className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold">Ações do Item</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Informações adicionais sobre o produto apareceriam aqui.</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm">Editar</button>
                                                        <button className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-1 px-3 rounded text-sm">Excluir</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                     )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NotaFiscalDetailModal;
