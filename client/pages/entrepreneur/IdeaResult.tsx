import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SimilarIdeas from '@/components/SimilarIdeas';
import SwotAnalysis from '@/components/SwotAnalysis';
import { evaluateIdea, EvaluationResult } from '@/lib/evaluator';
import { findSimilarIdeas, SimilarityScore } from '@/lib/similarityAnalysis';
import { generateSWOT, SWOTAnalysis } from '@/lib/pitch';
import { ideasApi } from '@/lib/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function IdeaResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateIdea = (location.state as any)?.idea;
  const [idea, setIdea] = useState<any | null>(stateIdea || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [swot, setSwot] = useState<SWOTAnalysis | null>(null);
  const [similarIdeas, setSimilarIdeas] = useState<SimilarityScore[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiSimilar, setAiSimilar] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // If we were given idea data via navigation state (SPA flow / offline), use that and skip server fetch
      if (stateIdea) {
        if (!mounted) return;
        const fetched = stateIdea;
        setIdea(fetched);
        const evalResult = evaluateIdea(fetched);
        setEvaluation(evalResult);
        const sw = generateSWOT(fetched);
        setSwot(sw);
        // Try to fetch all ideas for similarity but ignore failures (offline)
        try {
          const allResp = await ideasApi.getAll({});
          const allIdeas = allResp.ideas || [];
          const sims = findSimilarIdeas(fetched, allIdeas, 6);
          setSimilarIdeas(sims);
        } catch (e) {
          // ignore
        }
        setLoading(false);
        return;
      }

      if (!id) return;

      // If there's no auth token (static/local build), avoid calling API to prevent Access denied errors
      const token = localStorage.getItem('drishti_token');
      if (!token) {
        try {
          const local = JSON.parse(localStorage.getItem('local_ideas') || '[]');
          const found = (local || []).find((it: any) => (it._id || it.id) === id || String(it._id || it.id) === String(id));
          if (found) {
            if (!mounted) return;
            setIdea(found);
            const evalResult = evaluateIdea(found);
            setEvaluation(evalResult);
            const sw = generateSWOT(found);
            setSwot(sw);
            // attempt similar ideas from local list
            const sims = findSimilarIdeas(found, local || [], 6);
            setSimilarIdeas(sims);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Local storage lookup failed', e);
        }

        // No token and not found locally
        setError('Access denied. No token provided.');
        toast.error('Access denied. No token provided.');
        setLoading(false);
        return;
      }

      try {
        const res = await ideasApi.getById(id as string);
        if (!mounted) return;
        const fetched = res.idea;
        if (!fetched) {
          setError('Idea not found');
          toast.error('Idea not found');
          return;
        }
        setIdea(fetched);

        // Client-side evaluation
        const evalResult = evaluateIdea(fetched);
        setEvaluation(evalResult);

        // SWOT
        const sw = generateSWOT(fetched);
        setSwot(sw);

        // Similar ideas
        const allResp = await ideasApi.getAll({});
        const allIdeas = allResp.ideas || [];
        const sims = findSimilarIdeas(fetched, allIdeas, 6);
        setSimilarIdeas(sims);

        // Fetch AI-powered suggestions and similar market ideas from server
        try {
          const aiResp = await ideasApi.aiReview(id as string);
          if (!mounted) return;
          setAiSuggestions(aiResp.suggestions || []);
          setAiSimilar(aiResp.similarIdeas || []);

          // If AI provided a review with a numeric totalScore, prefer it over heuristics
          const review = aiResp.review;
          const totalScore = review?.totalScore ?? review?.totalScore ?? review?.totalScore;
          if (typeof totalScore === 'number') {
            // Normalize breakdown values to 0..1
            const raw = review.breakdown || {};
            const normalize = (v: any) => {
              if (v === undefined || v === null) return 0;
              const n = Number(v);
              if (isNaN(n)) return 0;
              if (n > 1) return Math.min(1, n / 100);
              return Math.max(0, Math.min(1, n));
            };

            const mappedBreakdown = {
              completeness: normalize(raw.completeness ?? ((raw.problem || 0) + (raw.solution || 0)) / 2),
              clarity: normalize(raw.clarity ?? raw.problemClarity ??  ((raw.problem || 0) * 0.5 + (raw.solution || 0) * 0.5)),
              differentiation: normalize(raw.uniqueness ?? raw.unique ?? raw.differentiation),
              marketPotential: normalize(raw.market ?? raw.marketPotential),
              traction: normalize(raw.traction ?? raw.momentum ?? 0),
              feasibility: normalize(raw.viability ?? raw.feasibility),
              businessModel: normalize(raw.businessModel ?? raw.model ?? 0),
              professionalism: normalize(raw.team ?? raw.professionalism ?? 0),
            };

            const expectedKeys = ['completeness','clarity','differentiation','marketPotential','traction','feasibility','businessModel','professionalism'];
            const hasDetailed = expectedKeys.some(k => raw[k] !== undefined);

            if (hasDetailed) {
              setEvaluation({ score: Math.round(totalScore), breakdown: mappedBreakdown, warnings: review.warnings || [] });
            } else {
              // Keep existing breakdown (from client-side heuristic) but update score
              setEvaluation((prev) => {
                const currentBreakdown = prev?.breakdown ?? evaluateIdea(fetched).breakdown;
                return { score: Math.round(totalScore), breakdown: currentBreakdown, warnings: review.warnings || prev?.warnings || [] };
              });
            }
          }
        } catch (e) {
          console.warn('AI review not available', e);
        }
      } catch (err: any) {
        // Handle API 404/Not found gracefully
        console.error('Get idea error:', err);
        // Try localStorage fallback by id
        try {
          if (id) {
            const local = JSON.parse(localStorage.getItem('local_ideas') || '[]');
            const found = (local || []).find((it: any) => (it._id || it.id) === id || String(it._id || it.id) === String(id));
            if (found) {
              if (!mounted) return;
              setIdea(found);
              const evalResult = evaluateIdea(found);
              setEvaluation(evalResult);
              const sw = generateSWOT(found);
              setSwot(sw);
              try {
                const allResp = await ideasApi.getAll({});
                const allIdeas = allResp.ideas || [];
                const sims = findSimilarIdeas(found, allIdeas, 6);
                setSimilarIdeas(sims);
              } catch (e) {
                // ignore
              }
              setError(null);
              return;
            }
          }
        } catch (e) {
          console.warn('Local storage lookup failed', e);
        }

        const msg = err?.message || String(err);
        setError(msg);
        if (msg.includes('not found') || msg.toLowerCase().includes('idea')) {
          toast.error(msg);
        } else {
          toast.error('Failed to load idea');
          console.error('Failed to load idea', err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto text-center">
          <h3 className="text-xl font-semibold">{error}</h3>
          <p className="text-sm text-gray-600">This idea may have been removed or is not accessible.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={() => navigate('/entrepreneur/submissions')}>Back to Submissions</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!idea) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-6xl mx-auto">Idea not found.</div>
      </DashboardLayout>
    );
  }

  // Prepare chart data from evaluation breakdown
  const barData = evaluation
    ? Object.entries(evaluation.breakdown).map(([k, v]) => ({ name: k, value: Math.round((v as number) * 100) }))
    : [];

  const displayScore = evaluation ? evaluation.score : (idea.aiScore || 0);
  const pieData = [
    { name: 'AI Score', value: displayScore },
    { name: 'Remaining', value: 100 - displayScore },
  ];

  const COLORS = ['#10B981', '#E5E7EB'];

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{idea.title}</div>
                    <div className="text-sm text-gray-600">{idea.tagline}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-4xl font-bold text-brand-600">{evaluation ? evaluation.score : (idea.aiScore ?? 0)}</div>
                      <div className="text-sm text-gray-500">AI Score</div>
                    </div>
                    <Button variant="ghost" onClick={() => { window.print(); }}>Download PDF</Button>
                    <Button variant="outline" onClick={() => navigate('/entrepreneur/submissions')}>Back</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Evaluation Breakdown</h4>
                    <div style={{ width: '100%', height: 240 }}>
                      <ResponsiveContainer>
                        <BarChart data={barData}>
                          <XAxis dataKey="name" hide />
                          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value: any) => `${value}%`} />
                          <Bar dataKey="value" fill="#3b82f6">
                            {barData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="md:col-span-1 space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Overall</h4>
                    <div className="flex items-center justify-center">
                      <div style={{ width: 140, height: 140 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={60} label={(entry: any) => `${entry.value}%`} >
                              {pieData.map((entry, idx) => (
                                <Cell key={`p-${idx}`} fill={COLORS[idx % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{idea.aiScore ?? (evaluation ? evaluation.score : 0)}/100</div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions to Improve</h4>
                  <div className="space-y-2">
                    {(idea.mlSuggestions || []).length > 0 ? (
                      idea.mlSuggestions.map((s: string, i: number) => (
                        <div key={i} className="text-sm text-gray-600">• {s}</div>
                      ))
                    ) : (aiSuggestions && aiSuggestions.length > 0) ? (
                      aiSuggestions.map((s: string, i: number) => (
                        <div key={i} className="text-sm text-gray-600">• {s}</div>
                      ))
                    ) : evaluation ? (
                      evaluation.warnings.map((w, i) => (
                        <div key={i} className="text-sm text-gray-600">�� {w}</div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-600">No suggestions available.</div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* SWOT */}
            {swot && (
              <SwotAnalysis swot={swot} />
            )}

            {/* Similar Ideas */}
            {aiSimilar && aiSimilar.length > 0 ? (
              <SimilarIdeas
                similarIdeas={aiSimilar.map((it: any) => ({
                  idea: it,
                  ideaId: (it._id || it.id),
                  score: 0.75,
                  similarities: [it.category || 'similar']
                }))}
                onViewIdea={(id) => { window.location.href = `/investor/idea/${id}`; }}
              />
            ) : (
              <SimilarIdeas similarIdeas={similarIdeas} onViewIdea={(id) => { window.location.href = `/investor/idea/${id}`; }} />
            )}

          </div>

          {/* Right column metrics */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex justify-between"><span>Views</span><span className="font-medium">{idea.views || 0}</span></div>
                  <div className="flex justify-between"><span>Interests</span><span className="font-medium">{Array.isArray(idea.interests) ? idea.interests.length : (idea.interests || 0)}</span></div>
                  <div className="flex justify-between"><span>Featured</span><span className="font-medium">{idea.featured ? 'Yes' : 'No'}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {Array.isArray(idea.scoreHistory) && idea.scoreHistory.length > 0 ? (
                    <div className="space-y-2">
                      {idea.scoreHistory.slice().reverse().map((h: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-xs">{new Date(h.date).toLocaleDateString()}</span>
                          <span className="font-medium">{h.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">No history yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
