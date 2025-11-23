
import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

const HelpSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 border-b border-gray-300 dark:border-gray-600 pb-2">{title}</h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
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
            <HelpSection title="1. Upload de Notas Fiscais">
                <p>Para adicionar notas ao sistema, arraste e solte arquivos <strong>.xml</strong> na área tracejada superior ou clique para selecionar do seu computador. O sistema irá processar o arquivo automaticamente.</p>
                <ul className="list-disc list-inside ml-2 mt-2 text-gray-500 dark:text-gray-400">
                    <li>O sistema identifica e ignora notas que já foram enviadas anteriormente.</li>
                    <li>A data de organização das pastas será baseada na <strong>Data de Emissão</strong> contida no XML, e não na data do upload.</li>
                </ul>
            </HelpSection>

            <HelpSection title="2. Organização e Visualização">
                <p>O sistema organiza suas notas de duas formas simultâneas:</p>
                <ul className="list-disc list-inside ml-2 mt-2 text-gray-500 dark:text-gray-400">
                    <li><strong>Recentes:</strong> No topo, você vê as últimas notas lançadas no sistema (você pode configurar quantas quer ver no painel de Filtros).</li>
                    <li><strong>Notas por Período:</strong> Logo abaixo, as notas são agrupadas automaticamente em pastas de <strong>Anos</strong> e <strong>Meses</strong> baseadas na emissão. Pastas vazias não são exibidas.</li>
                </ul>
            </HelpSection>

            <HelpSection title="3. Filtros Inteligentes">
                <p>Utilize o painel de "Filtros" para refinar sua busca. Ao aplicar um filtro (ex: nome do emitente ou faixa de valor):</p>
                <ul className="list-disc list-inside ml-2 mt-2 text-gray-500 dark:text-gray-400">
                    <li>A busca ocorre em <strong>todo o histórico</strong>.</li>
                    <li>As pastas de Anos e Meses exibirão apenas as notas que correspondem aos filtros aplicados.</li>
                    <li>Use o campo <strong>Qtd. Recentes</strong> para definir quantas notas devem aparecer na lista de acesso rápido.</li>
                </ul>
            </HelpSection>

            <HelpSection title="4. Análise Tributária">
                <p>Ao clicar em "Detalhes" de uma nota, o NCMIT utiliza Inteligência Artificial para estimar os impostos (ICMS, IPI, PIS/COFINS) baseados no NCM do produto e nos estados de origem/destino.</p>
                <p className="mt-1">Você pode recalcular a análise a qualquer momento.</p>
            </HelpSection>

            <HelpSection title="5. Consulta e Atualização de Alíquotas">
                <p>No botão <strong>Alíquotas</strong>, você acessa a tabela de referência usada pelo sistema.</p>
                <ul className="list-disc list-inside ml-2 mt-2 text-gray-500 dark:text-gray-400">
                    <li>O botão <strong>Verificar Atualizações</strong> consulta a base de conhecimento da Inteligência Artificial em tempo real.</li>
                    <li>O sistema verifica se houve alterações na legislação (Federal ou Convênios ICMS) desde a data da última atualização mostrada.</li>
                    <li>Se houver novidades, a tabela será atualizada automaticamente na sua tela. Caso contrário, um aviso informará que seus dados já estão atualizados.</li>
                </ul>
            </HelpSection>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
