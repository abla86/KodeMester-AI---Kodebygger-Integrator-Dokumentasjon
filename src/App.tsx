/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Sparkles, 
  Puzzle, 
  RefreshCw, 
  Wrench, 
  Terminal, 
  BookOpen, 
  BrainCircuit, 
  Play, 
  History, 
  HelpCircle, 
  ShieldCheck,
  CheckCircle2, 
  Layers, 
  Search, 
  AlertCircle,
  FileCode2,
  FolderArchive,
  Download,
  Check,
  Zap,
  Flame,
  ArrowRight,
  Cpu,
  Globe2
} from 'lucide-react';
import { 
  Mode, 
  Complexity, 
  CodeFile, 
  GeneratedProject,
  CodeVariant,
  AuditReport
} from './types';
import { SUPPORTED_LANGUAGES, LANGUAGE_PRESETS, LanguagePreset } from './utils/languages';
import { CodeViewer } from './components/CodeViewer';
import { MarkdownView } from './components/MarkdownView';
import { LiveRunner } from './components/LiveRunner';
import { CodeAssistantModal } from './components/CodeAssistantModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { RefactorAuditView } from './components/RefactorAuditView';
import { UnitTestView } from './components/UnitTestView';
import { ZipExportModal } from './components/ZipExportModal';

const STORAGE_KEY = 'kodemester_ai_projects_v3';

