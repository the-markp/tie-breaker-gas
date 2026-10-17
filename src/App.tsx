import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DecisionForm } from './components/DecisionForm';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ExportModal } from './components/ExportModal';
import { DecisionAnalysis, DecisionInput } from './types/decision';
import { getSavedDecisions, saveDecision, deleteDecision } from './utils/storage';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeAnalysis, setActiveAnalysis] = useState<DecisionAnalysis | null>(null);
  const [savedDecisions, setSavedDecisions] = useState<DecisionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved decisions from storage on mount
  useEffect(() => {
    const list = getSavedDecisions();
    setSavedDecisions(list);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Submit initial decision
  const handleAnalyzeDecision = async (input: DecisionInput) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/decision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze decision');
      }

      const result: DecisionAnalysis = await response.json();
      setActiveAnalysis(result);
      saveDecision(result);
      setSavedDecisions(getSavedDecisions());
      showToast('Tiebreaker verdict and analysis generated!');
    } catch (err: any) {
      console.error('Error analyzing decision:', err);
      showToast('Encountered an issue analyzing decision. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Follow-up AI refinement
  const handleRefineWithAI = async (userPrompt: string) => {
    if (!activeAnalysis) return;
    setIsRefining(true);
    try {
      const response = await fetch('/api/decision/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAnalysis: activeAnalysis,
          userPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine decision analysis');
      }

      const updated: DecisionAnalysis = await response.json();
      setActiveAnalysis(updated);
      saveDecision(updated);
      setSavedDecisions(getSavedDecisions());
      showToast('Analysis successfully updated with new factors!');
    } catch (err: any) {
      console.error('Error refining decision:', err);
      showToast('Failed to refine analysis. Please try a different prompt.');
    } finally {
      setIsRefining(false);
    }
  };

  // Update analysis locally (e.g. weights, custom criteria)
  const handleUpdateAnalysis = (updated: DecisionAnalysis) => {
    setActiveAnalysis(updated);
    saveDecision(updated);
    setSavedDecisions(getSavedDecisions());
  };

  // Toggle decided state
  const handleToggleDecided = () => {
    if (!activeAnalysis) return;
    const newStatus = activeAnalysis.status === 'decided' ? 'evaluating' : 'decided';
    const updated: DecisionAnalysis = {
      ...activeAnalysis,
      status: newStatus,
    };
    handleUpdateAnalysis(updated);
    showToast(newStatus === 'decided' ? 'Decision marked as Decided ✓' : 'Status reverted to Evaluating');
  };

  // Select decision from history
  const handleSelectHistory = (decision: DecisionAnalysis) => {
    setActiveAnalysis(decision);
    setIsHistoryOpen(false);
    showToast(`Loaded "${decision.input.title.slice(0, 30)}..."`);
  };

  // Delete from history
  const handleDeleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteDecision(id);
    const updated = getSavedDecisions();
    setSavedDecisions(updated);
    if (activeAnalysis?.id === id) {
      setActiveAnalysis(null);
    }
    showToast('Decision removed from archive.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onNewDecision={() => setActiveAnalysis(null)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        hasActiveAnalysis={!!activeAnalysis}
        historyCount={savedDecisions.length}
        currentAnalysis={activeAnalysis}
        onMarkDecided={handleToggleDecided}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeAnalysis ? (
          <AnalysisDashboard
            analysis={activeAnalysis}
            onUpdateAnalysis={handleUpdateAnalysis}
            onRefineWithAI={handleRefineWithAI}
            isRefining={isRefining}
            onNewDecision={() => setActiveAnalysis(null)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        ) : (
          <DecisionForm onSubmit={handleAnalyzeDecision} isLoading={isLoading} />
        )}
      </main>

      {/* Saved Decisions Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedDecisions={savedDecisions}
        onSelectDecision={handleSelectHistory}
        onDeleteDecision={handleDeleteFromHistory}
      />

      {/* Export Modal */}
      {isExportOpen && activeAnalysis && (
        <ExportModal
          decision={activeAnalysis}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>The Tiebreaker — Powered by Behavioral Decision Science & Gemini AI</p>
      </footer>
    </div>
  );
}
