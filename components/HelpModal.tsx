import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">{title}</h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
            {children}
        </div>
    </div>
);

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-brand-surface-dark rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 sticky top-0 bg-white dark:bg-brand-surface-dark z-10 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guia de Uso do NCMIT</h2>
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

        <div className="p-6 space-y-8">
            <HelpSection title="Bem-vindo ao NCMIT!">
                <p>Esta aplicação foi projetada para simplificar a leitura e o gerenciamento de suas Notas Fiscais Eletrônicas (NF-e) em formato XML.</p>
                <p>Siga os passos abaixo para começar.</p>
            </HelpSection>

            <HelpSection title="1. Upload de Arquivos XML">
                <p>
                    A primeira etapa é carregar suas notas fiscais. Você pode fazer isso de duas maneiras:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Arrastar e Soltar:</strong> Simplesmente arraste um ou mais arquivos <code>.xml</code> para a área pontilhada na tela inicial.</li>
                    <li><strong>Selecionar Arquivos:</strong> Clique no botão "Selecione os arquivos" para abrir o seletor de arquivos do seu sistema e escolher os XMLs desejados.</li>
                </ul>
                <p>Após o upload, o sistema processará os arquivos, extrairá as informações e os salvará no banco de dados. Notas fiscais que já existem (mesma chave de acesso) serão ignoradas para evitar duplicidade.</p>
            </HelpSection>

            <HelpSection title="2. Filtragem e Busca">
                <p>
                    Abaixo da área de upload, você encontrará o "Histórico de Notas Fiscais" com filtros para ajudá-lo a encontrar o que precisa:
                </p>
                 <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Emitente:</strong> Digite parte do nome da empresa que emitiu a nota para filtrar.</li>
                    <li><strong>Data Início e Fim:</strong> Selecione um período para visualizar as notas emitidas dentro desse intervalo.</li>
                </ul>
            </HelpSection>

            <HelpSection title="3. Tabela de Notas Fiscais">
                <p>
                    A tabela principal exibe um resumo das notas fiscais filtradas com as seguintes colunas:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Número NF:</strong> O número sequencial da nota fiscal.</li>
                    <li><strong>Emissão:</strong> A data em que a nota foi emitida.</li>
                    <li><strong>Emitente:</strong> O nome da empresa que emitiu a nota.</li>
                    <li><strong>Valor Total:</strong> O valor total da nota fiscal (produtos + impostos).</li>
                    <li><strong>Impostos:</strong> A soma de todos os impostos destacados na nota.</li>
                </ul>
                 <p className="mt-2">Clique no botão <strong>"Detalhes"</strong> em qualquer linha para ver todas as informações daquela nota.</p>
            </HelpSection>
            
            <HelpSection title="4. Exportação de Relatórios">
                <p>
                    Você pode exportar os dados filtrados em dois formatos:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Exportar PDF:</strong> Gera um arquivo PDF simples com a lista das notas fiscais visíveis na tabela.</li>
                    <li><strong>Exportar Excel:</strong> Gera uma planilha <code>.xlsx</code> com um relatório detalhado de cada nota fiscal filtrada, incluindo todos os seus itens.</li>
                </ul>
            </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
