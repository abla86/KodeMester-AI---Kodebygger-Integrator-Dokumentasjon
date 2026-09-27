import React, { useState } from 'react';
import { 
  FolderArchive, 
  X, 
  Check, 
  FileCode, 
  ShieldCheck, 
  BookOpen, 
  BrainCircuit, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Settings
} from 'lucide-react';
import { CodeVariant, GeneratedProject } from '../types';
import { exportProjectAsZip, triggerDownload } from '../utils/zipExporter';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: GeneratedProject;
  variant: CodeVariant;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({
  isOpen,
  onClose,
  project,
  variant,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setDownloading(true);
    try {
      const { blob, filename } = await exportProjectAsZip({
        projectTitle: project.title,
        language: project.language,
        variant,
        includeAuditReport: Boolean(project.auditReport),
        auditSummary: project.auditReport?.summaryNorwegian,
      });

      triggerDownload(blob, filename);
      setDownloaded(true);
      setTimeout(() => {
        setDownloaded(false);
      }, 3000);
    } catch (err) {
      console.error('Feil under eksport:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Eksporter Komplett Prosjekt (.ZIP)</h3>
              <p className="text-xs text-zinc-400">Last ned ferdig prosjektstruktur lokalt</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Prosjekt:</span>
              <span className="font-bold text-white truncate max-w-[280px]">{project.title}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Valgt variant:</span>
              <span className="font-semibold text-indigo-300">{variant.label} ({variant.strategyTag})</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Språk:</span>
              <span className="font-mono text-emerald-400 uppercase">{project.language}</span>
            </div>
          </div>

          {/* Archive Manifest Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-zinc-300 block">
              Inkludert i ZIP-arkivet:
            </span>

            <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 font-mono">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>src/ ({variant.files.length} kildekodefiler)</span>
              </div>
              {variant.unitTest && (
                <div className="flex items-center gap-2 text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>tests/{variant.unitTest.name} (Reelle enhetstester)</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>README.md (Dokumentasjon, forutsetninger &amp; veiledning)</span>
              </div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400 shrink-0" />
                <span>FORKLARING.md (Pedagogisk algoritme- og arkitekturanalyse)</span>
              </div>
              {variant.codeImprovements && variant.codeImprovements.length > 0 && (
                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>FORBEDRINGER.md (Forslag til videre utvikling)</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-400">
                <Settings className="w-4 h-4 text-zinc-500 shrink-0" />
                <span>Konfigurasjon / Manifest (klar for VS Code, PyCharm, etc.)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Lukk
          </button>

          <button
            onClick={handleExport}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
          >
            {downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>ZIP-fil lastet ned!</span>
              </>
            ) : (
              <>
                <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                <span>{downloading ? 'Pakker arkiv...' : 'Last ned ZIP-arkiv'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
