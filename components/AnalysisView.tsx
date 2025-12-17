import React from 'react';
import { AnalysisResult, Bug, Improvement } from '../types';
import { AlertTriangle, CheckCircle, Clock, Database, Code, Activity, Shield, Zap, FileText } from 'lucide-react';

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

      {/* Corrected Code Section */}
      <div className="bg-[#1e1e2e] rounded-3xl shadow-2xl overflow-hidden border border-slate-800/50 ring-4 ring-slate-100">
        <div className="p-4 border-b border-slate-700/50 bg-[#181825] flex justify-between items-center">
          <h2 className="text-slate-200 font-bold flex items-center gap-3">
            <Code className="w-5 h-5 text-violet-400" />
            קוד מתוקן
          </h2>
          <span className="text-xs text-slate-500 font-mono bg-slate-800/50 px-2 py-1 rounded-md">Read Only</span>
        </div>
        <div className="p-0 overflow-x-auto custom-scrollbar">
          <pre className="text-sm font-mono text-slate-300 p-6 leading-relaxed bg-[#1e1e2e]" dir="ltr">
            <code>{result.correctedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};