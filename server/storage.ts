import {
  users,
  students,
  companies,
  internships,
  allocations,
  matchFeedback,
  type User,
  type InsertUser,
  type Student,
  type InsertStudent,
  type Company,
  type InsertCompany,
  type Internship,
  type InsertInternship,
  type Allocation,
  type InsertAllocation,
  type MatchFeedback,
  type InsertMatchFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student operations
  getStudent(userId: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(userId: number, data: Partial<InsertStudent>): Promise<Student>;
  getAllStudents(): Promise<Student[]>;

  // Company operations
  getCompany(userId: number): Promise<Company | undefined>;
  getCompanyByUserId(userId: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(userId: number, data: Partial<InsertCompany>): Promise<Company>;

  // Internship operations
  getInternship(id: number): Promise<Internship | undefined>;
  getInternshipsByCompany(companyId: number): Promise<Internship[]>;
  createInternship(internship: InsertInternship): Promise<Internship>;
  updateInternship(id: number, data: Partial<InsertInternship>): Promise<Internship>;
  getAllActiveInternships(): Promise<Internship[]>;
  deleteInternship(id: number): Promise<void>;

  // Allocation operations
  createAllocation(allocation: InsertAllocation): Promise<Allocation>;
  getAllocations(filters?: { studentId?: number; internshipId?: number; status?: string }): Promise<Allocation[]>;
  getAllocationsWithDetails(): Promise<any[]>;

  // Match feedback operations
  submitFeedback(feedback: InsertMatchFeedback): Promise<MatchFeedback>;

  // Analytics and stats
  getSystemStats(): Promise<any>;
  getDiversityMetrics(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([insertUser])
      .returning();
    return user;
  }

  // Student operations
  async getStudent(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values([student])
      .returning();
    return newStudent;
  }

  async updateStudent(userId: number, data: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(data)
      .where(eq(students.userId, userId))
      .returning();
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  // Company operations
  async getCompany(userId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company || undefined;
  }

  async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.userId, userId));
    return company || undefined;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values([company])
      .returning();
    return newCompany;
  }

  async updateCompany(userId: number, data: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set(data)
      .where(eq(companies.userId, userId))
      .returning();
    return company;
  }

  // Internship operations
  async getInternship(id: number): Promise<Internship | undefined> {
    const [internship] = await db.select().from(internships).where(eq(internships.id, id));
    return internship || undefined;
  }

  async getInternshipsByCompany(companyId: number): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(eq(internships.companyId, companyId))
      .orderBy(desc(internships.createdAt));
  }

  async createInternship(internship: InsertInternship): Promise<Internship> {
    const [newInternship] = await db
      .insert(internships)
      .values([internship])
      .returning();
    return newInternship;
  }

  async updateInternship(id: number, data: Partial<InsertInternship>): Promise<Internship> {
    const [internship] = await db
      .update(internships)
      .set(data)
      .where(eq(internships.id, id))
      .returning();
    return internship;
  }

  async getAllActiveInternships(): Promise<Internship[]> {
    return await db
      .select()
      .from(internships)
      .where(eq(internships.isActive, true))
      .orderBy(desc(internships.createdAt));
  }

  async deleteInternship(id: number): Promise<void> {
    await db.delete(internships).where(eq(internships.id, id));
  }

  // Allocation operations
  async createAllocation(allocation: InsertAllocation): Promise<Allocation> {
    const [newAllocation] = await db
      .insert(allocations)
      .values([allocation])
      .returning();
    return newAllocation;
  }

  async getAllocations(filters?: { studentId?: number; internshipId?: number; status?: string }): Promise<Allocation[]> {
    let query = db.select().from(allocations);

    const conditions = [];
    if (filters?.studentId) {
      conditions.push(eq(allocations.studentId, filters.studentId));
    }
    if (filters?.internshipId) {
      conditions.push(eq(allocations.internshipId, filters.internshipId));
    }
    if (filters?.status) {
      conditions.push(eq(allocations.status, filters.status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(allocations.timestamp));
  }

  async getAllocationsWithDetails(): Promise<any[]> {
    return await db
      .select({
        id: allocations.id,
        matchScore: allocations.matchScore,
        explanation: allocations.explanation,
        status: allocations.status,
        timestamp: allocations.timestamp,
        studentName: students.name,
        internshipTitle: internships.title,
        companyName: companies.name
      })
      .from(allocations)
      .leftJoin(students, eq(allocations.studentId, students.id))
      .leftJoin(internships, eq(allocations.internshipId, internships.id))
      .leftJoin(companies, eq(internships.companyId, companies.id))
      .orderBy(desc(allocations.timestamp));
  }

  // Match feedback operations
  async submitFeedback(feedback: InsertMatchFeedback): Promise<MatchFeedback> {
    const [newFeedback] = await db
      .insert(matchFeedback)
      .values([feedback])
      .returning();
    return newFeedback;
  }

  // Analytics and stats
  async getSystemStats(): Promise<any> {
    const [totalStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students);

    const [activeInternships] = await db
      .select({ count: sql<number>`count(*)` })
      .from(internships)
      .where(eq(internships.isActive, true));

    const [successfulMatches] = await db
      .select({ count: sql<number>`count(*)` })
      .from(allocations)
      .where(eq(allocations.status, 'matched'));

    const [avgMatchScore] = await db
      .select({ avg: sql<number>`avg(match_score)` })
      .from(allocations);

    return {
      totalStudents: totalStudents.count,
      activeInternships: activeInternships.count,
      successfulMatches: successfulMatches.count,
      avgMatchScore: parseFloat(avgMatchScore.avg?.toFixed(1) || '0')
    };
  }

  async getDiversityMetrics(): Promise<any> {
    const [totalWithDiversity] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.diversityFlag, true));

    const [totalStudents] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students);

    const diversityPercentage = totalStudents.count > 0 
      ? (totalWithDiversity.count / totalStudents.count) * 100 
      : 0;

    return {
      diversityPercentage: parseFloat(diversityPercentage.toFixed(1)),
      totalWithDiversity: totalWithDiversity.count,
      totalStudents: totalStudents.count
    };
  }
}

export const storage = new DatabaseStorage();
