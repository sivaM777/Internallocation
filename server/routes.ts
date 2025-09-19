import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { AIMatchingService } from "./ai-service";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Student Routes
  app.get("/api/students/profile", requireAuth, async (req: any, res) => {
    try {
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/students/profile", requireAuth, async (req: any, res) => {
    try {
      const student = await storage.updateStudent(req.user.id, req.body);
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Add route for student matches without parameter
  app.get("/api/students/matches", requireAuth, async (req: any, res) => {
    try {
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const internships = await storage.getAllActiveInternships();
      
      const matchRequest = {
        student_profile: {
          skills: student.skills || [],
          cgpa: parseFloat(student.cgpa || '0'),
          location: student.location || '',
          diversity_flag: student.diversityFlag || false
        },
        internships: internships.map(i => ({
          id: i.id,
          required_skills: i.requiredSkills || [],
          location: i.location || '',
          title: i.title
        }))
      };

      const matches = await AIMatchingService.calculateMatches(matchRequest);
      res.json(matches.matches.slice(0, 5)); // Top 5 matches
    } catch (error) {
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  app.get("/api/students/matches/:studentId", requireAuth, async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const student = await storage.getStudentByUserId(req.user.id);
      
      // Authorization check
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const internships = await storage.getAllActiveInternships();
      
      const matchRequest = {
        student_profile: {
          skills: student.skills || [],
          cgpa: parseFloat(student.cgpa || '0'),
          location: student.location || '',
          diversity_flag: student.diversityFlag || false
        },
        internships: internships.map(i => ({
          id: i.id,
          required_skills: i.requiredSkills || [],
          location: i.location || '',
          title: i.title
        }))
      };

      const matches = await AIMatchingService.calculateMatches(matchRequest);
      res.json(matches.matches.slice(0, 5)); // Top 5 matches
    } catch (error) {
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  app.post("/api/students/feedback", requireAuth, async (req: any, res) => {
    try {
      const feedback = await storage.submitFeedback(req.body);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Company Routes
  app.get("/api/companies/profile", requireAuth, async (req: any, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/companies/profile", requireAuth, async (req: any, res) => {
    try {
      const company = await storage.updateCompany(req.user.id, req.body);
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/internships", requireAuth, async (req: any, res) => {
    try {
      const company = await storage.getCompanyByUserId(req.user.id);
      if (!company) {
        return res.status(404).json({ message: "Company profile not found" });
      }

      const internship = await storage.createInternship({
        ...req.body,
        companyId: company.id
      });
      res.json(internship);
    } catch (error) {
      res.status(500).json({ message: "Failed to create internship" });
    }
  });

  app.get("/api/internships/company/:companyId", requireAuth, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const internships = await storage.getInternshipsByCompany(companyId);
      res.json(internships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch internships" });
    }
  });

  app.get("/api/candidates/:internshipId", requireAuth, async (req: any, res) => {
    try {
      const internshipId = parseInt(req.params.internshipId);
      const internship = await storage.getInternship(internshipId);
      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }

      const students = await storage.getAllStudents();
      const candidates = [];

      for (const student of students) {
        const matchRequest = {
          student_profile: {
            skills: student.skills || [],
            cgpa: parseFloat(student.cgpa || '0'),
            location: student.location || '',
            diversity_flag: student.diversityFlag || false
          },
          internships: [{
            id: internship.id,
            required_skills: internship.requiredSkills || [],
            location: internship.location || '',
            title: internship.title
          }]
        };

        const matches = await AIMatchingService.calculateMatches(matchRequest);
        if (matches.matches.length > 0) {
          candidates.push({
            ...student,
            matchScore: matches.matches[0].match_score,
            explanation: matches.matches[0].explanation,
            skillOverlap: matches.matches[0].skill_overlap,
            missingSkills: matches.matches[0].missing_skills
          });
        }
      }

      // Sort by match score and return top candidates
      candidates.sort((a, b) => b.matchScore - a.matchScore);
      res.json(candidates.slice(0, 20));
    } catch (error) {
      res.status(500).json({ message: "Failed to get candidates" });
    }
  });

  // Admin Routes
  app.get("/api/admin/stats", requireRole('admin'), async (req: any, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  app.post("/api/admin/match/run", requireRole('admin'), async (req: any, res) => {
    try {
      // Bulk matching process
      const students = await storage.getAllStudents();
      const internships = await storage.getAllActiveInternships();
      
      let processedCount = 0;
      
      for (const student of students) {
        const matchRequest = {
          student_profile: {
            skills: student.skills || [],
            cgpa: parseFloat(student.cgpa || '0'),
            location: student.location || '',
            diversity_flag: student.diversityFlag || false
          },
          internships: internships.map(i => ({
            id: i.id,
            required_skills: i.requiredSkills || [],
            location: i.location || '',
            title: i.title
          }))
        };

        const matches = await AIMatchingService.calculateMatches(matchRequest);
        
        // Create allocations for top matches
        for (const match of matches.matches.slice(0, 3)) {
          if (match.match_score >= 50) { // Only create allocations for decent matches
            await storage.createAllocation({
              studentId: student.id,
              internshipId: match.internship_id,
              matchScore: match.match_score.toString(),
              explanation: match.explanation,
              status: 'matched'
            });
          }
        }
        processedCount++;
      }

      res.json({ message: `Processed ${processedCount} students`, processedCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to run matching process" });
    }
  });

  app.get("/api/admin/fairness", requireRole('admin'), async (req: any, res) => {
    try {
      const metrics = await storage.getDiversityMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get fairness metrics" });
    }
  });

  app.get("/api/admin/audit", requireRole('admin'), async (req: any, res) => {
    try {
      const allocations = await storage.getAllocationsWithDetails();
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get audit trail" });
    }
  });

  // Matching Routes - Fix route for match preview
  app.get("/api/match/preview/:studentId", requireAuth, async (req: any, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      
      // Authorization check - ensure user owns this student profile
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student || student.id !== studentId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const internships = await storage.getAllActiveInternships();
      
      const matchRequest = {
        student_profile: {
          skills: student.skills || [],
          cgpa: parseFloat(student.cgpa || '0'),
          location: student.location || '',
          diversity_flag: student.diversityFlag || false
        },
        internships: internships.map(i => ({
          id: i.id,
          required_skills: i.requiredSkills || [],
          location: i.location || '',
          title: i.title
        }))
      };

      const matches = await AIMatchingService.calculateMatches(matchRequest);
      res.json(matches.matches.slice(0, 3)); // Top 3 for preview
    } catch (error) {
      res.status(500).json({ message: "Failed to get match preview" });
    }
  });

  // Add route to handle match preview without studentId parameter
  app.get("/api/match/preview", requireAuth, async (req: any, res) => {
    try {
      const student = await storage.getStudentByUserId(req.user.id);
      if (!student) {
        return res.status(404).json({ message: "Student profile not found" });
      }

      const internships = await storage.getAllActiveInternships();
      
      const matchRequest = {
        student_profile: {
          skills: student.skills || [],
          cgpa: parseFloat(student.cgpa || '0'),
          location: student.location || '',
          diversity_flag: student.diversityFlag || false
        },
        internships: internships.map(i => ({
          id: i.id,
          required_skills: i.requiredSkills || [],
          location: i.location || '',
          title: i.title
        }))
      };

      const matches = await AIMatchingService.calculateMatches(matchRequest);
      res.json(matches.matches.slice(0, 3));
    } catch (error) {
      res.status(500).json({ message: "Failed to get match preview" });
    }
  });

  app.post("/api/match/bulk", requireRole('admin'), async (req: any, res) => {
    try {
      // Incremental matching for new students/internships
      res.json({ message: "Incremental matching completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to run bulk matching" });
    }
  });

  // Skills autocomplete endpoint
  app.get("/api/skills/suggestions", async (req: any, res) => {
    const query = req.query.q?.toLowerCase() || '';
    
    // Common tech skills for autocomplete
    const skills = [
      'Python', 'JavaScript', 'Java', 'C++', 'React', 'Node.js', 'Angular', 'Vue.js',
      'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'Google Cloud', 'Git', 'HTML', 'CSS', 'TypeScript',
      'Spring Boot', 'Django', 'Flask', 'Express.js', 'REST API', 'GraphQL',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'OpenCV',
      'Unity', 'Unreal Engine', 'Android', 'iOS', 'React Native', 'Flutter',
      'Blockchain', 'Ethereum', 'Solidity', 'DevOps', 'CI/CD', 'Jenkins',
      'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'UI/UX Design',
      'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Writing'
    ];

    const suggestions = skills
      .filter(skill => skill.toLowerCase().includes(query))
      .slice(0, 10);

    res.json(suggestions);
  });

  const httpServer = createServer(app);
  return httpServer;
}
