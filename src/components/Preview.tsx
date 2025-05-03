
import React, { useEffect, useRef, useState } from 'react';
import { FileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Play } from 'lucide-react';

interface PreviewProps {
  files: FileData[];
  activeFile: FileData | null;
  refreshTrigger: number;
}

const Preview: React.FC<PreviewProps> = ({ files, activeFile, refreshTrigger }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [consoleMessages, setConsoleMessages] = useState<any[]>([]);
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState<number>(0);
  const [activePreviewFile, setActivePreviewFile] = useState<string | null>(null);

  // Önizleme için kullanılacak dosyayı tespit et
  useEffect(() => {
    const htmlFile = files.find(f => f.name.endsWith('.html'));
    if (htmlFile) {
      setActivePreviewFile(htmlFile.name);
    } else if (files.length > 0) {
      // HTML dosyası yoksa ilk dosyayı göster
      setActivePreviewFile(files[0].name);
    }
  }, [files]);

  // Önizleme render işlemi
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

      // CSS dosyalarını ekle
      cssFiles.forEach(cssFile => {
        const style = doc.createElement('style');
        style.textContent = cssFile.content;
        doc.head.appendChild(style);
      });

      // JS dosyalarını ekle
      jsFiles.forEach(jsFile => {
        const script = doc.createElement('script');
        script.textContent = jsFile.content;
        doc.body.appendChild(script);
      });

      // Konsol loglarını yakala
      if (iframeRef.current.contentWindow) {
        const originalConsole = { ...(iframeRef.current.contentWindow as any).console || {} };
        const consoleTypes = ['log', 'info', 'warn', 'error'];
        
        consoleTypes.forEach(type => {
          if (iframeRef.current?.contentWindow) {
            (iframeRef.current.contentWindow as any).console[type] = (...args: any[]) => {
              originalConsole[type]?.apply(originalConsole, args);
              setConsoleMessages(prev => [...prev, { type, args, timestamp: new Date() }]);
            };
          }
        });
      }

      doc.close();
    } catch (error) {
      console.error('Önizleme oluşturulurken hata:', error);
      setConsoleMessages(prev => [
        ...prev, 
        { 
          type: 'error', 
          args: [`Önizleme hatası: ${error instanceof Error ? error.message : String(error)}`],
          timestamp: new Date()
        }
      ]);
    }
  }, [files, refreshTrigger, internalRefreshTrigger]);

  // Dosyalar için seçim arayüzü
  const renderFileSelector = () => {
    if (files.length === 0) return null;
    
    return (
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 px-2">
        {files.map(file => (
          <div 
            key={file.id}
            className={`cursor-pointer px-3 py-1 text-xs rounded-md flex items-center ${
              activePreviewFile === file.name ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            }`}
            onClick={() => setActivePreviewFile(file.name)}
          >
            {file.name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-md flex flex-col h-full bg-code shadow-md">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center justify-between p-2 border-b bg-code-header">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="preview">Önizleme</TabsTrigger>
            <TabsTrigger value="console">Konsol</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => {
                if (activeTab === 'console') {
                  setConsoleMessages([]);
                } else {
                  setInternalRefreshTrigger(prev => prev + 1);
                }
              }}
            >
              <RefreshCw className="h-3 w-3" />
              {activeTab === 'preview' ? 'Yenile' : 'Temizle'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 bg-green-700 hover:bg-green-800 text-white"
              onClick={() => {
                setInternalRefreshTrigger(prev => prev + 1);
                setActiveTab('preview');
                
                // JS dosyalarını tekrar çalıştır - simüle edilmiş run
                const jsFiles = files.filter(f => f.name.endsWith('.js') || f.name.endsWith('.jsx'));
                if (jsFiles.length > 0) {
                  setConsoleMessages(prev => [
                    ...prev,
                    {
                      type: 'info',
                      args: [`${jsFiles.length} JavaScript dosyası çalıştırılıyor...`],
                      timestamp: new Date()
                    }
                  ]);
                }
              }}
            >
              <Play className="h-3 w-3" />
              Çalıştır
            </Button>
          </div>
        </div>

        {activeTab === 'preview' && renderFileSelector()}

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
              <div className="text-muted-foreground p-2">Konsol çıktısı yok</div>
            ) : (
              consoleMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-1 border-l-2 pl-2 ${
                    msg.type === 'error' ? 'text-destructive border-destructive' : 
                    msg.type === 'warn' ? 'text-yellow-400 border-yellow-400' : 
                    'text-foreground border-blue-500'
                  }`}
                >
                  <span className="text-xs text-muted-foreground mr-2">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                  </span>
                  {msg.args.map((arg: any, i: number) => (
                    <span key={i} className="mr-2 whitespace-pre-wrap">
                      {typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)}
                    </span>
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
