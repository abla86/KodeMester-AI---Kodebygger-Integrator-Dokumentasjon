import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  ShieldCheck, 
  Terminal, 
  Clock, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CodeFile, SimulationResult, CodeVariant } from '../types';
import { highlightCode } from '../utils/prismHelper';

interface UnitTestViewProps {
  unitTest: CodeFile;
  mainFiles: CodeFile[];
  language: string;
  variant: CodeVariant;
}

export const UnitTestView: React.FC<UnitTestViewProps> = ({
  unitTest,
  mainFiles,
  language,
  variant,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<SimulationResult | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(unitTest.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([unitTest.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = unitTest.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResult(null);

    // Combine main code and test code so the runner executes both seamlessly
    const combinedCode = `
# ====================================================
# 1. HOVEDKILDEKODE
# ====================================================
${mainFiles.map((f) => f.code).join('\n\n')}

# ====================================================
# 2. ENHETSTESTER (UNITTEST)
# ====================================================
${unitTest.code}
`;

    try {
      const res = await fetch('/api/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: combinedCode,
          language,
          isUnitTest: true,
        }),
      });

      const data: SimulationResult = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        stdout: '',
        stderr: err.message || 'Kunne ikke kjøre enhetstestene.',
        exitCode: 1,
        explanationNorwegian: 'Feil under kjøring av testene.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const highlighted = highlightCode(unitTest.code, unitTest.language || language);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Automatisert Enhetstest-Suite</h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              {language === 'python' ? 'Python unittest' : `${language} test-framework`}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Reelle verifikasjonstester uten mock eller TODO-kommentarer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Kopiert!' : 'Kopier testfil'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Last ned {unitTest.name}</span>
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Kjører enhetstester...' : 'Kjør enhetstester nå'}</span>
          </button>
        </div>
      </div>

      {/* Test Execution Output Banner (if executed) */}
      {testResult && (
        <div
          className={`p-5 rounded-2xl border ${
            testResult.success
              ? 'bg-emerald-950/30 border-emerald-800/60'
              : 'bg-rose-950/30 border-rose-800/60'
          } space-y-3 shadow-xl`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <h4 className="font-bold text-sm text-white">
                {testResult.success
                  ? 'Alle enhetstester kjørte og besto (OK)'
                  : 'Enhetstest feilet'}
              </h4>
            </div>

            {testResult.executionTimeMs && (
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {testResult.executionTimeMs} ms
              </span>
            )}
          </div>

          {testResult.stdout && (
            <pre className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl font-mono text-xs text-emerald-300 whitespace-pre-wrap">
              {testResult.stdout}
            </pre>
          )}

          {testResult.stderr && (
            <pre className="p-3 bg-zinc-950 border border-rose-900/60 rounded-xl font-mono text-xs text-rose-300 whitespace-pre-wrap">
              {testResult.stderr}
            </pre>
          )}

          <p className="text-xs text-zinc-300">
            <strong>Norsk testvurdering:</strong> {testResult.explanationNorwegian}
          </p>
        </div>
      )}

      {/* Edge Cases Covered Grid */}
      {variant.verification.edgeCasesCovered.length > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Verifiserte kanttilfeller og funksjonaliteter:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {variant.verification.edgeCasesCovered.map((c, i) => (
              <div
                key={i}
                className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Code Viewer */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span className="text-zinc-200 font-semibold">{unitTest.name}</span>
          </div>
          <span>{unitTest.description || 'Fullstendig testkode'}</span>
        </div>
        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs leading-relaxed text-zinc-200">
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
        </div>
      </div>
    </div>
  );
};
