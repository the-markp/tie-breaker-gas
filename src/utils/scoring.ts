import { DecisionAnalysis, ComparisonCriterion, OptionProsCons } from '../types/decision';

export const IMPORTANCE_MULTIPLIERS = {
  Low: 1,
  Medium: 2,
  High: 3,
  Dealbreaker: 5,
};

export function calculateOptionProsConsScore(option: OptionProsCons): {
  prosSum: number;
  consSum: number;
  netScore: number;
} {
  const prosSum = option.pros.reduce((acc, item) => acc + (item.weight || 3), 0);
  const consSum = option.cons.reduce((acc, item) => acc + (item.weight || 3), 0);
  return {
    prosSum,
    consSum,
    netScore: prosSum - consSum,
  };
}

export function calculateTableScores(
  criteria: ComparisonCriterion[],
  options: string[]
): Record<string, { totalWeighted: number; maxPossible: number; percentage: number }> {
  const results: Record<string, { totalWeighted: number; maxPossible: number; percentage: number }> = {};

  let totalWeightSum = 0;
  criteria.forEach((crit) => {
    const mult = IMPORTANCE_MULTIPLIERS[crit.importance] || 2;
    totalWeightSum += mult * 10;
  });

  options.forEach((opt) => {
    let weightedScore = 0;
    criteria.forEach((crit) => {
      const mult = IMPORTANCE_MULTIPLIERS[crit.importance] || 2;
      const scoreObj = crit.scores[opt];
      const rawScore = scoreObj ? scoreObj.score : 5;
      weightedScore += rawScore * mult;
    });

    const percentage = totalWeightSum > 0 ? Math.round((weightedScore / totalWeightSum) * 100) : 0;
    results[opt] = {
      totalWeighted: weightedScore,
      maxPossible: totalWeightSum,
      percentage,
    };
  });

  return results;
}
