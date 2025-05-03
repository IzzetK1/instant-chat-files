
import React from 'react';
import { Button } from '@/components/ui/button';
import AIModelSelector from './AIModelSelector';
import { RefreshCw, Settings, Save, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
  onRunProject: () => void;
  runningCommand: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedModel,
  onSelectModel,
  onRunProject,
  runningCommand
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-sidebar">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-bold text-sidebar-foreground uppercase tracking-wider">AI Assistant</h3>
        <Badge variant="secondary" className="uppercase text-xs font-normal">
          Ollama
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <AIModelSelector selectedModel={selectedModel} onSelectModel={onSelectModel} />
        
        <Button
          size="sm"
          variant="outline"
          className="h-9 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-none"
          onClick={onRunProject}
        >
          <Play className="h-3.5 w-3.5" />
          {runningCommand ? 'Running...' : 'Run Project'}
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
