import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  Plus,
  Trash2,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  Clock,
  ShieldAlert,
  Compass,
  Check,
} from 'lucide-react';
import { DecisionInput, UrgencyLevel, RiskTolerance } from '../types/decision';
import { DECISION_PRESETS, DecisionPreset } from '../data/presets';

interface DecisionFormProps {
  onSubmit: (input: DecisionInput) => void;
  isLoading: boolean;
}

const COMMON_PRIORITIES = [
  'Work-Life Balance',
  'Compensation & Wealth',
  'Career Acceleration',
  'Low Day-to-Day Stress',
  'Autonomy & Freedom',
  'Job / Financial Security',
  'Learning & Mentorship',
  'Family & Relationships',
  'Geographic Flexibility',
  'Reversibility (Two-Way Door)',
];

export const DecisionForm: React.FC<DecisionFormProps> = ({ onSubmit, isLoading }) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [priorities, setPriorities] = useState<string[]>(['Career Acceleration', 'Work-Life Balance']);
  const [customPriority, setCustomPriority] = useState('');
  const [context, setContext] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('balanced');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle Preset selection
  const handleSelectPreset = (preset: DecisionPreset) => {
    setTitle(preset.title);
    setOptions([...preset.options]);
    setPriorities([...preset.priorities]);
    setContext(preset.context);
    setUrgency(preset.urgency);
    setRiskTolerance(preset.riskTolerance);
  };

  // Option management
  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  // Priority tag toggling
  const togglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((item) => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const addCustomPriority = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPriority.trim();
    if (trimmed && !priorities.includes(trimmed)) {
      setPriorities([...priorities, trimmed]);
      setCustomPriority('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return;
    if (cleanOptions.length < 2) return;

    const inputData: DecisionInput = {
      id: `dec_${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: title.trim(),
      options: cleanOptions,
      priorities,
      context: context.trim(),
      urgency,
      riskTolerance,
    };

    onSubmit(inputData);
  };

  const isSubmitDisabled = !title.trim() || options.filter((o) => o.trim()).length < 2 || isLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Intro */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-3">
          <Compass className="w-3.5 h-3.5" />
          The Science of Clear Decisions
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Break the deadlock. Make the right call.
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Feed in your dilemma. The Tiebreaker rigorously breaks down Pros & Cons, generates multi-criteria scorecards, maps SWOT matrices, and delivers a definitive verdict.
        </p>

        {/* Quick Inspiration Presets */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5">
            Or try a sample dilemma:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DECISION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <span>{preset.badge}:</span>
                <span className="font-semibold">{preset.options[0].split('(')[0].trim()} vs {preset.options[1].split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8 space-y-6"
      >
        {/* Step 1: Decision Question */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
            1. What decision are you wrestling with? <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Should I accept the startup offer or stay at my stable corporate job?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all"
          />
        </div>

        {/* Step 2: Options */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
              2. What are your competing options? <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Minimum 2, up to 5 options
            </span>
          </div>

          <div className="space-y-3">
            {options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
                  {String.fromCharCode(65 + idx)}
                </span>
                <input
                  type="text"
                  required
                  value={option}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={
                    idx === 0
                      ? 'e.g. Accept Series B Startup Offer'
                      : idx === 1
                      ? 'e.g. Stay at Enterprise Tech Company'
                      : `e.g. Alternative Option ${String.fromCharCode(65 + idx)}`
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Remove this option"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {options.length < 5 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add another alternative option
            </button>
          )}
        </div>

        {/* Step 3: Priorities & Core Values */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5">
            3. What matters most to you in this decision?
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            Select the factors you value most. The AI will weight these heavily in the comparison table and tiebreaker verdict.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_PRIORITIES.map((p) => {
              const selected = priorities.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePriority(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 stroke-[3]" />}
                  {p}
                </button>
              );
            })}
          </div>

          {/* Custom priority adder */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customPriority}
              onChange={(e) => setCustomPriority(e.target.value)}
              placeholder="Add your own custom priority (e.g. Relocating near parents)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomPriority(e);
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomPriority}
              disabled={!customPriority.trim()}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 transition-colors"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Step 4: Background Context & Constraints */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-bold text-slate-900 dark:text-slate-100">
              4. Key Details, Numbers & Personal Context (Optional)
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              The more context, the sharper the advice
            </span>
          </div>
          <textarea
            rows={3}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Salary difference is $30k. My current commute is 15 mins, startup is 45 mins. I have a 6-month emergency fund. My current manager is supportive, but company revenue is down 10%..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all resize-y"
          />
        </div>

        {/* Advanced Options Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {showAdvanced ? 'Hide fine-tuning parameters' : 'Customize urgency & risk tolerance'}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Decision Urgency
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setUrgency(level)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                        urgency === level
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                  Risk Profile
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['conservative', 'balanced', 'aggressive'] as RiskTolerance[]).map((profile) => (
                    <button
                      key={profile}
                      type="button"
                      onClick={() => setRiskTolerance(profile)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                        riskTolerance === profile
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {profile}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-700 hover:to-sky-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Weighing Pros & Cons, SWOT & Calculating Verdict...</span>
              </>
            ) : (
              <>
                <Scale className="w-5 h-5" />
                <span>Break The Tie With AI</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
