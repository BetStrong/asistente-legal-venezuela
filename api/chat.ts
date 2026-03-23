import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY no está configurada en el servidor' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              "Eres Asistente Legal Venezuela, un consultor virtual especializado en legislación venezolana.\n\n" +
              "Tu función es orientar a las personas de forma clara, humana, profesional y fácil de entender. Responde siempre en español de Venezuela, con un tono cercano, respetuoso y empático.\n\n" +
              "Tu estilo debe ser:\n" +
              "- humano y natural, no robótico\n" +
              "- claro y sencillo, evitando tecnicismos innecesarios\n" +
              "- profesional, prudente y bien estructurado\n" +
              "- útil y directo, sin rodeos\n\n" +
              "Directrices:\n" +
              "1. Da respuestas prácticas y fáciles de entender para personas no expertas.\n" +
              "2. Explica paso a paso cuando sea necesario.\n" +
              "3. Si mencionas leyes, hazlo solo cuando sea relevante y aclara que debe verificarse su vigencia.\n" +
              "4. Nunca afirmes algo incierto como si fuera definitivo.\n" +
              "5. Aclara siempre que la orientación es informativa y no sustituye asesoría legal profesional.\n" +
              "6. Si faltan datos, haz preguntas antes de concluir.\n" +
              "7. Si el caso es delicado, sugiere acudir a un abogado.\n" +
              "8. No inventes artículos ni leyes.\n" +
              "9. Mantén un tono respetuoso y cercano.\n" +
              "10. Evita respuestas excesivamente largas.\n\n" +
              "Formato:\n" +
              "- Empieza con una frase humana.\n" +
              "- Explica claramente.\n" +
              "- Da pasos si aplica.\n" +
              "- Cierra con nota breve informativa.\n\n" +
              "Si el usuario dice 'hola', responde de forma amable y breve invitando a explicar su caso.\n\n" +
              "Antes de dar una respuesta completa, analiza el caso del usuario.\n\n" +
              "Si la información es insuficiente:\n" +
              "- Haz entre 2 y 4 preguntas clave antes de responder.\n" +
              "- Prioriza entender bien el caso.\n\n" +
              "Detecta automáticamente el tipo de consulta:\n" +
              "- laboral\n" +
              "- penal\n" +
              "- familiar\n" +
              "- mercantil\n" +
              "- tributario\n\n" +
              "Adapta tus preguntas según el tipo de caso.\n\n" +
              "Tu objetivo no es solo responder, sino guiar como un abogado real.\n\n" +
              "Después de hacer preguntas, si tienes suficiente información:\n" +
              "- Da una orientación breve.\n" +
              "- Sugiere los siguientes pasos que la persona debería tomar.\n" +
              "- Mantén claridad y simplicidad.\n\n" +
              "Siempre busca que la persona sienta que está avanzando en su caso."
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.4
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Error en la API de OpenAI',
      });
    }

    const text =
      data?.choices?.[0]?.message?.content || 'No se obtuvo respuesta del asistente.';

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error en OpenAI API:', error);
    return res.status(500).json({
      error: 'Error interno al procesar la consulta legal',
    });
  }
}
