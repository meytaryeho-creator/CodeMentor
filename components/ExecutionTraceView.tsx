import React, { useState } from 'react';
import { ExecutionTrace } from '../types';
import { Play, SkipBack, SkipForward, Square, Terminal, Cpu, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface ExecutionTraceViewProps {
  trace: ExecutionTrace;
  onClose?: () => void;
}

export const ExecutionTraceView: React.FC<ExecutionTraceViewProps> = ({ trace, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = trace.steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === trace.steps.length - 1;

  const nextStep = () => {
    if (!isLast) setCurrentStepIndex(prev => prev + 1);
  };

  const prevStep = () => {
    if (!isFirst) setCurrentStepIndex(prev => prev - 1);
  };

  const reset = () => setCurrentStepIndex(0);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden flex flex-col h-[600px] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">סימולציית ריצה (Debugger)</h3>
            <p className="text-xs text-slate-400">קלט לדוגמה: {trace.inputDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
             צעד {currentStepIndex + 1} מתוך {trace.steps.length}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Variables & Output */}
        <div className="md:w-1/3 bg-slate-900 border-l border-slate-800 flex flex-col">
          
          {/* Variables Table */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Terminal className="w-3 h-3" /> משתנים בזיכרון
            </h4>
            
            {currentStep.variables.length > 0 ? (
              <div className="space-y-2">
                {currentStep.variables.map((v, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800/50 p-2 rounded border border-slate-700/50">
                    <span className="font-mono text-indigo-300 text-sm">{v.name}</span>
                    <span className="font-mono text-emerald-300 text-sm">{v.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm italic">אין משתנים פעילים בצעד זה</p>
            )}
          </div>

          {/* Final Output Preview (if reached) */}
          {isLast && (
             <div className="p-4 bg-slate-950 border-t border-slate-800">
               <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">פלט סופי</h4>
               <div className="font-mono text-emerald-400 text-sm break-all">
                 {trace.finalOutput}
               </div>
             </div>
          )}
        </div>

        {/* Right Panel: Execution Flow */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-800/30 flex flex-col justify-center items-center relative">
          
          {/* Code Line Display */}
          <div className="w-full max-w-xl mb-8 text-center">
            <div className="text-slate-500 text-sm mb-2 font-medium">שורת קוד נוכחית</div>
            <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 shadow-inner">
               <code className="font-mono text-lg text-yellow-300" dir="ltr">
                 {currentStep.lineContent}
               </code>
            </div>
          </div>

          {/* Explanation Bubble */}
          <div className="w-full max-w-xl bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-5 relative">
            <div className="absolute -top-3 right-6 bg-indigo-900 text-indigo-200 text-xs px-2 py-0.5 rounded border border-indigo-700">
              מה קורה כאן?
            </div>
            <p className="text-slate-200 text-lg leading-relaxed text-center">
              {currentStep.explanation}
            </p>
          </div>

        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-center items-center gap-4">
        
        <button 
          onClick={reset}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          title="התחל מחדש"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button 
          onClick={prevStep}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight className="w-5 h-5" />
          הקודם
        </button>

        <div className="h-12 w-px bg-slate-800 mx-2"></div>

        <button 
          onClick={nextStep}
          disabled={isLast}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-700 shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95"
        >
          {isLast ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              סיום
            </>
          ) : (
            <>
              הבא
              <ChevronLeft className="w-5 h-5" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};