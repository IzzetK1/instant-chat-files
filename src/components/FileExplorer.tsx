
import React, { useState } from 'react';
import { FileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronDown, 
  ChevronRight, 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  RefreshCw, 
  Search, 
  Settings,
  Copy,
  Trash2,
  Edit 
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileExplorerProps {
  files: FileData[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onCreateFile: (fileName: string, fileType: string) => void;
  onCreateFolder?: (folderName: string) => void;
  onDeleteFile?: (fileId: string) => void;
}

interface FolderStructure {
  name: string;
  isFolder: boolean;
  id?: string;
  children: FolderStructure[];
  content?: string;
  type?: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['public', 'src']));

  // Create a folder structure
  const buildFolderStructure = (): FolderStructure => {
    const root: FolderStructure = { name: 'root', isFolder: true, children: [] };
    
    // Add standard folders
    const publicFolder: FolderStructure = { name: 'public', isFolder: true, children: [] };
    const srcFolder: FolderStructure = { name: 'src', isFolder: true, children: [] };
    
    // Add files to their respective folders
    files.forEach(file => {
      const path = file.name.includes('/') ? file.name.split('/') : [file.name];
      let currentFolder = path.length > 1 ? srcFolder : root;
      
      // If file is like "components/Button.js", navigate to components folder
      for (let i = 0; i < path.length - 1; i++) {
        const folderName = path[i];
        let targetFolder = currentFolder.children.find(child => child.name === folderName && child.isFolder);
        
        if (!targetFolder) {
          targetFolder = { name: folderName, isFolder: true, children: [] };
          currentFolder.children.push(targetFolder);
        }
        
        currentFolder = targetFolder;
      }
      
      // Add the file to the current folder
      const fileName = path[path.length - 1];
      currentFolder.children.push({
        name: fileName,
        isFolder: false,
        id: file.id,
        children: [],
        content: file.content,
        type: file.type
      });
    });
    
    // Add standard folders to root
    root.children.push(publicFolder);
    root.children.push(srcFolder);
    
    return root;
  };

  const folderStructure = buildFolderStructure();

  const toggleFolder = (folderName: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderName)) {
      newExpandedFolders.delete(folderName);
    } else {
      newExpandedFolders.add(folderName);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const handleCreateFile = () => {
    if (newFileName) {
      onCreateFile(newFileName, fileType);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return <div className="w-4 h-4 text-yellow-400">#</div>;
      case 'ts':
      case 'tsx':
        return <div className="w-4 h-4 text-blue-400">#</div>;
      case 'css':
        return <div className="w-4 h-4 text-blue-500">#</div>;
      case 'html':
        return <div className="w-4 h-4 text-orange-500">&lt;&gt;</div>;
      case 'json':
        return <div className="w-4 h-4 text-yellow-500">{}</div>;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderFolderStructure = (folder: FolderStructure, depth = 0) => {
    // Filter children based on search query if provided
    const filteredChildren = searchQuery 
      ? folder.children.filter(child => child.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : folder.children;

    // Sort children: folders first, then files
    const sortedChildren = [...filteredChildren].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div className="pl-[10px]" style={{ paddingLeft: depth ? `${depth * 12}px` : '0' }}>
        {sortedChildren.map((item) => (
          <div key={item.isFolder ? item.name : item.id}>
            {item.isFolder ? (
              <div>
                <div 
                  className="flex items-center px-2 py-1 rounded-sm hover:bg-sidebar-accent/50 cursor-pointer group text-sidebar-foreground"
                  onClick={() => toggleFolder(item.name)}
                >
                  <span className="mr-1">
                    {expandedFolders.has(item.name) ? (
                      <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground opacity-70" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground opacity-70" />
                    )}
                  </span>
                  <span className="mr-1.5">
                    {expandedFolders.has(item.name) ? (
                      <FolderOpen className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Folder className="h-4 w-4 text-yellow-400" />
                    )}
                  </span>
                  <span className="text-sm font-medium truncate">{item.name}</span>
                </div>
                {expandedFolders.has(item.name) && renderFolderStructure(item, depth + 1)}
              </div>
            ) : (
              <div
                className={cn(
                  "flex items-center px-2 py-1 rounded-sm hover:bg-sidebar-accent/50 cursor-pointer group ml-4",
                  item.id === activeFileId ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground"
                )}
                onClick={() => item.id && onFileSelect(item.id)}
              >
                <span className="mr-2">{getFileIcon(item.name)}</span>
                <span className="text-sm truncate flex-1">{item.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-md h-full flex flex-col bg-sidebar">
      <div className="flex items-center justify-between p-3 border-b border-sidebar-border bg-sidebar">
        <h3 className="text-sm font-bold text-sidebar-foreground uppercase tracking-wider">Explorer</h3>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0" 
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="h-3.5 w-3.5 text-sidebar-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New File</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 w-7 p-0"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-sidebar-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="px-3 py-2 border-b border-sidebar-border">
        <div className="flex items-center bg-sidebar-accent rounded-md px-2 py-1">
          <Search className="h-3.5 w-3.5 text-sidebar-foreground opacity-70 mr-2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="border-0 bg-transparent text-sidebar-foreground text-xs h-5 px-0 py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>
      
      {isCreating && (
        <div className="p-3 border-b border-sidebar-border">
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

      <ScrollArea className="flex-1 px-2 py-2">
        {renderFolderStructure(folderStructure)}
      </ScrollArea>
      
      <div className="bg-sidebar-accent p-2 text-xs text-sidebar-foreground/70 border-t border-sidebar-border">
        <div className="font-semibold mb-1">DEPENDENCIES</div>
        <div className="px-2 py-1">
          <div className="flex justify-between items-center">
            <span>react</span>
            <span className="text-sidebar-foreground/50">^18.3.1</span>
          </div>
          <div className="flex justify-between items-center">
            <span>react-dom</span>
            <span className="text-sidebar-foreground/50">^18.3.1</span>
          </div>
          <div className="flex justify-between items-center">
            <span>@monaco-editor/react</span>
            <span className="text-sidebar-foreground/50">^4.7.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
