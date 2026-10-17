import { DecisionInput } from '../types/decision';

export interface DecisionPreset {
  id: string;
  badge: string;
  title: string;
  options: string[];
  priorities: string[];
  context: string;
  urgency: 'low' | 'medium' | 'high';
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
}

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: 'career_startup_vs_corp',
    badge: 'Career Crossroads',
    title: 'Should I join a Series B startup or stay at my stable tech job?',
    options: ['Join Series B Startup ($165k + 0.4% Equity)', 'Stay at Large Tech Enterprise ($195k + Stable RSUs)'],
    priorities: ['Rapid Career Acceleration', 'Autonomy & Impact', 'Financial Upside', 'Work-Life Balance', 'Reversibility'],
    context: '5 years in engineering. Startup has 28 months runway and top-tier tier-1 VCs. Enterprise role is 35 hrs/wk with great benefits, but legacy stack and slow promotions.',
    urgency: 'high',
    riskTolerance: 'balanced',
  },
  {
    id: 'finance_buy_vs_rent',
    badge: 'Real Estate & Wealth',
    title: 'Should I buy a home now or continue renting and investing?',
    options: ['Buy 3-Bed Townhome ($550k, 20% down)', 'Keep Renting ($2,400/mo) & Max Index Funds'],
    priorities: ['Wealth Accumulation', 'Geographic Mobility', 'Predictable Costs', 'Family Future', 'Peace of Mind'],
    context: 'Current mortgage rates are ~6.5%. Planning for kids in 2-3 years. HOA is $280/mo. Savings currently earn 5% in high-yield and equities.',
    urgency: 'medium',
    riskTolerance: 'conservative',
  },
  {
    id: 'life_relocation',
    badge: 'Lifestyle & Relocation',
    title: 'Should I relocate to Seattle or remain in Austin?',
    options: ['Relocate to Seattle, WA', 'Stay in Austin, TX'],
    priorities: ['Outdoor Access & Mountains', 'Tech Job Market Depth', 'Cost of Living', 'Friendship Circle', 'Climate/Weather'],
    context: 'Remote job allows moving anywhere. Love hiking and cooler weather, but Seattle is 25% pricier with gray winters. Austin has friends and warm summers.',
    urgency: 'medium',
    riskTolerance: 'balanced',
  },
  {
    id: 'education_mba_vs_bootcamp',
    badge: 'Skill & Education',
    title: 'Should I get a 2-year full-time MBA or transition internally into Product?',
    options: ['Enroll in Top-15 MBA Program', 'Self-Directed Internal Product Transfer'],
    priorities: ['High Brand Prestige', 'Zero Tuition Debt', 'Speed to Senior Role', 'Alumni Network', 'Practical Experience'],
    context: 'Tuition + living expenses = $160k debt vs staying employed earning $110k while shadowing PMs and taking Coursera/Reforge.',
    urgency: 'low',
    riskTolerance: 'aggressive',
  },
];
