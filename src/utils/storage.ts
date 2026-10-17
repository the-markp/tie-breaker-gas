import { DecisionAnalysis } from '../types/decision';

const STORAGE_KEY = 'tiebreaker_saved_decisions_v1';

export function getSavedDecisions(): DecisionAnalysis[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load decisions from localStorage', e);
    return [];
  }
}

export function saveDecision(decision: DecisionAnalysis): void {
  try {
    const existing = getSavedDecisions();
    const index = existing.findIndex((d) => d.id === decision.id);
    if (index >= 0) {
      existing[index] = decision;
    } else {
      existing.unshift(decision);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save decision to localStorage', e);
  }
}

export function deleteDecision(id: string): void {
  try {
    const existing = getSavedDecisions();
    const filtered = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete decision from localStorage', e);
  }
}

export function generateMarkdownReport(decision: DecisionAnalysis): string {
  const { input, verdict, prosAndCons, comparisonTable, swot, experiments } = decision;

  let md = `# The Tiebreaker Decision Brief\n\n`;
  md += `**Decision Question:** ${input.title}\n`;
  md += `**Date:** ${new Date(decision.createdAt).toLocaleDateString()}\n`;
  md += `**Options Evaluated:** ${input.options.join(' vs ')}\n\n`;

  md += `## ⚖️ Official Verdict: ${verdict.winner}\n`;
  md += `**Confidence:** ${verdict.confidence}%\n\n`;
  md += `> ${verdict.headline}\n\n`;
  md += `### The Core Crux\n${verdict.theCrux}\n\n`;

  md += `### Key Rationale\n`;
  verdict.rationale.forEach((r) => {
    md += `- ${r}\n`;
  });
  md += `\n`;

  md += `### 10-10-10 Perspective\n`;
  md += `- **In 10 Minutes:** ${verdict.tenTenTen.tenMinutes}\n`;
  md += `- **In 10 Months:** ${verdict.tenTenTen.tenMonths}\n`;
  md += `- **In 10 Years:** ${verdict.tenTenTen.tenYears}\n\n`;

  md += `### Reversibility (${verdict.reversibility.doorType})\n`;
  md += `${verdict.reversibility.explanation}\n`;
  md += `**Exit Strategy:** ${verdict.reversibility.exitStrategy}\n\n`;

  md += `### Devil's Advocate Challenge\n`;
  md += `> "${verdict.devilsAdvocate.counterArgument}"\n\n`;
  md += `*Questions to ask yourself:*\n`;
  verdict.devilsAdvocate.toughQuestions.forEach((q) => {
    md += `- ${q}\n`;
  });
  md += `\n`;

  md += `## 📋 Pros & Cons Breakdown\n\n`;
  prosAndCons.forEach((opt) => {
    md += `### ${opt.optionName}\n`;
    md += `**Pros:**\n`;
    opt.pros.forEach((p) => {
      md += `- [Weight: ${p.weight}/5] **${p.category}:** ${p.text} (${p.impact})\n`;
    });
    md += `\n**Cons:**\n`;
    opt.cons.forEach((c) => {
      md += `- [Weight: -${c.weight}/5] **${c.category}:** ${c.text} (${c.impact})\n`;
    });
    md += `\n`;
  });

  md += `## 📊 Comparison Matrix\n\n`;
  md += `| Criteria | Importance | ` + input.options.map((o) => `${o}`).join(' | ') + ` |\n`;
  md += `| :--- | :--- | ` + input.options.map(() => `:---`).join(' | ') + ` |\n`;
  comparisonTable.criteria.forEach((crit) => {
    const scoresCol = input.options
      .map((o) => {
        const s = crit.scores[o];
        return s ? `${s.score}/10 (${s.note})` : 'N/A';
      })
      .join(' | ');
    md += `| **${crit.name}** | ${crit.importance} | ${scoresCol} |\n`;
  });
  md += `\n*Summary:* ${comparisonTable.summary}\n\n`;

  md += `## 🧭 SWOT Analysis\n\n`;
  Object.entries(swot).forEach(([optName, data]) => {
    md += `### SWOT for: ${optName}\n`;
    md += `- **Strengths:** ${data.strengths.join('; ')}\n`;
    md += `- **Weaknesses:** ${data.weaknesses.join('; ')}\n`;
    md += `- **Opportunities:** ${data.opportunities.join('; ')}\n`;
    md += `- **Threats:** ${data.threats.join('; ')}\n`;
    md += `**Strategic Advice:** ${data.strategicAdvice}\n\n`;
  });

  md += `## 🚀 48-Hour Low-Risk Experiments\n\n`;
  experiments.forEach((exp, idx) => {
    md += `${idx + 1}. **${exp.title}** (${exp.timeline})\n`;
    md += `   - Action: ${exp.action}\n`;
    md += `   - Goal: ${exp.whatToLearn}\n`;
  });

  return md;
}
