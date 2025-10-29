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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Guia Rápido de Uso</h2>
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
            <HelpSection title="Como Usar o NCMIT">
                <p><strong>1. Upload de Arquivos XML:</strong> Arraste e solte ou selecione os arquivos <code>.xml</code> das suas notas fiscais na área de upload. O sistema processará e salvará os dados automaticamente, ignorando notas duplicadas.</p>
                <p><strong>2. Filtragem e Busca:</strong> Use o painel de "Filtros" para encontrar notas por emitente, período ou faixa de valor. Os resultados na tabela são atualizados instantaneamente.</p>
                <p><strong>3. Análise e Exportação:</strong> Clique em "Detalhes" para ver todas as informações de uma nota. Use os botões "Alíquotas" para consultar taxas de impostos e "Excel" para exportar um relatório completo dos dados filtrados.</p>
            </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;