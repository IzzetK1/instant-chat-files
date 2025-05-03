
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

export async function fetchAvailableModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    // Extract model names from the response
    const models = data.models ? data.models.map((model: any) => model.name) : [];
    return models;
    
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

export async function runProject(files: any[], projectType: string) {
  // Simple project detection and startup command generation
  let command = '';
  const fileNames = files.map(file => file.name.toLowerCase());
  
  // Check for package.json
  const hasPackageJson = fileNames.includes('package.json');
  
  if (hasPackageJson) {
    // Check for specific frameworks
    const isReact = fileNames.some(name => name.includes('react'));
    const isVue = fileNames.some(name => name.includes('vue'));
    const isAngular = fileNames.some(name => name.includes('angular'));
    const isNext = fileNames.some(name => name.includes('next'));
    
    if (isNext) {
      command = 'npm run dev';
    } else if (isReact) {
      command = 'npm start';
    } else if (isVue) {
      command = 'npm run serve';
    } else if (isAngular) {
      command = 'ng serve';
    } else {
      command = 'npm start';
    }
  } else {
    // Simple static site
    command = 'npx serve .';
  }
  
  return {
    command,
    projectType: hasPackageJson ? 'npm' : 'static',
  };
}
