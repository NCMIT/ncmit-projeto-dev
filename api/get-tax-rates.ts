// Importe os tipos da Vercel (opcional, mas bom para tipagem)
// Se der erro, pode remover : VercelRequest, : VercelResponse e usar : any
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
    // 1. Apenas aceite requisições POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { ncm, ufOrigem, ufDestino, isNaoContribuinte } = req.body;
        
        // 2. Valide os parâmetros de entrada
        if (!ncm || !ufOrigem || !ufDestino) {
            res.status(400).json({ error: 'Missing required parameters' });
            return;
        }

        // 3. Pegue a API Key do ambiente da Vercel (SEGURO)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set on the server.');
        }
        
        const ai = new GoogleGenAI({ apiKey });

        // 4. Lógica da API (movida do taxCalculator.ts)
        const tipoDestinatario = isNaoContribuinte ? "consumidor final não contribuinte de ICMS" : "contribuinte de ICMS (revenda)";
        const prompt = `Você é um especialista em tributação de autopeças no Brasil. Para o NCM '${ncm}', numa venda de '${ufOrigem}' para '${ufDestino}' destinada a um '${tipoDestinatario}', forneça a alíquota de IPI e a MVA-ST ajustada. Se for venda a não contribuinte (DIFAL), a MVA-ST é 0. Responda APENAS com o objeto JSON.`;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                ipi_aliquota: { type: Type.NUMBER, description: "Alíquota de IPI em porcentagem. Ex: 4.88" },
                mva_st_ajustada: { type: Type.NUMBER, description: "MVA-ST ajustada para a operação, em porcentagem. Ex: 71.78" },
            },
            required: ["ipi_aliquota", "mva_st_ajustada"],
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1
            },
        });

        const jsonText = response.text.trim();
        const rates = JSON.parse(jsonText);
        
        // 5. Retorne a resposta com sucesso
        res.status(200).json(rates);

    } catch (error: any) {
        // 6. Trate erros
        console.error('AI tax rate query failed (server-side):', error);
        res.status(500).json({ error: error.message || 'Failed to fetch tax rates from AI' });
    }
}