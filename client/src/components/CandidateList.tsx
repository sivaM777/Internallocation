import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Check, Eye, MapPin, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Candidate {
  id: number;
  name: string;
  cgpa: string;
  location: string;
  skills: string[];
  matchScore: number;
  explanation: string;
  skillOverlap: string[];
  missingSkills: string[];
}

interface CandidateListProps {
  internshipId?: number;
}

export function CandidateList({ internshipId }: CandidateListProps) {
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["/api/candidates", internshipId],
    enabled: !!internshipId,
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "match-score-high";
    if (score >= 50) return "match-score-medium";
    return "match-score-low";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border border-border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
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
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-500" />
          Top Candidates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {candidates.length > 0 ? (
            candidates.map((candidate: Candidate, index: number) => (
              <div 
                key={candidate.id}
                className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                data-testid={`candidate-${index}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-medium text-sm">
                        {getInitials(candidate.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{candidate.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        <span>CGPA: {candidate.cgpa}</span>
                        <span>•</span>
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.location}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getScoreColor(candidate.matchScore)} px-2 py-1 text-xs font-medium`}>
                    {Math.round(candidate.matchScore)}%
                  </Badge>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.skillOverlap.map((skill, skillIndex) => (
                    <Badge key={skillIndex} className="bg-green-100 text-green-800 text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.filter(skill => !candidate.skillOverlap.includes(skill)).slice(0, 2).map((skill, skillIndex) => (
                    <Badge key={skillIndex} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > candidate.skillOverlap.length + 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidate.skills.length - candidate.skillOverlap.length - 2} more
                    </Badge>
                  )}
                </div>

                {/* Match Explanation */}
                <div className="space-y-1 mb-3">
                  {candidate.skillOverlap.length > 0 && (
                    <div className="flex items-center text-xs">
                      <Check className="h-3 w-3 text-green-500 mr-2" />
                      <span className="text-muted-foreground">
                        Perfect skill match ({candidate.skillOverlap.length}/{candidate.skillOverlap.length + candidate.missingSkills.length})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-xs">
                    <MapPin className="h-3 w-3 text-blue-500 mr-2" />
                    <span className="text-muted-foreground">
                      {candidate.location === "Bangalore" ? "Location preference matches" : "Different location preference"}
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <GraduationCap className="h-3 w-3 text-purple-500 mr-2" />
                    <span className="text-muted-foreground">
                      {parseFloat(candidate.cgpa) >= 8.5 ? "High academic performance" : "Good academic performance"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" data-testid={`button-shortlist-${index}`}>
                    <Check className="h-3 w-3 mr-1" />
                    Shortlist
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-profile-${index}`}>
                    <Eye className="h-3 w-3 mr-1" />
                    Profile
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates found. Wait for students to apply or adjust your requirements.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
