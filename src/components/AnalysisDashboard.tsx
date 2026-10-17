import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  Shield,
  Layers,
  BarChart3,
  ListOrdered,
  Grid,
  Coins,
  Send,
  Loader2,
  ChevronRight,
  TrendingUp,
  Sliders,
  Share2,
  RotateCcw,
} from 'lucide-react';
import {
  DecisionAnalysis,
  OptionProsCons,
  ComparisonCriterion,
  ImportanceWeight,
  ProConItem,
} from '../types/decision';
import { calculateOptionProsConsScore, calculateTableScores } from '../utils/scoring';
import { CoinTossView } from './CoinTossView';

interface AnalysisDashboardProps {
  analysis: DecisionAnalysis;
  onUpdateAnalysis: (updated: DecisionAnalysis) => void;
  onRefineWithAI: (refinePrompt: string) => Promise<void>;
  isRefining: boolean;
  onNewDecision: () => void;
  onOpenExport: () => void;
}

type TabType = 'verdict' | 'pros_cons' | 'comparison' | 'swot' | 'gut_check' | 'experiments';

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  analysis,
  onUpdateAnalysis,
  onRefineWithAI,
  isRefining,
  onNewDecision,
  onOpenExport,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('verdict');
  const [selectedSwotOption, setSelectedSwotOption] = useState<string>(
    analysis.input.options[0] || ''
  );
  const [whatIfInput, setWhatIfInput] = useState('');

  // Local states for adding custom Pro / Con
  const [customProText, setCustomProText] = useState<{ [optionName: string]: string }>({});
  const [customConText, setCustomConText] = useState<{ [optionName: string]: string }>({});
  const [showAddCustom, setShowAddCustom] = useState<{ [optionName: string]: boolean }>({});

  // Local state for adding custom Criterion
  const [showAddCriterion, setShowAddCriterion] = useState(false);
  const [newCriterionName, setNewCriterionName] = useState('');
  const [newCriterionDesc, setNewCriterionDesc] = useState('');

  // Checked state for experiments
  const [completedExperiments, setCompletedExperiments] = useState<Record<number, boolean>>({});

  // Calculate table scores dynamically based on user adjusted importance
  const tableScoreResults = calculateTableScores(
    analysis.comparisonTable.criteria,
    analysis.input.options
  );

  // Sorted options by table ranking
  const rankedOptions = [...analysis.input.options].sort((a, b) => {
    const scoreA = tableScoreResults[a]?.totalWeighted || 0;
    const scoreB = tableScoreResults[b]?.totalWeighted || 0;
    return scoreB - scoreA;
  });

  // Handler to adjust Pro or Con weight
  const handleWeightChange = (
    optIndex: number,
    type: 'pros' | 'cons',
    itemId: string,
    delta: number
  ) => {
    const updatedProsCons = [...analysis.prosAndCons];
    const targetOpt = { ...updatedProsCons[optIndex] };
    const items = [...targetOpt[type]];
    const itemIndex = items.findIndex((i) => i.id === itemId);

    if (itemIndex >= 0) {
      const currentWeight = items[itemIndex].weight;
      const newWeight = Math.max(1, Math.min(5, currentWeight + delta));
      items[itemIndex] = { ...items[itemIndex], weight: newWeight };
      targetOpt[type] = items;
      updatedProsCons[optIndex] = targetOpt;

      onUpdateAnalysis({
        ...analysis,
        prosAndCons: updatedProsCons,
      });
    }
  };

  // Handler to delete a Pro or Con
  const handleDeleteItem = (optIndex: number, type: 'pros' | 'cons', itemId: string) => {
    const updatedProsCons = [...analysis.prosAndCons];
    const targetOpt = { ...updatedProsCons[optIndex] };
    targetOpt[type] = targetOpt[type].filter((i) => i.id !== itemId);
    updatedProsCons[optIndex] = targetOpt;

    onUpdateAnalysis({
      ...analysis,
      prosAndCons: updatedProsCons,
    });
  };

  // Handler to add custom Pro or Con
  const handleAddCustomItem = (optIndex: number, optName: string, type: 'pros' | 'cons') => {
    const text = type === 'pros' ? customProText[optName] : customConText[optName];
    if (!text || !text.trim()) return;

    const newItem: ProConItem = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: text.trim(),
      category: 'User Added',
      weight: 4,
      impact: 'Major',
      isCustom: true,
    };

    const updatedProsCons = [...analysis.prosAndCons];
    const targetOpt = { ...updatedProsCons[optIndex] };
    targetOpt[type] = [...targetOpt[type], newItem];
    updatedProsCons[optIndex] = targetOpt;

    if (type === 'pros') {
      setCustomProText({ ...customProText, [optName]: '' });
    } else {
      setCustomConText({ ...customConText, [optName]: '' });
    }

    onUpdateAnalysis({
      ...analysis,
      prosAndCons: updatedProsCons,
    });
  };

  // Handler to update criterion importance
  const handleCriterionImportanceChange = (critId: string, newImportance: ImportanceWeight) => {
    const updatedCriteria = analysis.comparisonTable.criteria.map((c) => {
      if (c.id === critId) {
        return { ...c, importance: newImportance };
      }
      return c;
    });

    onUpdateAnalysis({
      ...analysis,
      comparisonTable: {
        ...analysis.comparisonTable,
        criteria: updatedCriteria,
      },
    });
  };

  // Handler to add custom criterion
  const handleAddCriterionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCriterionName.trim()) return;

    const newCrit: ComparisonCriterion = {
      id: `crit_${Date.now()}`,
      name: newCriterionName.trim(),
      description: newCriterionDesc.trim() || 'Custom user dimension',
      importance: 'High',
      scores: analysis.input.options.reduce((acc, opt) => {
        acc[opt] = { score: 7, note: 'User specified evaluation' };
        return acc;
      }, {} as any),
    };

    onUpdateAnalysis({
      ...analysis,
      comparisonTable: {
        ...analysis.comparisonTable,
        criteria: [...analysis.comparisonTable.criteria, newCrit],
      },
    });

    setNewCriterionName('');
    setNewCriterionDesc('');
    setShowAddCriterion(false);
  };

  // Handler to submit What-If prompt
  const handleWhatIfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatIfInput.trim() || isRefining) return;
    const query = whatIfInput.trim();
    setWhatIfInput('');
    await onRefineWithAI(query);
  };

  const toggleExperiment = (idx: number) => {
    setCompletedExperiments((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const { verdict, prosAndCons, comparisonTable, swot, experiments, input } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Winner Callout */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        {/* Glow ambient background element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                The Tiebreaker's Call
              </span>
              <span className="text-xs text-indigo-200/80">
                Analyzed {new Date(analysis.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {input.title}
            </h1>

            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed font-medium">
              Winner:{' '}
              <span className="text-emerald-400 font-bold underline decoration-emerald-400/50 underline-offset-4">
                {verdict.winner}
              </span>
              {' — '}
              {verdict.headline}
            </p>
          </div>

          {/* Confidence Badge & Quick Actions */}
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/10 gap-4 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-indigo-300">
                AI Confidence
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${verdict.confidence}%` }}
                  />
                </div>
                <span className="text-lg font-black text-white">{verdict.confidence}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExport}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Export Brief
              </button>
              <button
                onClick={onNewDecision}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                New Decision
              </button>
            </div>
          </div>
        </div>

        {/* Core Crux callout box */}
        <div className="relative z-10 mt-6 p-4 rounded-xl bg-white/5 backdrop-blur-xs border border-white/10 text-xs sm:text-sm text-indigo-100/95 leading-relaxed">
          <strong className="text-amber-300 font-bold uppercase tracking-wider text-[11px] block mb-1">
            ⚡ What This Decision Really Boils Down To:
          </strong>
          {verdict.theCrux}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'verdict', label: 'Verdicts & Insights', icon: Trophy },
          { id: 'pros_cons', label: 'Pros & Cons Matrix', icon: ListOrdered },
          { id: 'comparison', label: 'Comparison Table', icon: BarChart3 },
          { id: 'swot', label: 'SWOT Analysis', icon: Grid },
          { id: 'gut_check', label: 'Coin Toss Intuition', icon: Coins },
          { id: 'experiments', label: '48-Hr Experiments', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Verdict & Insights */}
      {activeTab === 'verdict' && (
        <div className="space-y-6">
          {/* Key Rationale Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Why {verdict.winner} Wins
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {verdict.rationale.map((r, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5"
                >
                  <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* The 10-10-10 Rule (Suzy Welch framework) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <div className="mb-4">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Suzy Welch's Framework
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                The 10-10-10 Time Horizon Perspective
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Decisions feel different across three distinct psychological time horizons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <Clock className="w-4 h-4" />
                  In 10 Minutes (Immediate Emotion)
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {verdict.tenTenTen.tenMinutes}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60 space-y-2">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wide">
                  <TrendingUp className="w-4 h-4" />
                  In 10 Months (Operational Reality)
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {verdict.tenTenTen.tenMonths}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                  <Layers className="w-4 h-4" />
                  In 10 Years (Compounding Legacy)
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {verdict.tenTenTen.tenYears}
                </p>
              </div>
            </div>
          </div>

          {/* Reversibility & Devil's Advocate Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reversibility (Bezos Door Types) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Shield className="w-4 h-4" />
                Bezos Decision Architecture
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{verdict.reversibility.doorType}</span>
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {verdict.reversibility.explanation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <strong className="text-slate-900 dark:text-white block font-bold">
                  Recommended Exit Strategy:
                </strong>
                <p>{verdict.reversibility.exitStrategy}</p>
              </div>
            </div>

            {/* Devil's Advocate */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                Devil's Advocate Stress Test
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Challenging {verdict.devilsAdvocate.challengingOption}
                </h4>
                <blockquote className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic border-l-2 border-rose-500 pl-3 leading-relaxed">
                  "{verdict.devilsAdvocate.counterArgument}"
                </blockquote>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Questions to test your conviction:
                </span>
                <ul className="space-y-1.5">
                  {verdict.devilsAdvocate.toughQuestions.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2"
                    >
                      <span className="text-rose-500 font-bold shrink-0">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Pros & Cons Matrix */}
      {activeTab === 'pros_cons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive Pros & Cons Balance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust item weights (1 to 5) or add your personal dealbreakers to see net scores update in real time.
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-200/50">
              Net Score = Sum of Pros - Sum of Cons
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {prosAndCons.map((optGroup, optIdx) => {
              const scores = calculateOptionProsConsScore(optGroup);
              const isWinner = optGroup.optionName === verdict.winner;

              return (
                <div
                  key={optGroup.optionName}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                    isWinner
                      ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  } p-6 space-y-6 flex flex-col justify-between`}
                >
                  <div>
                    {/* Option Header & Score */}
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {optGroup.optionName}
                          </h4>
                          {isWinner && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Top Pick
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {optGroup.pros.length} Pros vs {optGroup.cons.length} Cons
                        </span>
                      </div>

                      {/* Net Score Pill */}
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300 block">
                          Net Score
                        </span>
                        <span
                          className={`text-xl font-extrabold ${
                            scores.netScore >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {scores.netScore > 0 ? `+${scores.netScore}` : scores.netScore}
                        </span>
                      </div>
                    </div>

                    {/* Pros List */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Pros (+{scores.prosSum} pts)
                        </span>
                        <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300">
                          Importance Weight
                        </span>
                      </div>

                      <div className="space-y-2">
                        {optGroup.pros.map((pro) => (
                          <div
                            key={pro.id}
                            className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  {pro.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {pro.impact}
                                </span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 font-medium">
                                {pro.text}
                              </p>
                            </div>

                            {/* Weight Stepper */}
                            <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={() => handleWeightChange(optIdx, 'pros', pro.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                                {pro.weight}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleWeightChange(optIdx, 'pros', pro.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(optIdx, 'pros', pro.id)}
                                className="ml-1 text-slate-400 hover:text-rose-500"
                                title="Delete pro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cons List */}
                    <div className="mt-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Cons (-{scores.consSum} pts)
                        </span>
                        <span className="text-[11px] font-normal text-slate-600 dark:text-slate-300">
                          Severity Weight
                        </span>
                      </div>

                      <div className="space-y-2">
                        {optGroup.cons.map((con) => (
                          <div
                            key={con.id}
                            className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                                  {con.category}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                  {con.impact}
                                </span>
                              </div>
                              <p className="text-slate-800 dark:text-slate-200 font-medium">
                                {con.text}
                              </p>
                            </div>

                            {/* Weight Stepper */}
                            <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                onClick={() => handleWeightChange(optIdx, 'cons', con.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
                              >
                                -
                              </button>
                              <span className="w-4 text-center font-bold text-rose-600 dark:text-rose-400">
                                {con.weight}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleWeightChange(optIdx, 'cons', con.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(optIdx, 'cons', con.id)}
                                className="ml-1 text-slate-400 hover:text-rose-500"
                                title="Delete con"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Add Custom Item Section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {!showAddCustom[optGroup.optionName] ? (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddCustom({ ...showAddCustom, [optGroup.optionName]: true })
                        }
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add a custom Pro or Con to this option
                      </button>
                    ) : (
                      <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add your own pro..."
                            value={customProText[optGroup.optionName] || ''}
                            onChange={(e) =>
                              setCustomProText({
                                ...customProText,
                                [optGroup.optionName]: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleAddCustomItem(optIdx, optGroup.optionName, 'pros')
                            }
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                          >
                            + Pro
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add your own con..."
                            value={customConText[optGroup.optionName] || ''}
                            onChange={(e) =>
                              setCustomConText({
                                ...customConText,
                                [optGroup.optionName]: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleAddCustomItem(optIdx, optGroup.optionName, 'cons')
                            }
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          >
                            + Con
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Comparison Table */}
      {activeTab === 'comparison' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-Option Comparison Scorecard
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Change criterion importance (Low, Medium, High, Dealbreaker) to recalculate the dynamic weighted leaderboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddCriterion(!showAddCriterion)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Criterion</span>
            </button>
          </div>

          {/* Form to add custom criterion */}
          {showAddCriterion && (
            <form
              onSubmit={handleAddCriterionSubmit}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3"
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Add New Evaluation Dimension
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Criterion Name (e.g. Parental Leave, Commute Time)"
                  value={newCriterionName}
                  onChange={(e) => setNewCriterionName(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Brief description or metric"
                  value={newCriterionDesc}
                  onChange={(e) => setNewCriterionDesc(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCriterion(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Dimension
                </button>
              </div>
            </form>
          )}

          {/* Leaderboard Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {rankedOptions.map((opt, rankIdx) => {
              const res = tableScoreResults[opt];
              return (
                <div
                  key={opt}
                  className={`p-3.5 rounded-xl border ${
                    rankIdx === 0
                      ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Rank #{rankIdx + 1}
                    </span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {res?.percentage || 0}% match
                    </span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate mt-1">
                    {opt}
                  </h5>
                  <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${res?.percentage || 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 font-bold w-1/3">Evaluation Criteria</th>
                  <th className="py-3 px-3 font-bold w-28">Importance</th>
                  {input.options.map((opt) => (
                    <th key={opt} className="py-3 px-3 font-bold">
                      {opt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonTable.criteria.map((crit) => (
                  <tr key={crit.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {crit.name}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {crit.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={crit.importance}
                        onChange={(e) =>
                          handleCriterionImportanceChange(
                            crit.id,
                            e.target.value as ImportanceWeight
                          )
                        }
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Low">Low (1x)</option>
                        <option value="Medium">Medium (2x)</option>
                        <option value="High">High (3x)</option>
                        <option value="Dealbreaker">Dealbreaker (5x)</option>
                      </select>
                    </td>
                    {input.options.map((opt) => {
                      const scoreData = crit.scores[opt] || { score: 5, note: 'Neutral' };
                      return (
                        <td key={opt} className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-black text-sm ${
                                  scoreData.score >= 8
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : scoreData.score >= 5
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {scoreData.score}/10
                              </span>
                              <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-current rounded-full"
                                  style={{ width: `${scoreData.score * 10}%` }}
                                />
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                              {scoreData.note}
                            </p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <strong className="text-slate-900 dark:text-white font-bold block mb-1">
              Comparison Takeaway:
            </strong>
            {comparisonTable.summary}
          </div>
        </div>
      )}

      {/* TAB 4: SWOT Analysis */}
      {activeTab === 'swot' && (
        <div className="space-y-6">
          {/* Option Selector for SWOT */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SWOT Strategic Grid
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Examine internal strengths & weaknesses alongside external opportunities & threats.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {input.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedSwotOption(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedSwotOption === opt
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* 2x2 SWOT Matrix */}
          {swot[selectedSwotOption] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths (Internal Positive) */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-800/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-black text-xs">
                    S
                  </span>
                  Strengths (Internal Advantages)
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {swot[selectedSwotOption].strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses (Internal Negative) */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 flex items-center justify-center font-black text-xs">
                    W
                  </span>
                  Weaknesses (Internal Vulnerabilities)
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {swot[selectedSwotOption].weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities (External Positive) */}
              <div className="bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl border border-sky-200/60 dark:border-sky-800/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-200 flex items-center justify-center font-black text-xs">
                    O
                  </span>
                  Opportunities (External Upside)
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {swot[selectedSwotOption].opportunities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-sky-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats (External Negative) */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-800/60 p-5 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 flex items-center justify-center font-black text-xs">
                    T
                  </span>
                  Threats (External Risks & Obstacles)
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {swot[selectedSwotOption].threats.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Strategic Advice Synthesis */}
          {swot[selectedSwotOption]?.strategicAdvice && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Strategic Action Playbook for {selectedSwotOption}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {swot[selectedSwotOption].strategicAdvice}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Coin Toss Intuition */}
      {activeTab === 'gut_check' && (
        <CoinTossView options={input.options} winnerOption={verdict.winner} />
      )}

      {/* TAB 6: 48-Hour Experiments */}
      {activeTab === 'experiments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Pre-Commitment Prototyping
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Low-Risk Experiments (Test Before You Leap)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
              Don't make irreversible leaps in the dark. Run these fast 48-72 hour micro-experiments to validate assumptions and gather real ground-truth data.
            </p>
          </div>

          <div className="space-y-4">
            {experiments.map((exp, idx) => {
              const isChecked = !!completedExperiments[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleExperiment(idx)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          isChecked
                            ? 'text-emerald-900 dark:text-emerald-200 line-through'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {exp.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                        {exp.timeline}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong>Concrete Action:</strong> {exp.action}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong>Target Learning:</strong> {exp.whatToLearn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating / Sticky What-If Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-5">
        <form onSubmit={handleWhatIfSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Ask The Tiebreaker: "What-If" Scenario Refinement
            </label>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={whatIfInput}
              onChange={(e) => setWhatIfInput(e.target.value)}
              disabled={isRefining}
              placeholder="e.g. What if they allow 2 days remote work? What if my commute is 45 minutes? Factor in moving next summer..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!whatIfInput.trim() || isRefining}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
            >
              {isRefining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Recalculating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Update Analysis</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
