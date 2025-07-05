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
export const courseCategoryEnum = pgEnum("course_category", ["business", "fitness", "crypto", "self-development"]);

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  instructor: varchar("instructor").notNull(),
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
export const bookCategoryEnum = pgEnum("book_category", ["business", "psychology", "technology", "finance", "all"]);

// Books table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  author: varchar("author").notNull(),
  description: text("description"),
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

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  enrollments: many(enrollments),
  bookPurchases: many(bookPurchases),
  transactions: many(transactions),
  channelSubscriptions: many(channelSubscriptions),
  dailyChallenges: many(dailyChallenges),
  referrer: one(users, { fields: [users.referredBy], references: [users.id] }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const booksRelations = relations(books, ({ many }) => ({
  purchases: many(bookPurchases),
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
