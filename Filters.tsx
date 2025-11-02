import React, { useState } from 'react';
import type { Filtros } from '../types';
import { ExcelIcon, ClearIcon, FilterIcon, ChevronDownIcon, TaxIcon } from './common/Icon';
import { ESTADOS_ICMS } from '../services/taxCalculator';

interface FiltersProps {
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  onExportExcel: () => void;
  onClearFilters: () => void;
  onShowAliquotas: () => void;
  maxValorAbsoluto: number;
}

const Filters: React.FC<FiltersProps> = ({ filtros, setFiltros, onExportExcel, onClearFilters, onShowAliquotas, maxValorAbsoluto }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), filtros.valorMax - 1);
    setFiltros(prev => ({ ...prev, valorMin: newMin }));
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), filtros.valorMin + 1);
    setFiltros(prev => ({ ...prev, valorMax: newMax }));
  };

  const areFiltersActive = filtros.emitente !== '' || filtros.dataInicio !== '' || filtros.dataFim !== '' || filtros.valorMin > 0 || filtros.valorMax < maxValorAbsoluto || filtros.ufDestino !== '';

  const minPosPercent = (filtros.valorMin / maxValorAbsoluto) * 100;
  const maxPosPercent = (filtros.valorMax / maxValorAbsoluto) * 100;

  return (
    <div className="mb-6">
        <div className="flex justify-between items-center">
            <button 
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="flex items-center gap-2 px-4 py-2 font-bold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
                <FilterIcon className="w-5 h-5" />
                Filtros
                {areFiltersActive && <span className="w-2 h-2 bg-brand-yellow rounded-full"></span>}
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isPanelOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
                <button onClick={onShowAliquotas} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors" title="Consultar alíquotas de impostos padrão.">
                    <TaxIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Alíquotas</span>
                </button>
                <button onClick={onExportExcel} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors" title="Exportar os dados detalhados das notas fiscais filtradas para um arquivo Excel.">
                    <ExcelIcon className="w-5 h-5" />
                     <span className="hidden sm:inline">Excel</span>
                </button>
            </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPanelOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
            <div className="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-6">
                    {/* Filtro Emitente */}
                    <div className="flex flex-col md:col-span-2">
                        <label htmlFor="emitente" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Emitente</label>
                        <input
                        type="text" name="emitente" id="emitente" value={filtros.emitente} onChange={handleInputChange}
                        placeholder="Nome do fornecedor"
                        className="p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-brand-yellow focus:border-brand-yellow"
                        />
                    </div>
                     {/* Filtro UF Destino */}
                    <div className="flex flex-col">
                        <label htmlFor="ufDestino" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">UF Destino</label>
                        <select
                        name="ufDestino" id="ufDestino" value={filtros.ufDestino} onChange={handleInputChange}
                        className="p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-brand-yellow focus:border-brand-yellow"
                        >
                            <option value="">Todos</option>
                            {ESTADOS_ICMS.map(estado => (
                                <option key={estado.uf} value={estado.uf}>{estado.uf}</option>
                            ))}
                        </select>
                    </div>
                    <div></div> {/* Spacer */}
                    {/* Filtro Data Início */}
                    <div className="flex flex-col">
                        <label htmlFor="dataInicio" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Data Início</label>
                        <input
                        type="date" name="dataInicio" id="dataInicio" value={filtros.dataInicio} onChange={handleInputChange}
                        className="p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-brand-yellow focus:border-brand-yellow"
                        />
                    </div>
                    {/* Filtro Data Fim */}
                    <div className="flex flex-col">
                        <label htmlFor="dataFim" className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Data Fim</label>
                        <input
                        type="date" name="dataFim" id="dataFim" value={filtros.dataFim} onChange={handleInputChange}
                        className="p-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-brand-yellow focus:border-brand-yellow"
                        />
                    </div>
                    {/* Filtro Faixa de Valor */}
                    <div className="flex flex-col md:col-span-2">
                        <label className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">Faixa de Valor</label>
                        <div className="text-center font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            R$ {Math.round(filtros.valorMin)} - R$ {Math.round(filtros.valorMax)}
                        </div>
                        <div className="relative h-8 flex items-center">
                            <div className="relative w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full">
                                <div 
                                    className="absolute h-1 bg-brand-yellow rounded-full z-10"
                                    style={{ left: `${minPosPercent}%`, width: `${maxPosPercent - minPosPercent}%` }}
                                ></div>
                            </div>
                            <input
                                type="range" name="valorMin"
                                min="0" max={maxValorAbsoluto}
                                value={filtros.valorMin}
                                onChange={handleMinChange}
                                className="range-slider"
                                aria-label="Valor Mínimo"
                            />
                            <input
                                type="range" name="valorMax"
                                min="0" max={maxValorAbsoluto}
                                value={filtros.valorMax}
                                onChange={handleMaxChange}
                                className="range-slider"
                                aria-label="Valor Máximo"
                            />
                        </div>
                    </div>
                    {/* Botão Limpar */}
                    <div className="flex flex-col justify-end md:col-start-4">
                         <label className="mb-1 text-sm font-medium text-transparent hidden md:block">Ação</label>
                        <button onClick={onClearFilters} className="flex items-center justify-center w-full gap-2 border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold py-2 px-4 rounded-md transition-colors" title="Limpar todos os filtros.">
                            <ClearIcon className="w-5 h-5" /> Limpar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Filters;