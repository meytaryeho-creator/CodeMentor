export interface Bug {
  line?: number;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface Improvement {
  description: string;
  category: 'performance' | 'readability' | 'security' | 'best-practice';
}

export interface AnalysisResult {
  summary: string;
  language: string;
  bugs: Bug[];
  improvements: Improvement[];
  timeComplexity: string;
  spaceComplexity: string;
  correctedCode: string;
}

export interface AnalysisState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: AnalysisResult | null;
  error: string | null;
}

// Debugger / Trace Types
export interface VariableState {
  name: string;
  value: string;
}

export interface TraceStep {
  step: number;
  lineContent: string;
  variables: VariableState[];
  explanation: string;
}

export interface ExecutionTrace {
  inputDescription: string;
  steps: TraceStep[];
  finalOutput: string;
}

export interface TraceState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: ExecutionTrace | null;
  error: string | null;
}