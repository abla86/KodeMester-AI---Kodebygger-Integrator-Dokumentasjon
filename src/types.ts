export type Mode = 'generate' | 'integrate' | 'convert' | 'optimize' | 'refactor_audit';

export type Complexity = 'simple' | 'standard' | 'advanced';

export interface CodeFile {
  name: string;
  language: string;
  code: string;
  description: string;
}

export interface TestCase {
  description: string;
  input: string;
  expectedOutput: string;
}

export interface VerificationInfo {
  tested: boolean;
  syntaxCheck: string;
  runtimeCheck: string;
  edgeCasesCovered: string[];
}

export interface CodeVariant {
  id: string; // 'variant_1' | 'variant_2' | 'variant_3'
  label: string; // e.g. "Forslag 1: Ren & Idiomatisk"
  strategyTag: string; // e.g. "Ren kode", "Høy ytelse", "Robust & Type-sikker"
  strategyDescription: string;
  files: CodeFile[];
  unitTest: CodeFile;
  documentation: string;
  explanation: string;
  codeImprovements: string[];
  verification: VerificationInfo;
  testCases: TestCase[];
  executablePreview: boolean;
}

export interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'bug' | 'performance' | 'duplication' | 'naming' | 'security';
  title: string;
  description: string;
  lineRange?: string;
  recommendation: string;
}

export interface AuditReport {
  overallScore: number;
  summaryNorwegian: string;
  issues: AuditIssue[];
  strengths: string[];
}

export interface GeneratedProject {
  id: string;
  createdAt: number;
  prompt: string;
  mode: Mode;
  language: string;
  title: string;
  summary: string;
  variants: CodeVariant[];
  selectedVariantIndex: number;
  auditReport?: AuditReport;
  integrationNotes?: string;
}

export interface SimulationResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs?: number;
  variableTrace?: { name: string; value: string }[];
  explanationNorwegian: string;
}

export interface SupportedLanguage {
  id: string;
  name: string;
  extension: string;
  prismLang: string;
  category: 'core' | 'web' | 'backend' | 'systems' | 'scripting' | 'database';
  badgeColor: string;
  popular?: boolean;
}
