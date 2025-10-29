import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, supabaseInitializationError } from './services/supabaseClient';
import { NotaFiscal, Filtros, Toast } from './types';
import { parseNFeXML } from './services/xmlParser';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Filters from './components/Filters';
import NotaFiscalTable from './components/NotaFiscalTable';
import NotaFiscalDetailModal from './components/NotaFiscalDetailModal';
import HelpModal from './components/HelpModal';
import AliquotaModal from './components/AliquotaModal';
import Auth from './components/Auth';
import ToastContainer from './components/Toast';
import { utils, writeFile } from 'xlsx';
import { Session } from '@supabase/supabase-js';

const getDetailedErrorMessage = (error: any): string => {
    if (error instanceof Error) return error.message;
    if (error && typeof error.message === 'string') {
        if (typeof error.details === 'string' && error.details) {
            return `${error.message} - Detalhes: ${error.details}`;
        }
        return error.message;
    }
    if (typeof error === 'string') return error;
    try {
        const jsonString = JSON.stringify(error);
        if (jsonString !== '{}') return jsonString;
    } catch (e) { /* Fall through */ }
    return 'Ocorreu um erro desconhecido.';
};

type UploadResult = 
  | { status: 'success'; file: string }
  | { status: 'skipped'; file: string }
  | { status: 'failure'; file: string; reason: string };

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({ dataInicio: '', dataFim: '', emitente: '', valorMin: 0, valorMax: 0 });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAliquotaModal, setShowAliquotaModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type,
    };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };


  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Reset state on auth change
      if (_event === 'SIGNED_OUT') {
        setNotasFiscais([]);
        setFiltros({ dataInicio: '', dataFim: '', emitente: '', valorMin: 0, valorMax: 0 });
        addToast('Você saiu com sucesso.', 'info');
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);
  
  const fetchNotasFiscais = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const { data, error } = await supabase!
      .from('nota_fiscal')
      .select('*, item_nota_fiscal(*)');

    if (error) {
      addToast('Falha ao buscar notas fiscais: ' + error.message, 'error');
      console.error(error);
    } else {
      setNotasFiscais(data as NotaFiscal[] || []);
    }
    setLoading(false);
  }, [session, addToast]);

  useEffect(() => {
    if (session) {
      fetchNotasFiscais();
    }
  }, [session, fetchNotasFiscais]);

  const maxValorAbsoluto = useMemo(() => {
    if (notasFiscais.length === 0) return 5000; // Default max
    const maxVal = Math.max(...notasFiscais.map(n => n.valor_total));
    return Math.ceil(maxVal > 0 ? maxVal : 5000);
  }, [notasFiscais]);
  
  useEffect(() => {
    // Initialize the max value of the filter when the absolute max is calculated
    if (maxValorAbsoluto > 0 && filtros.valorMax === 0) {
      setFiltros(prev => ({ ...prev, valorMax: maxValorAbsoluto }));
    }
  }, [maxValorAbsoluto, filtros.valorMax]);


  if (supabaseInitializationError || !supabase) {
    return (
      <div className="min-h-screen text-gray-800 dark:text-gray-200 bg-brand-light dark:bg-brand-dark">
        <Header session={null} onShowHelp={() => setShowHelpModal(true)} />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-6 rounded-lg" role="alert">
            <h2 className="font-bold text-xl mb-2">Erro de Configuração</h2>
            <p>{supabaseInitializationError || 'Não foi possível inicializar o cliente Supabase.'}</p>
            <p className="mt-4 text-sm">Por favor, siga as instruções no arquivo <code>README.md</code> para configurar o banco de dados.</p>
          </div>
        </main>
      </div>
    );
  }

  const handleFileUpload = async (files: FileList) => {
    if (!session?.user) {
        addToast("Você precisa estar logado para fazer upload.", 'error');
        return;
    }

    setLoading(true);
    
    const uploadPromises: Promise<UploadResult>[] = Array.from(files).map(async (file): Promise<UploadResult> => {
      try {
        const xmlText = await file.text();
        const parsedData = parseNFeXML(xmlText);
        const { items, ...notaFiscalCoreData } = parsedData;

        const { data: existing, error: findError } = await supabase!
            .from('nota_fiscal')
            .select('chave_acesso')
            .eq('chave_acesso', notaFiscalCoreData.chave_acesso)
            .single();

        if (findError && findError.code !== 'PGRST116') throw findError;

        if (existing) {
          return { status: 'skipped', file: file.name };
        }
        
        const notaFiscalData = {
            ...notaFiscalCoreData,
            user_id: session.user.id,
        };

        const { data: insertedNota, error: notaError } = await supabase!
          .from('nota_fiscal')
          .insert(notaFiscalData)
          .select('chave_acesso')
          .single();

        if (notaError) throw notaError;
        const chaveAcesso = insertedNota.chave_acesso;

        if (items.length > 0) {
          const itemsData = items.map(item => ({ ...item, fk_nota_fiscal_chave_acesso: chaveAcesso }));
          const { error: itemsError } = await supabase!.from('item_nota_fiscal').insert(itemsData);
          if (itemsError) {
            await supabase!.from('nota_fiscal').delete().eq('chave_acesso', chaveAcesso); // Rollback
            throw itemsError;
          }
        }

        const historicoData = {
            fk_nota_fiscal_chave_acesso: chaveAcesso,
            valor_original: notaFiscalCoreData.valor_total,
            valor_tributado: notaFiscalCoreData.imposto_total,
        };
        const { error: historicoError } = await supabase!.from('historico_calculo').insert(historicoData);
        if (historicoError) {
            await supabase!.from('nota_fiscal').delete().eq('chave_acesso', chaveAcesso); // Rollback
            throw historicoError;
        }

        return { status: 'success', file: file.name };
      } catch (err: any) {
        return { 
          status: 'failure', 
          file: file.name, 
          reason: getDetailedErrorMessage(err) 
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const status = {
      successes: results.filter(r => r.status === 'success').length,
      skips: results.filter(r => r.status === 'skipped').length,
      failures: results.filter((r): r is Extract<UploadResult, { status: 'failure' }> => r.status === 'failure'),
    };
    
    if (status.successes > 0) addToast(`${status.successes} nota(s) importada(s) com sucesso.`, 'success');
    if (status.skips > 0) addToast(`${status.skips} nota(s) ignorada(s) (já existentes).`, 'info');
    if (status.failures.length > 0) {
        addToast(`${status.failures.length} arquivo(s) falharam ao importar. Verifique o console para detalhes.`, 'error');
        console.error("Falhas no Upload:", status.failures);
    }


    if (status.successes > 0) {
        await fetchNotasFiscais();
    } else {
        setLoading(false);
    }
  };

  const filteredNotas = useMemo(() => {
    return notasFiscais.filter(nota => {
      const dataEmissao = new Date(nota.data_emissao);
      const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
      const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
      
      if (dataInicio && dataEmissao < dataInicio) return false;
      if (dataFim && dataEmissao > dataFim) return false;
      if (filtros.emitente && !nota.nome_emitente.toLowerCase().includes(filtros.emitente.toLowerCase())) return false;
      if (filtros.valorMin > 0 && nota.valor_total < filtros.valorMin) return false;
      // Note: valorMax can be 0, so we check if it is set and less than the max value
      if (filtros.valorMax > 0 && filtros.valorMax < maxValorAbsoluto && nota.valor_total > filtros.valorMax) return false;

      return true;
    });
  }, [notasFiscais, filtros, maxValorAbsoluto]);
  
  const handleClearFilters = () => {
    setFiltros({ dataInicio: '', dataFim: '', emitente: '', valorMin: 0, valorMax: maxValorAbsoluto });
  };

  const handleExportExcel = () => {
    const worksheetData = filteredNotas.flatMap(n => ([
      { A: "Chave de Acesso", B: n.chave_acesso },
      { A: "Número", B: n.numero },
      { A: "Emissão", B: new Date(n.data_emissao).toLocaleString() },
      { A: "Emitente", B: n.nome_emitente },
      { A: "Destinatário", B: n.nome_destinatario },
      { A: "Doc. Destinatário", B: n.doc_destinatario },
      { A: "Valor Total", B: n.valor_total },
      { A: "Imposto Total", B: n.imposto_total },
      {}, // Spacer row
      { A: "Cód. Item", B: "Descrição", C: "NCM", D: "Qtd", E: "Un.", F: "Vlr. Unit.", G: "Vlr. Total" },
      ...n.item_nota_fiscal.map(item => ({
        A: item.codigo, B: item.descricao, C: item.codigo_ncm, D: item.quantidade, E: item.unidade, F: item.valor_unitario, G: item.valor_total
      })),
      {}, // Spacer row
    ]));

    const worksheet = utils.json_to_sheet(worksheetData, { skipHeader: true });
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Notas Fiscais');
    writeFile(workbook, 'relatorio_notas_fiscais.xlsx');
  };

  if (loading && !session) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
              {/* Pode adicionar um spinner aqui se o carregamento inicial da sessão demorar */}
          </div>
      );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Header session={session} onShowHelp={() => setShowHelpModal(true)} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <FileUpload onFileUpload={handleFileUpload} />
          
          <div className="bg-white dark:bg-brand-surface-dark p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Histórico de Notas Fiscais</h2>
            <Filters 
              filtros={filtros} 
              setFiltros={setFiltros} 
              onExportExcel={handleExportExcel}
              onClearFilters={handleClearFilters}
              onShowAliquotas={() => setShowAliquotaModal(true)}
              maxValorAbsoluto={maxValorAbsoluto}
            />
            <NotaFiscalTable
              notas={filteredNotas}
              onSelectNota={setSelectedNota}
              isLoading={loading}
            />
          </div>
        </div>
      </main>
      {selectedNota && <NotaFiscalDetailModal nota={selectedNota} onClose={() => setSelectedNota(null)} />}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      {showAliquotaModal && <AliquotaModal onClose={() => setShowAliquotaModal(false)} />}
    </div>
  );
};

export default App;