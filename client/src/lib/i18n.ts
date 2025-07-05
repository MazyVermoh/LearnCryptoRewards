export const translations = {
  en: {
    // Navigation
    courses: "Courses",
    library: "Library",
    rewards: "Rewards",
    admin: "Admin",
    home: "Home",
    progress: "Progress",
    wallet: "Wallet",
    profile: "Profile",
    
    // User Profile
    level: "Level",
    explorer: "Explorer",
    todaysSteps: "Today's Steps",
    
    // Course Categories
    business: "Business",
    fitness: "Fitness",
    crypto: "Crypto",
    selfDev: "Self-Dev",
    
    // Courses
    browseCategories: "Browse Categories",
    featuredCourses: "Featured Courses",
    myCourses: "My Courses",
    enroll: "Enroll",
    courseProgress: "Progress",
    
    // Library
    searchBooks: "Search books and materials...",
    categories: "Categories",
    featuredBooks: "Featured Books",
    myLibrary: "My Library",
    buy: "Buy",
    read: "Read",
    download: "Download",
    
    // Rewards
    dailyRewards: "Daily Rewards",
    stepsChallenge: "Steps Challenge",
    walkSteps: "Walk 10,000 steps daily",
    earnTokens: "Earn 50 EDU when completed",
    sponsorChannelRewards: "Sponsor Channel Rewards",
    subscribe: "Subscribe",
    completed: "Completed",
    referralProgram: "Referral Program",
    friendsReferred: "Friends Referred",
    yourReferralCode: "Your Referral Code:",
    copy: "Copy",
    earnForFriend: "Earn 200 EDU for each friend who joins!",
    shareReferralLink: "Share Referral Link",
    recentTransactions: "Recent Transactions",
    
    // Admin
    adminDashboard: "Admin Dashboard",
    totalUsers: "Total Users",
    activeCourses: "Active Courses",
    libraryBooks: "Library Books",
    eduDistributed: "EDU Distributed",
    quickActions: "Quick Actions",
    addCourse: "Add Course",
    addBook: "Add Book",
    manageRewards: "Manage Rewards",
    analytics: "Analytics",
    recentActivity: "Recent Activity",
    userManagement: "User Management",
    recentUsers: "Recent Users",
    viewAll: "View All",
    
    // Common
    all: "All",
    steps: "steps",
    hoursAgo: "hours ago",
    yesterday: "Yesterday",
    minutesAgo: "minutes ago",
    newUserRegistered: "New user registered",
    courseCompleted: "Course completed",
    joined: "Joined",
    daysAgo: "days ago",
  },
  ru: {
    // Navigation
    courses: "Курсы",
    library: "Библиотека",
    rewards: "Награды",
    admin: "Админ",
    home: "Главная",
    progress: "Прогресс",
    wallet: "Кошелек",
    profile: "Профиль",
    
    // User Profile
    level: "Уровень",
    explorer: "Исследователь",
    todaysSteps: "Шаги сегодня",
    
    // Course Categories
    business: "Бизнес",
    fitness: "Фитнес",
    crypto: "Крипто",
    selfDev: "Саморазвитие",
    
    // Courses
    browseCategories: "Категории",
    featuredCourses: "Рекомендуемые курсы",
    myCourses: "Мои курсы",
    enroll: "Записаться",
    courseProgress: "Прогресс",
    
    // Library
    searchBooks: "Поиск книг и материалов...",
    categories: "Категории",
    featuredBooks: "Рекомендуемые книги",
    myLibrary: "Моя библиотека",
    buy: "Купить",
    read: "Читать",
    download: "Скачать",
    
    // Rewards
    dailyRewards: "Ежедневные награды",
    stepsChallenge: "Челлендж шагов",
    walkSteps: "Пройти 10,000 шагов ежедневно",
    earnTokens: "Заработать 50 EDU при выполнении",
    sponsorChannelRewards: "Награды за подписки",
    subscribe: "Подписаться",
    completed: "Выполнено",
    referralProgram: "Реферальная программа",
    friendsReferred: "Друзей приглашено",
    yourReferralCode: "Ваш реферальный код:",
    copy: "Копировать",
    earnForFriend: "Заработать 200 EDU за каждого друга!",
    shareReferralLink: "Поделиться ссылкой",
    recentTransactions: "Последние транзакции",
    
    // Admin
    adminDashboard: "Админ панель",
    totalUsers: "Всего пользователей",
    activeCourses: "Активные курсы",
    libraryBooks: "Книги в библиотеке",
    eduDistributed: "EDU распределено",
    quickActions: "Быстрые действия",
    addCourse: "Добавить курс",
    addBook: "Добавить книгу",
    manageRewards: "Управление наградами",
    analytics: "Аналитика",
    recentActivity: "Последняя активность",
    userManagement: "Управление пользователями",
    recentUsers: "Новые пользователи",
    viewAll: "Смотреть все",
    
    // Common
    all: "Все",
    steps: "шагов",
    hoursAgo: "часов назад",
    yesterday: "Вчера",
    minutesAgo: "минут назад",
    newUserRegistered: "Новый пользователь зарегистрирован",
    courseCompleted: "Курс завершен",
    joined: "Присоединился",
    daysAgo: "дней назад",
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
