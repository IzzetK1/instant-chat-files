
import React from 'react';
import Editor from '@monaco-editor/react';
import { FileData } from '@/types';

interface CodeEditorProps {
  file: FileData | null;
  onContentChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onContentChange }) => {
  // Get language based on file type
  const getLanguageFromFileType = (type: string): string => {
    const langMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
    };
    
    return langMap[type] || 'plaintext';
  };

  const handleEditorChange = (value: string = '') => {
    onContentChange(value);
  };

  return (
    <div 
      className="h-full w-full border rounded-md overflow-hidden bg-code text-code-foreground shadow-md"
      data-testid="code-editor"
    >
      {!file ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4">
          <div className="text-4xl mb-4 opacity-20">📝</div>
          <h3 className="text-lg font-semibold mb-2">No file selected</h3>
          <p className="text-sm text-center max-w-md opacity-70">
            Select an existing file from the explorer or create a new one to start editing
          </p>
        </div>
      ) : (
        <Editor
          height="100%"
          defaultLanguage={getLanguageFromFileType(file.type)}
          language={getLanguageFromFileType(file.type)}
          value={file.content}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
            padding: { top: 16 },
            lineNumbers: 'on',
            roundedSelection: true,
            cursorStyle: 'line',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 12,
              horizontalScrollbarSize: 12
            }
          }}
        />
      )}
    </div>
  );
};

export default CodeEditor;
