import { db } from "./db";
import { users, courses, books, sponsorChannels, transactions, dailyChallenges, bookPurchases } from "@shared/schema";
import { coursesWithTranslations, booksWithTranslations } from "./seed-translations";

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

    // Create courses with Russian translations
    const courseResults = await db.insert(courses).values(coursesWithTranslations).onConflictDoNothing().returning();
    console.log("Created courses:", courseResults.length);

    // Create books with Russian translations
    const bookResults = await db.insert(books).values(booksWithTranslations).onConflictDoNothing().returning();
    console.log("Created books:", bookResults.length);

    // Create sponsor channels
    const sponsorChannelsData = [
      {
        name: "Crypto News Daily",
        channelUrl: "https://t.me/cryptonewsdaily",
        reward: "100",
      },
      {
        name: "Tech Innovations",
        channelUrl: "https://t.me/techinnovations",
        reward: "75",
      },
      {
        name: "Finance Hub",
        channelUrl: "https://t.me/financehub",
        reward: "80",
      },
    ];

    await db.insert(sponsorChannels).values(sponsorChannelsData).onConflictDoNothing();
    console.log("Created sponsor channels");

    // Create sample transactions
    const transactionsData = [
      {
        userId: "user123",
        type: "reward" as const,
        amount: "100",
        description: "Daily steps challenge completed",
      },
      {
        userId: "user123",
        type: "reward" as const,
        amount: "50",
        description: "Course enrollment bonus",
      },
      {
        userId: "user123",
        type: "referral" as const,
        amount: "200",
        description: "Friend referral bonus",
      },
    ];

    await db.insert(transactions).values(transactionsData).onConflictDoNothing();
    console.log("Created transactions");

    // Create daily challenge
    const challengeData = {
      userId: "user123",
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      targetSteps: 10000,
      actualSteps: 8500,
      completed: false,
    };

    await db.insert(dailyChallenges).values(challengeData).onConflictDoNothing();
    console.log("Created daily challenge");

    // Create sample book purchase
    if (bookResults.length > 0) {
      const bookPurchaseData = {
        userId: "user123",
        bookId: bookResults[0].id,
        purchasePrice: "0",
      };

      await db.insert(bookPurchases).values(bookPurchaseData).onConflictDoNothing();
      console.log("Created book purchase");
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}