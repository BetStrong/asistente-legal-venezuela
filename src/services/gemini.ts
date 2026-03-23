export async function sendMessage(messages: any[]) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages || []
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en la comunicación con el servidor');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error al llamar a la API de chat:', error);
    throw error;
  }
}
