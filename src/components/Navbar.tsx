import React from 'react';
import { Scale, Sparkles, History, PlusCircle, Share2, CheckCircle2 } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';

interface NavbarProps {
  onNewDecision: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  hasActiveAnalysis: boolean;
  historyCount: number;
  currentAnalysis: DecisionAnalysis | null;
  onMarkDecided: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDecision,
  onOpenHistory,
  onOpenExport,
  hasActiveAnalysis,
  historyCount,
  currentAnalysis,
  onMarkDecided,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={onNewDecision}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                The Tiebreaker
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                AI Strategist
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Decisive clarity through structured pros, cons, matrices & SWOT
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {hasActiveAnalysis && (
            <>
              {currentAnalysis && (
                <button
                  onClick={onMarkDecided}
                  title="Mark this decision as final"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                    currentAnalysis.status === 'decided'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {currentAnalysis.status === 'decided' ? 'Decided ✓' : 'Mark as Decided'}
                </button>
              )}

              <button
                onClick={onOpenExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors"
                title="Export or Share decision report"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/80 transition-colors"
            title="Saved Decisions History"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Saved</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onNewDecision}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Decision</span>
          </button>
        </div>
      </div>
    </header>
  );
};
