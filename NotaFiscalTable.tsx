import React, { useState, useEffect } from 'react';
import type { NotaFiscal } from '../types';
import { SpinnerIcon, WarningIcon } from './common/Icon';

interface NotaFiscalTableProps {
  notas: NotaFiscal[];
  onSelectNota: (nota: NotaFiscal) => void;
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 10;

const NotaFiscalTable: React.FC<NotaFiscalTableProps> = ({ notas, onSelectNota, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Zera a página sempre que a lista de notas (resultado dos filtros) mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [notas]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 py-8">
        <SpinnerIcon className="w-10 h-10 animate-spin text-brand-yellow-dark mb-3" />
        <p className="text-lg">Carregando e processando notas...</p>
      </div>
    );
  }
  
  if (notas.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Nenhuma nota fiscal encontrada.</p>;
  }

  // Lógica de paginação
  const totalPages = Math.ceil(notas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotas = notas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-brand-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Número da Nota Fiscal.">Número NF</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Data de emissão da Nota Fiscal.">Emissão</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Nome da empresa que emitiu a Nota Fiscal.">Emitente</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Valor total dos produtos/serviços na Nota Fiscal.">Valor Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Soma dos impostos calculados na Nota Fiscal.">Impostos</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" title="Indica se a nota contém itens com NCM desconhecido para o cálculo de IPI.">
                <span className="sr-only">Alerta NCM</span>
                <WarningIcon className="w-4 h-4 mx-auto" />
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Detalhes</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedNotas.map((nota) => (
              <tr key={nota.chave_acesso} className="hover:bg-gray-100 dark:hover:bg-gray-900/60">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{nota.numero}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(nota.data_emissao).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">{nota.nome_emitente}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">R$ {nota.valor_total.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">R$ {nota.imposto_total.toFixed(2)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                  {nota.possui_ncm_desconhecido && <WarningIcon className="w-5 h-5 text-yellow-500 mx-auto" title="Contém NCMs desconhecidos. O cálculo do IPI pode estar incompleto." />}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onSelectNota(nota)} className="text-brand-yellow-dark hover:text-brand-yellow">
                    Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-2 border-t dark:border-gray-700">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Próximo
          </button>
        </div>
      )}
    </>
  );
};

export default NotaFiscalTable;