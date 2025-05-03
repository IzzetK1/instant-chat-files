
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, RefreshCw } from 'lucide-react';
import { fetchAvailableModels } from '@/services/ollamaService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface AIModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
}) => {
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const availableModels = await fetchAvailableModels();
      setModels(availableModels);
      // If the currently selected model isn't available, default to the first one
      if (availableModels.length > 0 && !availableModels.includes(selectedModel)) {
        onSelectModel(availableModels[0]);
      }
    } catch (error) {
      console.error('Error fetching available models:', error);
      toast({
        title: "Hata",
        description: "Ollama modellerini alırken bir hata oluştu. Ollama API'nin çalıştığından emin olun.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Skeleton className="h-9 w-48" />
      ) : (
        <Select value={selectedModel} onValueChange={onSelectModel}>
          <SelectTrigger className="w-48 text-xs h-9 bg-sidebar-accent">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            {models.length === 0 ? (
              <SelectItem value="no-models" disabled>No models found</SelectItem>
            ) : (
              models.map(model => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0"
        onClick={fetchModels}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-9 w-9 p-0"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AIModelSelector;
