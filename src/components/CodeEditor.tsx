
import React, { useRef, useEffect } from 'react';
import * as Monaco from 'monaco-editor';
import { FileData } from '@/types';

interface CodeEditorProps {
  file: FileData | null;
  onContentChange: (content: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file, onContentChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoEditorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Monaco Editor
    monacoEditorRef.current = Monaco.editor.create(editorRef.current, {
      value: file?.content || '',
      language: getLanguageFromFileType(file?.type || 'js'),
      theme: 'vs-dark',
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontSize: 14,
      padding: { top: 16 },
    });

    // Set up change handler
    const changeModel = monacoEditorRef.current.onDidChangeModelContent(() => {
      const value = monacoEditorRef.current?.getValue() || '';
      onContentChange(value);
    });

    return () => {
      changeModel?.dispose();
      monacoEditorRef.current?.dispose();
    };
  }, []);

  // Update editor content when file changes
  useEffect(() => {
    if (monacoEditorRef.current && file) {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== file.content) {
        monacoEditorRef.current.setValue(file.content);
      }

      Monaco.editor.setModelLanguage(
        monacoEditorRef.current.getModel()!,
        getLanguageFromFileType(file.type)
      );
    }
  }, [file]);

  // Helper function to determine language based on file type
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

  return (
    <div 
      className="h-full w-full border rounded-md overflow-hidden bg-code text-code-foreground"
      data-testid="code-editor"
    >
      {!file && (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          Select or create a file to start editing
        </div>
      )}
      <div ref={editorRef} className="h-full w-full" style={{ display: file ? 'block' : 'none' }} />
    </div>
  );
};

export default CodeEditor;
