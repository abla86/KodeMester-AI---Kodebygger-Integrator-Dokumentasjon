import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { AuditReport, CodeVariant } from '../types';

interface RefactorAuditViewProps {
  auditReport: AuditReport;
  variants: CodeVariant[];
  selectedVariantIndex: number;
  onSelectVariant: (index: number) => void;
  onApplyVariant: (variant: CodeVariant) => void;
}

export const RefactorAuditView: React.FC<RefactorAuditViewProps> = ({
  auditReport,
  variants,
  selectedVariantIndex,
  onSelectVariant,
  onApplyVariant,
}) => {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
    if (score >= 55) return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/30';
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'bug': return 'Kritisk Feil / Krasj';
      case 'performance': return 'Ytelse / Kompleksitet';
      case 'duplication': return 'Duplisert Kode';
      case 'naming': return 'Navngiving & Lesbarhet';
      case 'security': return 'Sikkerhet';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Score Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              Automatisk Kode-revisjonsrapport
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">Resultat av Kodeanalyse</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {auditReport.summaryNorwegian}
          </p>
        </div>

        {/* Big Score Meter */}
        <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${getScoreBadgeColor(auditReport.overallScore)} min-w-[130px]`}>
          <span className="text-3xl font-extrabold tracking-tight">{auditReport.overallScore}/100</span>
          <span className="text-[11px] font-medium uppercase mt-0.5">
            {auditReport.overallScore >= 80 ? 'God kvalitet' : auditReport.overallScore >= 55 ? 'Trenger refaktorering' : 'Kritiske feil funnet'}
          </span>
        </div>
      </div>

      {/* Issues List & Strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detected Issues */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Identifiserte forbedringsområder ({auditReport.issues.length})</span>
          </h4>

          <div className="space-y-3">
            {auditReport.issues.map((issue, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(issue.severity)}
                    <span className="font-semibold text-zinc-100">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 uppercase font-mono">
                      {getCategoryLabel(issue.category)}
                    </span>
                    {issue.lineRange && (
                      <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 text-[10px] font-mono">
                        {issue.lineRange}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-zinc-300 leading-relaxed pl-6">{issue.description}</p>

                <div className="mt-2 pl-6 pt-2 border-t border-zinc-800/60 flex items-start gap-2 text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[11px] block text-emerald-200">Anbefalt løsning:</strong>
                    <span>{issue.recommendation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Strengths */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Kvantifiserte styrker</span>
          </h4>

          <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-2.5 text-xs text-zinc-300">
            {auditReport.strengths.map((str, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Refactored Proposals Selector */}
      <div className="bg-zinc-900/90 border border-indigo-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span>Velg mellom 3 forbedrede og testede versjoner</span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hvert forslag løser de identifiserte problemene med ulik optimaliseringsstrategi.
            </p>
          </div>
        </div>

        {/* The 3 Variant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {variants.map((v, idx) => {
            const isSelected = idx === selectedVariantIndex;
            return (
              <div
                key={v.id}
                onClick={() => onSelectVariant(idx)}
                className={`cursor-pointer rounded-xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                    : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {v.strategyTag}
                    </span>
                    {isSelected && (
                      <span className="text-[11px] font-semibold text-indigo-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktiv
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-sm text-white">{v.label}</h5>
                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                    {v.strategyDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/70 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    ✓ {v.verification.edgeCasesCovered.length} tester bestått
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyVariant(v);
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <span>Bruk kode</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
