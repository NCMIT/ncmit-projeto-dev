import { NotaFiscal, ItemNotaFiscal } from '../types';
import { ALIQUOTAS_DATA, ESTADOS_ICMS, MVA_AUTOPECAS_PADRAO, getAliquotaInterestadual, EstadoICMS } from '../components/AliquotaModal';

type NotaCoreData = Omit<NotaFiscal, 'item_nota_fiscal' | 'user_id' >;

interface TaxEstimateResult {
    imposto_estimado_total: number;
    imposto_estimado_icms: number;
    imposto_estimado_ipi: number;
    imposto_estimado_pis_cofins: number;
    diferenca_imposto: number;
    calculo_premissas: string;
    data_calculo: string;
}


const parseIpiRates = (): Map<string, number> => {
    const ipiData = ALIQUOTAS_DATA.find(t => t.shortName === 'IPI');
    const ipiSection = ipiData?.sections.find(s => s.title.includes('Exemplos de Alíquotas'));
    const rates = new Map<string, number>();

    if (ipiSection && Array.isArray(ipiSection.content)) {
        (ipiSection.content as string[]).forEach(item => {
            const match = item.match(/NCM\s*([\d.]+).*:\s*([\d.]+)%/);
            if (match) {
                const ncm = match[1].replace(/\./g, ''); // Remove dots from NCM
                const rate = parseFloat(match[2]);
                rates.set(ncm, rate);
            }
        });
    }
    return rates;
};

// FIX: Relaxed the type of the `items` parameter to only require properties essential for tax calculation.
// This resolves a type mismatch in App.tsx when passing newly parsed XML items, which lack the database foreign key,
// making the function compatible with both new and existing nota fiscal items.
export const calculateTaxEstimate = (notaCore: NotaCoreData, items: Pick<ItemNotaFiscal, 'valor_total' | 'codigo_ncm'>[]): TaxEstimateResult => {
    const ipiRates = parseIpiRates();
    const pisCofinsRate = 13.1; // PIS/COFINS Monofásico para autopeças (ex: 2.3% + 10.8%)

    let totalIcms = 0;
    let totalIpi = 0;
    let totalPisCofins = 0;
    const details: string[] = [];

    const getEstado = (uf: string): EstadoICMS => {
        return ESTADOS_ICMS.find(e => e.uf === uf) || { uf, aliquota: 18, fcp: 0 }; // Default
    };

    const estadoOrigem = getEstado(notaCore.uf_emitente);
    const estadoDestino = notaCore.uf_destinatario ? getEstado(notaCore.uf_destinatario) : estadoOrigem;
    const isOperationInterestadual = !!notaCore.uf_destinatario && notaCore.uf_emitente !== notaCore.uf_destinatario;

    items.forEach(item => {
        const valorBase = item.valor_total || 0;
        
        // PIS/COFINS (Regime Monofásico)
        totalPisCofins += valorBase * (pisCofinsRate / 100);

        // IPI (conforme NCM)
        const ncmLimpo = (item.codigo_ncm || '').replace(/\./g, '');
        let valorIpiItem = 0;
        if (ncmLimpo && ipiRates.has(ncmLimpo)) {
            const ipiRate = ipiRates.get(ncmLimpo)!;
            valorIpiItem = valorBase * (ipiRate / 100);
            totalIpi += valorIpiItem;
        } else {
             if(ncmLimpo && !details.some(d => d.includes('NCMs não encontrados'))) {
                details.push(`- IPI não calculado para NCMs não encontrados na lista de referência (ex: ${ncmLimpo}).`);
             }
        }
        
        // ICMS: O valor do IPI compõe a base de cálculo do ICMS
        const baseCalculoIcms = valorBase + valorIpiItem;

        if (!isOperationInterestadual) { // Operação Interna
            const aliquotaEfetiva = estadoOrigem.aliquota + estadoOrigem.fcp;
            totalIcms += baseCalculoIcms * (aliquotaEfetiva / 100);
        } else { // Operação Interestadual com ST
            const aliquotaInterestadual = getAliquotaInterestadual(estadoOrigem.uf, estadoDestino.uf);
            
            // ICMS Próprio da operação interestadual
            const icmsProprio = baseCalculoIcms * (aliquotaInterestadual / 100);
            
            // Cálculo da Substituição Tributária (ST)
            const baseCalculoST = baseCalculoIcms * (1 + MVA_AUTOPECAS_PADRAO / 100);
            const aliquotaInternaDestinoEfetiva = estadoDestino.aliquota + estadoDestino.fcp;
            const icmsTotalST = baseCalculoST * (aliquotaInternaDestinoEfetiva / 100);
            const icmsSTaRecolher = Math.max(0, icmsTotalST - icmsProprio);

            totalIcms += icmsProprio + icmsSTaRecolher;
        }
    });

    const totalEstimado = totalIcms + totalIpi + totalPisCofins;
    const diferenca = totalEstimado - notaCore.imposto_total;

    // Adiciona premissas ao resultado
    if (!isOperationInterestadual) {
        details.unshift(`- ICMS calculado como Operação Interna em ${estadoOrigem.uf} (Alíquota ${estadoOrigem.aliquota}% + FCP ${estadoOrigem.fcp}%).`);
    } else {
        const aliquotaInterestadual = getAliquotaInterestadual(estadoOrigem.uf, estadoDestino.uf);
        details.unshift(`- ICMS-ST de ${estadoOrigem.uf} para ${estadoDestino.uf} (Alíq. Interestadual ${aliquotaInterestadual}%, Alíq. Interna Dest. ${(estadoDestino.aliquota + estadoDestino.fcp).toFixed(2)}%).`);
        details.unshift(`- ICMS-ST calculado usando MVA de ${MVA_AUTOPECAS_PADRAO}%.`);
    }
    details.unshift(`- PIS/COFINS calculado com alíquota de ${pisCofinsRate}% (Regime Monofásico).`);
    details.unshift(`- O valor do IPI foi somado à base de cálculo do ICMS.`);
    details.push(`- Cálculo não considera DIFAL (aplicável a não contribuintes) ou regimes especiais.`);

    return {
        imposto_estimado_total: totalEstimado,
        imposto_estimado_icms: totalIcms,
        imposto_estimado_ipi: totalIpi,
        imposto_estimado_pis_cofins: totalPisCofins,
        diferenca_imposto: diferenca,
        calculo_premissas: details.join('\n'),
        data_calculo: new Date().toISOString()
    };
};