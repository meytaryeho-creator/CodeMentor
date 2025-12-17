import React, { useState, useRef, useCallback } from 'react';
import { analyzeCodeWithGemini, traceCodeWithGemini } from './services/geminiService';
import { AnalysisResult, AnalysisState, TraceState } from './types';
import { AnalysisView } from './components/AnalysisView';
import { ExecutionTraceView } from './components/ExecutionTraceView';
import { Code, Upload, Send, RefreshCcw, Loader2, Sparkles, BookOpen, PlayCircle, Bug as BugIcon } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">CodeMentor</h1>
              <span className="text-xs text-slate-500 font-medium">המלווה האישי שלך לתכנות</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              מופעל ע"י Gemini 2.5
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Intro / Empty State */}
        {analysisState.status === 'idle' && !code && (
          <div className="text-center py-12 px-4">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-full mb-6">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">מוכנים לשפר את הקוד שלכם?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              העלו קוד או הדביקו אותו כאן למטה כדי לקבל ניתוח מעמיק, איתור באגים,
              וחישוב סיבוכיות זמן ומקום באופן מיידי.
            </p>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
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
                className="text-sm flex items-center gap-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                טען קובץ
              </button>
              {code && (
                <button 
                  onClick={handleClear}
                  className="text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  נקה
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="הדבק את הקוד שלך כאן..."
              className="w-full h-80 p-6 font-mono text-sm bg-slate-900 text-slate-200 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              dir="ltr"
              spellCheck="false"
            />
            {/* Action Bar (Sticky at bottom of textarea container) */}
            <div className="absolute bottom-4 right-4 left-4 flex justify-end gap-3 pointer-events-none">
              
              {/* Debug Button */}
               <button
                onClick={handleDebug}
                disabled={!code.trim() || traceState.status === 'loading' || analysisState.status === 'loading'}
                className="pointer-events-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200"
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
                className="pointer-events-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
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
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600 mb-3">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">אופס, משהו השתבש</h3>
            <p className="text-red-700">
              {analysisState.error || traceState.error}
            </p>
          </div>
        )}

        {/* Debug Trace View */}
        {traceState.status === 'success' && traceState.data && (
          <div id="debug-section">
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