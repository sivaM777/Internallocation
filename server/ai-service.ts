// AI Matching Service - OpenAI-powered implementation
import OpenAI from 'openai';

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
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Cache embeddings to reduce API calls
  private static embeddingCache = new Map<string, number[]>();

  static async calculateMatches(request: MatchRequest): Promise<MatchResponse> {
    const matches: MatchResult[] = [];

    try {
      // Get student skills embedding
      const studentSkillsText = request.student_profile.skills.join(', ');
      const studentEmbedding = await this.getEmbedding(studentSkillsText);

      for (const internship of request.internships) {
        // Get internship skills embedding
        const internshipSkillsText = internship.required_skills.join(', ');
        const internshipEmbedding = await this.getEmbedding(internshipSkillsText);

        // Calculate cosine similarity between skills
        const skillsSimilarity = this.cosineSimilarity(studentEmbedding, internshipEmbedding);
        
        // Find skill overlaps using both exact matching and embeddings
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

        // Calculate match score using weighted formula with AI similarity
        const aiSkillsScore = skillsSimilarity * 50; // 50% weight for AI-powered similarity
        const cgpaScore = (request.student_profile.cgpa / 10) * 20; // 20% weight
        const locationScore = request.student_profile.location === internship.location ? 10 : 0; // 10% weight
        const diversityScore = request.student_profile.diversity_flag ? 20 : 0; // 20% weight

        const totalScore = aiSkillsScore + cgpaScore + locationScore + diversityScore;

        // Generate detailed explanation
        let explanation = '';
        if (skillsSimilarity > 0.8) {
          explanation += 'Excellent AI-powered skill match. ';
        } else if (skillsSimilarity > 0.6) {
          explanation += 'Good skill compatibility detected. ';
        } else if (skillsSimilarity > 0.4) {
          explanation += 'Moderate skill alignment. ';
        } else {
          explanation += 'Limited skill match. ';
        }

        if (skillOverlap.length > 0) {
          explanation += `Direct skill overlap: ${skillOverlap.join(', ')}. `;
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
          explanation += `Recommended skills to learn: ${missingSkills.slice(0, 2).join(', ')}.`;
        }

        matches.push({
          internship_id: internship.id,
          match_score: Math.round(Math.min(totalScore, 100) * 100) / 100,
          explanation: explanation.trim(),
          skill_overlap: skillOverlap,
          missing_skills: missingSkills
        });
      }
    } catch (error) {
      console.error('OpenAI API error, falling back to basic matching:', error);
      // Fallback to basic string matching if OpenAI fails
      return this.basicMatching(request);
    }

    // Sort by match score descending
    matches.sort((a, b) => b.match_score - a.match_score);

    return { matches };
  }

  private static async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      const embedding = response.data[0].embedding;
      
      // Cache the embedding
      this.embeddingCache.set(text, embedding);
      
      return embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      // Return a zero vector as fallback
      return new Array(1536).fill(0);
    }
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private static basicMatching(request: MatchRequest): MatchResponse {
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

      // Basic scoring without AI
      const skillsScore = (skillOverlap.length / Math.max(internship.required_skills.length, 1)) * 50;
      const cgpaScore = (request.student_profile.cgpa / 10) * 20;
      const locationScore = request.student_profile.location === internship.location ? 10 : 0;
      const diversityScore = request.student_profile.diversity_flag ? 20 : 0;

      const totalScore = skillsScore + cgpaScore + locationScore + diversityScore;

      let explanation = 'Basic matching (AI unavailable). ';
      if (skillOverlap.length > 0) {
        explanation += `Skill overlap: ${skillOverlap.join(', ')}. `;
      }
      if (locationScore > 0) {
        explanation += 'Location match bonus. ';
      }
      if (cgpaScore >= 16) {
        explanation += 'High CGPA advantage. ';
      }
      if (diversityScore > 0) {
        explanation += 'Diversity boost. ';
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
