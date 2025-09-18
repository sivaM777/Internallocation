import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  boolean, 
  numeric, 
  serial 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Core users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().$type<'student' | 'company' | 'admin'>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Student profiles with array fields
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  skills: text("skills").array().default(sql`'{}'`),
  cgpa: numeric("cgpa", { precision: 3, scale: 2 }),
  location: text("location"),
  diversityFlag: boolean("diversity_flag").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Company profiles
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  location: text("location"),
  industry: text("industry"),
  createdAt: timestamp("created_at").defaultNow()
});

// Internship postings with skill arrays
export const internships = pgTable("internships", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  requiredSkills: text("required_skills").array().default(sql`'{}'`),
  location: text("location"),
  stipend: integer("stipend"),
  positions: integer("positions").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Allocation audit trail
export const allocations = pgTable("allocations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  internshipId: integer("internship_id").references(() => internships.id),
  matchScore: numeric("match_score", { precision: 5, scale: 2 }),
  explanation: text("explanation"),
  status: text("status").default('matched').$type<'matched' | 'applied' | 'shortlisted' | 'rejected'>(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Student feedback on matches
export const matchFeedback = pgTable("match_feedback", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  internshipId: integer("internship_id").references(() => internships.id),
  feedback: text("feedback").$type<'good' | 'poor'>(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId]
  }),
  company: one(companies, {
    fields: [users.id], 
    references: [companies.userId]
  })
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id]
  }),
  allocations: many(allocations),
  feedback: many(matchFeedback)
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id]
  }),
  internships: many(internships)
}));

export const internshipsRelations = relations(internships, ({ one, many }) => ({
  company: one(companies, {
    fields: [internships.companyId],
    references: [companies.id]
  }),
  allocations: many(allocations),
  feedback: many(matchFeedback)
}));

export const allocationsRelations = relations(allocations, ({ one }) => ({
  student: one(students, {
    fields: [allocations.studentId],
    references: [students.id]
  }),
  internship: one(internships, {
    fields: [allocations.internshipId],
    references: [internships.id]
  })
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  userId: true,
  createdAt: true
});

export const insertInternshipSchema = createInsertSchema(internships).omit({
  id: true,
  createdAt: true
});

export const insertAllocationSchema = createInsertSchema(allocations).omit({
  id: true,
  timestamp: true
});

export const insertMatchFeedbackSchema = createInsertSchema(matchFeedback).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Internship = typeof internships.$inferSelect;
export type InsertInternship = z.infer<typeof insertInternshipSchema>;
export type Allocation = typeof allocations.$inferSelect;
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type MatchFeedback = typeof matchFeedback.$inferSelect;
export type InsertMatchFeedback = z.infer<typeof insertMatchFeedbackSchema>;
