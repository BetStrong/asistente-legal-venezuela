export async function sendMessage(messages: any[]) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error del servidor');
    }

    return data.text;
  } catch (error) {
    console.error('Error al llamar a la API:', error);
    throw error;
  }
}
