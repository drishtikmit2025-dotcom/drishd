import type { EvaluationInput } from './types';

// Try to use OpenAI if available and configured, otherwise provide a local heuristic evaluator
export async function evaluateIdeaWithAI(data: EvaluationInput) {
  // Attempt to use OpenAI SDK when API key is present
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const OpenAI = await import('openai');
      const client = new OpenAI.OpenAI({ apiKey });

      const prompt = `You are a startup evaluator AI. Analyze this startup idea based on real-world success potential. Provide a detailed analysis and a numeric score (0–100). Return a JSON object strictly in this format: { "totalScore": number, "breakdown": { "problem": number, "solution": number, "uniqueness": number, "market": number, "team": number, "viability": number }, "suggestions": [string] }\n\nIdea details:\n- Title: ${data.title}\n- Tagline: ${data.tagline}\n- Problem: ${data.problemStatement}\n- Proposed Solution: ${data.proposedSolution}\n- Uniqueness: ${data.uniqueness}\n- Customer Validation: ${data.customerValidation}\n- Market Size: ${data.marketSize}\n- Category: ${data.category}\n- Team Background: ${data.teamBackground || 'Not provided'}`;

      // Use chat completion
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a startup evaluator AI.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const responseText = completion.choices?.[0]?.message?.content?.trim() || 'null';
      try {
        const parsed = JSON.parse(responseText);
        // Basic validation
        if (parsed && typeof parsed.totalScore === 'number') return parsed;
      } catch (err) {
        console.error('Error parsing AI response as JSON:', err);
      }
    } catch (err) {
      console.error('OpenAI evaluation failed, falling back to heuristic:', err);
    }
  }

  // Use a modular, transparent holistic evaluator as a fallback
  function holisticEvaluator(d: any) {
    // Map market size to normalized categories
    const marketSizeRaw = d.marketSize || '';
    const mapMarket = (m: string) => {
      if (/large/i.test(m) || />\s*\$?10B/i.test(m)) return 'Large (> $10B)';
      if (/medium/i.test(m) || /1B/i.test(m)) return 'Medium ($1B-$10B)';
      return 'Small (< $1B)';
    };

    const input = {
      title: d.title || '',
      tagline: d.tagline || '',
      problemStatement: d.problemStatement || '',
      proposedSolution: d.proposedSolution || '',
      uniqueness: d.uniqueness || '',
      customerValidation: d.customerValidation || '',
      teamBackground: d.teamBackground || '',
      marketSize: mapMarket(marketSizeRaw),
      category: d.category || '',
      businessModel: d.businessModel || '',
      ethicalRisk: !!d.ethicalRisk,
      feasibilityRisk: !!d.feasibilityRisk,
    };

    // ----- IDEA QUALITY -----
    const problemScore = input.problemStatement.length > 50 ? 18 : 10;
    const solutionScore = input.proposedSolution.length > 50 ? 18 : 10;
    const uniquenessScore = input.uniqueness.length > 50 ? 12 : 5;
    const marketScore = input.marketSize === 'Large (> $10B)' ? 20
      : input.marketSize === 'Medium ($1B-$10B)' ? 15
      : 5;

    const ideaScore = problemScore + solutionScore + uniquenessScore + marketScore; // max ~70-80

    // ----- EXECUTION READINESS -----
    const execProblem = input.problemStatement.length > 50 ? 10 : 5;
    const execSolution = input.proposedSolution.length > 50 ? 10 : 5;
    const execValidation = input.customerValidation.length > 30 ? 10 : 5;
    const execTeam = input.teamBackground && input.teamBackground.length > 50 ? 10 : 5;
    const execBusiness = input.businessModel ? 10 : 5;

    const executionScore = execProblem + execSolution + execValidation + execTeam + execBusiness; // max ~50

    // ----- PENALTIES -----
    let penalties = 0;
    if (input.ethicalRisk) penalties += 20;
    if (input.feasibilityRisk) penalties += 10;
    if (!input.title || input.title.trim().length < 5) penalties += 5;
    if (!input.tagline || input.tagline.trim().length < 10) penalties += 5;

    // ----- WEIGHTED TOTAL -----
    const totalScore = Math.max(0, Math.min(100, Math.round((ideaScore * 0.55) + (executionScore * 0.45) - penalties)));

    const suggestions = [
      !input.customerValidation || input.customerValidation.length < 30 ? 'Add customer validation (interviews, pilots, metrics).' : '',
      !input.teamBackground || input.teamBackground.length < 50 ? 'Provide more details on the team and experience.' : '',
      !input.businessModel ? 'Clarify your business model.' : '',
    ].filter(Boolean);

    return {
      totalScore,
      breakdown: {
        idea: ideaScore,
        execution: executionScore,
        penalties,
      },
      suggestions,
    };
  }

  const fallback = holisticEvaluator(data);
  return { totalScore: fallback.totalScore, breakdown: fallback.breakdown, suggestions: fallback.suggestions } as any;
}
