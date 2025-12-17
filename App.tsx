import React, { useState, useRef, useCallback } from 'react';
import { analyzeCodeWithGemini, traceCodeWithGemini } from './services/geminiService';
import { AnalysisResult, AnalysisState, TraceState } from './types';
import { AnalysisView } from './components/AnalysisView';
import { ExecutionTraceView } from './components/ExecutionTraceView';
import { Code, Upload, Send, RefreshCcw, Loader2, Sparkles, BookOpen, Bug as BugIcon } from 'lucide-react';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  
  // Analysis State
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: 'idle',
    data: null,
    error: null,
  });

  // Execution Trace State
  const [traceState, setTraceState] = useState<TraceState>({
    status: 'idle',
    data: null,
    error: null,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    // Reset trace when re-analyzing
    setTraceState({ status: 'idle', data: null, error: null });
    setAnalysisState({ status: 'loading', data: null, error: null });

    try {
      const result = await analyzeCodeWithGemini(code);
      setAnalysisState({ status: 'success', data: result, error: null });
    } catch (err: any) {
      setAnalysisState({ 
        status: 'error', 
        data: null, 
        error: err.message || 'אירעה שגיאה בניתוח הקוד. אנא נסה שנית.' 
      });
    }
  };

  const handleDebug = async () => {
    if (!code.trim()) return;
    
    setTraceState({ status: 'loading', data: null, error: null });
    
    try {
      const trace = await traceCodeWithGemini(code);
      setTraceState({ status: 'success', data: trace, error: null });
      
      // Scroll to trace view
      setTimeout(() => {
        document.getElementById('debug-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setTraceState({
        status: 'error',
        data: null,
        error: err.message || 'אירעה שגיאה בסימולציית הריצה.'
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setCode(text);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClear = useCallback(() => {
    setCode('');
    setAnalysisState({ status: 'idle', data: null, error: null });
    setTraceState({ status: 'idle', data: null, error: null });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
         <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
         <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
         <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 leading-none">CodeMentor</h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">AI TUTOR ASSISTANT</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Gemini 2.5 Powered
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        
        {/* Intro / Empty State */}
        {analysisState.status === 'idle' && !code && (
          <div className="text-center py-16 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center justify-center p-6 bg-white rounded-full mb-8 shadow-xl shadow-indigo-100">
              <Sparkles className="w-10 h-10 text-indigo-600" />
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
              הקוד שלך, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">טוב יותר.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              העלו קוד או הדביקו אותו כאן למטה כדי לקבל ניתוח מעמיק, איתור באגים,
              וחישוב סיבוכיות זמן ומקום באופן מיידי.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 border border-white overflow-hidden transition-all duration-300 ring-1 ring-slate-100">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-500" />
              עורך הקוד
            </h3>
            <div className="flex gap-2">
               <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css"
              />
              <button 
                onClick={triggerFileUpload}
                className="text-sm flex items-center gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Upload className="w-4 h-4" />
                טען קובץ
              </button>
              {code && (
                <button 
                  onClick={handleClear}
                  className="text-sm flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <RefreshCcw className="w-4 h-4" />
                  נקה
                </button>
              )}
            </div>
          </div>
          
          <div className="relative group">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="הדבק את הקוד שלך כאן..."
              className="w-full h-96 p-8 font-mono text-sm bg-[#1e293b] text-indigo-100 resize-y focus:outline-none focus:ring-0 leading-loose selection:bg-indigo-500/30"
              dir="ltr"
              spellCheck="false"
            />
            {/* Action Bar (Sticky at bottom of textarea container) */}
            <div className="absolute bottom-6 right-6 left-6 flex justify-end gap-4 pointer-events-none">
              
              {/* Debug Button */}
               <button
                onClick={handleDebug}
                disabled={!code.trim() || traceState.status === 'loading' || analysisState.status === 'loading'}
                className="pointer-events-auto flex items-center gap-2 bg-slate-800/90 backdrop-blur hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl border border-slate-700 disabled:opacity-50 disabled:transform-none"
              >
                {traceState.status === 'loading' ? (
                   <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <BugIcon className="w-5 h-5" />
                )}
                 סימולציית ריצה
              </button>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={!code.trim() || analysisState.status === 'loading' || traceState.status === 'loading'}
                className="pointer-events-auto flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl disabled:transform-none"
              >
                {analysisState.status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מנתח קוד...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 rtl:rotate-180" />
                    נתח את הקוד
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error States */}
        {(analysisState.status === 'error' || traceState.status === 'error') && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center animate-in fade-in zoom-in-95 shadow-sm">
            <div className="inline-flex p-4 rounded-full bg-white shadow-sm text-rose-500 mb-4 ring-4 ring-rose-50">
              <AlertTriangleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">אופס, משהו השתבש</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              {analysisState.error || traceState.error}
            </p>
          </div>
        )}

        {/* Debug Trace View */}
        {traceState.status === 'success' && traceState.data && (
          <div id="debug-section" className="scroll-mt-24">
            <ExecutionTraceView 
              trace={traceState.data} 
              onClose={() => setTraceState({ status: 'idle', data: null, error: null })} 
            />
          </div>
        )}

        {/* Analysis Results View */}
        {analysisState.status === 'success' && analysisState.data && (
          <AnalysisView result={analysisState.data} />
        )}

      </main>
    </div>
  );
};

// Helper for error icon in main file to avoid extra component file
const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
);

export default App;