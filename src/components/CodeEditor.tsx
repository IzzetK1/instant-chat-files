
import React, { useRef, useEffect } from 'react';
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
    };
    
    return langMap[type] || 'plaintext';
  };

  const handleEditorChange = (value: string = '') => {
    onContentChange(value);
  };

  return (
    <div 
      className="h-full w-full border rounded-md overflow-hidden bg-code text-code-foreground"
      data-testid="code-editor"
    >
      {!file ? (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Select or create a file to start editing
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
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            padding: { top: 16 },
          }}
        />
      )}
    </div>
  );
};

export default CodeEditor;
