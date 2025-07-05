import { db } from "./db";
import { users, courses, books, sponsorChannels } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create mock user
    const [user] = await db.insert(users).values({
      id: "user123",
      email: "demo@educrypto.com",
      firstName: "Demo",
      lastName: "User",
      tokenBalance: "1000",
      dailySteps: 8500,
      level: 1,
      language: "en",
    }).onConflictDoNothing().returning();

    console.log("Created user:", user?.id || "user already exists");

    // Create sample courses
    const coursesData = [
      {
        title: "Introduction to Cryptocurrency",
        description: "Learn the fundamentals of cryptocurrency and blockchain technology",
        instructor: "Dr. Sarah Johnson",
        category: "crypto" as const,
        rating: "4.8",
        reviewCount: 245,
        duration: 180,
        price: "0",
      },
      {
        title: "Personal Finance Mastery",
        description: "Master your personal finances and build wealth",
        instructor: "Michael Chen",
        category: "business" as const,
        rating: "4.7",
        reviewCount: 189,
        duration: 240,
        price: "0",
      },
      {
        title: "Fitness for Beginners",
        description: "Start your fitness journey with this comprehensive guide",
        instructor: "Emma Rodriguez",
        category: "fitness" as const,
        rating: "4.9",
        reviewCount: 312,
        duration: 150,
        price: "0",
      },
      {
        title: "Mindfulness and Meditation",
        description: "Develop mindfulness practices for better mental health",
        instructor: "Dr. James Wilson",
        category: "self-development" as const,
        rating: "4.6",
        reviewCount: 167,
        duration: 120,
        price: "0",
      },
      {
        title: "Digital Marketing Fundamentals",
        description: "Learn modern digital marketing strategies",
        instructor: "Lisa Thompson",
        category: "business" as const,
        rating: "4.5",
        reviewCount: 203,
        duration: 200,
        price: "0",
      },
      {
        title: "Strength Training Basics",
        description: "Build muscle and strength with proper techniques",
        instructor: "Carlos Martinez",
        category: "fitness" as const,
        rating: "4.8",
        reviewCount: 156,
        duration: 180,
        price: "0",
      },
    ];

    const insertedCourses = await db.insert(courses).values(coursesData).onConflictDoNothing().returning();
    console.log(`Created ${insertedCourses.length} courses`);

    // Create sample books
    const booksData = [
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description: "Timeless lessons on wealth, greed, and happiness",
        category: "finance" as const,
        pageCount: 252,
        price: "0",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "An easy & proven way to build good habits & break bad ones",
        category: "psychology" as const,
        pageCount: 319,
        price: "0",
      },
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        description: "How today's entrepreneurs use continuous innovation",
        category: "business" as const,
        pageCount: 296,
        price: "0",
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        description: "A handbook of agile software craftsmanship",
        category: "technology" as const,
        pageCount: 464,
        price: "0",
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "The frailties of human judgment and how to overcome them",
        category: "psychology" as const,
        pageCount: 418,
        price: "0",
      },
      {
        title: "The 4-Hour Workweek",
        author: "Timothy Ferriss",
        description: "Escape 9-5, live anywhere, and join the new rich",
        category: "business" as const,
        pageCount: 308,
        price: "0",
      },
    ];

    const insertedBooks = await db.insert(books).values(booksData).onConflictDoNothing().returning();
    console.log(`Created ${insertedBooks.length} books`);

    // Create sponsor channels
    const sponsorChannelsData = [
      {
        name: "Crypto News Daily",
        channelUrl: "https://t.me/cryptonewsdaily",
        reward: "100",
      },
      {
        name: "Business Insights",
        channelUrl: "https://t.me/businessinsights",
        reward: "75",
      },
      {
        name: "Fitness Motivation",
        channelUrl: "https://t.me/fitnessmotivation",
        reward: "50",
      },
    ];

    const insertedChannels = await db.insert(sponsorChannels).values(sponsorChannelsData).onConflictDoNothing().returning();
    console.log(`Created ${insertedChannels.length} sponsor channels`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}