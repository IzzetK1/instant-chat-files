import React from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const codeRef = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  return (
    <pre ref={codeRef} className={`language-${language}`}>
      <code>{code}</code>
    </pre>
  );
};

export default CodeBlock;