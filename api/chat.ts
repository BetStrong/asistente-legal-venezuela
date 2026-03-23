import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Formato de mensajes inválido' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY no configurada' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres Asistente Legal Venezuela, un consultor virtual especializado en legislación venezolana.

Tu función es orientar a las personas de forma clara, humana, profesional y fácil de entender. Responde siempre en español de Venezuela, con un tono cercano y respetuoso.

Tu estilo debe ser:
- humano
- claro
- profesional
- directo

Reglas:
- Haz preguntas si falta información
- No inventes leyes
- Sugiere acudir a abogado en casos delicados
- Explica fácil

Detecta el tipo de caso:
- laboral
- penal
- familiar
- mercantil
- tributario

Después de entender el caso:
- orienta
- da pasos claros
- guía como abogado real`
          },
          ...messages
        ],
        temperature: 0.4
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Error OpenAI'
      });
    }

    const text = data?.choices?.[0]?.message?.content || '';

    return res.status(200).json({ text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
