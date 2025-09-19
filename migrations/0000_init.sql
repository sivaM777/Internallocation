CREATE TABLE "allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"internship_id" integer,
	"match_score" numeric(5, 2),
	"explanation" text,
	"status" text DEFAULT 'matched',
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"location" text,
	"industry" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "internships" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer,
	"title" text NOT NULL,
	"description" text,
	"required_skills" text[] DEFAULT '{}',
	"location" text,
	"stipend" integer,
	"positions" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer,
	"internship_id" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"name" text NOT NULL,
	"skills" text[] DEFAULT '{}',
	"cgpa" numeric(3, 2),
	"location" text,
	"diversity_flag" boolean DEFAULT false,
	"profile_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internships" ADD CONSTRAINT "internships_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_internship_id_internships_id_fk" FOREIGN KEY ("internship_id") REFERENCES "public"."internships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;