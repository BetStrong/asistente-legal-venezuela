import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejar CORS si es necesario (Vercel lo maneja en la configuración, pero aquí lo aseguramos)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'El mensaje es requerido' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en el servidor' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Usamos generateContent para una respuesta directa y eficiente en serverless
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: `Eres un abogado experto en el marco legal de Venezuela. 
        Tu objetivo es ayudar a los usuarios con consultas legales basadas en la Constitución de la República Bolivariana de Venezuela, el Código Civil, el Código Penal, la LOTTT, y otras leyes especiales vigentes.
        
        Directrices:
        1. Proporciona información precisa y citando artículos específicos cuando sea posible.
        2. Mantén un tono profesional, ético y empático.
        3. Aclara siempre que eres una inteligencia artificial y que tus respuestas son orientativas.
        4. Responde en español de Venezuela.
        5. Menciona la vigencia de las leyes si han sido reformadas recientemente.`,
      },
    });

    const text = response.text;
    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error en Gemini API:', error);
    return res.status(500).json({ error: 'Error interno al procesar la consulta legal' });
  }
}
