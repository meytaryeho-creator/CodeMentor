import React from 'react';
import { AnalysisResult, Bug, Improvement } from '../types';
import { AlertTriangle, CheckCircle, Clock, Database, Code, Activity, Shield, Zap, FileText } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
}

const SeverityBadge = ({ severity }: { severity: Bug['severity'] }) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };
  
  const labels = {
    critical: 'קריטי',
    warning: 'אזהרה',
    info: 'מידע',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colors[severity]}`}>
      {labels[severity]}
    </span>
  );
};

const CategoryIcon = ({ category }: { category: Improvement['category'] }) => {
  switch (category) {
    case 'performance': return <Zap className="w-4 h-4 text-orange-500" />;
    case 'security': return <Shield className="w-4 h-4 text-red-500" />;
    case 'readability': return <FileText className="w-4 h-4 text-blue-500" />;
    default: return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          סיכום כללי ({result.language})
        </h2>
        <p className="text-slate-600 leading-relaxed text-lg">
          {result.summary}
        </p>
      </div>

      {/* Complexity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-indigo-900">סיבוכיות זמן (Time Complexity)</h3>
          </div>
          <p className="text-indigo-800 font-mono text-lg ltr text-right" dir="ltr">
            {result.timeComplexity}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-indigo-900">סיבוכיות מקום (Space Complexity)</h3>
          </div>
          <p className="text-indigo-800 font-mono text-lg ltr text-right" dir="ltr">
            {result.spaceComplexity}
          </p>
        </div>
      </div>

      {/* Bugs Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-red-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            שגיאות ובעיות שאותרו
            <span className="bg-red-100 text-red-700 text-sm font-normal px-2 py-0.5 rounded-full">
              {result.bugs.length}
            </span>
          </h2>
        </div>
        <div className="p-6">
          {result.bugs.length === 0 ? (
            <p className="text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> לא נמצאו שגיאות קריטיות. כל הכבוד!
            </p>
          ) : (
            <ul className="space-y-4">
              {result.bugs.map((bug, idx) => (
                <li key={idx} className="flex gap-4 items-start p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="mt-1">
                    <SeverityBadge severity={bug.severity} />
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">
                      {bug.line ? <span className="text-slate-400 text-sm ml-2">שורה {bug.line}:</span> : null}
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-green-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-600" />
            הצעות לשיפור
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4">
            {result.improvements.map((item, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 border border-slate-100 rounded-lg shadow-sm">
                <div className="mt-1 bg-slate-100 p-1.5 rounded-full">
                  <CategoryIcon category={item.category} />
                </div>
                <div>
                  <p className="text-slate-700">{item.description}</p>
                  <span className="text-xs text-slate-400 mt-1 block">קטגוריה: {item.category}</span>
                </div>
              </div>
            ))}
            {result.improvements.length === 0 && (
              <p className="text-slate-500 italic">לא נמצאו הצעות לשיפור מיוחדות.</p>
            )}
          </div>
        </div>
      </div>

      {/* Corrected Code Section */}
      <div className="bg-slate-900 rounded-2xl shadow-lg overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-700 bg-slate-950 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            קוד מתוקן
          </h2>
          <span className="text-xs text-slate-400 font-mono">מומלץ לעבור על השינויים</span>
        </div>
        <div className="p-0 overflow-x-auto">
          <pre className="text-sm font-mono text-slate-300 p-6 leading-relaxed" dir="ltr">
            <code>{result.correctedCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};