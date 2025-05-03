
import { OllamaResponse } from '@/types';

const API_BASE_URL = 'http://localhost:11434';  // Default Ollama API endpoint

export async function sendChatMessage(content: string, model = 'llama3') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content }
        ],
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as OllamaResponse;

  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
}

export async function streamChatMessage(content: string, model = 'llama3', onChunk: (chunk: string) => void) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content }
        ],
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (value) {
        const chunk = decoder.decode(value);
        // Each line is a JSON object
        const lines = chunk
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (e) {
              console.error('Failed to parse JSON line:', line);
              return null;
            }
          })
          .filter(Boolean);

        lines.forEach(obj => {
          if (obj.message?.content) {
            onChunk(obj.message.content);
          }
        });
      }
    }

  } catch (error) {
    console.error('Error streaming from Ollama API:', error);
    throw error;
  }
}
