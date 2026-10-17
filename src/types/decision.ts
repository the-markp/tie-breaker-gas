export type UrgencyLevel = 'low' | 'medium' | 'high';
export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';
export type ImportanceWeight = 'Low' | 'Medium' | 'High' | 'Dealbreaker';

export interface DecisionInput {
  id: string;
  createdAt: string;
  title: string;
  options: string[];
  priorities: string[];
  context: string;
  urgency: UrgencyLevel;
  riskTolerance: RiskTolerance;
}

export interface ProConItem {
  id: string;
  text: string;
  category: string;
  weight: number; // 1 to 5
  impact: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  isCustom?: boolean;
}

export interface OptionProsCons {
  optionName: string;
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface ComparisonCriterion {
  id: string;
  name: string;
  description: string;
  importance: ImportanceWeight;
  scores: Record<string, { score: number; note: string }>;
}

export interface SWOTSection {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicAdvice: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  input: DecisionInput;
  verdict: {
    winner: string;
    confidence: number;
    headline: string;
    theCrux: string;
    rationale: string[];
    tenTenTen: {
      tenMinutes: string;
      tenMonths: string;
      tenYears: string;
    };
    devilsAdvocate: {
      challengingOption: string;
      counterArgument: string;
      toughQuestions: string[];
    };
    reversibility: {
      doorType: 'Type 1 (One-Way Door)' | 'Type 2 (Two-Way Door)';
      explanation: string;
      exitStrategy: string;
    };
  };
  prosAndCons: OptionProsCons[];
  comparisonTable: {
    criteria: ComparisonCriterion[];
    summary: string;
  };
  swot: Record<string, SWOTSection>;
  experiments: Array<{
    title: string;
    timeline: string;
    action: string;
    whatToLearn: string;
  }>;
  userSelectedWinner?: string;
  status?: 'evaluating' | 'decided';
  decisionNotes?: string;
}
