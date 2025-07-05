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
      // Psychology, Thinking, Self-Development
      {
        title: "Atomic Habits",
        author: "James Clear",
        description: "A proven way to build good habits and break bad ones through small changes that make a big difference.",
        category: "psychology-thinking-development" as const,
        pageCount: 319,
        price: "0",
      },
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        description: "A comprehensive exploration of the two systems that drive the way we think and make decisions.",
        category: "psychology-thinking-development" as const,
        pageCount: 499,
        price: "0",
      },
      {
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen Covey",
        description: "A powerful framework for personal and professional effectiveness based on timeless principles.",
        category: "psychology-thinking-development" as const,
        pageCount: 381,
        price: "0",
      },
      {
        title: "The Power of Habit",
        author: "Charles Duhigg",
        description: "Why habits exist and how they can be transformed to improve every aspect of your life.",
        category: "psychology-thinking-development" as const,
        pageCount: 371,
        price: "0",
      },
      {
        title: "How to Win Friends and Influence People",
        author: "Dale Carnegie",
        description: "The classic guide to developing social skills and building meaningful relationships.",
        category: "psychology-thinking-development" as const,
        pageCount: 291,
        price: "0",
      },
      
      // Financial Literacy and Economics
      {
        title: "Rich Dad Poor Dad",
        author: "Robert Kiyosaki",
        description: "What the rich teach their kids about money that the poor and middle class do not.",
        category: "financial-literacy-economics" as const,
        pageCount: 207,
        price: "0",
      },
      {
        title: "The Intelligent Investor",
        author: "Benjamin Graham",
        description: "The definitive book on value investing and sound investment principles.",
        category: "financial-literacy-economics" as const,
        pageCount: 640,
        price: "0",
      },
      {
        title: "Your Road to Financial Freedom",
        author: "Bodo Schäfer",
        description: "A practical guide to achieving financial independence and wealth building.",
        category: "financial-literacy-economics" as const,
        pageCount: 288,
        price: "0",
      },
      {
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        description: "The timeless classic on the psychology of success and wealth creation.",
        category: "financial-literacy-economics" as const,
        pageCount: 238,
        price: "0",
      },
      {
        title: "The Richest Man in Babylon",
        author: "George Clason",
        description: "Timeless financial wisdom through parables set in ancient Babylon.",
        category: "financial-literacy-economics" as const,
        pageCount: 194,
        price: "0",
      },
      
      // Marketing
      {
        title: "Purple Cow",
        author: "Seth Godin",
        description: "How to stand out in a crowded marketplace by being remarkable.",
        category: "marketing" as const,
        pageCount: 145,
        price: "0",
      },
      {
        title: "Marketing from A to Z",
        author: "Philip Kotler",
        description: "80 concepts every manager needs to know from the father of modern marketing.",
        category: "marketing" as const,
        pageCount: 208,
        price: "0",
      },
      {
        title: "Positioning: The Battle for Your Mind",
        author: "Al Ries and Jack Trout",
        description: "How to be seen and heard in the overcrowded marketplace.",
        category: "marketing" as const,
        pageCount: 213,
        price: "0",
      },
      {
        title: "The 22 Immutable Laws of Marketing",
        author: "Al Ries and Jack Trout",
        description: "Violate them at your own risk! The fundamental laws of marketing success.",
        category: "marketing" as const,
        pageCount: 143,
        price: "0",
      },
      {
        title: "Made to Stick",
        author: "Chip Heath and Dan Heath",
        description: "Why some ideas survive and others die - the anatomy of ideas that stick.",
        category: "marketing" as const,
        pageCount: 291,
        price: "0",
      },
      
      // Health, Fitness, Nutrition
      {
        title: "Why We Sleep",
        author: "Matthew Walker",
        description: "The new science of sleep and dreams, and why sleep is vital for health and performance.",
        category: "health-fitness-nutrition" as const,
        pageCount: 368,
        price: "0",
      },
      {
        title: "Eat to Live",
        author: "Joel Fuhrman",
        description: "The revolutionary formula for fast and sustained weight loss through nutrient-dense eating.",
        category: "health-fitness-nutrition" as const,
        pageCount: 328,
        price: "0",
      },
      {
        title: "Bigger Leaner Stronger",
        author: "Michael Matthews",
        description: "The simple science of building the ultimate male body through proper training and nutrition.",
        category: "health-fitness-nutrition" as const,
        pageCount: 312,
        price: "0",
      },
      {
        title: "Fitness Mindset",
        author: "Brian Keane",
        description: "How to get your mindset right to achieve your fitness goals and maintain them long-term.",
        category: "health-fitness-nutrition" as const,
        pageCount: 240,
        price: "0",
      },
      {
        title: "The Body Book",
        author: "Cameron Diaz",
        description: "The law of hunger, the science of strength, and other ways to love your amazing body.",
        category: "health-fitness-nutrition" as const,
        pageCount: 272,
        price: "0",
      },
      
      // Communication and Soft Skills
      {
        title: "Never Split the Difference",
        author: "Chris Voss",
        description: "Negotiating as if your life depended on it - tactics from a former FBI hostage negotiator.",
        category: "communication-soft-skills" as const,
        pageCount: 288,
        price: "0",
      },
      {
        title: "Influence",
        author: "Robert Cialdini",
        description: "The psychology of persuasion and the six universal principles of influence.",
        category: "communication-soft-skills" as const,
        pageCount: 320,
        price: "0",
      },
      {
        title: "Talk Like TED",
        author: "Carmine Gallo",
        description: "The 9 public-speaking secrets of the world's top minds.",
        category: "communication-soft-skills" as const,
        pageCount: 288,
        price: "0",
      },
      {
        title: "Radical Candor",
        author: "Kim Scott",
        description: "How to be a great boss without losing your humanity through radical candor.",
        category: "communication-soft-skills" as const,
        pageCount: 304,
        price: "0",
      },
      {
        title: "Quiet",
        author: "Susan Cain",
        description: "The power of introverts in a world that can't stop talking.",
        category: "communication-soft-skills" as const,
        pageCount: 333,
        price: "0",
      },
      
      // Entrepreneurship and Career
      {
        title: "The Lean Startup",
        author: "Eric Ries",
        description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
        category: "entrepreneurship-career" as const,
        pageCount: 296,
        price: "0",
      },
      {
        title: "Start with Why",
        author: "Simon Sinek",
        description: "How great leaders inspire everyone to take action by starting with why.",
        category: "entrepreneurship-career" as const,
        pageCount: 256,
        price: "0",
      },
      {
        title: "Zero to One",
        author: "Peter Thiel",
        description: "Notes on startups, or how to build the future through creating something new.",
        category: "entrepreneurship-career" as const,
        pageCount: 210,
        price: "0",
      },
      {
        title: "Good to Great",
        author: "Jim Collins",
        description: "Why some companies make the leap and others don't - the principles of great performance.",
        category: "entrepreneurship-career" as const,
        pageCount: 300,
        price: "0",
      },
      {
        title: "The Startup Owner's Manual",
        author: "Steve Blank",
        description: "The step-by-step guide for building a great company from startup to scale.",
        category: "entrepreneurship-career" as const,
        pageCount: 608,
        price: "0",
      },
      
      // Technology and the Future
      {
        title: "Homo Deus",
        author: "Yuval Noah Harari",
        description: "A brief history of tomorrow - how humanity will upgrade itself into divinity.",
        category: "technology-future" as const,
        pageCount: 448,
        price: "0",
      },
      {
        title: "Life 3.0",
        author: "Max Tegmark",
        description: "Being human in the age of artificial intelligence and the future of life itself.",
        category: "technology-future" as const,
        pageCount: 384,
        price: "0",
      },
      {
        title: "Blockchain Revolution",
        author: "Don Tapscott",
        description: "How the technology behind Bitcoin is changing money, business, and the world.",
        category: "technology-future" as const,
        pageCount: 368,
        price: "0",
      },
      {
        title: "Superintelligence",
        author: "Nick Bostrom",
        description: "Paths, dangers, strategies for navigating the coming age of artificial superintelligence.",
        category: "technology-future" as const,
        pageCount: 352,
        price: "0",
      },
      
      // Popular Personalities
      {
        title: "The Mamba Mentality",
        author: "Kobe Bryant",
        description: "How I play - the mindset and approach that made Kobe Bryant a champion.",
        category: "popular-personalities" as const,
        pageCount: 208,
        price: "0",
      },
      {
        title: "Moment of Truth",
        author: "Cristiano Ronaldo",
        description: "The autobiography of one of the greatest footballers of all time.",
        category: "popular-personalities" as const,
        pageCount: 288,
        price: "0",
      },
      {
        title: "I Am Zlatan",
        author: "Zlatan Ibrahimović",
        description: "The explosive autobiography of football's most controversial superstar.",
        category: "popular-personalities" as const,
        pageCount: 320,
        price: "0",
      },
      {
        title: "I Can Accept Failure, But Not Trying",
        author: "Michael Jordan",
        description: "The philosophy and mindset of basketball's greatest champion.",
        category: "popular-personalities" as const,
        pageCount: 256,
        price: "0",
      },
      {
        title: "Soul of a Butterfly",
        author: "Muhammad Ali",
        description: "Reflections on life's journey from the greatest boxer and cultural icon.",
        category: "popular-personalities" as const,
        pageCount: 224,
        price: "0",
      },
      
      // Relationships
      {
        title: "The 5 Love Languages",
        author: "Gary Chapman",
        description: "The secret to love that lasts - understanding how to express and receive love.",
        category: "relationships" as const,
        pageCount: 208,
        price: "0",
      },
      {
        title: "Men Are from Mars, Women Are from Venus",
        author: "John Gray",
        description: "A practical guide for improving communication and getting what you want in relationships.",
        category: "relationships" as const,
        pageCount: 286,
        price: "0",
      },
      {
        title: "Mating in Captivity",
        author: "Esther Perel",
        description: "Unlocking erotic intelligence and reconciling the domestic and the erotic.",
        category: "relationships" as const,
        pageCount: 272,
        price: "0",
      },
      {
        title: "Why We Love",
        author: "Helen Fisher",
        description: "The nature and chemistry of romantic love from an anthropological perspective.",
        category: "relationships" as const,
        pageCount: 304,
        price: "0",
      },
      {
        title: "Games People Play",
        author: "Eric Berne",
        description: "The psychology of human relationships and the games we unconsciously play.",
        category: "relationships" as const,
        pageCount: 192,
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