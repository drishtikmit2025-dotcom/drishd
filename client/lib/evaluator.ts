export interface EvaluationBreakdown {
  completeness: number;
  clarity: number;
  differentiation: number;
  marketPotential: number;
  traction: number;
  feasibility: number;
  businessModel: number;
  professionalism: number;
}

export interface EvaluationResult {
  score: number;
  breakdown: EvaluationBreakdown;
  warnings: string[];
}

const hasNumbers = (s: string) => /\d/.test(s);
const sentenceCount = (s: string) => s.split(/[.!?]+/).filter(Boolean).length;
const wordCount = (s: string) => (s.match(/\b\w+\b/g) || []).length;
const avgSentenceLength = (s: string) => {
  const sc = sentenceCount(s);
  const wc = wordCount(s);
  return sc === 0 ? wc : wc / sc;
};
const repeatedCharsPenalty = (s: string) => (/([a-zA-Z0-9])\1{3,}/.test(s) ? 1 : 0);
const urlOnly = (s: string) => /^https?:\/\//i.test(s.trim()) && s.trim().split(/\s+/).length < 3;

const qualityScoreByLength = (text: string, min: number, good: number): number => {
  const len = (text || '').trim().length;
  if (len <= 0) return 0;
  if (len < min) return 0.2;
  if (len < good) return 0.7;
  return 1;
};

export const validateIdeaInput = (idea: any): string[] => {
  const issues: string[] = [];
  const title = idea.title || '';
  const tagline = idea.tagline || '';
  const problem = idea.problemStatement || '';
  const solution = idea.proposedSolution || '';
  const uniqueness = idea.uniqueness || '';

  const invalidPhrases = [/lorem\s+ipsum/i, /^test$/i, /^asdf$/i, /^qwerty$/i, /^12345+$/];
  const isGibberish = (s: string) => invalidPhrases.some((re) => re.test(s.trim()));
  const alphaRatio = (s: string) => {
    const letters = (s.match(/[a-z]/gi) || []).length;
    const total = s.length || 1;
    return letters / total;
  };

  if (!title.trim()) issues.push('Provide a clear, descriptive title.');
  if (alphaRatio(title) < 0.4) issues.push('Title must contain meaningful words, not just symbols or links.');
  if (!tagline.trim() || tagline.trim().length < 10) issues.push('Add a descriptive one-liner tagline (10+ chars).');
  if (!problem.trim() || problem.trim().length < 40) issues.push('Expand the problem statement (40+ chars).');
  if (!solution.trim() || solution.trim().length < 40) issues.push('Expand the proposed solution (40+ chars).');
  if (!uniqueness.trim() || uniqueness.trim().length < 20) issues.push('Describe what makes your solution unique (20+ chars).');

  if (urlOnly(problem) || urlOnly(solution)) issues.push('Problem/Solution must describe context, not only a link.');
  if (isGibberish(title) || isGibberish(tagline) || isGibberish(problem) || isGibberish(solution)) {
    issues.push('Remove placeholder or non-context content (e.g., lorem ipsum, test, 12345).');
  }
  if (repeatedCharsPenalty(problem + solution) > 0) issues.push('Avoid long repeated characters or spam-like content.');

  return issues;
};

export const evaluateIdea = (idea: any): EvaluationResult => {
  const title = idea.title || '';
  const tagline = idea.tagline || '';
  const problem = idea.problemStatement || '';
  const solution = idea.proposedSolution || '';
  const uniqueness = idea.uniqueness || '';
  const validation = idea.customerValidation || '';
  const marketSize = idea.marketSize || '';
  const stage = idea.stage || '';
  const businessModel = idea.businessModel || '';
  const demoUrl = idea.demoUrl || '';

  // Subscores 0..1
  const completeness = [title, tagline, problem, solution, uniqueness].filter((v) => v && v.trim().length > 0).length / 5;

  // Clarity from sentence length and structure
  const psAvg = avgSentenceLength(problem);
  const solAvg = avgSentenceLength(solution);
  const clarityRaw = (() => {
    const samples = [psAvg, solAvg].filter((n) => n > 0);
    if (samples.length === 0) return 0;
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    // Ideal average sentence length ~ 12-24 words
    if (avg < 8) return 0.5;
    if (avg <= 28) return 1.0;
    if (avg <= 40) return 0.7;
    return 0.4;
  })();
  const clarityPenalty = repeatedCharsPenalty(problem + solution) ? 0.2 : 0;
  const clarity = Math.max(0, clarityRaw - clarityPenalty);

  const differentiation = qualityScoreByLength(uniqueness, 20, 80);

  const marketPotential = /Large|>\s*\$?10B|10\s*B/i.test(marketSize)
    ? 1
    : /Medium|\$?1B\s*-\s*\$?10B/i.test(marketSize)
    ? 0.7
    : marketSize
    ? 0.4
    : 0.2;

  const traction = (() => {
    let t = 0;
    if (validation && validation.length > 20) t += 0.4;
    if (hasNumbers(validation)) t += 0.3; // metrics, users, MRR, etc.
    if (/users?|mrr|revenue|signup|waitlist|pilot|poC/i.test(validation)) t += 0.3;
    return Math.min(1, t);
  })();

  const feasibility = (() => {
    const map: Record<string, number> = {
      'Idea': 0.3,
      'Prototype': 0.6,
      'MVP Ready': 0.7,
      'Early Customers': 0.8,
      'Growth': 0.9,
      'Scaling': 1.0,
      'early-users': 0.75,
      'prototype': 0.6,
      'mvp': 0.7,
      'revenue': 0.9,
    };
    const s = map[stage] ?? map[stage.toLowerCase()] ?? 0.4;
    return demoUrl ? Math.min(1, s + 0.1) : s;
  })();

  const businessModelScore = businessModel ? 0.8 : 0.3;

  const professionalism = (() => {
    const text = [title, tagline, problem, solution, uniqueness].join(' ');
    const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
    const penalty = Math.min(0.4, allCapsWords * 0.05) + (urlOnly(tagline) ? 0.3 : 0) + repeatedCharsPenalty(text) * 0.3;
    return Math.max(0, 1 - penalty);
  })();

  // Weights sum to 1
  const weights = {
    completeness: 0.15,
    clarity: 0.15,
    differentiation: 0.15,
    marketPotential: 0.1,
    traction: 0.15,
    feasibility: 0.15,
    businessModel: 0.05,
    professionalism: 0.1,
  };

  const score0to1 =
    completeness * weights.completeness +
    clarity * weights.clarity +
    differentiation * weights.differentiation +
    marketPotential * weights.marketPotential +
    traction * weights.traction +
    feasibility * weights.feasibility +
    businessModelScore * weights.businessModel +
    professionalism * weights.professionalism;

  const breakdown: EvaluationBreakdown = {
    completeness,
    clarity,
    differentiation,
    marketPotential,
    traction,
    feasibility,
    businessModel: businessModelScore,
    professionalism,
  };

  const warnings: string[] = [];
  if (completeness < 0.6) warnings.push('Complete all required sections to improve score.');
  if (clarity < 0.6) warnings.push('Clarify problem and solution with concrete sentences and examples.');
  if (differentiation < 0.6) warnings.push('Explain how you differ from competitors more clearly.');
  if (traction < 0.5) warnings.push('Add customer validation or traction metrics.');

  const score = Math.max(0, Math.min(100, Math.round(score0to1 * 100)));
  return { score, breakdown, warnings };
};