export default function App() {
  // Modes: 'generate' | 'refactor_audit' | 'integrate' | 'convert'
  const [mode, setMode] = useState<Mode>('generate');
  const [language, setLanguage] = useState<string>('python');
  const [customLanguage, setCustomLanguage] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<string>('javascript');
  const [complexity, setComplexity] = useState<Complexity>('standard');

  // Input states
  const [prompt, setPrompt] = useState('');
  const [existingCode, setExistingCode] = useState('');
  const [additionalSnippet, setAdditionalSnippet] = useState('');
  const [refactorGoal, setRefactorGoal] = useState('Fjern duplisering, forbedre algoritmer og finn potensielle feil');

  // Execution / generation state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active project & variant selection
  const [currentProject, setCurrentProject] = useState<GeneratedProject | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'code' | 'docs' | 'explanation' | 'unittests' | 'audit' | 'runner' | 'improvements'>('code');

  // Preset filter state
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('all');

  // Modals & drawers
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<GeneratedProject[]>([]);

  // Initial load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedProjects(parsed);
        if (parsed.length > 0) {
          setCurrentProject(parsed[0]);
          setSelectedVariantIndex(parsed[0].selectedVariantIndex || 0);
        }
      }
    } catch (e) {
      console.error('Kunne ikke laste lagrede prosjekter:', e);
    }
  }, []);

  const saveProjectToHistory = (project: GeneratedProject) => {
    setSavedProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== project.id);
      const updated = [project, ...filtered].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Lagringsfeil:', err);
      }
      return updated;
    });
  };

  const handleDeleteProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (currentProject?.id === id) {
      setCurrentProject(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleClearHistory = () => {
    setSavedProjects([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Loading steps animation
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((s) => (s + 1) % 4);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    'Aktiverer universell kodemotor og forbereder 3 distinkte arkitekturer...',
    'Skriver 100% komplett, reell og feilfri kildekode for ethvert konsept...',
    'Utarbeider ekte enhetstester (unittest) og verifiserer syntaks & kjøretid...',
    'Kvalitetssikrer at koden er produksjonsklar, uten mock eller TODO...',
  ];

  const effectiveLanguage = language === 'custom' ? (customLanguage.trim() || 'Egendefinert språk') : language;

  const handleGenerate = async () => {
    if (mode === 'refactor_audit') {
      await handleAnalyzeAndRefactor();
      return;
    }

    if (!prompt.trim() && !existingCode.trim() && !additionalSnippet.trim()) {
      setErrorMessage('Vennligst oppgi en beskrivelse eller kode å arbeide med.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language: effectiveLanguage,
          mode,
          existingCode,
          additionalSnippet,
          targetLanguage: mode === 'convert' ? targetLanguage : undefined,
          complexity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Serverfeil under generering.');
      }

      const data = await res.json();

      const newProject: GeneratedProject = {
        id: 'proj_' + Date.now(),
        createdAt: Date.now(),
        prompt: prompt || data.title,
        mode,
        language: data.language || effectiveLanguage,
        title: data.title || 'Generert program',
        summary: data.summary || '',
        variants: data.variants || [],
        selectedVariantIndex: 0,
        integrationNotes: data.integrationNotes || '',
      };

      setCurrentProject(newProject);
      setSelectedVariantIndex(0);
      saveProjectToHistory(newProject);

      if (newProject.variants[0]?.executablePreview) {
        setActiveTab('runner');
      } else {
        setActiveTab('code');
      }
    } catch (err: any) {
      console.error('Genereringsfeil:', err);
      setErrorMessage(err.message || 'Kunne ikke bygge koden. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAndRefactor = async () => {
    if (!existingCode.trim()) {
      setErrorMessage('Vennligst lim inn koden som skal analyseres og refaktoreres.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze-and-refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: existingCode,
          language: effectiveLanguage,
          goal: refactorGoal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Kunne ikke analysere koden.');
      }

      const data = await res.json();

      const newProject: GeneratedProject = {
        id: 'proj_' + Date.now(),
        createdAt: Date.now(),
        prompt: `Refaktorering av ${effectiveLanguage}-kode`,
        mode: 'refactor_audit',
        language: data.language || effectiveLanguage,
        title: data.title || `Refaktorert ${effectiveLanguage}-kode`,
        summary: data.summary || '',
        auditReport: data.auditReport,
        variants: data.variants || [],
        selectedVariantIndex: 0,
      };

      setCurrentProject(newProject);
      setSelectedVariantIndex(0);
      setActiveTab('audit');
      saveProjectToHistory(newProject);
    } catch (err: any) {
      console.error('Feil under refaktorering:', err);
      setErrorMessage(err.message || 'Kunne ikke gjennomføre refaktorering.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset: LanguagePreset) => {
    setLanguage(preset.language);
    setPrompt(preset.prompt);
    setMode('generate');
  };

  const activeVariant: CodeVariant | undefined = currentProject?.variants?.[selectedVariantIndex] || currentProject?.variants?.[0];
  const primaryCodeString = activeVariant?.files.map((f) => f.code).join('\n\n') || '';

  // Filter presets
  const filteredPresets = LANGUAGE_PRESETS.filter((p) => {
    if (selectedPresetCategory === 'future') return p.category === 'future';
    const matchesLang = p.language === language || language === 'custom';
    const matchesCat = selectedPresetCategory === 'all' || p.category === selectedPresetCategory;
    return matchesLang && matchesCat;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-600/40">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">KodeMester AI</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Alle Språk • Universell Kodemotor
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                3 forslag per prompt • Ingen mock • Enhetstester • ZIP-eksport • Fremtidige &amp; ukjente koder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentProject && activeVariant && (
              <button
                onClick={() => setIsZipModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
                title="Last ned hele prosjektet som en ZIP-fil"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>Last ned ZIP</span>
              </button>
            )}

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-zinc-400" />
              <span>Historikk</span>
              {savedProjects.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-zinc-700 rounded-full text-[10px] text-zinc-300">
                  {savedProjects.length}
                </span>
              )}
            </button>

            {currentProject && (
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Spør om koden</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Mode Selector */}
        <div className="bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 flex flex-wrap gap-1.5 shadow-lg">
          <button
            onClick={() => setMode('generate')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'generate'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>1. Generer Kode (3 Forslag)</span>
          </button>

          <button
            onClick={() => setMode('refactor_audit')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'refactor_audit'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>2. Kodeanalyse &amp; Refaktorering</span>
          </button>

          <button
            onClick={() => setMode('integrate')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'integrate'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Puzzle className="w-4 h-4 text-amber-400" />
            <span>3. Integrer &amp; Utvid Kode</span>
          </button>

          <button
            onClick={() => setMode('convert')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'convert'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-purple-400" />
            <span>4. Konverter Språk</span>
          </button>
        </div>

        {/* Input Configuration Box */}
        <section className="bg-zinc-900/70 rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-xl">
          {/* Language Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-400 font-semibold">Programmeringsspråk:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SUPPORTED_LANGUAGES.slice(0, 5).map((l) => {
                  const isSelected = language === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      {l.name}
                    </button>
                  );
                })}

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs rounded-lg px-2.5 py-1.5 font-mono"
                >
                  <option value="" disabled>Avanserte / Fremtidsrettede språk...</option>
                  {SUPPORTED_LANGUAGES.slice(5).map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>

                {language === 'custom' && (
                  <input
                    type="text"
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    placeholder="Skriv inn språk: Mojo, Zig, Solidity, WebAssembly, Haskell, CUDA..."
                    className="bg-zinc-950 border border-fuchsia-500/60 text-fuchsia-300 text-xs rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-fuchsia-400 min-w-[240px]"
                  />
                )}
              </div>
            </div>

            {/* Complexity Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Nivå:</span>
              <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
                {(['simple', 'standard', 'advanced'] as Complexity[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setComplexity(c)}
                    className={`px-2.5 py-1 text-[11px] rounded capitalize font-medium ${
                      complexity === c ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                    }`}
                  >
                    {c === 'simple' ? 'Enkel' : c === 'standard' ? 'Standard' : 'Avansert'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Utforsk koder som finnes – og koder som aldri er laget før:</span>
              </span>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setSelectedPresetCategory('all')}
                  className={`px-2 py-0.5 rounded ${selectedPresetCategory === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  Alle
                </button>
                <button
                  onClick={() => setSelectedPresetCategory('future')}
                  className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                    selectedPresetCategory === 'future' ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40' : 'text-zinc-400 hover:text-fuchsia-300'
                  }`}
                >
                  <span>🧬 Innovasjon &amp; Fremtid</span>
                </button>
                <button
                  onClick={() => setSelectedPresetCategory('syntax')}
                  className={`px-2 py-0.5 rounded ${selectedPresetCategory === 'syntax' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  Syntaks
                </button>
                <button
                  onClick={() => setSelectedPresetCategory('datastructure')}
                  className={`px-2 py-0.5 rounded ${selectedPresetCategory === 'datastructure' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  Datastrukturer
                </button>
                <button
                  onClick={() => setSelectedPresetCategory('algorithm')}
                  className={`px-2 py-0.5 rounded ${selectedPresetCategory === 'algorithm' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
                >
                  Algoritmer
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {filteredPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="text-left p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 font-mono">
                      {preset.categoryLabel}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h6 className="text-xs font-bold text-zinc-200 line-clamp-1">{preset.title}</h6>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {mode === 'refactor_audit' ? (
            /* Refactoring & Code Analysis Mode */
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                  <span>Lim inn kildekoden som skal analyseres, testes og refaktoreres:</span>
                  <span className="text-[10px] text-zinc-500 font-normal">Støtter Python, JavaScript, Java, C++, C# og flere</span>
                </label>
                <textarea
                  value={existingCode}
                  onChange={(e) => setExistingCode(e.target.value)}
                  rows={8}
                  placeholder={`# Eksempel på kode som skal analyseres:\ndef prosesser_data(liste):\n    resultat = []\n    for i in range(len(liste)):\n        for j in range(len(liste)):\n            if liste[i] == liste[j] and i != j:\n                resultat.append(liste[i])\n    return resultat`}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 resize-y leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Hva ønsker du at refaktoreringen skal fokusere på?
                </label>
                <input
                  type="text"
                  value={refactorGoal}
                  onChange={(e) => setRefactorGoal(e.target.value)}
                  placeholder="F.eks: Gjør tidskompleksitet raskere, fjern nested loops, gi bedre variabelnavn og legg til typesjekk."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : mode === 'integrate' ? (
            /* Integrate Mode */
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">1. Hovedkildekode (Eksisterende program):</label>
                  <textarea
                    value={existingCode}
                    onChange={(e) => setExistingCode(e.target.value)}
                    rows={8}
                    placeholder="// Lim inn hovedkoden her..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">2. Ekstern kodebit som skal integreres:</label>
                  <textarea
                    value={additionalSnippet}
                    onChange={(e) => setAdditionalSnippet(e.target.value)}
                    rows={8}
                    placeholder="// Lim inn koden som skal flettes inn her..."
                    className="w-full bg-zinc-950 border border-amber-900/40 rounded-xl p-3 font-mono text-xs text-amber-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Instruks for integrasjonen (f.eks: Koble koden sammen slik at...)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200"
              />
            </div>
          ) : mode === 'convert' ? (
            /* Convert Mode */
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-300">Konverter kildekode fra {effectiveLanguage} til:</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="bg-zinc-950 border border-indigo-500 text-indigo-300 text-xs rounded-lg px-3 py-1.5 font-mono"
                >
                  {SUPPORTED_LANGUAGES.filter((l) => l.id !== language).map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={existingCode}
                onChange={(e) => setExistingCode(e.target.value)}
                rows={7}
                placeholder="// Lim inn koden du vil oversette her..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            /* Generate Mode */
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                <span>Beskriv hva du vil bygge i {effectiveLanguage} (uansett hvor avansert eller ukjent konseptet er):</span>
                <span className="text-[11px] text-zinc-400 font-normal">Trykk Ctrl + Enter for å generere 3 forslag</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleGenerate();
                  }
                }}
                rows={4}
                placeholder="F.eks: Bygg en kvantedatamaskin-simulator i Python, eller en høyytelses ringbuffer i C++20, eller et eget programmeringsspråk med lexer og parser, eller en WebGPU compute shader for partikler..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            {errorMessage ? (
              <div className="flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : (
              <div className="text-[11px] text-zinc-400">
                ✓ 3 unike forslag • Ingen TODO eller mock • Fullstendige enhetstester • Klar for ZIP-nedlasting
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all ml-auto"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>
                {loading
                  ? 'Kvalitetssikrer og tester...'
                  : mode === 'refactor_audit'
                  ? 'Analyser & Refaktorer (3 Forslag)'
                  : 'Generer 3 Forslag med Tester'}
              </span>
            </button>
          </div>
        </section>

        {/* Loading Progress */}
        {loading && (
          <div className="bg-zinc-900/90 border border-indigo-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-white">KodeMester syntetiserer og tester...</h3>
              <p className="text-xs text-indigo-300 font-medium">
                {loadingMessages[loadingStep]}
              </p>
            </div>
            <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${(loadingStep + 1) * 25}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Workspace with 3 Variants Selector */}
        {currentProject && !loading && (
          <section className="space-y-4">
            {/* Top 3-Variant Switcher Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                    {currentProject.language}
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight">{currentProject.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden md:inline">Forhåndsverifisert: Fri for krasjer</span>
                  </div>

                  {activeVariant && (
                    <button
                      onClick={() => setIsZipModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Last ned prosjekt (.ZIP)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The 3 Proposal Selector Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {currentProject.variants?.map((v, idx) => {
                  const isSelected = idx === selectedVariantIndex;
                  return (
                    <button
                      key={v.id || idx}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {v.strategyTag}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valgt
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{v.label}</h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {v.strategyDescription}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Tabs for Active Variant */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kildekode ({activeVariant?.files.length || 0})</span>
                </button>

                {activeVariant?.unitTest && (
                  <button
                    onClick={() => setActiveTab('unittests')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'unittests' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-zinc-400 hover:text-emerald-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enhetstester ({currentProject.language.toLowerCase().includes('python') ? 'unittest' : 'test suite'})</span>
                  </button>
                )}

                {currentProject.auditReport && (
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'audit' ? 'bg-zinc-800 text-amber-300 shadow-sm' : 'text-zinc-400 hover:text-amber-300'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kodeanalyse ({currentProject.auditReport.issues.length} funn)</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('docs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'docs' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dokumentasjon (NO)</span>
                </button>

                <button
                  onClick={() => setActiveTab('explanation')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'explanation' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                  <span>Forklaring (NO)</span>
                </button>

                {activeVariant?.codeImprovements && activeVariant.codeImprovements.length > 0 && (
                  <button
                    onClick={() => setActiveTab('improvements')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === 'improvements' ? 'bg-zinc-800 text-amber-300 shadow-sm' : 'text-zinc-400 hover:text-amber-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Forbedringsforslag</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('runner')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'runner' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Kjør Koden</span>
                </button>
              </div>

              {/* Strategy badge */}
              {activeVariant && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 italic">
                    Aktivt forslag: <strong className="text-indigo-300">{activeVariant.label}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Active Tab Views */}
            {activeVariant && (
              <div>
                {activeTab === 'code' && (
                  <CodeViewer
                    files={activeVariant.files}
                    projectTitle={currentProject.title}
                    variant={activeVariant}
                    language={currentProject.language}
                    onDownloadZip={() => setIsZipModalOpen(true)}
                    onFilesChange={(newFiles) => {
                      const updatedVariants = [...currentProject.variants];
                      updatedVariants[selectedVariantIndex] = {
                        ...updatedVariants[selectedVariantIndex],
                        files: newFiles,
                      };
                      const updatedProject = { ...currentProject, variants: updatedVariants };
                      setCurrentProject(updatedProject);
                      saveProjectToHistory(updatedProject);
                    }}
                  />
                )}

                {activeTab === 'unittests' && activeVariant.unitTest && (
                  <UnitTestView
                    unitTest={activeVariant.unitTest}
                    mainFiles={activeVariant.files}
                    language={currentProject.language}
                    variant={activeVariant}
                  />
                )}

                {activeTab === 'audit' && currentProject.auditReport && (
                  <RefactorAuditView
                    auditReport={currentProject.auditReport}
                    variants={currentProject.variants}
                    selectedVariantIndex={selectedVariantIndex}
                    onSelectVariant={(idx) => {
                      setSelectedVariantIndex(idx);
                      setActiveTab('code');
                    }}
                    onApplyVariant={(variant) => {
                      setSelectedVariantIndex(currentProject.variants.findIndex((v) => v.id === variant.id));
                      setActiveTab('code');
                    }}
                  />
                )}

                {activeTab === 'docs' && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[620px]">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <h3 className="font-semibold text-sm text-white">Dokumentasjon og Kjøreveiledning på Norsk</h3>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">Bokmål</span>
                    </div>
                    <MarkdownView content={activeVariant.documentation} />
                  </div>
                )}

                {activeTab === 'explanation' && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[620px]">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold text-sm text-white">Pedagogisk Gjennomgang &amp; Algoritmeanalyse</h3>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">Linje-for-linje</span>
                    </div>
                    <MarkdownView content={activeVariant.explanation} />
                  </div>
                )}

                {activeTab === 'improvements' && activeVariant.codeImprovements && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[620px] space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <h3 className="font-semibold text-sm text-white">Forslag til Videre Forbedringer og Optimalisering</h3>
                    </div>
                    <div className="space-y-3">
                      {activeVariant.codeImprovements.map((imp, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3 text-xs text-zinc-200"
                        >
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'runner' && (
                  <LiveRunner
                    files={activeVariant.files}
                    language={currentProject.language}
                    testCases={activeVariant.testCases}
                    executablePreview={activeVariant.executablePreview}
                  />
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Code Assistant Modal */}
      <CodeAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        currentCode={primaryCodeString}
        language={currentProject?.language || effectiveLanguage}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        projects={savedProjects}
        onSelectProject={(proj) => {
          setCurrentProject(proj);
          setSelectedVariantIndex(0);
          setActiveTab('code');
        }}
        onDeleteProject={handleDeleteProject}
        onClearAll={handleClearHistory}
      />

      {/* Complete Project ZIP Export Modal */}
      {currentProject && activeVariant && (
        <ZipExportModal
          isOpen={isZipModalOpen}
          onClose={() => setIsZipModalOpen(false)}
          project={currentProject}
          variant={activeVariant}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-600">
        <p>KodeMester AI • Universell Kodemotor, Refaktorering, Enhetstester &amp; ZIP-Eksport</p>
      </footer>
    </div>
  );
}
