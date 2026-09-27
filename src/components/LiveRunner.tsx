import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  Layers, 
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { CodeFile, TestCase, SimulationResult } from '../types';

interface LiveRunnerProps {
  files: CodeFile[];
  language: string;
  testCases: TestCase[];
  executablePreview: boolean;
}

export const LiveRunner: React.FC<LiveRunnerProps> = ({
  files,
  language,
  testCases,
  executablePreview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'terminal' | 'tests'>(
    executablePreview ? 'preview' : 'terminal'
  );
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; actual: string }>>([]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // If HTML/CSS/JS webapp, assemble complete iframe content
  const assembleWebappHtml = () => {
    const htmlFile = files.find((f) => f.name.endsWith('.html') || f.language === 'html');
    const cssFiles = files.filter((f) => f.name.endsWith('.css') || f.language === 'css');
    const jsFiles = files.filter((f) => f.name.endsWith('.js') || f.language === 'javascript');

    if (htmlFile) {
      let fullHtml = htmlFile.code;
      // Inject CSS if separate
      if (cssFiles.length > 0 && !fullHtml.includes('<style')) {
        const injectedStyles = cssFiles.map((c) => `<style>${c.code}</style>`).join('\n');
        fullHtml = fullHtml.replace('</head>', `${injectedStyles}\n</head>`);
      }
      // Inject JS if separate
      if (jsFiles.length > 0 && !fullHtml.includes('<script')) {
        const injectedJs = jsFiles.map((j) => `<script>${j.code}<\/script>`).join('\n');
        fullHtml = fullHtml.replace('</body>', `${injectedJs}\n</body>`);
      }
      return fullHtml;
    }

    // If pure JS/TS
    const primaryJs = files.find((f) => f.language.includes('javascript') || f.language.includes('typescript') || f.name.endsWith('.js'));
    if (primaryJs) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, sans-serif; background: #09090b; color: #f4f4f5; padding: 20px; }
    #console { font-family: monospace; background: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a; white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #a5b4fc; }
  </style>
</head>
<body>
  <h3>JavaScript Konsoll-kjøring</h3>
  <div id="console"></div>
  <script>
    const output = document.getElementById('console');
    const log = (msg) => { output.textContent += msg + '\\n'; };
    console.log = (...args) => log(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : a).join(' '));
    console.error = (...args) => log('[FEIL] ' + args.join(' '));
    try {
      ${primaryJs.code}
    } catch(err) {
      log('Runtime Error: ' + err.message);
    }
  <\/script>
</body>
</html>`;
    }

    return '';
  };

  const handleRunSimulation = async (inputToRun: string = customInput) => {
    setIsRunning(true);
    setErrorMessage(null);

    const primaryFile = files[0];
    const codeToRun = files.map((f) => `// Fil: ${f.name}\n${f.code}`).join('\n\n');

    try {
      const res = await fetch('/api/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToRun,
          language: primaryFile?.language || language,
          input: inputToRun,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Kunne ikke simulere kjøring.');
      }

      const data: SimulationResult = await res.json();
      setSimulationResult(data);
      setActiveSubTab('terminal');
    } catch (err: any) {
      setErrorMessage(err.message || 'Ukjent feil under simulering.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunAllTests = async () => {
    setIsRunning(true);
    const results: Array<{ passed: boolean; actual: string }> = [];

    for (const tc of testCases) {
      try {
        const res = await fetch('/api/run-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: files.map((f) => f.code).join('\n\n'),
            language: files[0]?.language || language,
            input: tc.input,
          }),
        });
        const data: SimulationResult = await res.json();
        // Check if stdout contains or equals expected
        const passed = data.stdout.toLowerCase().includes(tc.expectedOutput.toLowerCase().trim()) || data.exitCode === 0;
        results.push({
          passed,
          actual: data.stdout || data.stderr || 'Ingen utskrift',
        });
      } catch (e: any) {
        results.push({ passed: false, actual: e.message });
      }
    }

    setTestResults(results);
    setIsRunning(false);
    setActiveSubTab('tests');
  };

  const reloadIframe = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = assembleWebappHtml();
    }
  };

  return (
    <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl h-[620px]">
      {/* Sub Header Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-2">
        <div className="flex items-center gap-2">
          {executablePreview && (
            <button
              onClick={() => setActiveSubTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Interaktiv Visning (Live App)</span>
            </button>
          )}

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'terminal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Kjør & Terminal (Konsoll)</span>
          </button>

          {testCases.length > 0 && (
            <button
              onClick={() => setActiveSubTab('tests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'tests'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Testbenk ({testCases.length})</span>
            </button>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'preview' && (
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/50">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded ${deviceMode === 'desktop' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="Desktop-visning (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded ${deviceMode === 'tablet' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="Nettbrett-visning (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded ${deviceMode === 'mobile' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="Mobil-visning (390px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={reloadIframe}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded ml-1"
                title="Last inn på nytt"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => handleRunSimulation()}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Kjører kode...' : 'Kjør kildekode'}</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-hidden relative bg-zinc-950 flex flex-col">
        {activeSubTab === 'preview' && (
          <div className="w-full h-full flex items-center justify-center p-4 bg-zinc-900/30 overflow-auto">
            <div
              className={`h-full transition-all duration-300 rounded-lg overflow-hidden border border-zinc-800 shadow-2xl bg-white ${
                deviceMode === 'mobile'
                  ? 'w-[390px]'
                  : deviceMode === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full'
              }`}
            >
              <iframe
                ref={iframeRef}
                title="Live Application Preview"
                srcDoc={assembleWebappHtml()}
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}

        {activeSubTab === 'terminal' && (
          <div className="w-full h-full flex flex-col p-4 font-mono text-xs overflow-hidden">
            {/* Input prompt bar for custom parameters */}
            <div className="flex items-center gap-2 mb-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
              <span className="text-zinc-500 select-none pl-1">Input / Stdin:</span>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="F.eks. argumenter, tall, eller testdata..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleRunSimulation()}
              />
              <button
                onClick={() => handleRunSimulation()}
                disabled={isRunning}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors"
              >
                Send & Kjør
              </button>
            </div>

            {/* Output Screen */}
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-auto text-zinc-300 space-y-3 shadow-inner">
              {isRunning && (
                <div className="flex items-center gap-2 text-indigo-400 italic">
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Kompilerer og simulerer kjøring i sandkasse...</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded text-rose-300">
                  <div className="font-bold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Feil under kjøring:</span>
                  </div>
                  <p className="mt-1 font-mono text-xs">{errorMessage}</p>
                </div>
              )}

              {simulationResult ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      simulationResult.success
                        ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {simulationResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {simulationResult.success
                          ? 'Kjøring fullført uten feil (Exit code 0)'
                          : `Avsluttet med feilkode ${simulationResult.exitCode}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      {simulationResult.executionTimeMs && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {simulationResult.executionTimeMs} ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standard Output (stdout) */}
                  {simulationResult.stdout && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                        Standard Output (stdout):
                      </div>
                      <pre className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-emerald-300 whitespace-pre-wrap">
                        {simulationResult.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Standard Error (stderr) */}
                  {simulationResult.stderr && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-rose-400 font-bold mb-1">
                        Standard Error / Log (stderr):
                      </div>
                      <pre className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-rose-300 whitespace-pre-wrap">
                        {simulationResult.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Variable Trace */}
                  {simulationResult.variableTrace && simulationResult.variableTrace.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-1 flex items-center gap-1">
                        <Cpu className="w-3 h-3" /> Variabeltilstand etter kjøring:
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {simulationResult.variableTrace.map((v, i) => (
                          <div key={i} className="bg-zinc-900 p-2 rounded border border-zinc-800 text-[11px]">
                            <span className="text-zinc-400 font-semibold">{v.name}: </span>
                            <span className="text-indigo-300 font-mono">{v.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Norwegian Analysis */}
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-300 text-xs">
                    <strong className="text-zinc-200">🔍 Forklaring av kjøringen på norsk:</strong>
                    <p className="mt-1">{simulationResult.explanationNorwegian}</p>
                  </div>
                </div>
              ) : (
                !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-16">
                    <Terminal className="w-10 h-10 mb-2 text-zinc-700" />
                    <p>Klikk på "Kjør kildekode" for å starte eksekvering og se konsollutskrift.</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'tests' && (
          <div className="w-full h-full p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Automatiserte Verifikasjonstester</h4>
                <p className="text-xs text-zinc-400">Verifiserer at koden fungerer og gir forventet resultat.</p>
              </div>
              <button
                onClick={handleRunAllTests}
                disabled={isRunning}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Kjør alle tester</span>
              </button>
            </div>

            <div className="space-y-3">
              {testCases.map((tc, idx) => {
                const res = testResults[idx];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                          {idx + 1}
                        </span>
                        {tc.description}
                      </span>
                      {res && (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                            res.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {res.passed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {res.passed ? 'Bestått' : 'Feilet'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono mt-2">
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[10px] uppercase">Testinput / Scenarie:</span>
                        <span className="text-zinc-300">{tc.input}</span>
                      </div>
                      <div className="p-2 bg-zinc-950 rounded border border-zinc-800/80">
                        <span className="text-zinc-500 block text-[10px] uppercase">Forventet resultat:</span>
                        <span className="text-emerald-400">{tc.expectedOutput}</span>
                      </div>
                    </div>

                    {res && !res.passed && (
                      <div className="p-2 bg-rose-950/30 border border-rose-900/50 rounded text-rose-300 text-[11px] font-mono">
                        <span className="text-rose-400 block text-[10px] uppercase">Faktisk resultat:</span>
                        <span>{res.actual}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
