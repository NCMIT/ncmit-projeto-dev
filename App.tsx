
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, supabaseInitializationError } from './services/supabaseClient';
import type { NotaFiscal, Filtros, Toast } from './types';
import { parseNFeXML } from './services/xmlParser';
import { calculateTaxEstimate } from './services/taxCalculator';
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
import type { Session } from '@supabase/supabase-js';
import { FolderIcon, FolderOpenIcon, ChevronDownIcon } from './components/common/Icon';

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
  | { status: 'success'; file: string; nota: NotaFiscal }
  | { status: 'skipped'; file: string }
  | { status: 'failure'; file: string; reason: string };

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null);
  const [filtros, setFiltros] = useState<Filtros>({ 
      dataInicio: '', 
      dataFim: '', 
      emitente: '', 
      valorMin: 0, 
      valorMax: 0, 
      ufEmitente: '',
      limitRecent: 5 
  });
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showAliquotaModal, setShowAliquotaModal] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // State for Folder Navigation
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_OUT') {
        setNotasFiscais([]);
        setFiltros({ dataInicio: '', dataFim: '', emitente: '', valorMin: 0, valorMax: 0, ufEmitente: '', limitRecent: 5 });
        addToast('Você saiu com sucesso.', 'info');
      }
    });

    return () => subscription.unsubscribe();
  }, [addToast]);
  
  const fetchNotasFiscais = useCallback(async () => {
    if (!session) {
        setLoading(false);
        return;
    };
    setLoading(true);
    const { data, error } = await supabase!
      .from('nota_fiscal')
      .select('*, item_nota_fiscal(*)')
      .order('created_at', { ascending: false }); // Order by upload date descending

    if (error) {
      addToast('Falha ao buscar notas fiscais: ' + error.message, 'error');
      console.error(error);
      setNotasFiscais([]);
    } else {
      setNotasFiscais(data as NotaFiscal[] || []);
    }
    setLoading(false);
  }, [session, addToast]);

  useEffect(() => {
    if (session) {
      fetchNotasFiscais();
    } else {
      setLoading(false);
    }
  }, [session, fetchNotasFiscais]);

  const maxValorAbsoluto = useMemo(() => {
    if (notasFiscais.length === 0) return 5000;
    const maxVal = Math.max(...notasFiscais.map(n => n.valor_total));
    return Math.ceil(maxVal > 0 ? maxVal : 5000);
  }, [notasFiscais]);
  
  useEffect(() => {
    if (maxValorAbsoluto > 0 && filtros.valorMax === 0) {
      setFiltros(prev => ({ ...prev, valorMax: maxValorAbsoluto }));
    }
  }, [maxValorAbsoluto, filtros.valorMax]);

  const handleUpdateNota = (updatedNota: NotaFiscal) => {
      setNotasFiscais(prevNotas => 
        prevNotas.map(n => n.chave_acesso === updatedNota.chave_acesso ? updatedNota : n)
      );
      if (selectedNota?.chave_acesso === updatedNota.chave_acesso) {
          setSelectedNota(updatedNota);
      }
  };

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
        
        const { analysis: analysisResult, itemTaxes } = await calculateTaxEstimate(notaFiscalCoreData, items);

        const updatedItems = items.map((item, index) => {
            const taxes = itemTaxes[index];
            const valorBase = item.valor_total || 0; 
            return {
                ...item,
                valor_total: valorBase + taxes.ipi + taxes.icms + taxes.pis + taxes.cofins,
            };
        });

        const originalImpostoTotal = notaFiscalCoreData.imposto_total;
        const originalValorTotal = notaFiscalCoreData.valor_total;
        const impostoEstimadoTotal = analysisResult.imposto_estimado_total;
        
        const novoValorTotal = originalValorTotal - originalImpostoTotal + impostoEstimadoTotal;

        const notaFiscalData = {
            ...notaFiscalCoreData,
            imposto_total: impostoEstimadoTotal,
            valor_total: novoValorTotal,
            user_id: session.user.id,
            imposto_estimado_total: analysisResult.imposto_estimado_total,
            diferenca_imposto: analysisResult.diferenca_imposto,
            calculo_premissas: analysisResult.calculo_premissas,
            data_calculo: analysisResult.data_calculo,
            possui_ncm_desconhecido: analysisResult.possui_ncm_desconhecido,
        };

        const { data: insertedNota, error: notaError } = await supabase!
          .from('nota_fiscal')
          .insert(notaFiscalData)
          .select('chave_acesso')
          .single();

        if (notaError) throw notaError;
        const chaveAcesso = insertedNota.chave_acesso;

        const itemsData = updatedItems.map(item => ({ ...item, fk_nota_fiscal_chave_acesso: chaveAcesso }));
        if (itemsData.length > 0) {
          const { error: itemsError } = await supabase!.from('item_nota_fiscal').insert(itemsData);
          if (itemsError) {
            await supabase!.from('nota_fiscal').delete().eq('chave_acesso', chaveAcesso); 
            throw itemsError;
          }
        }
        
        const newNota: NotaFiscal = {
            ...notaFiscalData,
            item_nota_fiscal: itemsData,
        };

        return { status: 'success', file: file.name, nota: newNota };
      } catch (err: any) {
        return { 
          status: 'failure', 
          file: file.name, 
          reason: getDetailedErrorMessage(err) 
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter((r): r is Extract<UploadResult, { status: 'success' }> => r.status === 'success');
    const skippedUploads = results.filter(r => r.status === 'skipped');
    const failedUploads = results.filter((r): r is Extract<UploadResult, { status: 'failure' }> => r.status === 'failure');
    
    if (successfulUploads.length > 0) {
        addToast(`${successfulUploads.length} nota(s) importada(s) e analisada(s) com sucesso.`, 'success');
    }
    if (skippedUploads.length > 0) {
        addToast(`${skippedUploads.length} nota(s) ignorada(s) (já existentes).`, 'info');
    }
    if (failedUploads.length > 0) {
        addToast(`${failedUploads.length} arquivo(s) falharam ao importar. Verifique o console para detalhes.`, 'error');
        console.error("Falhas no Upload:", failedUploads);
    }

    if (successfulUploads.length > 0) {
        // Fetch again to ensure correct order and data integrity or prepend locally
        // Simplest is to re-fetch to keep order logic consistent
        fetchNotasFiscais();
    } else {
        setLoading(false);
    }
  };

  // --- Filtering Logic ---

  const filteredNotas = useMemo(() => {
    return notasFiscais.filter(nota => {
      const dataEmissao = new Date(nota.data_emissao);
      const dataInicio = filtros.dataInicio ? new Date(filtros.dataInicio) : null;
      const dataFim = filtros.dataFim ? new Date(filtros.dataFim) : null;
      
      if (dataInicio && dataEmissao < dataInicio) return false;
      if (dataFim && dataEmissao > dataFim) return false;
      if (filtros.emitente && !nota.nome_emitente.toLowerCase().includes(filtros.emitente.toLowerCase())) return false;
      if (filtros.ufEmitente && nota.uf_emitente !== filtros.ufEmitente) return false;
      if (filtros.valorMin > 0 && nota.valor_total < filtros.valorMin) return false;
      if (filtros.valorMax > 0 && filtros.valorMax < maxValorAbsoluto && nota.valor_total > filtros.valorMax) return false;

      return true;
    });
  }, [notasFiscais, filtros, maxValorAbsoluto]);
  
  // --- Grouping Logic for Folders ---

  const folderStructure = useMemo(() => {
      const structure: Record<string, Record<string, NotaFiscal[]>> = {};

      filteredNotas.forEach(nota => {
          const date = new Date(nota.data_emissao);
          const year = date.getFullYear().toString();
          // Get Month Name (e.g., "Janeiro", "Fevereiro")
          const month = date.toLocaleString('pt-BR', { month: 'long' });
          // Capitalize
          const monthCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
          // We need a key that sorts correctly, so maybe use number-name
          const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')} - ${monthCapitalized}`;

          if (!structure[year]) {
              structure[year] = {};
          }
          if (!structure[year][monthKey]) {
              structure[year][monthKey] = [];
          }
          structure[year][monthKey].push(nota);
      });
      return structure;
  }, [filteredNotas]);

  const years = Object.keys(folderStructure).sort((a, b) => b.localeCompare(a)); // Sort years descending

  const toggleYear = (year: string) => {
      setExpandedYears(prev => {
          const newSet = new Set(prev);
          if (newSet.has(year)) newSet.delete(year);
          else newSet.add(year);
          return newSet;
      });
  };

  const toggleMonth = (year: string, monthKey: string) => {
      const uniqueKey = `${year}-${monthKey}`;
      setExpandedMonths(prev => {
          const newSet = new Set(prev);
          if (newSet.has(uniqueKey)) newSet.delete(uniqueKey);
          else newSet.add(uniqueKey);
          return newSet;
      });
  };

  const handleClearFilters = () => {
    setFiltros({ dataInicio: '', dataFim: '', emitente: '', valorMin: 0, valorMax: maxValorAbsoluto, ufEmitente: '', limitRecent: 5 });
  };

  const handleExportExcel = () => {
    const worksheetData = filteredNotas.flatMap(n => ([
      { A: "Chave de Acesso", B: n.chave_acesso },
      { A: "Número", B: n.numero },
      { A: "Emissão", B: new Date(n.data_emissao).toLocaleString() },
      { A: "Emitente", B: n.nome_emitente },
      { A: "UF Emitente", B: n.uf_emitente },
      { A: "Destinatário", B: n.nome_destinatario },
      { A: "Doc. Destinatário", B: n.doc_destinatario },
      { A: "Valor Total", B: n.valor_total },
      { A: "Imposto Total", B: n.imposto_total },
      { A: "Imposto Estimado", B: n.imposto_estimado_total },
      {}, 
      { A: "Cód. Item", B: "Descrição", C: "NCM", D: "Qtd", E: "Un.", F: "Vlr. Unit.", G: "Vlr. Total" },
      ...n.item_nota_fiscal.map(item => ({
        A: item.codigo, B: item.descricao, C: item.codigo_ncm, D: item.quantidade, E: item.unidade, F: item.valor_unitario, G: item.valor_total
      })),
      {}, 
    ]));

    const worksheet = utils.json_to_sheet(worksheetData, { skipHeader: true });
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Notas Fiscais');
    writeFile(workbook, 'relatorio_notas_fiscais.xlsx');
  };

  if (loading && !session) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark">
          </div>
      );
  }

  if (!session) {
    return <Auth />;
  }

  // Recent notes are simply the first X of the current filtered view (or all notes if we want raw history, 
  // but filtering usually implies we want to see recent matches).
  // The prompt says "X primeiras notas do sistema (em ordem que foram lançadas no sistema)".
  // `notasFiscais` is already sorted by creation date desc from fetch.
  // We should probably use the unfiltered `notasFiscais` for the "Recent Uploads" section to strictly follow "do sistema",
  // OR use `filteredNotas` to respect filters. Given the UX, "do sistema" usually implies Global history.
  // However, if I filter by "2020", showing 2024 notes in "Recent" might be confusing if the user thinks "Recent" respects filters.
  // I will use `filteredNotas` to make it cohesive, but label it clearly.
  const recentNotes = filteredNotas.slice(0, filtros.limitRecent);

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

            {/* Recent Invoices Section */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                    Últimas {Math.min(filtros.limitRecent, filteredNotas.length)} notas (de {filteredNotas.length})
                </h3>
                <NotaFiscalTable
                    notas={recentNotes}
                    onSelectNota={setSelectedNota}
                    isLoading={loading}
                />
            </div>
            
            {/* Folders Section */}
            <div className="mt-8 space-y-2">
                 <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
                    Notas por Período
                </h3>
                {years.length === 0 && !loading && (
                    <p className="text-gray-500 dark:text-gray-400 italic">Nenhuma pasta encontrada para os filtros aplicados.</p>
                )}
                {years.map(year => {
                    const isYearExpanded = expandedYears.has(year);
                    const months = Object.keys(folderStructure[year]).sort((a, b) => b.localeCompare(a)); // Sort months desc (Dec first)
                    const totalNotesInYear = months.reduce((acc, m) => acc + folderStructure[year][m].length, 0);

                    return (
                        <div key={year} className="border dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900/30">
                            {/* Year Header */}
                            <div 
                                onClick={() => toggleYear(year)}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    {isYearExpanded ? 
                                        <FolderOpenIcon className="w-6 h-6 text-brand-yellow-dark" /> : 
                                        <FolderIcon className="w-6 h-6 text-brand-yellow" />
                                    }
                                    <span className="font-bold text-lg">{year}</span>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                        {totalNotesInYear} notas
                                    </span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform text-gray-500 ${isYearExpanded ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Months List */}
                            {isYearExpanded && (
                                <div className="border-t dark:border-gray-700">
                                    {months.map(monthKey => {
                                        const uniqueMonthKey = `${year}-${monthKey}`;
                                        const isMonthExpanded = expandedMonths.has(uniqueMonthKey);
                                        const notesInMonth = folderStructure[year][monthKey];

                                        return (
                                            <div key={monthKey} className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
                                                {/* Month Header */}
                                                <div 
                                                    onClick={() => toggleMonth(year, monthKey)}
                                                    className="flex items-center justify-between p-3 pl-4 cursor-pointer hover:bg-white dark:hover:bg-gray-800/50 transition-colors"
                                                >
                                                     <div className="flex items-center gap-3">
                                                        {isMonthExpanded ? 
                                                            <FolderOpenIcon className="w-5 h-5 text-brand-yellow-dark" /> : 
                                                            <FolderIcon className="w-5 h-5 text-brand-yellow" />
                                                        }
                                                        <span className="font-medium">{monthKey.split(' - ')[1]}</span>
                                                        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                            {notesInMonth.length}
                                                        </span>
                                                    </div>
                                                    <ChevronDownIcon className={`w-4 h-4 transition-transform text-gray-400 ${isMonthExpanded ? 'rotate-180' : ''}`} />
                                                </div>

                                                {/* Month Content (Table) */}
                                                {isMonthExpanded && (
                                                    <div className="p-2 bg-white dark:bg-brand-surface-dark border-t border-b dark:border-gray-700 ml-4 rounded-bl-lg">
                                                        <NotaFiscalTable 
                                                            notas={notesInMonth}
                                                            onSelectNota={setSelectedNota}
                                                            isLoading={false}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

          </div>
        </div>
      </main>
      {selectedNota && <NotaFiscalDetailModal nota={selectedNota} onClose={() => setSelectedNota(null)} onUpdateNota={handleUpdateNota} />}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
      {showAliquotaModal && <AliquotaModal onClose={() => setShowAliquotaModal(false)} onAddToast={addToast} />}
      {/* Helper SVG for Chevron used in App.tsx directly if needed, but importing from Icon.tsx is cleaner */}
      <div style={{ display: 'none' }}>
        <svg id="chevron-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default App;
