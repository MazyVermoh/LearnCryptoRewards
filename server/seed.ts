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
        title: "English for Business Communication",
        description: "Master professional English communication skills",
        instructor: "Dr. Sarah Johnson",
        category: "languages" as const,
        rating: "4.8",
        reviewCount: 245,
        duration: 180,
        price: "0",
      },
      {
        title: "Critical Thinking Mastery",
        description: "Develop advanced critical thinking and problem-solving skills",
        instructor: "Dr. Michael Chen",
        category: "mind-thinking" as const,
        rating: "4.7",
        reviewCount: 189,
        duration: 240,
        price: "0",
      },
      {
        title: "Personal Finance and Investment",
        description: "Build wealth through smart financial planning and investments",
        instructor: "Emma Rodriguez",
        category: "finance-economics" as const,
        rating: "4.9",
        reviewCount: 312,
        duration: 150,
        price: "0",
      },
      {
        title: "Leadership and Management Skills",
        description: "Develop essential skills for career advancement",
        instructor: "Dr. James Wilson",
        category: "career-skills" as const,
        rating: "4.6",
        reviewCount: 167,
        duration: 120,
        price: "0",
      },
      {
        title: "Innovation and Future Thinking",
        description: "Learn to think strategically about future trends",
        instructor: "Lisa Thompson",
        category: "future-thinking" as const,
        rating: "4.5",
        reviewCount: 203,
        duration: 200,
        price: "0",
      },
      {
        title: "Holistic Health and Wellness",
        description: "Comprehensive approach to physical and mental well-being",
        instructor: "Carlos Martinez",
        category: "health-body" as const,
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
        category: "financial-literacy-economics" as const,
        pageCount: 252,
        price: "0",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "An easy & proven way to build good habits & break bad ones",
        category: "psychology-thinking-development" as const,
        pageCount: 319,
        price: "0",
      },
      {
        title: "Building a StoryBrand",
        author: "Donald Miller",
        description: "Clarify Your Message So Customers Will Listen",
        category: "marketing" as const,
        pageCount: 240,
        price: "0",
      },
      {
        title: "The Body Keeps the Score",
        author: "Bessel van der Kolk",
        description: "Brain, Mind, and Body in the Healing of Trauma",
        category: "health-fitness-nutrition" as const,
        pageCount: 464,
        price: "0",
      },
      {
        title: "How to Win Friends and Influence People",
        author: "Dale Carnegie",
        description: "The classic guide to interpersonal skills",
        category: "communication-soft-skills" as const,
        pageCount: 291,
        price: "0",
      },
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        description: "How today's entrepreneurs use continuous innovation",
        category: "entrepreneurship-career" as const,
        pageCount: 296,
        price: "0",
      },
      {
        title: "The Future of Work",
        author: "Jacob Morgan",
        description: "Attract New Talent, Build Better Leaders",
        category: "technology-future" as const,
        pageCount: 320,
        price: "0",
      },
      {
        title: "Attached",
        author: "Amir Levine",
        description: "The New Science of Adult Attachment",
        category: "relationships" as const,
        pageCount: 304,
        price: "0",
      },
      {
        title: "Steve Jobs",
        author: "Walter Isaacson",
        description: "The exclusive biography",
        category: "popular-personalities" as const,
        pageCount: 656,
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