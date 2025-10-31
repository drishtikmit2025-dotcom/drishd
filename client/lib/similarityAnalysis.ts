// Utility for analyzing idea similarity

export interface SimilarityScore {
  ideaId: string;
  score: number;
  similarities: string[];
  idea: any;
}

// Keywords to extract from text for similarity analysis
const extractKeywords = (text: string): string[] => {
  if (!text) return [];
  
  // Common words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
    'its', 'our', 'their', 'am', 'do', 'does', 'did', 'get', 'go', 'make', 'take', 'come', 'see'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 20); // Limit to top 20 keywords
};

// Calculate similarity between two sets of keywords
const calculateKeywordSimilarity = (keywords1: string[], keywords2: string[]): number => {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size; // Jaccard similarity
};

// Find similar ideas based on multiple criteria
export const findSimilarIdeas = (
  submittedIdea: any,
  allIdeas: any[],
  maxResults: number = 6
): SimilarityScore[] => {
  const submittedKeywords = [
    ...extractKeywords(submittedIdea.title || ''),
    ...extractKeywords(submittedIdea.tagline || ''),
    ...extractKeywords(submittedIdea.problemStatement || ''),
    ...extractKeywords(submittedIdea.proposedSolution || '')
  ];

  const similarities: SimilarityScore[] = allIdeas
    .filter(idea => (idea.id || idea._id) !== (submittedIdea.id || submittedIdea._id))
    .map(idea => {
      const ideaKeywords = [
        ...extractKeywords(idea.title || ''),
        ...extractKeywords(idea.tagline || ''),
        ...extractKeywords(idea.description || ''),
        ...extractKeywords(idea.problemStatement || ''),
        ...extractKeywords(idea.proposedSolution || '')
      ];

      let score = 0;
      const reasons: string[] = [];

      // 1. Category similarity (40% weight)
      if (submittedIdea.category === idea.category) {
        score += 0.4;
        reasons.push(`Same category: ${idea.category}`);
      }

      // 2. Keyword similarity (30% weight)
      const keywordSim = calculateKeywordSimilarity(submittedKeywords, ideaKeywords);
      score += keywordSim * 0.3;
      if (keywordSim > 0.1) {
        const commonKeywords = submittedKeywords.filter(kw => ideaKeywords.includes(kw));
        if (commonKeywords.length > 0) {
          reasons.push(`Similar keywords: ${commonKeywords.slice(0, 3).join(', ')}`);
        }
      }

      // 3. Target audience similarity (15% weight)
      if (submittedIdea.targetAudience === idea.targetAudience) {
        score += 0.15;
        reasons.push(`Same target audience: ${idea.targetAudience}`);
      }

      // 4. Stage similarity (10% weight)
      if (submittedIdea.stage === idea.stage) {
        score += 0.1;
        reasons.push(`Same development stage: ${idea.stage}`);
      }

      // 5. Business model similarity (5% weight)
      if (submittedIdea.businessModel === idea.businessModel) {
        score += 0.05;
        reasons.push(`Same business model: ${idea.businessModel}`);
      }

      return {
        ideaId: idea.id || idea._id,
        score,
        similarities: reasons,
        idea
      };
    })
    .filter(result => result.score > 0.1) // Only include ideas with meaningful similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return similarities;
};

// Get similarity color based on score
export const getSimilarityColor = (score: number): string => {
  if (score >= 0.7) return 'text-red-600'; // Very similar
  if (score >= 0.5) return 'text-orange-600'; // Moderately similar
  if (score >= 0.3) return 'text-yellow-600'; // Somewhat similar
  return 'text-green-600'; // Low similarity
};

// Get similarity label based on score
export const getSimilarityLabel = (score: number): string => {
  if (score >= 0.7) return 'Very Similar';
  if (score >= 0.5) return 'Moderately Similar';
  if (score >= 0.3) return 'Somewhat Similar';
  return 'Loosely Related';
};
