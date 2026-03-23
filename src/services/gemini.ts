export async function sendMessage(message: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en la comunicación con el servidor');
    }

    return data.text;
  } catch (error) {
    console.error('Error al llamar a la API de chat:', error);
    throw error;
  }
}
