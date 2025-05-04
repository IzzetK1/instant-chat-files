import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Message } from '@/types';
import { useToast } from '@/hooks/use-toast';
import Editor from '@monaco-editor/react';
import { Copy } from 'lucide-react';
import CodeBlock from "@/components/ui/codeblock";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast({
        title: "Mesaj boş olamaz",
        variant: "destructive",
      });
      return;
    }
    
    onSendMessage(input);
    setInput('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Updated renderMessageContent to use CodeBlock
  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([\w]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return parts.map((part, i) => {
      if (part.type === 'text') {
        return <div key={i} className="whitespace-pre-wrap mb-2">{part.content}</div>;
      } else {
        return (
          <div key={i} className="mb-4">
            <CodeBlock code={part.content} language={part.language} />
          </div>
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full border rounded-md">
      <div className="p-3 border-b bg-sidebar">
        <h3 className="font-semibold text-sidebar-foreground">Sohbet</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div 
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {renderMessageContent(message.content)}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatDate(message.timestamp)}
              </span>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-secondary text-secondary-foreground max-w-[80%] rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-current animate-pulse-slow"></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-pulse-slow delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-current animate-pulse-slow delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Bir mesaj yazın..."
          className="min-h-[60px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          Gönder
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
