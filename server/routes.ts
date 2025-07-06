import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerRewardRoutes } from "./reward-routes";
import { z } from "zod";
import {
  insertCourseSchema,
  insertBookSchema,
  insertEnrollmentSchema,
  insertBookPurchaseSchema,
  insertTransactionSchema,
  insertSponsorChannelSchema,
  insertChannelSubscriptionSchema,
  insertDailyChallengeSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { category } = req.query;
      const courses = await storage.getCourses(category as string);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourseById(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Failed to update course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment routes
  app.post("/api/enrollments", async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.enrollUser(enrollmentData);
      
      // Create transaction record
      await storage.createTransaction({
        userId: enrollmentData.userId,
        type: "purchase",
        amount: "-" + req.body.coursePrice,
        description: `Enrolled in course: ${req.body.courseTitle}`,
      });

      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(400).json({ message: "Failed to enroll user" });
    }
  });

  app.get("/api/users/:userId/enrollments", async (req, res) => {
    try {
      const { userId } = req.params;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      await storage.updateEnrollmentProgress(id, progress);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Book routes
  app.get("/api/books", async (req, res) => {
    try {
      const { category, search } = req.query;
      const books = await storage.getBooks(category as string, search as string);
      res.json(books);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error creating book:", error);
      res.status(400).json({ message: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(400).json({ message: "Failed to update book" });
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Book purchase routes
  app.post("/api/book-purchases", async (req, res) => {
    try {
      const purchaseData = insertBookPurchaseSchema.parse(req.body);
      const purchase = await storage.purchaseBook(purchaseData);
      
      // Create transaction record
      await storage.createTransaction({
        userId: purchaseData.userId,
        type: "purchase",
        amount: "-" + req.body.bookPrice,
        description: `Purchased book: ${req.body.bookTitle}`,
      });

      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error purchasing book:", error);
      res.status(400).json({ message: "Failed to purchase book" });
    }
  });

  app.get("/api/users/:userId/books", async (req, res) => {
    try {
      const { userId } = req.params;
      const books = await storage.getUserBooks(userId);
      res.json(books);
    } catch (error) {
      console.error("Error fetching user books:", error);
      res.status(500).json({ message: "Failed to fetch user books" });
    }
  });

  // Transaction routes
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const transactions = await storage.getUserTransactions(userId, limit ? parseInt(limit as string) : undefined);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Update user token balance
      await storage.updateUserTokens(transactionData.userId, transactionData.amount);
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Sponsor channel routes
  app.get("/api/sponsor-channels", async (req, res) => {
    try {
      const channels = await storage.getSponsorChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching sponsor channels:", error);
      res.status(500).json({ message: "Failed to fetch sponsor channels" });
    }
  });

  app.post("/api/sponsor-channels", async (req, res) => {
    try {
      const channelData = insertSponsorChannelSchema.parse(req.body);
      const channel = await storage.createSponsorChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating sponsor channel:", error);
      res.status(400).json({ message: "Failed to create sponsor channel" });
    }
  });

  // Channel subscription routes
  app.post("/api/channel-subscriptions", async (req, res) => {
    try {
      const subscriptionData = insertChannelSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeToChannel(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error subscribing to channel:", error);
      res.status(400).json({ message: "Failed to subscribe to channel" });
    }
  });

  app.get("/api/users/:userId/subscriptions", async (req, res) => {
    try {
      const { userId } = req.params;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.put("/api/subscriptions/:id/verify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.verifySubscription(id);
      
      // Award tokens for subscription
      const { userId, reward } = req.body;
      await storage.createTransaction({
        userId,
        type: "subscription",
        amount: reward,
        description: "Channel subscription reward",
      });
      
      res.status(204).send();
    } catch (error) {
      console.error("Error verifying subscription:", error);
      res.status(500).json({ message: "Failed to verify subscription" });
    }
  });

  // Daily challenge routes
  app.get("/api/users/:userId/daily-challenge", async (req, res) => {
    try {
      const { userId } = req.params;
      let challenge = await storage.getTodayChallenge(userId);
      
      if (!challenge) {
        // Create today's challenge
        const today = new Date().toISOString().split('T')[0];
        challenge = await storage.createDailyChallenge({
          userId,
          date: today,
          targetSteps: 10000,
          actualSteps: 0,
          completed: false,
          rewardClaimed: false,
        });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
      res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
  });

  app.put("/api/daily-challenges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      await storage.updateDailyChallenge(id, updateData);
      
      // Award tokens if challenge completed
      if (updateData.completed && updateData.rewardClaimed) {
        await storage.createTransaction({
          userId: updateData.userId,
          type: "steps",
          amount: "50",
          description: "Daily steps challenge completed",
        });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error updating daily challenge:", error);
      res.status(500).json({ message: "Failed to update daily challenge" });
    }
  });

  // User routes
  app.get("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:userId/steps", async (req, res) => {
    try {
      const { userId } = req.params;
      const { steps } = req.body;
      await storage.updateUserSteps(userId, steps);
      res.status(204).send();
    } catch (error) {
      console.error("Error updating user steps:", error);
      res.status(500).json({ message: "Failed to update user steps" });
    }
  });

  app.post("/api/users/:userId/referral-code", async (req, res) => {
    try {
      const { userId } = req.params;
      const code = await storage.generateReferralCode(userId);
      res.json({ code });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Course content management routes
  app.get("/api/courses/:id/lessons", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getCourseLessons(courseId);
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching course lessons:", error);
      res.status(500).json({ error: "Failed to fetch course lessons" });
    }
  });

  app.post("/api/courses/:id/lessons", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const lesson = await storage.createCourseLesson({
        ...req.body,
        courseId
      });
      res.json(lesson);
    } catch (error) {
      console.error("Error creating course lesson:", error);
      res.status(500).json({ error: "Failed to create course lesson" });
    }
  });

  app.put("/api/course-lessons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.updateCourseLesson(id, req.body);
      res.json(lesson);
    } catch (error) {
      console.error("Error updating course lesson:", error);
      res.status(500).json({ error: "Failed to update course lesson" });
    }
  });

  app.delete("/api/course-lessons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourseLesson(id);
      res.json({ message: "Course lesson deleted successfully" });
    } catch (error) {
      console.error("Error deleting course lesson:", error);
      res.status(500).json({ error: "Failed to delete course lesson" });
    }
  });

  // Book content management routes
  app.get("/api/books/:id/chapters", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const chapters = await storage.getBookChapters(bookId);
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching book chapters:", error);
      res.status(500).json({ error: "Failed to fetch book chapters" });
    }
  });

  app.post("/api/books/:id/chapters", async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const chapter = await storage.createBookChapter({
        ...req.body,
        bookId
      });
      res.json(chapter);
    } catch (error) {
      console.error("Error creating book chapter:", error);
      res.status(500).json({ error: "Failed to create book chapter" });
    }
  });

  app.put("/api/book-chapters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating chapter", id, "with data:", req.body);
      const chapter = await storage.updateBookChapter(id, req.body);
      console.log("Updated chapter:", chapter);
      res.json(chapter);
    } catch (error) {
      console.error("Error updating book chapter:", error);
      res.status(500).json({ error: "Failed to update book chapter" });
    }
  });

  app.delete("/api/book-chapters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookChapter(id);
      res.json({ message: "Book chapter deleted successfully" });
    } catch (error) {
      console.error("Error deleting book chapter:", error);
      res.status(500).json({ error: "Failed to delete book chapter" });
    }
  });

  // Register MIND Token reward system routes
  registerRewardRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
