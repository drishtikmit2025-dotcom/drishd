import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  ExternalLink,
  Search
} from 'lucide-react';
import { SimilarityScore, getSimilarityColor, getSimilarityLabel } from '@/lib/similarityAnalysis';

interface SimilarIdeasProps {
  similarIdeas: SimilarityScore[];
  onViewIdea?: (ideaId: string) => void;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

const SimilarIdeas: React.FC<SimilarIdeasProps> = ({ 
  similarIdeas, 
  onViewIdea,
  className = ""
}) => {
  if (similarIdeas.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Similar Ideas Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Similar Ideas Found</h3>
            <p className="text-gray-600">
              Your idea appears to be unique! This could be a great opportunity to be first to market.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Similar Ideas Found ({similarIdeas.length})
        </CardTitle>
        <p className="text-sm text-gray-600">
          We found some ideas similar to yours. Review them to understand the competitive landscape and identify opportunities for differentiation.
        </p>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {similarIdeas.map((result) => (
            <SimilarIdeaCard 
              key={result.ideaId} 
              result={result} 
              onViewIdea={onViewIdea}
            />
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

interface SimilarIdeaCardProps {
  result: SimilarityScore;
  onViewIdea?: (ideaId: string) => void;
}

const SimilarIdeaCard: React.FC<SimilarIdeaCardProps> = ({ result, onViewIdea }) => {
  const { idea, score, similarities } = result;
  const similarityPercentage = Math.round(score * 100);
  
  const getEntrepreneurName = (entrepreneur: any): string => {
    if (typeof entrepreneur === 'string') return entrepreneur;
    if (entrepreneur?.name) return entrepreneur.name;
    return 'Anonymous';
  };

  const getEntrepreneurAvatar = (entrepreneur: any): string => {
    if (typeof entrepreneur === 'object' && entrepreneur?.avatar) return entrepreneur.avatar;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${getEntrepreneurName(entrepreneur)}`;
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                  {idea.title}
                </h3>
                <Badge variant="secondary">{idea.category}</Badge>
                {idea.stage && (
                  <Badge variant="outline" className="text-xs">
                    {idea.stage}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {idea.tagline || idea.description || 'No description available'}
              </p>
              
              {/* Entrepreneur info */}
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={getEntrepreneurAvatar(idea.entrepreneur)}
                  alt={getEntrepreneurName(idea.entrepreneur)}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs text-gray-500">
                  by {getEntrepreneurName(idea.entrepreneur)}
                </span>
              </div>
            </div>
            
            {/* Similarity Score */}
            <div className="text-right ml-4">
              <div className={`text-lg font-bold ${getSimilarityColor(score)}`}>
                {similarityPercentage}%
              </div>
              <div className="text-xs text-gray-500 mb-1">
                {getSimilarityLabel(score)}
              </div>
              <Progress 
                value={similarityPercentage} 
                className="w-16 h-1" 
              />
            </div>
          </div>
          
          {/* Similarity Reasons */}
          {similarities.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-medium text-gray-700">Why it's similar:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {similarities.slice(0, 3).map((similarity, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                  >
                    {similarity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Metrics */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{idea.views || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>
                  {Array.isArray(idea.interests) ? idea.interests.length : (idea.interests || 0)} interests
                </span>
              </div>
              {(idea.score || idea.aiScore) && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{idea.score || idea.aiScore}/100 score</span>
                </div>
              )}
            </div>
            
            {onViewIdea && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewIdea(result.ideaId)}
                className="text-xs"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Details
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SimilarIdeas;
