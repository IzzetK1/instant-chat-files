import { fetchAvailableModels } from "./ollamaService";

const SYSTEM_PROMPT = `
You are a highly capable AI agent designed to assist with a wide range of tasks, including but not limited to:
- Answering questions based on provided context.
- Writing, debugging, and explaining code.
- Fetching and summarizing information from the internet.
- Managing files and directories.
- Providing recommendations and insights.

Your responses should be clear, concise, and professional. Always prioritize user satisfaction and accuracy.`;

export { SYSTEM_PROMPT };

export async function queryOllamaModel(model: string, prompt: string): Promise<string> {
  try {
    const response = await fetch(`/api/ollama/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error querying Ollama model:", error);
    throw error;
  }
}

export async function getAvailableModels(): Promise<string[]> {
  try {
    return await fetchAvailableModels();
  } catch (error) {
    console.error("Error fetching available models:", error);
    throw error;
  }
}