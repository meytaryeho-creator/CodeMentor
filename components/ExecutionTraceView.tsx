import React, { useState } from 'react';
import { ExecutionTrace } from '../types';
import { Play, SkipBack, SkipForward, Square, Terminal, Cpu, ChevronLeft, ChevronRight, RefreshCw, Lightbulb } from 'lucide-react';

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
    <div className="bg-[#1e293b] rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col h-[650px] animate-in fade-in zoom-in-95 duration-500 ring-4 ring-slate-100">
      
      {/* Header */}
      <div className="bg-[#0f172a] p-5 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg tracking-tight">סימולציית ריצה</h3>
            <div className="flex items-center gap-2 mt-1">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                 <p className="text-xs text-slate-400 font-mono">Input: {trace.inputDescription}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-900 px-3 py-1.5 rounded-lg font-mono">
             STEP {currentStepIndex + 1} / {trace.steps.length}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Variables & Output */}
        <div className="md:w-80 bg-[#1e293b] border-l border-slate-700/50 flex flex-col shadow-inner">
          
          {/* Variables Table */}
          <div className="flex-1 p-5 overflow-y-auto">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              Local Variables
            </h4>
            
            {currentStep.variables.length > 0 ? (
              <div className="space-y-2">
                {currentStep.variables.map((v, idx) => (
                  <div key={idx} className="group flex justify-between items-center bg-[#334155]/50 hover:bg-[#334155] p-3 rounded-xl border border-slate-700/50 transition-colors">
                    <span className="font-mono text-indigo-200 text-sm font-medium">{v.name}</span>
                    <span className="font-mono text-emerald-300 text-sm bg-[#0f172a]/50 px-2 py-0.5 rounded">{v.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                  <span className="text-4xl block mb-2">∅</span>
                  <p className="text-slate-500 text-sm">No active variables</p>
              </div>
            )}
          </div>

          {/* Final Output Preview (if reached) */}
          {isLast && (
             <div className="p-5 bg-[#0f172a] border-t border-slate-800">
               <h4 className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                   פלט סופי (Output)
               </h4>
               <div className="font-mono text-emerald-300 text-sm break-all bg-emerald-950/20 p-3 rounded-lg border border-emerald-900/50">
                 {trace.finalOutput}
               </div>
             </div>
          )}
        </div>

        {/* Right Panel: Execution Flow */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#18212f] flex flex-col relative custom-scrollbar">
          
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
             {/* Code Line Display */}
            <div className="mb-8 relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-yellow-500 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)]"></div>
                <div className="text-slate-500 text-xs uppercase font-bold tracking-widest mb-3 pl-1">Executing Line</div>
                <div className="bg-[#0f172a] border-l-4 border-yellow-500 rounded-r-xl p-6 shadow-2xl">
                    <code className="font-mono text-xl md:text-2xl text-yellow-100" dir="ltr">
                        {currentStep.lineContent}
                    </code>
                </div>
            </div>

            {/* Explanation Bubble */}
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 relative">
                <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full border border-indigo-400 shadow-lg flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    הסבר
                </div>
                <p className="text-indigo-100 text-lg leading-relaxed text-right">
                {currentStep.explanation}
                </p>
            </div>
          </div>

        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-[#0f172a] p-4 border-t border-slate-800 flex justify-center items-center gap-6">
        
        <button 
          onClick={reset}
          className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
          title="התחל מחדש"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        <button 
          onClick={prevStep}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all border border-transparent hover:border-slate-700"
        >
          <ChevronRight className="w-5 h-5" />
          הקודם
        </button>

        <div className="h-8 w-px bg-slate-800"></div>

        <button 
          onClick={nextStep}
          disabled={isLast}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isLast 
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-900/20'
          }`}
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