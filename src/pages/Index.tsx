
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import Preview from '@/components/Preview';
import ChatInterface from '@/components/ChatInterface';
import ChatHeader from '@/components/ChatHeader';
import { FileData, Message } from '@/types';
import { generateId, getFileExtension, createFile, parseCodeBlocks, getInitialFiles } from '@/utils/fileUtils';
import { streamChatMessage, runProject } from '@/services/ollamaService';

const Index = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedModel, setSelectedModel] = useState<string>('llama3');
  const [runningCommand, setRunningCommand] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize with some default files
  useEffect(() => {
    const initialFiles = getInitialFiles();
    setFiles(initialFiles);
    if (initialFiles.length > 0) {
      setActiveFileId(initialFiles[0].id);
    }
  }, []);

  const activeFile = activeFileId ? files.find((file) => file.id === activeFileId) || null : null;

  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleCreateFile = (fileName: string, fileType: string) => {
    // If no extension provided, append default
    if (!fileName.includes('.')) {
      fileName = `${fileName}.${fileType}`;
    }
    
    // Check if file already exists
    if (files.some((file) => file.name === fileName)) {
      toast({
        title: "Hata",
        description: "Bu isimde bir dosya zaten var.",
        variant: "destructive",
      });
      return;
    }

    const fileExt = getFileExtension(fileName);
    const newFile = createFile(fileName, fileExt);
    
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    
    toast({
      title: "Başarılı",
      description: `${fileName} dosyası oluşturuldu.`,
    });
  };

  const handleContentChange = (content: string) => {
    if (!activeFileId) return;
    
    setFiles(files.map((file) => 
      file.id === activeFileId ? { ...file, content } : file
    ));
  };

  const handleRunProject = async () => {
    try {
      const result = await runProject(files, 'web');
      setRunningCommand(result.command);
      
      toast({
        title: "Proje Başlatıldı",
        description: `Komut: ${result.command}`,
      });
      
      // Refresh the preview
      setRefreshTrigger(prev => prev + 1);
      
      // Clear the command after a few seconds to allow for multiple runs
      setTimeout(() => {
        setRunningCommand(null);
      }, 3000);
    } catch (error) {
      console.error('Error running project:', error);
      toast({
        title: "Hata",
        description: "Proje başlatılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      // Add user message to the chat
      const userMessage: Message = {
        id: generateId(),
        content,
        role: 'user',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Collect response chunks
      let responseContent = '';
      await streamChatMessage(content, selectedModel, (chunk) => {
        responseContent += chunk;
        // Update AI message as chunks arrive
        setMessages((prev) => {
          // If the last message is from the AI and still loading, update it
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: responseContent }
            ];
          } else {
            // Otherwise add a new AI message
            return [
              ...prev,
              {
                id: generateId(),
                content: responseContent,
                role: 'assistant',
                timestamp: new Date(),
              }
            ];
          }
        });
      });

      // Final AI message after all chunks processed
      setMessages((prev) => {
        // Remove temporary messages and add the final one
        const withoutTemp = prev.filter(msg => msg.role !== 'assistant' || msg.content !== responseContent);
        return [
          ...withoutTemp,
          {
            id: generateId(),
            content: responseContent,
            role: 'assistant',
            timestamp: new Date(),
          }
        ];
      });

      // Extract and create files from code blocks
      const codeBlocks = parseCodeBlocks(responseContent);
      if (codeBlocks.length > 0) {
        codeBlocks.forEach((block) => {
          // Try to determine a name based on content or use defaults
          let fileName = `code-${generateId().substring(0, 5)}.${block.language}`;
          
          // For HTML/CSS/JS we can use standard names
          if (block.language === 'html') fileName = 'index.html';
          if (block.language === 'css') fileName = 'styles.css';
          if (block.language === 'javascript' || block.language === 'js') fileName = 'script.js';
          
          // Check if we're updating an existing file or creating a new one
          const existingFile = files.find(f => f.name.toLowerCase().endsWith(`.${block.language}`));
          
          if (existingFile) {
            // Update existing file
            setFiles(files.map(file => 
              file.id === existingFile.id ? { ...file, content: block.code } : file
            ));
            setActiveFileId(existingFile.id);
            
            toast({
              title: "Dosya Güncellendi",
              description: `${existingFile.name} dosyası güncellendi.`,
            });
          } else {
            // Create new file
            const newFile = createFile(fileName, block.language, block.code);
            setFiles([...files, newFile]);
            setActiveFileId(newFile.id);
            
            toast({
              title: "Yeni Dosya",
              description: `${fileName} dosyası oluşturuldu.`,
            });
          }
        });
        
        // Refresh preview
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Hata",
        description: "API ile iletişim sırasında bir hata oluştu. Ollama API'nin çalıştığından emin olun.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-sidebar shadow-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Ollama Kod Asistanı
        </h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="bg-sidebar-accent text-sidebar-foreground border-sidebar-border"
          >
            Önizlemeyi Yenile
          </Button>
        </div>
      </header>
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} className="bg-sidebar">
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onCreateFile={handleCreateFile}
          />
        </ResizablePanel>
        
        <ResizableHandle className="bg-sidebar-border w-1" />
        
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} className="overflow-hidden">
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50}>
                  <CodeEditor 
                    file={activeFile} 
                    onContentChange={handleContentChange} 
                  />
                </ResizablePanel>
                
                <ResizableHandle className="bg-sidebar-border h-1" />
                
                <ResizablePanel defaultSize={50}>
                  <Preview 
                    files={files} 
                    activeFile={activeFile} 
                    refreshTrigger={refreshTrigger}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            
            <ResizableHandle className="bg-sidebar-border h-1" />
            
            <ResizablePanel defaultSize={40} className="border-t border-sidebar-border">
              <div className="flex flex-col h-full">
                <ChatHeader 
                  selectedModel={selectedModel} 
                  onSelectModel={setSelectedModel}
                  onRunProject={handleRunProject}
                  runningCommand={runningCommand} 
                />
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
