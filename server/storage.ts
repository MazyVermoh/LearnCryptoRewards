import {
  users,
  courses,
  books,
  enrollments,
  bookPurchases,
  transactions,
  sponsorChannels,
  channelSubscriptions,
  dailyChallenges,
  courseLessons,
  bookChapters,
  bookReadingProgress,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Book,
  type InsertBook,
  type Enrollment,
  type InsertEnrollment,
  type BookPurchase,
  type InsertBookPurchase,
  type Transaction,
  type InsertTransaction,
  type SponsorChannel,
  type InsertSponsorChannel,
  type ChannelSubscription,
  type InsertChannelSubscription,
  type DailyChallenge,
  type InsertDailyChallenge,
  type CourseLesson,
  type InsertCourseLesson,
  type BookChapter,
  type InsertBookChapter,
  type BookReadingProgress,
  type InsertBookReadingProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, sql, like } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserTokens(userId: string, amount: string): Promise<void>;
  updateUserSteps(userId: string, steps: number): Promise<void>;
  generateReferralCode(userId: string): Promise<string>;
  
  // Course operations
  getCourses(category?: string): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  permanentlyDeleteCourse(id: number): Promise<void>;
  
  // Enrollment operations
  enrollUser(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]>;
  updateEnrollmentProgress(enrollmentId: number, progress: number): Promise<void>;
  
  // Book operations
  getBooks(category?: string, search?: string): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  permanentlyDeleteBook(id: number): Promise<void>;
  generateBookChapters(bookId: number, numberOfChapters: number): Promise<BookChapter[]>;
  generateCourseLessons(courseId: number, numberOfLessons: number): Promise<CourseLesson[]>;
  
  // Book purchase operations
  purchaseBook(purchase: InsertBookPurchase): Promise<BookPurchase>;
  getUserBooks(userId: string): Promise<(BookPurchase & { book: Book })[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Sponsor channel operations
  getSponsorChannels(): Promise<SponsorChannel[]>;
  createSponsorChannel(channel: InsertSponsorChannel): Promise<SponsorChannel>;
  
  // Channel subscription operations
  subscribeToChannel(subscription: InsertChannelSubscription): Promise<ChannelSubscription>;
  getUserSubscriptions(userId: string): Promise<(ChannelSubscription & { channel: SponsorChannel })[]>;
  verifySubscription(subscriptionId: number): Promise<void>;
  
  // Daily challenge operations
  getTodayChallenge(userId: string): Promise<DailyChallenge | undefined>;
  createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge>;
  updateDailyChallenge(id: number, challenge: Partial<InsertDailyChallenge>): Promise<void>;
  
  // Analytics
  getAdminStats(): Promise<{
    totalUsers: number;
    activeCourses: number;
    totalBooks: number;
    tokensDistributed: string;
  }>;
  getAllUsers(): Promise<User[]>;
  
  // Content management
  getCourseLessons(courseId: number): Promise<CourseLesson[]>;
  createCourseLesson(lesson: InsertCourseLesson): Promise<CourseLesson>;
  updateCourseLesson(id: number, lesson: Partial<InsertCourseLesson>): Promise<CourseLesson>;
  deleteCourseLesson(id: number): Promise<void>;
  
  getBookChapters(bookId: number): Promise<BookChapter[]>;
  createBookChapter(chapter: InsertBookChapter): Promise<BookChapter>;
  updateBookChapter(id: number, chapter: Partial<InsertBookChapter>): Promise<BookChapter>;
  deleteBookChapter(id: number): Promise<void>;
  
  // Book reading progress operations
  getBookReadingProgress(userId: string, bookId: number): Promise<BookReadingProgress | undefined>;
  updateBookReadingProgress(userId: string, bookId: number, currentChapter: number): Promise<BookReadingProgress>;
  completeBookReading(userId: string, bookId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserTokens(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({
        tokenBalance: sql`${users.tokenBalance} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserSteps(userId: string, steps: number): Promise<void> {
    await db
      .update(users)
      .set({
        dailySteps: steps,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async generateReferralCode(userId: string): Promise<string> {
    const code = `USER${userId.slice(-4)}${Date.now().toString().slice(-4)}`;
    await db
      .update(users)
      .set({ referralCode: code })
      .where(eq(users.id, userId));
    return code;
  }

  async getCourses(category?: string): Promise<Course[]> {
    const query = db.select().from(courses).where(eq(courses.isActive, true));
    if (category && category !== "all") {
      return await query.where(eq(courses.category, category as any));
    }
    return await query;
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async permanentlyDeleteCourse(id: number): Promise<void> {
    // Delete related course lessons first
    await db.delete(courseLessons).where(eq(courseLessons.courseId, id));
    // Delete related enrollments
    await db.delete(enrollments).where(eq(enrollments.courseId, id));
    // Delete the course
    await db.delete(courses).where(eq(courses.id, id));
  }

  async enrollUser(enrollment: InsertEnrollment): Promise<Enrollment> {
    // Check if user is already enrolled in this course
    const existingEnrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.userId, enrollment.userId),
          eq(enrollments.courseId, enrollment.courseId)
        )
      );
    
    if (existingEnrollment.length > 0) {
      throw new Error('User is already enrolled in this course');
    }
    
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async getUserEnrollments(userId: string): Promise<(Enrollment & { course: Course })[]> {
    return await db
      .select({
        id: enrollments.id,
        userId: enrollments.userId,
        courseId: enrollments.courseId,
        progress: enrollments.progress,
        completedAt: enrollments.completedAt,
        enrolledAt: enrollments.enrolledAt,
        course: courses,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, userId));
  }

  async updateEnrollmentProgress(enrollmentId: number, progress: number): Promise<void> {
    await db
      .update(enrollments)
      .set({
        progress,
        completedAt: progress === 100 ? new Date() : null,
      })
      .where(eq(enrollments.id, enrollmentId));
  }

  async getBooks(category?: string, search?: string): Promise<Book[]> {
    let query = db.select().from(books).where(eq(books.isActive, true));
    
    if (category && category !== "all") {
      query = query.where(eq(books.category, category as any));
    }
    
    if (search) {
      query = query.where(like(books.title, `%${search}%`));
    }
    
    return await query;
  }

  async getBookById(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db.insert(books).values(book).returning();
    return newBook;
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book> {
    const [updatedBook] = await db
      .update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    await db.update(books).set({ isActive: false }).where(eq(books.id, id));
  }

  async permanentlyDeleteBook(id: number): Promise<void> {
    // Delete related book chapters first
    await db.delete(bookChapters).where(eq(bookChapters.bookId, id));
    // Delete related book purchases
    await db.delete(bookPurchases).where(eq(bookPurchases.bookId, id));
    // Delete the book
    await db.delete(books).where(eq(books.id, id));
  }

  async generateBookChapters(bookId: number, numberOfChapters: number): Promise<BookChapter[]> {
    // First, delete existing chapters
    await db.delete(bookChapters).where(eq(bookChapters.bookId, bookId));
    
    // Generate new chapters
    const chapters = [];
    for (let i = 1; i <= numberOfChapters; i++) {
      const chapterData = {
        bookId,
        title: `Chapter ${i}`,
        titleRu: `Глава ${i}`,
        content: `Content for Chapter ${i}...`,
        contentRu: `Содержание для главы ${i}...`,
        orderIndex: i,
      };
      chapters.push(chapterData);
    }
    
    // Insert all chapters at once
    if (chapters.length > 0) {
      const insertedChapters = await db.insert(bookChapters).values(chapters).returning();
      return insertedChapters;
    }
    
    return [];
  }

  async generateCourseLessons(courseId: number, numberOfLessons: number): Promise<CourseLesson[]> {
    // First, delete existing lessons
    await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));
    
    // Generate new lessons
    const lessons = [];
    for (let i = 1; i <= numberOfLessons; i++) {
      const lessonData = {
        courseId,
        title: `Lesson ${i}`,
        titleRu: `Урок ${i}`,
        description: `Description for Lesson ${i}...`,
        descriptionRu: `Описание для урока ${i}...`,
        content: `Content for Lesson ${i}...`,
        contentRu: `Содержание для урока ${i}...`,
        duration: 10,
        orderIndex: i,
      };
      lessons.push(lessonData);
    }
    
    // Insert all lessons at once
    if (lessons.length > 0) {
      const insertedLessons = await db.insert(courseLessons).values(lessons).returning();
      return insertedLessons;
    }
    
    return [];
  }

  async purchaseBook(purchase: InsertBookPurchase): Promise<BookPurchase> {
    // Check if user has already purchased this book
    const existingPurchase = await db
      .select()
      .from(bookPurchases)
      .where(
        and(
          eq(bookPurchases.userId, purchase.userId),
          eq(bookPurchases.bookId, purchase.bookId)
        )
      );
    
    if (existingPurchase.length > 0) {
      throw new Error('User has already purchased this book');
    }
    
    const [newPurchase] = await db.insert(bookPurchases).values(purchase).returning();
    return newPurchase;
  }

  async getUserBooks(userId: string): Promise<(BookPurchase & { book: Book })[]> {
    return await db
      .select({
        id: bookPurchases.id,
        userId: bookPurchases.userId,
        bookId: bookPurchases.bookId,
        purchasedAt: bookPurchases.purchasedAt,
        book: books,
      })
      .from(bookPurchases)
      .innerJoin(books, eq(bookPurchases.bookId, books.id))
      .where(eq(bookPurchases.userId, userId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string, limit = 10): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getSponsorChannels(): Promise<SponsorChannel[]> {
    return await db.select().from(sponsorChannels).where(eq(sponsorChannels.isActive, true));
  }

  async createSponsorChannel(channel: InsertSponsorChannel): Promise<SponsorChannel> {
    const [newChannel] = await db.insert(sponsorChannels).values(channel).returning();
    return newChannel;
  }

  async subscribeToChannel(subscription: InsertChannelSubscription): Promise<ChannelSubscription> {
    const [newSubscription] = await db.insert(channelSubscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getUserSubscriptions(userId: string): Promise<(ChannelSubscription & { channel: SponsorChannel })[]> {
    return await db
      .select({
        id: channelSubscriptions.id,
        userId: channelSubscriptions.userId,
        channelId: channelSubscriptions.channelId,
        verified: channelSubscriptions.verified,
        subscribedAt: channelSubscriptions.subscribedAt,
        channel: sponsorChannels,
      })
      .from(channelSubscriptions)
      .innerJoin(sponsorChannels, eq(channelSubscriptions.channelId, sponsorChannels.id))
      .where(eq(channelSubscriptions.userId, userId));
  }

  async verifySubscription(subscriptionId: number): Promise<void> {
    await db
      .update(channelSubscriptions)
      .set({ verified: true })
      .where(eq(channelSubscriptions.id, subscriptionId));
  }

  async getTodayChallenge(userId: string): Promise<DailyChallenge | undefined> {
    const today = new Date().toISOString().split('T')[0];
    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(and(eq(dailyChallenges.userId, userId), eq(dailyChallenges.date, today)));
    return challenge;
  }

  async createDailyChallenge(challenge: InsertDailyChallenge): Promise<DailyChallenge> {
    const [newChallenge] = await db.insert(dailyChallenges).values(challenge).returning();
    return newChallenge;
  }

  async updateDailyChallenge(id: number, challenge: Partial<InsertDailyChallenge>): Promise<void> {
    await db
      .update(dailyChallenges)
      .set(challenge)
      .where(eq(dailyChallenges.id, id));
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    activeCourses: number;
    totalBooks: number;
    tokensDistributed: string;
  }> {
    const [userCount] = await db.select({ count: sql`count(*)` }).from(users);
    const [courseCount] = await db.select({ count: sql`count(*)` }).from(courses).where(eq(courses.isActive, true));
    const [bookCount] = await db.select({ count: sql`count(*)` }).from(books).where(eq(books.isActive, true));
    const [tokenSum] = await db.select({ sum: sql`sum(${users.tokenBalance})` }).from(users);

    return {
      totalUsers: Number(userCount.count),
      activeCourses: Number(courseCount.count),
      totalBooks: Number(bookCount.count),
      tokensDistributed: tokenSum.sum || "0",
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Content management methods
  async getCourseLessons(courseId: number): Promise<CourseLesson[]> {
    return await db.select().from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(asc(courseLessons.orderIndex));
  }

  async createCourseLesson(lesson: InsertCourseLesson): Promise<CourseLesson> {
    const [newLesson] = await db.insert(courseLessons).values(lesson).returning();
    return newLesson;
  }

  async updateCourseLesson(id: number, lesson: Partial<InsertCourseLesson>): Promise<CourseLesson> {
    const [updatedLesson] = await db.update(courseLessons)
      .set({ ...lesson, updatedAt: new Date() })
      .where(eq(courseLessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteCourseLesson(id: number): Promise<void> {
    await db.delete(courseLessons).where(eq(courseLessons.id, id));
  }

  async getBookChapters(bookId: number): Promise<BookChapter[]> {
    return await db.select().from(bookChapters)
      .where(eq(bookChapters.bookId, bookId))
      .orderBy(asc(bookChapters.orderIndex));
  }

  async createBookChapter(chapter: InsertBookChapter): Promise<BookChapter> {
    const [newChapter] = await db.insert(bookChapters).values(chapter).returning();
    return newChapter;
  }

  async updateBookChapter(id: number, chapter: Partial<InsertBookChapter>): Promise<BookChapter> {
    const [updatedChapter] = await db.update(bookChapters)
      .set({ ...chapter, updatedAt: new Date() })
      .where(eq(bookChapters.id, id))
      .returning();
    return updatedChapter;
  }

  async deleteBookChapter(id: number): Promise<void> {
    await db.delete(bookChapters).where(eq(bookChapters.id, id));
  }

  async getBookReadingProgress(userId: string, bookId: number): Promise<BookReadingProgress | undefined> {
    const result = await db.select().from(bookReadingProgress)
      .where(and(
        eq(bookReadingProgress.userId, userId),
        eq(bookReadingProgress.bookId, bookId)
      ));
    return result[0];
  }

  async updateBookReadingProgress(userId: string, bookId: number, currentChapter: number): Promise<BookReadingProgress> {
    // First check if progress exists
    const existing = await this.getBookReadingProgress(userId, bookId);
    
    if (existing) {
      // Update existing progress
      const result = await db.update(bookReadingProgress)
        .set({
          currentChapter,
          updatedAt: new Date()
        })
        .where(and(
          eq(bookReadingProgress.userId, userId),
          eq(bookReadingProgress.bookId, bookId)
        ))
        .returning();
      return result[0];
    } else {
      // Create new progress record
      // First get the total chapters for this book
      const chapters = await db.select().from(bookChapters)
        .where(eq(bookChapters.bookId, bookId));
      
      const result = await db.insert(bookReadingProgress)
        .values({
          userId,
          bookId,
          currentChapter,
          totalChapters: chapters.length,
          isCompleted: false,
          rewardClaimed: false
        })
        .returning();
      return result[0];
    }
  }

  async completeBookReading(userId: string, bookId: number): Promise<void> {
    const progress = await this.getBookReadingProgress(userId, bookId);
    
    if (progress && !progress.isCompleted) {
      // Mark as completed
      await db.update(bookReadingProgress)
        .set({
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(bookReadingProgress.userId, userId),
          eq(bookReadingProgress.bookId, bookId)
        ));

      // Give reward - 100 MIND tokens for completing a book
      const rewardAmount = "100";
      await this.updateUserTokens(userId, rewardAmount);
      
      // Create transaction record
      await this.createTransaction({
        userId,
        amount: rewardAmount,
        type: "reward",
        description: "Book completion reward",
        status: "completed"
      });

      // Mark reward as claimed
      await db.update(bookReadingProgress)
        .set({
          rewardClaimed: true,
          updatedAt: new Date()
        })
        .where(and(
          eq(bookReadingProgress.userId, userId),
          eq(bookReadingProgress.bookId, bookId)
        ));
    }
  }
}

export const storage = new DatabaseStorage();
