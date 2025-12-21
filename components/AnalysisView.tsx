import React, { useState, useEffect } from 'react';
import { AnalysisResult, Bug, Improvement } from '../types';
import { refineCodeWithGemini } from '../services/geminiService';
import { AlertTriangle, CheckCircle, Clock, Database, Code, Activity, Shield, Zap, FileText, MessageSquare, Send, Bot, Loader2, Copy, Check, Sparkles } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
}

const SeverityBadge = ({ severity }: { severity: Bug['severity'] }) => {
  const styles = {
    critical: 'bg-red-50 text-red-700 border-red-100 ring-red-600/10',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10',
    info: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-600/10',
  };
  
  const labels = {
    critical: 'קריטי',
    warning: 'אזהרה',
    info: 'מידע',
  };

  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ring-1 ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
};

const CategoryIcon = ({ category }: { category: Improvement['category'] }) => {
  switch (category) {
    case 'performance': return <Zap className="w-5 h-5 text-amber-500" />;
    case 'security': return <Shield className="w-5 h-5 text-rose-500" />;
    case 'readability': return <FileText className="w-5 h-5 text-sky-500" />;
    default: return <CheckCircle className="w-5 h-5 text-emerald-500" />;
  }
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  const [currentCode, setCurrentCode] = useState(result.correctedCode);
  const [chatInput, setChatInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [lastExplanation, setLastExplanation] = useState<string | null>(null);
  const [showCorrectedCode, setShowCorrectedCode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    setCurrentCode(result.correctedCode);
    setLastExplanation(null);
    setChatInput("");
    setShowCorrectedCode(false);
    setCopied(false);
  }, [result]);

  const handleRefineCode = async () => {
    if (!chatInput.trim() || isRefining) return;
    
    setIsRefining(true);
    try {
      const response = await refineCodeWithGemini(currentCode, chatInput);
      setCurrentCode(response.newCode);
      setLastExplanation(response.explanation);
      setChatInput("");
      setCopied(false);
    } catch (error) {
      console.error("Failed to refine", error);
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Summary Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
             <Activity className="w-6 h-6 text-violet-600" />
          </div>
          סיכום כללי ({result.language})
        </h2>
        <p className="text-slate-600 leading-relaxed text-lg bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
          {result.summary}
        </p>
      </div>

      {/* Complexity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 border border-indigo-100 shadow-lg shadow-indigo-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-full shadow-sm">
                <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-bold text-indigo-950 text-lg">סיבוכיות זמן</h3>
          </div>
          <p className="text-indigo-900 font-mono text-xl ltr text-right bg-white/60 p-3 rounded-xl border border-indigo-50" dir="ltr">
            {result.timeComplexity}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-6 border border-purple-100 shadow-lg shadow-purple-100/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-full shadow-sm">
                <Database className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-purple-950 text-lg">סיבוכיות מקום</h3>
          </div>
          <p className="text-purple-900 font-mono text-xl ltr text-right bg-white/60 p-3 rounded-xl border border-purple-50" dir="ltr">
            {result.spaceComplexity}
          </p>
        </div>
      </div>

      {/* Bugs Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-50/50 to-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            בעיות שאותרו
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.bugs.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
              {result.bugs.length}
          </span>
        </div>
        <div className="p-6 bg-slate-50/30">
          {result.bugs.length === 0 ? (
            <div className="text-center py-8">
                <div className="inline-flex p-4 bg-green-50 rounded-full mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-slate-600 font-medium">לא נמצאו שגיאות קריטיות. עבודה מצוינת!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {result.bugs.map((bug, idx) => (
                <li key={idx} className="flex flex-col sm:flex-row gap-4 items-start p-4 bg-white hover:shadow-md rounded-2xl border border-slate-100 transition-all duration-200">
                  <div className="mt-1 shrink-0">
                    <SeverityBadge severity={bug.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {bug.line && <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">שורה {bug.line}</span>}
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {bug.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Improvements Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-white">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
                <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            הצעות לשיפור
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 gap-4 bg-slate-50/30">
            {result.improvements.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="mt-1 bg-slate-50 p-2 rounded-xl shrink-0">
                  <CategoryIcon category={item.category} />
                </div>
                <div>
                  <p className="text-slate-700 font-medium mb-1">{item.description}</p>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-full inline-block">
                    {item.category === 'best-practice' ? 'Best Practice' : item.category}
                  </span>
                </div>
              </div>
            ))}
            {result.improvements.length === 0 && (
              <p className="text-slate-500 italic text-center py-4">לא נמצאו הצעות לשיפור מיוחדות.</p>
            )}
        </div>
      </div>

      {/* Approval Step / Interactive Code Agent Section */}
      {!showCorrectedCode ? (
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl shadow-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="inline-flex p-4 bg-white/10 backdrop-blur rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">הכנתי לך גרסה מתוקנת!</h2>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            על סמך הניתוח, יצרתי קוד מתוקן שכולל פתרון לבאגים ויישום של ההצעות לשיפור. 
            האם תרצה לראות אותו ולעבוד איתו?
          </p>
          <button 
            onClick={() => setShowCorrectedCode(true)}
            className="bg-white text-indigo-700 font-bold py-4 px-10 rounded-2xl shadow-xl hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all text-lg"
          >
            כן, הצג קוד מתוקן
          </button>
        </div>
      ) : (
        <div className="bg-[#1e1e2e] rounded-3xl shadow-2xl overflow-hidden border border-slate-800/50 ring-4 ring-slate-100 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50 bg-[#181825] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-slate-200 font-bold flex items-center gap-3">
                <Code className="w-5 h-5 text-violet-400" />
                קוד מתוקן ומשופר
              </h2>
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-green-400 font-mono font-bold uppercase tracking-wider">Agent Ready</span>
              </div>
            </div>
            
            <button 
              onClick={copyToClipboard}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                copied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'הועתק!' : 'העתק קוד'}
            </button>
          </div>
          
          {/* Code Display */}
          <div className="p-0 overflow-x-auto custom-scrollbar relative group">
            <pre className="text-sm font-mono text-slate-300 p-8 leading-relaxed bg-[#1e1e2e] min-h-[250px]" dir="ltr">
              <code>{currentCode}</code>
            </pre>
            
            {/* Last Update Overlay Notification */}
            {lastExplanation && (
              <div className="absolute top-6 right-6 max-w-sm animate-in fade-in slide-in-from-top-2 duration-500 z-10">
                 <div className="bg-indigo-950/90 backdrop-blur text-indigo-100 text-sm p-4 rounded-2xl border border-indigo-500/30 shadow-2xl flex gap-3 ring-1 ring-white/5">
                    <Bot className="w-6 h-6 shrink-0 mt-0.5 text-indigo-400" />
                    <div>
                      <span className="font-bold block text-[10px] text-indigo-400 uppercase mb-1 tracking-widest">Bot Update</span>
                      {lastExplanation}
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Chat / Refine Interface */}
          <div className="bg-[#2a2a3c] border-t border-slate-700/50 p-5 shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
             <div className="flex flex-col gap-3 max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    שוחח עם הבוט לתיקון נוסף
                  </label>
                  {isRefining && <span className="text-[10px] text-indigo-400 font-bold animate-pulse">הבוט חושב...</span>}
                </div>
                
                <div className="flex gap-2 relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefineCode()}
                    placeholder="בקש שינוי, למשל: 'שנה את שמות המשתנים לעברית' או 'הוסף הערות הסבר'..."
                    className="w-full bg-[#181825] text-white text-base rounded-2xl px-5 py-4 pl-14 border border-slate-700 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-slate-600 shadow-inner"
                    disabled={isRefining}
                  />
                  <button 
                    onClick={handleRefineCode}
                    disabled={!chatInput.trim() || isRefining}
                    className="absolute left-2.5 top-2.5 p-3 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    {isRefining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:rotate-180" />}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};