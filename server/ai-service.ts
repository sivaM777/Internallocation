// AI Matching Service - Stub implementation
// In production, this would be a separate Python Flask microservice

export interface MatchRequest {
  student_profile: {
    skills: string[];
    cgpa: number;
    location: string;
    diversity_flag: boolean;
  };
  internships: Array<{
    id: number;
    required_skills: string[];
    location: string;
    title: string;
  }>;
}

export interface MatchResult {
  internship_id: number;
  match_score: number;
  explanation: string;
  skill_overlap: string[];
  missing_skills: string[];
}

export interface MatchResponse {
  matches: MatchResult[];
}

export class AIMatchingService {
  // Stub implementation - in production this would call OpenAI API
  static async calculateMatches(request: MatchRequest): Promise<MatchResponse> {
    const matches: MatchResult[] = [];

    for (const internship of request.internships) {
      const skillOverlap = request.student_profile.skills.filter(skill =>
        internship.required_skills.some(reqSkill => 
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      );

      const missingSkills = internship.required_skills.filter(reqSkill =>
        !request.student_profile.skills.some(skill =>
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      );

      // Calculate match score using weighted formula
      const skillsScore = (skillOverlap.length / Math.max(internship.required_skills.length, 1)) * 50;
      const cgpaScore = (request.student_profile.cgpa / 10) * 20;
      const locationScore = request.student_profile.location === internship.location ? 10 : 0;
      const diversityScore = request.student_profile.diversity_flag ? 20 : 0;

      const totalScore = skillsScore + cgpaScore + locationScore + diversityScore;

      let explanation = '';
      if (skillOverlap.length > 0) {
        explanation += `Strong skill overlap in ${skillOverlap.join(', ')}. `;
      }
      if (locationScore > 0) {
        explanation += 'Location match bonus applied. ';
      }
      if (cgpaScore >= 16) { // CGPA > 8.0
        explanation += 'High CGPA advantage. ';
      }
      if (diversityScore > 0) {
        explanation += 'Diversity boost applied. ';
      }
      if (missingSkills.length > 0) {
        explanation += `Consider learning: ${missingSkills.slice(0, 2).join(', ')}.`;
      }

      matches.push({
        internship_id: internship.id,
        match_score: Math.round(Math.min(totalScore, 100) * 100) / 100,
        explanation: explanation.trim(),
        skill_overlap: skillOverlap,
        missing_skills: missingSkills
      });
    }

    // Sort by match score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    return { matches };
  }

  static getMatchScoreColor(score: number): string {
    if (score >= 80) return 'match-score-high';
    if (score >= 50) return 'match-score-medium';
    return 'match-score-low';
  }

  static getMatchScoreLabel(score: number): string {
    if (score >= 90) return 'Perfect';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  }
}
