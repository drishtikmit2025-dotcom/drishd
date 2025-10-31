export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','will','would','could','should','may','might','can','this','that','these','those','i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','her','its','our','their','am','do','does','did','get','go','make','take','come','see'
  ]);
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 30);
};

export const generateSWOT = (idea: any): SWOTAnalysis => {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  const title = idea.title || '';
  const tagline = idea.tagline || '';
  const problem = idea.problemStatement || '';
  const solution = idea.proposedSolution || '';
  const uniqueness = idea.uniqueness || '';
  const marketSize = idea.marketSize || '';
  const competitors = idea.competitors || '';
  const validation = idea.customerValidation || '';
  const stage = idea.stage || '';
  const category = idea.category || '';
  const audience = idea.targetAudience || '';
  const businessModel = idea.businessModel || '';
  const demoUrl = idea.demoUrl || '';

  const keywords = [
    ...extractKeywords(title),
    ...extractKeywords(tagline),
    ...extractKeywords(problem),
    ...extractKeywords(solution),
    ...extractKeywords(uniqueness)
  ];

  // Strengths
  if (uniqueness.length > 30) strengths.push(`Clear differentiation: ${uniqueness.substring(0, 120)}${uniqueness.length > 120 ? '…' : ''}`);
  if (problem.length > 80 && solution.length > 80) strengths.push('Strong problem-solution articulation with tangible context');
  if (/Large|>\s*\$?10B/i.test(marketSize)) strengths.push('Large market potential with room for scale');
  if (validation.length > 20) strengths.push('Early customer validation provides confidence');
  if (demoUrl) strengths.push('Prototype/demo available for investor evaluation');
  if (businessModel) strengths.push(`Defined business model: ${businessModel}`);
  if (audience) strengths.push(`Well-defined target audience: ${audience}`);

  // Weaknesses
  if (!validation) weaknesses.push('Limited customer validation provided');
  if (!demoUrl && /Idea|Prototype/i.test(stage)) weaknesses.push('Early stage without demo link may slow investor confidence');
  if (!uniqueness || uniqueness.length < 20) weaknesses.push('Differentiation from competitors not strongly articulated');
  if (!businessModel) weaknesses.push('Business model not specified');

  // Opportunities
  if (category) opportunities.push(`Growing opportunity in ${category}`);
  if (/AI|machine learning|ml|automation/i.test(keywords.join(' '))) opportunities.push('Tailwinds from rapid AI ecosystem growth');
  if (/sustainab|green|climate|energy/i.test(keywords.join(' '))) opportunities.push('ESG and sustainability investment interest');
  if (/health|medic|therapy|mental/i.test(keywords.join(' '))) opportunities.push('Rising demand for digital health solutions');
  if (/education|edtech|learning/i.test(keywords.join(' '))) opportunities.push('Increased appetite for modern education platforms');
  if (audience === 'Enterprises') opportunities.push('Potential for high contract ACVs in enterprise segment');

  // Threats
  if (competitors && competitors.length > 10) threats.push('Competitive landscape exists; need clear moat');
  if (/fintech|payments|bank|lending|insurance/i.test(category)) threats.push('Regulatory and compliance hurdles in FinTech');
  if (/health/i.test(category)) threats.push('Clinical validation and regulatory approvals may be required');
  if (/ai|ml/i.test(keywords.join(' '))) threats.push('Data privacy, bias, and model drift risks in AI systems');
  if (/marketplace/i.test(businessModel)) threats.push('Chicken-and-egg dynamics for marketplace liquidity');

  // Ensure minimum content in each section
  const ensure = (arr: string[], fallback: string) => {
    if (arr.length === 0) arr.push(fallback);
  };

  ensure(strengths, 'Compelling narrative and potential for differentiation');
  ensure(weaknesses, 'Key risks not fully articulated');
  ensure(opportunities, 'Emerging market dynamics to leverage');
  ensure(threats, 'Execution and external risks to monitor');

  return { strengths, weaknesses, opportunities, threats };
};
