import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  tokenBalance: decimal("token_balance", { precision: 10, scale: 2 }).default("0"),
  dailySteps: integer("daily_steps").default(0),
  level: integer("level").default(1),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by").references(() => users.id),
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course categories enum
export const courseCategoryEnum = pgEnum("course_category", ["mind-thinking", "finance-economics", "career-skills", "future-thinking", "health-body"]);

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleRu: varchar("title_ru"),
  description: text("description"),
  descriptionRu: text("description_ru"),
  instructor: varchar("instructor").notNull(),
  instructorRu: varchar("instructor_ru"),
  category: courseCategoryEnum("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  imageUrl: varchar("image_url"),
  duration: integer("duration_minutes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User course enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  progress: integer("progress").default(0), // 0-100
  completedAt: timestamp("completed_at"),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});

// Book categories enum
export const bookCategoryEnum = pgEnum("book_category", ["psychology-thinking-development", "financial-literacy-economics", "marketing", "health-fitness-nutrition", "communication-soft-skills", "entrepreneurship-career", "technology-future", "relationships", "popular-personalities"]);

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  titleRu: varchar("title_ru"),
  author: varchar("author").notNull(),
  authorRu: varchar("author_ru"),
  description: text("description"),
  descriptionRu: text("description_ru"),
  category: bookCategoryEnum("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  coverImageUrl: varchar("cover_image_url"),
  fileUrl: varchar("file_url"),
  pageCount: integer("page_count"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User book purchases
export const bookPurchases = pgTable("book_purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bookId: integer("book_id").references(() => books.id).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Transaction types enum
export const transactionTypeEnum = pgEnum("transaction_type", ["reward", "purchase", "referral", "steps", "subscription"]);

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sponsor channels table
export const sponsorChannels = pgTable("sponsor_channels", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  channelUrl: varchar("channel_url").notNull(),
  reward: decimal("reward", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User channel subscriptions
export const channelSubscriptions = pgTable("channel_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  channelId: integer("channel_id").references(() => sponsorChannels.id).notNull(),
  verified: boolean("verified").default(false),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

// Daily challenges table
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  targetSteps: integer("target_steps").default(10000),
  actualSteps: integer("actual_steps").default(0),
  completed: boolean("completed").default(false),
  rewardClaimed: boolean("reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// MIND Token reward system tables
export const userDailyCounters = pgTable("user_daily_counters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  stepsMind: integer("steps_mind").default(0),
  booksMind: integer("books_mind").default(0),
  coursesMind: integer("courses_mind").default(0),
  subsMind: integer("subs_mind").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("user_date_idx").on(table.userId, table.date),
  uniqueUserDate: unique("unique_user_date").on(table.userId, table.date),
}));

export const userRewards = pgTable("user_rewards", {
  id: serial("id").primaryKey(),
  txHash: varchar("tx_hash"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  actionId: varchar("action_id").notNull(),
  mindAmount: integer("mind_amount").notNull(),
  idempotencyKey: varchar("idempotency_key").notNull().unique(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_rewards_user_idx").on(table.userId),
  timestampIdx: index("user_rewards_timestamp_idx").on(table.timestamp),
  actionIdx: index("user_rewards_action_idx").on(table.actionId),
}));

// Course lessons table
export const courseLessons = pgTable("course_lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  titleRu: varchar("title_ru"),
  description: text("description"),
  descriptionRu: text("description_ru"),
  content: text("content").notNull(),
  contentRu: text("content_ru"),
  videoUrl: varchar("video_url"),
  duration: integer("duration"), // in minutes
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Book chapters table
export const bookChapters = pgTable("book_chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  titleRu: varchar("title_ru"),
  content: text("content").notNull(),
  contentRu: text("content_ru"),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Book reading progress table
export const bookReadingProgress = pgTable("book_reading_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  currentChapter: integer("current_chapter").default(1),
  totalChapters: integer("total_chapters").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.bookId),
]);

// Course reading progress table
export const courseReadingProgress = pgTable("course_reading_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  currentLesson: integer("current_lesson").default(1),
  totalLessons: integer("total_lessons").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  rewardClaimed: boolean("reward_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.courseId),
]);

// Tests for chapters and lessons
export const chapterTests = pgTable("chapter_tests", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => bookChapters.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  questionRu: text("question_ru"),
  options: text("options").array().notNull(), // JSON array of options
  optionsRu: text("options_ru").array(), // JSON array of Russian options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option (0-based)
  explanation: text("explanation"),
  explanationRu: text("explanation_ru"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonTests = pgTable("lesson_tests", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => courseLessons.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  questionRu: text("question_ru"),
  options: text("options").array().notNull(), // JSON array of options
  optionsRu: text("options_ru").array(), // JSON array of Russian options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct option (0-based)
  explanation: text("explanation"),
  explanationRu: text("explanation_ru"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Test attempts/results
export const testAttempts = pgTable("test_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  testType: varchar("test_type").notNull(), // 'chapter' or 'lesson'
  testId: integer("test_id").notNull(), // chapterTests.id or lessonTests.id
  chapterId: integer("chapter_id").references(() => bookChapters.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => courseLessons.id, { onDelete: "cascade" }),
  selectedAnswer: integer("selected_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  attemptedAt: timestamp("attempted_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  enrollments: many(enrollments),
  bookPurchases: many(bookPurchases),
  transactions: many(transactions),
  channelSubscriptions: many(channelSubscriptions),
  dailyChallenges: many(dailyChallenges),
  bookReadingProgress: many(bookReadingProgress),
  courseReadingProgress: many(courseReadingProgress),
  referrer: one(users, { fields: [users.referredBy], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  lessons: many(courseLessons),
  readingProgress: many(courseReadingProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const booksRelations = relations(books, ({ many }) => ({
  purchases: many(bookPurchases),
  chapters: many(bookChapters),
  readingProgress: many(bookReadingProgress),
}));

export const bookPurchasesRelations = relations(bookPurchases, ({ one }) => ({
  user: one(users, { fields: [bookPurchases.userId], references: [users.id] }),
  book: one(books, { fields: [bookPurchases.bookId], references: [books.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const sponsorChannelsRelations = relations(sponsorChannels, ({ many }) => ({
  subscriptions: many(channelSubscriptions),
}));

export const channelSubscriptionsRelations = relations(channelSubscriptions, ({ one }) => ({
  user: one(users, { fields: [channelSubscriptions.userId], references: [users.id] }),
  channel: one(sponsorChannels, { fields: [channelSubscriptions.channelId], references: [sponsorChannels.id] }),
}));

export const dailyChallengesRelations = relations(dailyChallenges, ({ one }) => ({
  user: one(users, { fields: [dailyChallenges.userId], references: [users.id] }),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  course: one(courses, { fields: [courseLessons.courseId], references: [courses.id] }),
  tests: many(lessonTests),
}));

export const bookChaptersRelations = relations(bookChapters, ({ one, many }) => ({
  book: one(books, { fields: [bookChapters.bookId], references: [books.id] }),
  tests: many(chapterTests),
}));

export const chapterTestsRelations = relations(chapterTests, ({ one, many }) => ({
  chapter: one(bookChapters, { fields: [chapterTests.chapterId], references: [bookChapters.id] }),
  attempts: many(testAttempts),
}));

export const lessonTestsRelations = relations(lessonTests, ({ one, many }) => ({
  lesson: one(courseLessons, { fields: [lessonTests.lessonId], references: [courseLessons.id] }),
  attempts: many(testAttempts),
}));

export const testAttemptsRelations = relations(testAttempts, ({ one }) => ({
  user: one(users, { fields: [testAttempts.userId], references: [users.id] }),
  chapter: one(bookChapters, { fields: [testAttempts.chapterId], references: [bookChapters.id] }),
  lesson: one(courseLessons, { fields: [testAttempts.lessonId], references: [courseLessons.id] }),
}));

export const bookReadingProgressRelations = relations(bookReadingProgress, ({ one }) => ({
  user: one(users, { fields: [bookReadingProgress.userId], references: [users.id] }),
  book: one(books, { fields: [bookReadingProgress.bookId], references: [books.id] }),
}));

export const courseReadingProgressRelations = relations(courseReadingProgress, ({ one }) => ({
  user: one(users, { fields: [courseReadingProgress.userId], references: [users.id] }),
  course: one(courses, { fields: [courseReadingProgress.courseId], references: [courses.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertEnrollmentSchema = createInsertSchema(enrollments);
export const insertBookSchema = createInsertSchema(books);
export const insertBookPurchaseSchema = createInsertSchema(bookPurchases);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertSponsorChannelSchema = createInsertSchema(sponsorChannels);
export const insertChannelSubscriptionSchema = createInsertSchema(channelSubscriptions);
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges);
export const insertCourseLessonSchema = createInsertSchema(courseLessons);
export const insertBookChapterSchema = createInsertSchema(bookChapters);
export const insertChapterTestSchema = createInsertSchema(chapterTests);
export const insertLessonTestSchema = createInsertSchema(lessonTests);
export const insertTestAttemptSchema = createInsertSchema(testAttempts);
export const insertBookReadingProgressSchema = createInsertSchema(bookReadingProgress);
export const insertCourseReadingProgressSchema = createInsertSchema(courseReadingProgress);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type BookPurchase = typeof bookPurchases.$inferSelect;
export type InsertBookPurchase = z.infer<typeof insertBookPurchaseSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SponsorChannel = typeof sponsorChannels.$inferSelect;
export type InsertSponsorChannel = z.infer<typeof insertSponsorChannelSchema>;
export type ChannelSubscription = typeof channelSubscriptions.$inferSelect;
export type InsertChannelSubscription = z.infer<typeof insertChannelSubscriptionSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;

// MIND Token reward system types
export type UserDailyCounter = typeof userDailyCounters.$inferSelect;
export type InsertUserDailyCounter = typeof userDailyCounters.$inferInsert;
export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = typeof userRewards.$inferInsert;
export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type BookChapter = typeof bookChapters.$inferSelect;
export type InsertBookChapter = z.infer<typeof insertBookChapterSchema>;
export type BookReadingProgress = typeof bookReadingProgress.$inferSelect;
export type InsertBookReadingProgress = z.infer<typeof insertBookReadingProgressSchema>;
export type CourseReadingProgress = typeof courseReadingProgress.$inferSelect;
export type InsertCourseReadingProgress = z.infer<typeof insertCourseReadingProgressSchema>;

// Test types
export type ChapterTest = typeof chapterTests.$inferSelect;
export type InsertChapterTest = z.infer<typeof insertChapterTestSchema>;
export type LessonTest = typeof lessonTests.$inferSelect;
export type InsertLessonTest = z.infer<typeof insertLessonTestSchema>;
export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;
