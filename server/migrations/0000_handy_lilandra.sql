CREATE TYPE "public"."book_category" AS ENUM('psychology-thinking-development', 'financial-literacy-economics', 'marketing', 'health-fitness-nutrition', 'communication-soft-skills', 'entrepreneurship-career', 'technology-future', 'relationships', 'popular-personalities');--> statement-breakpoint
CREATE TYPE "public"."course_category" AS ENUM('mind-thinking', 'finance-economics', 'career-skills', 'future-thinking', 'health-body');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('reward', 'purchase', 'referral', 'steps', 'subscription');--> statement-breakpoint
CREATE TABLE "book_chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"title_ru" varchar,
	"content" text NOT NULL,
	"content_ru" text,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"book_id" integer NOT NULL,
	"purchased_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"book_id" integer NOT NULL,
	"current_chapter" integer DEFAULT 1,
	"total_chapters" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reward_claimed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "book_reading_progress_user_id_book_id_unique" UNIQUE("user_id","book_id")
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"title_ru" varchar,
	"author" varchar NOT NULL,
	"author_ru" varchar,
	"description" text,
	"description_ru" text,
	"category" "book_category" NOT NULL,
	"price" numeric(10, 2) DEFAULT '0',
	"cover_image_url" varchar,
	"file_url" varchar,
	"page_count" integer,
	"is_active" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channel_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"channel_id" integer NOT NULL,
	"verified" boolean DEFAULT false,
	"subscribed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chapter_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"question" text NOT NULL,
	"question_ru" text,
	"options" text[] NOT NULL,
	"options_ru" text[],
	"correct_answer" integer NOT NULL,
	"explanation" text,
	"explanation_ru" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"title_ru" varchar,
	"description" text,
	"description_ru" text,
	"content" text NOT NULL,
	"content_ru" text,
	"video_url" varchar,
	"duration" integer,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" integer NOT NULL,
	"current_lesson" integer DEFAULT 1,
	"total_lessons" integer NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reward_claimed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "course_reading_progress_user_id_course_id_unique" UNIQUE("user_id","course_id")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"title_ru" varchar,
	"description" text,
	"description_ru" text,
	"content" text,
	"content_ru" text,
	"instructor" varchar NOT NULL,
	"instructor_ru" varchar,
	"category" "course_category" NOT NULL,
	"price" numeric(10, 2) DEFAULT '0',
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"image_url" varchar,
	"duration_minutes" integer,
	"is_active" boolean DEFAULT true,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" varchar NOT NULL,
	"target_steps" integer DEFAULT 10000,
	"actual_steps" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"reward_claimed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"completed_at" timestamp,
	"enrolled_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"question" text NOT NULL,
	"question_ru" text,
	"options" text[] NOT NULL,
	"options_ru" text[],
	"correct_answer" integer NOT NULL,
	"explanation" text,
	"explanation_ru" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sponsor_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"channel_url" varchar NOT NULL,
	"reward" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"test_type" varchar NOT NULL,
	"test_id" integer NOT NULL,
	"chapter_id" integer,
	"lesson_id" integer,
	"selected_answer" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "text_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"text_en" text NOT NULL,
	"text_ru" text NOT NULL,
	"category" varchar(100) DEFAULT 'general' NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "text_content_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" varchar NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_daily_counters" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"date" varchar NOT NULL,
	"steps_mind" integer DEFAULT 0,
	"books_mind" integer DEFAULT 0,
	"courses_mind" integer DEFAULT 0,
	"subs_mind" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_user_date" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "user_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"tx_hash" varchar,
	"user_id" varchar NOT NULL,
	"action_id" varchar NOT NULL,
	"mind_amount" integer NOT NULL,
	"idempotency_key" varchar NOT NULL,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_rewards_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"token_balance" numeric(10, 2) DEFAULT '0',
	"daily_steps" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"referral_code" varchar,
	"referred_by" varchar,
	"language" varchar DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "book_chapters" ADD CONSTRAINT "book_chapters_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_purchases" ADD CONSTRAINT "book_purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_purchases" ADD CONSTRAINT "book_purchases_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reading_progress" ADD CONSTRAINT "book_reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_reading_progress" ADD CONSTRAINT "book_reading_progress_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscriptions" ADD CONSTRAINT "channel_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_subscriptions" ADD CONSTRAINT "channel_subscriptions_channel_id_sponsor_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."sponsor_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapter_tests" ADD CONSTRAINT "chapter_tests_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reading_progress" ADD CONSTRAINT "course_reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_reading_progress" ADD CONSTRAINT "course_reading_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_challenges" ADD CONSTRAINT "daily_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tests" ADD CONSTRAINT "lesson_tests_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_chapter_id_book_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."book_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_counters" ADD CONSTRAINT "user_daily_counters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "user_date_idx" ON "user_daily_counters" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "user_rewards_user_idx" ON "user_rewards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_rewards_timestamp_idx" ON "user_rewards" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "user_rewards_action_idx" ON "user_rewards" USING btree ("action_id");