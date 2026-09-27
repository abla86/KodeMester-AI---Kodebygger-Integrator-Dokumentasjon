import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FolderArchive, 
  FileCode, 
  Edit3, 
  Eye, 
  Maximize2, 
  Minimize2,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import { CodeFile, CodeVariant } from '../types';
import { highlightCode } from '../utils/prismHelper';
import { exportProjectAsZip, triggerDownload } from '../utils/zipExporter';

interface CodeViewerProps {
  files: CodeFile[];
  onFilesChange?: (files: CodeFile[]) => void;
  projectTitle: string;
  variant?: CodeVariant;
  language?: string;
  onDownloadZip?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  onFilesChange,
  projectTitle,
  variant,
  language = 'python',
  onDownloadZip,
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localFiles, setLocalFiles] = useState<CodeFile[]>(files);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setLocalFiles(files);
    if (activeFileIndex >= files.length) {
      setActiveFileIndex(0);
    }
  }, [files]);

  if (!localFiles || localFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 bg-zinc-950/60 rounded-xl border border-zinc-800">
        <FileCode className="w-12 h-12 text-zinc-700 mb-3" />
        <p className="text-sm font-medium">Ingen kildekodefiler å vise ennå.</p>
        <p className="text-xs text-zinc-600 mt-1">Generer eller integrer kode for å starte.</p>
      </div>
    );
  }

  const activeFile = localFiles[activeFileIndex] || localFiles[0];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingleFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    if (onDownloadZip) {
      onDownloadZip();
      return;
    }

    setIsExporting(true);
    try {
      if (variant) {
        const { blob, filename } = await exportProjectAsZip({
          projectTitle,
          language,
          variant: { ...variant, files: localFiles },
        });
        triggerDownload(blob, filename);
      } else {
        const zip = new JSZip();
        localFiles.forEach((file) => {
          zip.file(file.name, file.code);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        triggerDownload(content, `${projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()}.zip`);
      }
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    const updated = [...localFiles];
    updated[activeFileIndex] = {
      ...updated[activeFileIndex],
      code: newCode,
    };
    setLocalFiles(updated);
    if (onFilesChange) {
      onFilesChange(updated);
    }
  };

  const handleAddFile = () => {
    const newName = prompt('Skriv inn filnavn (f.eks. helper.py eller styles.css):', 'ny_fil.txt');
    if (!newName) return;
    const ext = newName.split('.').pop() || 'txt';
    const newFile: CodeFile = {
      name: newName,
      language: ext,
      code: '// Skriv eller lim inn din kode her\n',
      description: 'Egendefinert fil',
    };
    const updated = [...localFiles, newFile];
    setLocalFiles(updated);
    setActiveFileIndex(updated.length - 1);
    if (onFilesChange) onFilesChange(updated);
  };

  const handleDeleteFile = (index: number) => {
    if (localFiles.length <= 1) {
      alert('Prosjektet må ha minst én fil.');
      return;
    }
    if (confirm(`Er du sikker på at du vil slette ${localFiles[index].name}?`)) {
      const updated = localFiles.filter((_, i) => i !== index);
      setLocalFiles(updated);
      setActiveFileIndex(0);
      if (onFilesChange) onFilesChange(updated);
    }
  };

  const lineCount = activeFile.code.split('\n').length;
  const highlighted = highlightCode(activeFile.code, activeFile.language);

  return (
    <div
      className={`flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl border-indigo-500/40' : 'h-[620px]'
      }`}
    >
      {/* File Tabs & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-2 gap-2">
        {/* Tab Items */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65%] pb-0.5 scrollbar-thin">
          {localFiles.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={file.name + idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span>{file.name}</span>
                {localFiles.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(idx);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-rose-400 ml-1 p-0.5"
                    title="Slett fil"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={handleAddFile}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-indigo-300 hover:bg-zinc-800 transition-colors"
            title="Legg til en ny fil i prosjektet"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ny fil</span>
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border transition-colors ${
              isEditing
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200'
                : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
            title={isEditing ? 'Vis fargekodet visning' : 'Rediger koden direkte'}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isEditing ? 'Fargevisning' : 'Rediger'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
            title="Kopier kildekode til utklippstavlen"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Kopiert!' : 'Kopier'}</span>
          </button>

          <button
            onClick={handleDownloadSingleFile}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white transition-colors"
            title={`Last ned ${activeFile.name}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Last ned</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors"
            title="Last ned alle prosjektfiler som .ZIP"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Last ned ZIP</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors ml-1"
            title={isFullscreen ? 'Lukk fullskjerm' : 'Åpne fullskjerm'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* File Description Header (if available) */}
      {activeFile.description && (
        <div className="px-4 py-1.5 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
          <span className="truncate">
            <strong className="text-zinc-300 font-semibold">{activeFile.name}:</strong> {activeFile.description}
          </span>
          <span className="text-[11px] font-mono text-zinc-500 shrink-0 ml-3">
            {lineCount} linjer • {activeFile.language}
          </span>
        </div>
      )}

      {/* Code Area */}
      <div className="flex-1 relative overflow-hidden bg-zinc-950">
        {isEditing ? (
          <textarea
            value={activeFile.code}
            onChange={(e) => handleCodeChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 font-mono text-xs leading-relaxed text-zinc-100 bg-transparent resize-none focus:outline-none border-none selection:bg-indigo-900/60"
          />
        ) : (
          <div className="w-full h-full overflow-auto flex font-mono text-xs leading-relaxed p-2">
            {/* Line Numbers */}
            <div className="select-none text-zinc-600 text-right pr-4 pl-2 py-2 font-mono text-xs border-r border-zinc-800/60 min-w-[42px]">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Syntax Highlighted Code */}
            <div className="flex-1 pl-4 pr-6 py-2 overflow-x-auto">
              <pre className="text-zinc-200">
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-1.5 bg-zinc-900 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <div className="flex items-center gap-3">
          <span>Språk: <strong className="text-indigo-400">{activeFile.language}</strong></span>
          <span>Filer i prosjekt: <strong className="text-zinc-300">{localFiles.length}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span>{isEditing ? 'Redigeringsmodus aktiv' : 'Visningsmodus'}</span>
        </div>
      </div>
    </div>
  );
};
