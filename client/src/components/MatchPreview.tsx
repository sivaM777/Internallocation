import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, RefreshCw, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface MatchData {
  internship_id: number;
  match_score: number;
  explanation: string;
  skill_overlap: string[];
  missing_skills: string[];
  title?: string;
  company?: string;
  location?: string;
}

export function MatchPreview() {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Get student profile to extract student ID
  const { data: profile } = useQuery({
    queryKey: ["/api/students/profile"],
    enabled: user?.role === 'student',
  });

  useEffect(() => {
    if (profile?.id) {
      setStudentId(profile.id);
    }
  }, [profile]);

  const { data: matches = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/match/preview", studentId],
    enabled: !!studentId,
    refetchInterval: 30000, // Refresh every 30 seconds for live updates
  });

  // Simulate AI processing progress
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [isLoading]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Perfect";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Eye className="h-5 w-5 mr-2 text-accent" />
          Live Match Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* AI Processing Status */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-3">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isLoading ? "AI is analyzing your profile..." : "Analysis complete"}
            </p>
            <Progress value={progress} className="w-full h-2" />
          </div>

          {/* Match Results */}
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))
            ) : matches.length > 0 ? (
              matches.map((match: MatchData, index: number) => (
                <div 
                  key={index}
                  className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  data-testid={`match-preview-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {match.title || `Internship #${match.internship_id}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {match.company || "Company"} • {match.location || "Location"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getScoreColor(match.match_score)} text-white`}>
                        {Math.round(match.match_score)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getScoreLabel(match.match_score)}
                      </div>
                    </div>
                  </div>
                  
                  {match.skill_overlap.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {match.skill_overlap.slice(0, 3).map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {match.skill_overlap.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.skill_overlap.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {match.explanation}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No matches found. Try updating your profile to get better matches.</p>
              </div>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh-matches"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Matches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
