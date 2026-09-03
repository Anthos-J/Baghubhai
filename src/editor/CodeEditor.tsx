import Editor, { OnMount } from '@monaco-editor/react';

export interface CodeEditorProps {
  value: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  height?: string | number;
  onMount?: OnMount;
}

export function CodeEditor({
  value,
  language = 'javascript',
  readOnly = false,
  onChange,
  className = '',
  height = '100%',
  onMount
}: CodeEditorProps) {
  const handleEditorChange = (val: string | undefined) => {
    if (onChange && val !== undefined) {
      onChange(val);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Define a custom AmongDevs / Code Mafia dark theme
    monaco.editor.defineTheme('amongdevs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6B7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: '00F0FF', fontStyle: 'bold' },
        { token: 'string', foreground: '00FF66' },
        { token: 'number', foreground: 'FFB800' },
        { token: 'identifier', foreground: 'E0E7FF' },
        { token: 'type', foreground: '9D00FF' },
        { token: 'function', foreground: '38BDF8' }
      ],
      colors: {
        'editor.background': '#070B16',
        'editor.foreground': '#E0E7FF',
        'editorCursor.foreground': '#00F0FF',
        'editor.lineHighlightBackground': '#0F172A80',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#00F0FF',
        'editor.selectionBackground': '#00F0FF33',
        'editor.inactiveSelectionBackground': '#00F0FF1A'
      }
    });

    monaco.editor.setTheme('amongdevs-dark');

    if (onMount) {
      onMount(editor, monaco);
    }
  };

  return (
    <div className={`w-full h-full flex-1 overflow-hidden bg-[#070B16] relative ${className}`}>
      {readOnly && (
        <div className="absolute top-2 right-4 z-20 pointer-events-none">
          <span className="font-pixel text-[10px] text-mafia bg-black/80 border border-mafia px-2 py-1 uppercase tracking-wider shadow-[0_0_8px_#FF003C]">
            READ ONLY
          </span>
        </div>
      )}

      <Editor
        height={height}
        language={language}
        value={value}
        theme="amongdevs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full text-primary font-tech animate-pulse text-sm">
            &gt; INITIALIZING MONACO EDITOR CORE...
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: '"Fira Code", "Share Tech Mono", Consolas, monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          padding: { top: 12, bottom: 12 },
          tabSize: 2
        }}
      />
    </div>
  );
}

export default CodeEditor;
