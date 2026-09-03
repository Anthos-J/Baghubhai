import { FileCode, FileJson, Folder, File } from 'lucide-react';
import { EditorFile } from './predefinedProject';

export interface FileTreeProps {
  files: EditorFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  className?: string;
  projectName?: string;
}

function getFileIcon(filename: string) {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) {
    return <FileCode size={14} className="text-yellow-400" />;
  }
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
    return <FileCode size={14} className="text-primary" />;
  }
  if (filename.endsWith('.json')) {
    return <FileJson size={14} className="text-success" />;
  }
  return <File size={14} className="text-gray-400" />;
}

export function FileTree({
  files,
  activeFileId,
  onSelectFile,
  className = '',
  projectName = 'PROJECT_SRC'
}: FileTreeProps) {
  return (
    <div className={`w-full bg-[#070B16] border-2 border-[#1A233A] flex flex-col select-none ${className}`}>
      {/* Tree Header */}
      <div className="bg-[#0D1426] px-3 py-2 border-b-2 border-[#1A233A] flex items-center gap-2">
        <Folder size={14} className="text-primary" />
        <span className="font-pixel text-[10px] text-primary tracking-wider truncate uppercase">
          {projectName}
        </span>
      </div>

      {/* File List */}
      <div className="py-2 flex flex-col overflow-y-auto">
        {files.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <button
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-left font-mono text-xs transition-colors group relative ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
                  : 'text-gray-400 hover:text-textMain hover:bg-[#111827] border-l-4 border-transparent'
              }`}
              title={file.description || file.name}
            >
              <span className="flex-shrink-0">{getFileIcon(file.name)}</span>
              <span className="truncate flex-1">{file.name}</span>
              {file.taskId && (
                <span className="text-[9px] font-tech text-gray-500 group-hover:text-gray-400">
                  [{file.taskId.replace('task-', '')}]
                </span>
              )}
            </button>
          );
        })}

        {files.length === 0 && (
          <div className="px-3 py-4 text-center font-mono text-xs text-gray-600">
            No files available
          </div>
        )}
      </div>
    </div>
  );
}

export default FileTree;
