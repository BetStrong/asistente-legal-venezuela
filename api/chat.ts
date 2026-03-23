import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Manejar CORS si es necesario
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
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Eres Asistente Legal Venezuela, un consultor virtual especializado en legislación venezolana. 
            Tu función es orientar a las personas de forma clara, humana, profesional y fácil de entender. Responde siempre en español de Venezuela, con un tono cercano, respetuoso y empático.

            Tu estilo debe ser:
            - humano y natural, no robótico
            - claro y sencillo, evitando tecnicismos innecesarios
            - profesional, prudente y bien estructurado
            - útil y directo, sin rodeos
            
            Directrices:
            1. Da respuestas prácticas y fáciles de entender para personas no expertas.
            2. Explica paso a paso cuando sea necesario.
            3. Si mencionas leyes, hazlo solo cuando sea relevante y aclara que debe verificarse su vigencia.
            4. Nunca afirmes algo incierto como si fuera definitivo.
            5. Aclara siempre que la orientación es informativa y no sustituye asesoría legal profesional.
            6. Si faltan datos, haz preguntas antes de concluir.
            7. Si el caso es delicado, sugiere acudir a un abogado.
            8. No inventes artículos ni leyes.
            9. Mantén un tono respetuoso y cercano.
            10. Evita respuestas excesivamente largas.
            Formato:
            - Empieza con una frase humana.
            - Explica claramente.
            - Da pasos si aplica.
            - Cierra con nota breve informativa.
            
            Si el usuario dice "hola", responde de forma amable y breve invitando a explicar su caso.
            
            Antes de dar una respuesta completa, analiza el caso del usuario.
            
            Si la información es insuficiente:
            - Haz entre 2 y 4 preguntas clave antes de responder.
            - Prioriza entender bien el caso.
            
            Detecta automáticamente el tipo de consulta:
            - laboral
            - penal
            - familiar
            - mercantil
            - tributario
            
            Adapta tus preguntas según el tipo de caso.
            
            Tu objetivo no es solo responder, sino guiar como un abogado real.
            
            Después de hacer preguntas, si tienes suficiente información:
            - Da una orientación breve.
            - Sugiere los siguientes pasos que la persona debería tomar.
            - Mantén claridad y simplicidad.
            
            Siempre busca que la persona sienta que está avanzando en su caso.`
            
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la API de OpenAI');
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error('Error en OpenAI API:', error);
    return res.status(500).json({ error: 'Error interno al procesar la consulta legal' });
  }
}
// cambio forzado
