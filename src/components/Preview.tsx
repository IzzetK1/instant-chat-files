
import React, { useEffect, useRef, useState } from 'react';
import { FileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PreviewProps {
  files: FileData[];
  activeFile: FileData | null;
  refreshTrigger: number;
}

const Preview: React.FC<PreviewProps> = ({ files, activeFile, refreshTrigger }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [consoleMessages, setConsoleMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!iframeRef.current || files.length === 0) return;

    const htmlFile = files.find(f => f.name.endsWith('.html'));
    if (!htmlFile) return;

    const cssFiles = files.filter(f => f.name.endsWith('.css'));
    const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));

    try {
      const doc = iframeRef.current.contentDocument!;
      doc.open();
      doc.write(htmlFile.content);

      // Inject CSS files
      cssFiles.forEach(cssFile => {
        const style = doc.createElement('style');
        style.textContent = cssFile.content;
        doc.head.appendChild(style);
      });

      // Inject JS files
      jsFiles.forEach(jsFile => {
        const script = doc.createElement('script');
        script.textContent = jsFile.content;
        doc.body.appendChild(script);
      });

      // Intercept console logs
      if (iframeRef.current.contentWindow) {
        const originalConsole = { ...(iframeRef.current.contentWindow.console || {}) };
        const consoleTypes = ['log', 'info', 'warn', 'error'];
        
        consoleTypes.forEach(type => {
          if (iframeRef.current?.contentWindow?.console) {
            iframeRef.current.contentWindow.console[type as keyof Console] = (...args: any[]) => {
              originalConsole[type]?.apply(originalConsole, args);
              setConsoleMessages(prev => [...prev, { type, args }]);
            };
          }
        });
      }

      doc.close();
    } catch (error) {
      console.error('Error rendering preview:', error);
    }
  }, [files, refreshTrigger]);

  return (
    <div className="border rounded-md flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="console">Console</TabsTrigger>
          </TabsList>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto text-xs"
            onClick={() => {
              if (activeTab === 'console') {
                setConsoleMessages([]);
              }
            }}
          >
            {activeTab === 'preview' ? 'Refresh' : 'Clear'}
          </Button>
        </div>

        <TabsContent value="preview" className="flex-1 flex p-0 m-0 overflow-hidden">
          <iframe 
            ref={iframeRef} 
            title="Preview" 
            className="preview-iframe bg-white w-full"
            sandbox="allow-scripts allow-same-origin"
          />
        </TabsContent>

        <TabsContent value="console" className="flex-1 p-0 m-0 overflow-hidden">
          <div className="bg-code text-code-foreground h-full p-2 overflow-y-auto font-mono text-sm">
            {consoleMessages.length === 0 ? (
              <div className="text-muted-foreground p-2">No console output</div>
            ) : (
              consoleMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-1 ${
                    msg.type === 'error' ? 'text-destructive' : 
                    msg.type === 'warn' ? 'text-yellow-400' : 'text-foreground'
                  }`}
                >
                  {msg.args.map((arg: any, i: number) => (
                    <span key={i} className="mr-2">{JSON.stringify(arg)}</span>
                  ))}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Preview;
