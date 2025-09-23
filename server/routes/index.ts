import type { Express, Request, Response } from 'express';
import { createServer, type Server } from 'http';
import { z } from 'zod';

import {
  insertCourseSchema,
  insertBookSchema,
  insertEnrollmentSchema,
  insertBookPurchaseSchema,
  insertTransactionSchema,
  insertSponsorChannelSchema,
  insertChannelSubscriptionSchema,
  insertChapterTestSchema,
  insertLessonTestSchema,
  insertTestAttemptSchema,
  insertTextContentSchema,
} from '@shared/schema';

import { storage } from '../services/storage.service';
import { registerRewardRoutes } from './reward.routes';
import { logger } from '../utils/logger';
import { registerUser } from '../services/user.service';
import { getUserProfile } from '../services/profile.service';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export async function registerRoutes(app: Express): Promise<Server> {
  const userRegistrationSchema = z.object({
    id: z.string().min(1),
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().optional(),
    referredBy: z.string().optional(),
  });

  app.post('/api/users/register', async (req, res) => {
    try {
      const payload = userRegistrationSchema.parse(req.body);
      const user = await registerUser(payload);
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
      });
    } catch (error) {
      logger.error('Error registering user:', error);
      res.status(400).json({ message: 'Failed to register user', error: getErrorMessage(error) });
    }
  });

  app.get('/api/users/:userId/profile', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(profile);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      res
        .status(500)
        .json({ message: 'Failed to fetch user profile', error: getErrorMessage(error) });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const { category } = req.query;
      const courses = await storage.getCourses(category as string);
      res.json(courses);
    } catch (error) {
      logger.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Failed to fetch courses' });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourseById(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      logger.error('Error fetching course:', error);
      res.status(500).json({ message: 'Failed to fetch course' });
    }
  });

  app.put('/api/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      res.json(course);
    } catch (error) {
      logger.error('Error updating course:', error);
      res.status(400).json({
        message: 'Failed to update course',
        error: getErrorMessage(error),
      });
    }
  });

  app.post('/api/courses', async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      logger.error('Error creating course:', error);
      res.status(400).json({ message: 'Failed to create course' });
    }
  });

  app.delete('/api/courses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting course:', error);
      res.status(500).json({ message: 'Failed to delete course' });
    }
  });

  app.delete('/api/courses/:id/permanent', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.permanentlyDeleteCourse(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error permanently deleting course:', error);
      res.status(500).json({ message: 'Failed to permanently delete course' });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.enrollUser(enrollmentData);

      // Create transaction record
      await storage.createTransaction({
        userId: enrollmentData.userId,
        type: 'purchase',
        amount: '-' + req.body.coursePrice,
        description: `Enrolled in course: ${req.body.courseTitle}`,
      });

      res.status(201).json(enrollment);
    } catch (error) {
      logger.error('Error creating enrollment:', error);
      if (error instanceof Error && error.message === 'User is already enrolled in this course') {
        res.status(409).json({ message: 'You are already enrolled in this course' });
      } else {
        res.status(400).json({ message: 'Failed to enroll user' });
      }
    }
  });

  app.get('/api/users/:userId/enrollments', async (req, res) => {
    try {
      const { userId } = req.params;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      logger.error('Error fetching enrollments:', error);
      res.status(500).json({ message: 'Failed to fetch enrollments' });
    }
  });

  app.put('/api/enrollments/:id/progress', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { progress } = req.body;
      await storage.updateEnrollmentProgress(id, progress);
      res.status(204).send();
    } catch (error) {
      logger.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const { category, search } = req.query;
      const books = await storage.getBooks(category as string, search as string);
      res.json(books);
    } catch (error) {
      logger.error('Error fetching books:', error);
      res.status(500).json({ message: 'Failed to fetch books' });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const book = await storage.getBookById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      res.json(book);
    } catch (error) {
      logger.error('Error fetching book:', error);
      res.status(500).json({ message: 'Failed to fetch book' });
    }
  });

  app.post('/api/books', async (req, res) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      logger.error('Error creating book:', error);
      res.status(400).json({ message: 'Failed to create book' });
    }
  });

  app.put('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      res.json(book);
    } catch (error) {
      logger.error('Error updating book:', error);
      res.status(400).json({ message: 'Failed to update book' });
    }
  });

  app.delete('/api/books/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBook(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting book:', error);
      res.status(500).json({ message: 'Failed to delete book' });
    }
  });

  app.delete('/api/books/:id/permanent', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.permanentlyDeleteBook(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error permanently deleting book:', error);
      res.status(500).json({ message: 'Failed to permanently delete book' });
    }
  });

  app.post('/api/books/:id/generate-chapters', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { numberOfChapters } = req.body;

      if (!numberOfChapters || numberOfChapters < 1 || numberOfChapters > 50) {
        return res.status(400).json({ message: 'Number of chapters must be between 1 and 50' });
      }

      const chapters = await storage.generateBookChapters(id, numberOfChapters);
      res.status(201).json(chapters);
    } catch (error) {
      logger.error('Error generating book chapters:', error);
      res.status(500).json({ message: 'Failed to generate book chapters' });
    }
  });

  // Generate course lessons
  app.post('/api/courses/:id/generate-lessons', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { numberOfLessons } = req.body;

      if (!numberOfLessons || numberOfLessons < 1 || numberOfLessons > 50) {
        return res.status(400).json({ message: 'Number of lessons must be between 1 and 50' });
      }

      const lessons = await storage.generateCourseLessons(id, numberOfLessons);
      res.status(201).json(lessons);
    } catch (error) {
      logger.error('Error generating course lessons:', error);
      res.status(500).json({ message: 'Failed to generate course lessons' });
    }
  });

  // Book purchase routes
  app.post('/api/book-purchases', async (req, res) => {
    try {
      const purchaseData = insertBookPurchaseSchema.parse(req.body);
      const purchase = await storage.purchaseBook(purchaseData);

      // Create transaction record
      await storage.createTransaction({
        userId: purchaseData.userId,
        type: 'purchase',
        amount: '-' + req.body.bookPrice,
        description: `Purchased book: ${req.body.bookTitle}`,
      });

      res.status(201).json(purchase);
    } catch (error) {
      logger.error('Error purchasing book:', error);
      if (error instanceof Error && error.message === 'User has already purchased this book') {
        res.status(409).json({ message: 'You have already purchased this book' });
      } else {
        res.status(400).json({ message: 'Failed to purchase book' });
      }
    }
  });

  app.get('/api/users/:userId/books', async (req, res) => {
    try {
      const { userId } = req.params;
      const books = await storage.getUserBooks(userId);
      res.json(books);
    } catch (error) {
      logger.error('Error fetching user books:', error);
      res.status(500).json({ message: 'Failed to fetch user books' });
    }
  });

  // Transaction routes
  app.get('/api/users/:userId/transactions', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      const transactions = await storage.getUserTransactions(
        userId,
        limit ? parseInt(limit as string) : undefined,
      );
      res.json(transactions);
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);

      // Update user token balance
      await storage.updateUserTokens(transactionData.userId, transactionData.amount);

      res.status(201).json(transaction);
    } catch (error) {
      logger.error('Error creating transaction:', error);
      res.status(400).json({ message: 'Failed to create transaction' });
    }
  });

  // Sponsor channel routes
  app.get('/api/sponsor-channels', async (req, res) => {
    try {
      const channels = await storage.getSponsorChannels();
      res.json(channels);
    } catch (error) {
      logger.error('Error fetching sponsor channels:', error);
      res.status(500).json({ message: 'Failed to fetch sponsor channels' });
    }
  });

  app.post('/api/sponsor-channels', async (req, res) => {
    try {
      const channelData = insertSponsorChannelSchema.parse(req.body);
      const channel = await storage.createSponsorChannel(channelData);
      res.status(201).json(channel);
    } catch (error) {
      logger.error('Error creating sponsor channel:', error);
      res.status(400).json({ message: 'Failed to create sponsor channel' });
    }
  });

  // Channel subscription routes
  app.post('/api/channel-subscriptions', async (req, res) => {
    try {
      const subscriptionData = insertChannelSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeToChannel(subscriptionData);
      res.status(201).json(subscription);
    } catch (error) {
      logger.error('Error subscribing to channel:', error);
      res.status(400).json({ message: 'Failed to subscribe to channel' });
    }
  });

  app.get('/api/users/:userId/subscriptions', async (req, res) => {
    try {
      const { userId } = req.params;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      logger.error('Error fetching subscriptions:', error);
      res.status(500).json({ message: 'Failed to fetch subscriptions' });
    }
  });

  app.put('/api/subscriptions/:id/verify', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.verifySubscription(id);

      // Award tokens for subscription
      const { userId, reward } = req.body;
      await storage.createTransaction({
        userId,
        type: 'subscription',
        amount: reward,
        description: 'Channel subscription reward',
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Error verifying subscription:', error);
      res.status(500).json({ message: 'Failed to verify subscription' });
    }
  });

  // Daily challenge routes
  app.get('/api/users/:userId/daily-challenge', async (req, res) => {
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
      logger.error('Error fetching daily challenge:', error);
      res.status(500).json({ message: 'Failed to fetch daily challenge' });
    }
  });

  app.put('/api/daily-challenges/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      await storage.updateDailyChallenge(id, updateData);

      // Award tokens if challenge completed
      if (updateData.completed && updateData.rewardClaimed) {
        await storage.createTransaction({
          userId: updateData.userId,
          type: 'steps',
          amount: '50',
          description: 'Daily steps challenge completed',
        });
      }

      res.status(204).send();
    } catch (error) {
      logger.error('Error updating daily challenge:', error);
      res.status(500).json({ message: 'Failed to update daily challenge' });
    }
  });

  // User routes
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      logger.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  app.put('/api/users/:userId/steps', async (req, res) => {
    try {
      const { userId } = req.params;
      const { steps } = req.body;
      await storage.updateUserSteps(userId, steps);
      res.status(204).send();
    } catch (error) {
      logger.error('Error updating user steps:', error);
      res.status(500).json({ message: 'Failed to update user steps' });
    }
  });

  app.post('/api/users/:userId/referral-code', async (req, res) => {
    try {
      const { userId } = req.params;
      const code = await storage.generateReferralCode(userId);
      res.json({ code });
    } catch (error) {
      logger.error('Error generating referral code:', error);
      res.status(500).json({ message: 'Failed to generate referral code' });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      logger.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin stats' });
    }
  });

  app.get('/api/admin/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCoursesForAdmin();
      res.json(courses);
    } catch (error) {
      logger.error('Error fetching admin courses:', error);
      res.status(500).json({ message: 'Failed to fetch admin courses' });
    }
  });

  app.patch('/api/admin/courses/:id/visibility', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { isVisible } = req.body;
      await storage.updateCourseVisibility(courseId, isVisible);
      res.status(204).send();
    } catch (error) {
      logger.error('Error updating course visibility:', error);
      res.status(500).json({ message: 'Failed to update course visibility' });
    }
  });

  app.get('/api/admin/books', async (req, res) => {
    try {
      const books = await storage.getAllBooksForAdmin();
      res.json(books);
    } catch (error) {
      logger.error('Error fetching admin books:', error);
      res.status(500).json({ message: 'Failed to fetch admin books' });
    }
  });

  app.patch('/api/admin/books/:id/visibility', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const { isVisible } = req.body;
      await storage.updateBookVisibility(bookId, isVisible);
      res.status(204).send();
    } catch (error) {
      logger.error('Error updating book visibility:', error);
      res.status(500).json({ message: 'Failed to update book visibility' });
    }
  });

  // Course content management routes
  app.get('/api/courses/:id/lessons', async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const lessons = await storage.getCourseLessons(courseId);
      res.json(lessons);
    } catch (error) {
      logger.error('Error fetching course lessons:', error);
      res.status(500).json({ error: 'Failed to fetch course lessons' });
    }
  });

  app.post('/api/courses/:id/lessons', async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      const lesson = await storage.createCourseLesson({
        ...req.body,
        courseId,
      });
      res.json(lesson);
    } catch (error) {
      logger.error('Error creating course lesson:', error);
      res.status(500).json({ error: 'Failed to create course lesson' });
    }
  });

  app.put('/api/course-lessons/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.updateCourseLesson(id, req.body);
      res.json(lesson);
    } catch (error) {
      logger.error('Error updating course lesson:', error);
      res.status(500).json({ error: 'Failed to update course lesson' });
    }
  });

  app.delete('/api/course-lessons/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourseLesson(id);
      res.json({ message: 'Course lesson deleted successfully' });
    } catch (error) {
      logger.error('Error deleting course lesson:', error);
      res.status(500).json({ error: 'Failed to delete course lesson' });
    }
  });

  // Book content management routes
  app.get('/api/books/:id/chapters', async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const chapters = await storage.getBookChapters(bookId);
      res.json(chapters);
    } catch (error) {
      logger.error('Error fetching book chapters:', error);
      res.status(500).json({ error: 'Failed to fetch book chapters' });
    }
  });

  app.post('/api/books/:id/chapters', async (req: Request, res: Response) => {
    try {
      const bookId = parseInt(req.params.id);
      const chapter = await storage.createBookChapter({
        ...req.body,
        bookId,
      });
      res.json(chapter);
    } catch (error) {
      logger.error('Error creating book chapter:', error);
      res.status(500).json({ error: 'Failed to create book chapter' });
    }
  });

  app.put('/api/book-chapters/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const chapter = await storage.updateBookChapter(id, req.body);
      res.json(chapter);
    } catch (error) {
      logger.error('Error updating book chapter:', error);
      res.status(500).json({ error: 'Failed to update book chapter' });
    }
  });

  app.delete('/api/book-chapters/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookChapter(id);
      res.json({ message: 'Book chapter deleted successfully' });
    } catch (error) {
      logger.error('Error deleting book chapter:', error);
      res.status(500).json({ error: 'Failed to delete book chapter' });
    }
  });

  // Book reading progress routes
  app.get('/api/users/:userId/books/:bookId/progress', async (req: Request, res: Response) => {
    try {
      const { userId, bookId } = req.params;
      const progress = await storage.getBookReadingProgress(userId, parseInt(bookId));
      res.json(progress);
    } catch (error) {
      logger.error('Error getting book reading progress:', error);
      res.status(500).json({ error: 'Failed to get book reading progress' });
    }
  });

  app.put('/api/users/:userId/books/:bookId/progress', async (req: Request, res: Response) => {
    try {
      const { userId, bookId } = req.params;
      const { currentChapter } = req.body;

      const progress = await storage.updateBookReadingProgress(
        userId,
        parseInt(bookId),
        currentChapter,
      );

      // Check if book is completed (currentChapter equals totalChapters)
      if (currentChapter >= progress.totalChapters && !progress.isCompleted) {
        await storage.completeBookReading(userId, parseInt(bookId));
      }

      res.json(progress);
    } catch (error) {
      logger.error('Error updating book reading progress:', error);
      res.status(500).json({ error: 'Failed to update book reading progress' });
    }
  });

  // Complete book manually
  app.post('/api/users/:userId/books/:bookId/complete', async (req: Request, res: Response) => {
    try {
      const { userId, bookId } = req.params;
      await storage.completeBookReading(userId, parseInt(bookId));
      res.json({ success: true });
    } catch (error) {
      logger.error('Error completing book:', error);
      res.status(500).json({ error: 'Failed to complete book' });
    }
  });

  // Course reading progress routes
  app.get('/api/users/:userId/courses/:courseId/progress', async (req: Request, res: Response) => {
    try {
      const { userId, courseId } = req.params;
      const progress = await storage.getCourseReadingProgress(userId, parseInt(courseId));
      res.json(progress);
    } catch (error) {
      logger.error('Error getting course reading progress:', error);
      res.status(500).json({ error: 'Failed to get course reading progress' });
    }
  });

  app.put('/api/users/:userId/courses/:courseId/progress', async (req: Request, res: Response) => {
    try {
      const { userId, courseId } = req.params;
      const { currentLesson } = req.body;

      const progress = await storage.updateCourseReadingProgress(
        userId,
        parseInt(courseId),
        currentLesson,
      );

      // Check if course is completed (currentLesson equals totalLessons)
      if (currentLesson >= progress.totalLessons && !progress.isCompleted) {
        await storage.completeCourseReading(userId, parseInt(courseId));
      }

      res.json(progress);
    } catch (error) {
      logger.error('Error updating course reading progress:', error);
      res.status(500).json({ error: 'Failed to update course reading progress' });
    }
  });

  // Complete course manually
  app.post('/api/users/:userId/courses/:courseId/complete', async (req: Request, res: Response) => {
    try {
      const { userId, courseId } = req.params;
      await storage.completeCourseReading(userId, parseInt(courseId));
      res.json({ success: true });
    } catch (error) {
      logger.error('Error completing course:', error);
      res.status(500).json({ error: 'Failed to complete course' });
    }
  });

  // Get all user book reading progress
  app.get('/api/users/:userId/book-progress', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const progressList = await storage.getAllBookReadingProgress(userId);
      res.json(progressList);
    } catch (error) {
      logger.error('Error getting book reading progress:', error);
      res.status(500).json({ error: 'Failed to get book reading progress' });
    }
  });

  // Chapter Tests Routes
  app.get('/api/chapters/:chapterId/tests', async (req: Request, res: Response) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const tests = await storage.getChapterTests(chapterId);
      res.json(tests);
    } catch (error) {
      logger.error('Error fetching chapter tests:', error);
      res.status(500).json({ error: 'Failed to fetch chapter tests' });
    }
  });

  app.post('/api/chapters/:chapterId/tests', async (req: Request, res: Response) => {
    try {
      const chapterId = parseInt(req.params.chapterId);
      const testData = insertChapterTestSchema.parse({
        ...req.body,
        chapterId,
      });
      const test = await storage.createChapterTest(testData);
      res.json(test);
    } catch (error) {
      logger.error('Error creating chapter test:', error);
      res.status(500).json({ error: 'Failed to create chapter test' });
    }
  });

  app.put('/api/chapter-tests/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const testData = req.body;
      const test = await storage.updateChapterTest(id, testData);
      res.json(test);
    } catch (error) {
      logger.error('Error updating chapter test:', error);
      res.status(500).json({ error: 'Failed to update chapter test' });
    }
  });

  app.delete('/api/chapter-tests/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChapterTest(id);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting chapter test:', error);
      res.status(500).json({ error: 'Failed to delete chapter test' });
    }
  });

  // Lesson Tests Routes
  app.get('/api/lessons/:lessonId/tests', async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const tests = await storage.getLessonTests(lessonId);
      res.json(tests);
    } catch (error) {
      logger.error('Error fetching lesson tests:', error);
      res.status(500).json({ error: 'Failed to fetch lesson tests' });
    }
  });

  app.post('/api/lessons/:lessonId/tests', async (req: Request, res: Response) => {
    try {
      const lessonId = parseInt(req.params.lessonId);
      const testData = insertLessonTestSchema.parse({
        ...req.body,
        lessonId,
      });
      const test = await storage.createLessonTest(testData);
      res.json(test);
    } catch (error) {
      logger.error('Error creating lesson test:', error);
      res.status(500).json({ error: 'Failed to create lesson test' });
    }
  });

  app.put('/api/lesson-tests/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const testData = req.body;
      const test = await storage.updateLessonTest(id, testData);
      res.json(test);
    } catch (error) {
      logger.error('Error updating lesson test:', error);
      res.status(500).json({ error: 'Failed to update lesson test' });
    }
  });

  app.delete('/api/lesson-tests/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLessonTest(id);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting lesson test:', error);
      res.status(500).json({ error: 'Failed to delete lesson test' });
    }
  });

  // Test Submission Routes
  app.post('/api/test-attempts', async (req: Request, res: Response) => {
    try {
      const attemptData = insertTestAttemptSchema.parse(req.body);
      const attempt = await storage.submitTestAnswer(attemptData);

      // Check if answer was wrong - if so, reset progress
      if (!attempt.isCorrect) {
        if (attempt.testType === 'chapter' && attempt.chapterId) {
          const bookId = await storage.getBookIdByChapter(attempt.chapterId);
          if (bookId) {
            await storage.resetUserBookProgress(attempt.userId, bookId);
          }
        } else if (attempt.testType === 'lesson' && attempt.lessonId) {
          const courseId = await storage.getCourseIdByLesson(attempt.lessonId);
          if (courseId) {
            await storage.resetUserCourseProgress(attempt.userId, courseId);
          }
        }
      }

      res.json(attempt);
    } catch (error) {
      logger.error('Error submitting test answer:', error);
      res.status(500).json({ error: 'Failed to submit test answer' });
    }
  });

  app.get('/api/users/:userId/test-attempts', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { testType, testId } = req.query;

      if (!testType || !testId) {
        return res.status(400).json({ error: 'testType and testId are required' });
      }

      const attempts = await storage.getUserTestAttempts(
        userId,
        testType as 'chapter' | 'lesson',
        parseInt(testId as string),
      );
      res.json(attempts);
    } catch (error) {
      logger.error('Error fetching test attempts:', error);
      res.status(500).json({ error: 'Failed to fetch test attempts' });
    }
  });

  app.get('/api/users/:userId/test-status', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { testType, testId } = req.query;

      if (!testType || !testId) {
        return res.status(400).json({ error: 'testType and testId are required' });
      }

      const hasPassed = await storage.hasUserPassedTest(
        userId,
        testType as 'chapter' | 'lesson',
        parseInt(testId as string),
      );
      res.json({ hasPassed });
    } catch (error) {
      logger.error('Error checking test status:', error);
      res.status(500).json({ error: 'Failed to check test status' });
    }
  });

  // Text Content Management Routes
  app.get('/api/admin/text-content', async (req, res) => {
    try {
      const { category } = req.query;
      let content;
      if (category) {
        content = await storage.getTextContentByCategory(category as string);
      } else {
        content = await storage.getAllTextContent();
      }
      res.json(content);
    } catch (error) {
      logger.error('Error fetching text content:', error);
      res.status(500).json({ error: 'Failed to fetch text content' });
    }
  });

  app.get('/api/text-content/:key', async (req, res) => {
    try {
      const content = await storage.getTextContentByKey(req.params.key);
      if (!content) {
        return res.status(404).json({ error: 'Text content not found' });
      }
      res.json(content);
    } catch (error) {
      logger.error('Error fetching text content:', error);
      res.status(500).json({ error: 'Failed to fetch text content' });
    }
  });

  app.post('/api/admin/text-content', async (req, res) => {
    try {
      const contentData = insertTextContentSchema.parse(req.body);
      const content = await storage.createTextContent(contentData);
      res.json(content);
    } catch (error) {
      logger.error('Error creating text content:', error);
      res.status(500).json({ error: 'Failed to create text content' });
    }
  });

  app.put('/api/admin/text-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contentData = req.body;
      const content = await storage.updateTextContent(id, contentData);
      res.json(content);
    } catch (error) {
      logger.error('Error updating text content:', error);
      res.status(500).json({ error: 'Failed to update text content' });
    }
  });

  app.delete('/api/admin/text-content/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTextContent(id);
      res.json({ success: true });
    } catch (error) {
      logger.error('Error deleting text content:', error);
      res.status(500).json({ error: 'Failed to delete text content' });
    }
  });

  // Register Quadrant reward system routes
  registerRewardRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
