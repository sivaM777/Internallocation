import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Info, Heart, Send, ThumbsUp, ThumbsDown, Check, Plus, Lightbulb } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MatchData {
  internship_id: number;
  match_score: number;
  explanation: string;
  skill_overlap: string[];
  missing_skills: string[];
  title?: string;
  company?: string;
  location?: string;
  stipend?: number;
}

export function MatchResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

  // Get student profile to extract student ID
  const { data: profile } = useQuery({
    queryKey: ["/api/students/profile"],
    enabled: user?.role === 'student',
  });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["/api/students/matches", profile?.id],
    enabled: !!profile?.id,
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: { studentId: number; internshipId: number; feedback: 'good' | 'poor' }) => {
      const res = await apiRequest("POST", "/api/students/feedback", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for helping improve our AI!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Feedback failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "match-score-high";
    if (score >= 50) return "match-score-medium";
    return "match-score-low";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Perfect";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  const submitFeedback = (internshipId: number, feedback: 'good' | 'poor') => {
    if (profile?.id) {
      feedbackMutation.mutate({
        studentId: profile.id,
        internshipId,
        feedback
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Top Matches
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:underline">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match: MatchData, index: number) => (
              <div 
                key={index}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                data-testid={`match-result-${index}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-foreground">
                        {match.title || `Internship #${match.internship_id}`}
                      </h4>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-1 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Why this match?</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {match.company || "Company"}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-muted-foreground">
                      <span>{match.location || "Location"}</span>
                      {match.stipend && (
                        <>
                          <span className="mx-2">•</span>
                          <span>₹{match.stipend.toLocaleString()}/month</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getScoreColor(match.match_score)} px-2 py-1 text-xs font-medium mb-1`}>
                      {Math.round(match.match_score)}%
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {getScoreLabel(match.match_score)}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {match.skill_overlap.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {match.skill_overlap.map((skill, skillIndex) => (
                      <Badge key={skillIndex} className="bg-green-100 text-green-800 text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {match.missing_skills.slice(0, 2).map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Explanation */}
                <div className="space-y-2 mb-3">
                  {match.skill_overlap.length > 0 && (
                    <div className="flex items-center text-xs">
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                      <span className="text-muted-foreground">
                        Strong skill overlap: {match.skill_overlap.join(', ')}
                      </span>
                    </div>
                  )}
                  {match.missing_skills.length > 0 && (
                    <div className="flex items-center text-xs">
                      <Lightbulb className="h-3 w-3 text-blue-500 mr-2" />
                      <span className="text-muted-foreground">
                        Consider learning: {match.missing_skills.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-xs">
                    <Plus className="h-3 w-3 text-blue-500 mr-2" />
                    <span className="text-muted-foreground">{match.explanation}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" data-testid={`button-apply-${index}`}>
                    <Send className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-save-${index}`}>
                    <Heart className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No matches found yet. Complete your profile to get personalized matches.</p>
            </div>
          )}

          {/* Feedback Section */}
          {matches.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Match Feedback</p>
                  <p className="text-xs text-muted-foreground">Help improve our AI</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-green-500 hover:bg-green-50 hover:text-green-600"
                    onClick={() => submitFeedback(matches[0]?.internship_id, 'good')}
                    disabled={feedbackMutation.isPending}
                    data-testid="button-feedback-good"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => submitFeedback(matches[0]?.internship_id, 'poor')}
                    disabled={feedbackMutation.isPending}
                    data-testid="button-feedback-poor"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
