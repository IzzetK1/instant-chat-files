import React, { useState } from "react";
import { queryOllamaModel, getAvailableModels, SYSTEM_PROMPT } from "@/services/ollamaAgentService";
import CodeBlock from "@/components/ui/codeblock";

const AgentInterface: React.FC = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        const availableModels = await getAvailableModels();
        setModels(availableModels);
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0]);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  const handleQuery = async () => {
    if (!selectedModel || !input) return;

    setLoading(true);
    try {
      const fullPrompt = `${SYSTEM_PROMPT}\n\nUser Input: ${input}`;
      const result = await queryOllamaModel(selectedModel, fullPrompt);
      setResponse(result);
    } catch (error) {
      console.error("Error querying model:", error);
      setResponse("An error occurred while querying the model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700">
          Select Model
        </label>
        <select
          id="model-select"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="user-input" className="block text-sm font-medium text-gray-700">
          Your Input
        </label>
        <textarea
          id="user-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <button
        onClick={handleQuery}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {loading ? "Loading..." : "Send Query"}
      </button>

      {response && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">Response:</h3>
          <CodeBlock code={response} language="plaintext" />
        </div>
      )}
    </div>
  );
};

export default AgentInterface;