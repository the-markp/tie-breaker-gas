import React from 'react';
import { X, Trash2, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { DecisionAnalysis } from '../types/decision';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecisions: DecisionAnalysis[];
  onSelectDecision: (decision: DecisionAnalysis) => void;
  onDeleteDecision: (id: string, e: React.MouseEvent) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  savedDecisions,
  onSelectDecision,
  onDeleteDecision,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Decision Archive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savedDecisions.length} {savedDecisions.length === 1 ? 'decision' : 'decisions'} stored locally
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedDecisions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No saved decisions yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Run an analysis or break a tie, and your decision dossiers will appear here.
              </p>
            </div>
          ) : (
            savedDecisions.map((dec) => (
              <div
                key={dec.id}
                onClick={() => {
                  onSelectDecision(dec);
                  onClose();
                }}
                className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-xs hover:shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {dec.input.title}
                  </h4>
                  <button
                    type="button"
                    onClick={(e) => onDeleteDecision(dec.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-all"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(dec.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{dec.input.options.length} options</span>
                  {dec.status === 'decided' && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Decided
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    Verdict: <strong className="text-indigo-600 dark:text-indigo-400">{dec.verdict.winner}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-500 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
