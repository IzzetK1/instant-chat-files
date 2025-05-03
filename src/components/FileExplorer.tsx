
import React, { useState } from 'react';
import { FileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, File, Folder } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileExplorerProps {
  files: FileData[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onCreateFile: (fileName: string, fileType: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onCreateFile,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [fileType, setFileType] = useState('js');

  const handleCreateFile = () => {
    if (newFileName) {
      onCreateFile(newFileName, fileType);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const getFileExtension = (fileName: string) => {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop() : '';
  };

  return (
    <div className="border rounded-md p-2 h-full flex flex-col bg-sidebar">
      <div className="flex items-center justify-between mb-2 p-2">
        <h3 className="text-sm font-medium text-sidebar-foreground">Files</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          className="h-8 w-8 p-0" 
          onClick={() => setIsCreating(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {isCreating && (
        <div className="p-2 border-b border-sidebar-border mb-2">
          <div className="flex mb-2">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="file-name.js"
              className="text-xs h-7 bg-sidebar-accent text-sidebar-foreground"
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="h-7 text-xs" 
              onClick={handleCreateFile}
            >
              Create
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs" 
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center p-2 rounded-md cursor-pointer file-item ${
                file.id === activeFileId ? 'active' : ''
              }`}
              onClick={() => onFileSelect(file.id)}
            >
              <File className="h-4 w-4 mr-2 text-sidebar-foreground opacity-70" />
              <span className="text-sm text-sidebar-foreground truncate">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
