import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeDisplayProps {
  code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
      <SyntaxHighlighter 
        language="typescript" 
        style={vscDarkPlus}
        showLineNumbers={false}
        wrapLines={true}
        customStyle={{
          margin: 0,
          padding: '20px',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
