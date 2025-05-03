
import { FileData } from '@/types';

// Generate a unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Get file extension from file name
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

// Create a new file object
export const createFile = (name: string, type: string, content = ''): FileData => {
  return {
    id: generateId(),
    name,
    content,
    type,
  };
};

// Parse code blocks from AI response
export const parseCodeBlocks = (text: string): { language: string; code: string }[] => {
  const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/g;
  const codeBlocks: { language: string; code: string }[] = [];

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    codeBlocks.push({ language, code });
  }

  return codeBlocks;
};

// Get initial files for the project
export const getInitialFiles = (): FileData[] => {
  return [
    createFile('index.html', 'html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Preview</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`),
    createFile('styles.css', 'css', `
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 1rem;
}

#app {
  max-width: 800px;
  margin: 0 auto;
}
`),
    createFile('main.js', 'js', `
// Ana JavaScript dosyası
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  app.innerHTML = '<h1>Merhaba, Dünya!</h1><p>Kod düzenlemeye başlamak için dosyaları düzenleyin.</p>';
});
`),
  ];
};
