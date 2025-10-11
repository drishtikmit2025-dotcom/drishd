import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertTriangle, TrendingUp, Flame } from 'lucide-react';
import type { SWOTAnalysis } from '@/lib/pitch';

interface SwotAnalysisProps {
  swot: SWOTAnalysis;
  className?: string;
}

const Section = ({ title, color, items }: { title: string; color: string; items: string[] }) => (
  <Card className={`border-l-4 ${color}`}>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <Badge variant="secondary" className="mt-0.5">{idx + 1}</Badge>
          <p className="text-sm text-gray-700">{item}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);

const SwotAnalysis: React.FC<SwotAnalysisProps> = ({ swot, className = '' }) => {
  return (
    <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
      <Section title="Strengths" color="border-l-green-500" items={swot.strengths} />
      <Section title="Weaknesses" color="border-l-orange-500" items={swot.weaknesses} />
      <Section title="Opportunities" color="border-l-blue-500" items={swot.opportunities} />
      <Section title="Threats" color="border-l-red-500" items={swot.threats} />
    </div>
  );
};

export default SwotAnalysis;
