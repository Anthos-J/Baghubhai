import { DiffEditor } from '@monaco-editor/react';

export interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
  originalTitle?: string;
  modifiedTitle?: string;
}

export function DiffViewer({
  original,
  modified,
  language = 'javascript',
  readOnly = true,
  className = '',
  height = '100%',
  originalTitle = 'ORIGINAL / BASELINE',
  modifiedTitle = 'MODIFIED / CURRENT'
}: DiffViewerProps) {
  return (
    <div className={`w-full h-full flex flex-col bg-[#070B16] border-2 border-[#1A233A] ${className}`}>
      {/* Diff Headers */}
      <div className="flex justify-between items-center bg-[#0D1426] px-4 py-2 border-b-2 border-[#1A233A] font-pixel text-[10px]">
        <span className="text-gray-400">&lt; {originalTitle}</span>
        <span className="text-primary">{modifiedTitle} &gt;</span>
      </div>

      {/* Monaco Diff Container */}
      <div className="flex-1 overflow-hidden relative">
        <DiffEditor
          height={height}
          language={language}
          original={original}
          modified={modified}
          theme="vs-dark"
          loading={
            <div className="flex items-center justify-center h-full text-primary font-tech animate-pulse text-sm">
              &gt; COMPUTING CODE DIFF...
            </div>
          }
          options={{
            readOnly,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: '"Fira Code", "Share Tech Mono", Consolas, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>
    </div>
  );
}

export default DiffViewer;
