import React from 'react';
import { X, Clock, Trash2, FolderOpen, ArrowRight, Code2 } from 'lucide-react';
import { GeneratedProject } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: GeneratedProject[];
  onSelectProject: (project: GeneratedProject) => void;
  onDeleteProject: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
  onDeleteProject,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-zinc-900 border-l border-zinc-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm text-white">Prosjekthistorikk ({projects.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {projects.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p>Ingen lagrede prosjekter ennå.</p>
              <p className="text-[11px] text-zinc-600 mt-1">Genererte koder lagres automatisk her.</p>
            </div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProject(p);
                  onClose();
                }}
                className="group p-3.5 rounded-xl border border-zinc-800 hover:border-indigo-500/50 bg-zinc-950/60 hover:bg-zinc-800/40 cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-xs text-zinc-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {p.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono shrink-0 uppercase">
                    {p.language}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {p.summary || p.prompt}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[10px] text-zinc-500">
                  <span>{new Date(p.createdAt).toLocaleDateString('no-NO')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(p.id);
                      }}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Slett prosjekt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Åpne <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {projects.length > 0 && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center text-xs">
            <button
              onClick={() => {
                if (confirm('Er du sikker på at du vil slette hele historikken?')) {
                  onClearAll();
                }
              }}
              className="text-zinc-500 hover:text-rose-400 transition-colors"
            >
              Tøm all historikk
            </button>
            <span className="text-zinc-500 text-[11px]">Lagres lokalt i nettleseren</span>
          </div>
        )}
      </div>
    </div>
  );
};
