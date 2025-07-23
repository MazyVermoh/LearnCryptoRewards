import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function seedTextContent() {
  console.log('🌱 Seeding text content...');
  
  const textContent = [
    // Navigation
    { key: 'courses', value: 'Courses', valueRu: 'Курсы', category: 'navigation', description: 'Navigation tab for courses' },
    { key: 'library', value: 'Library', valueRu: 'Библиотека', category: 'navigation', description: 'Navigation tab for library' },
    { key: 'rewards', value: 'Rewards', valueRu: 'Награды', category: 'navigation', description: 'Navigation tab for rewards' },
    { key: 'adminDashboard', value: 'Admin Dashboard', valueRu: 'Админ панель', category: 'navigation', description: 'Admin dashboard title' },

    // Course related
    { key: 'myCourses', value: 'My Courses', valueRu: 'Мои курсы', category: 'course', description: 'Title for user enrolled courses' },
    { key: 'availableCourses', value: 'Available Courses', valueRu: 'Доступные курсы', category: 'course', description: 'Title for course catalog' },
    { key: 'courseProgress', value: 'Progress', valueRu: 'Прогресс', category: 'course', description: 'Course progress label' },
    { key: 'enroll', value: 'Enroll', valueRu: 'Записаться', category: 'course', description: 'Enroll button text' },
    { key: 'enrolled', value: 'Enrolled', valueRu: 'Записан', category: 'course', description: 'Enrolled status' },
    { key: 'continue', value: 'Continue', valueRu: 'Продолжить', category: 'course', description: 'Continue course button' },
    { key: 'read', value: 'Read', valueRu: 'Читать', category: 'course', description: 'Read course content button' },

    // Book related
    { key: 'myBooks', value: 'My Books', valueRu: 'Мои книги', category: 'book', description: 'Title for user purchased books' },
    { key: 'availableBooks', value: 'Available Books', valueRu: 'Доступные книги', category: 'book', description: 'Title for book catalog' },
    { key: 'purchase', value: 'Purchase', valueRu: 'Купить', category: 'book', description: 'Purchase book button' },
    { key: 'purchased', value: 'Purchased', valueRu: 'Куплено', category: 'book', description: 'Purchased status' },
    { key: 'download', value: 'Download', valueRu: 'Скачать', category: 'book', description: 'Download book button' },

    // User interface
    { key: 'search', value: 'Search', valueRu: 'Поиск', category: 'ui', description: 'Search placeholder' },
    { key: 'save', value: 'Save', valueRu: 'Сохранить', category: 'ui', description: 'Save button' },
    { key: 'cancel', value: 'Cancel', valueRu: 'Отмена', category: 'ui', description: 'Cancel button' },
    { key: 'edit', value: 'Edit', valueRu: 'Редактировать', category: 'ui', description: 'Edit button' },
    { key: 'delete', value: 'Delete', valueRu: 'Удалить', category: 'ui', description: 'Delete button' },
    { key: 'add', value: 'Add', valueRu: 'Добавить', category: 'ui', description: 'Add button' },
    { key: 'loading', value: 'Loading...', valueRu: 'Загрузка...', category: 'ui', description: 'Loading message' },

    // Rewards system
    { key: 'dailyRewards', value: 'Daily Rewards', valueRu: 'Ежедневные награды', category: 'rewards', description: 'Daily rewards section title' },
    { key: 'stepsChallenge', value: 'Steps Challenge', valueRu: 'Челлендж шагов', category: 'rewards', description: 'Steps challenge title' },
    { key: 'walkSteps', value: 'Walk 10,000 steps daily', valueRu: 'Проходи 10,000 шагов ежедневно', category: 'rewards', description: 'Steps challenge description' },
    { key: 'steps', value: 'steps', valueRu: 'шагов', category: 'rewards', description: 'Steps unit' },
    { key: 'earnTokens', value: 'Earn MIND Token for activity', valueRu: 'Зарабатывай MIND Token за активность', category: 'rewards', description: 'Token earning description' },
    { key: 'referralProgram', value: 'Referral Program', valueRu: 'Реферальная программа', category: 'rewards', description: 'Referral program title' },
    { key: 'friendsReferred', value: 'Friends Referred', valueRu: 'Приглашено друзей', category: 'rewards', description: 'Friends referred count' },
    { key: 'yourReferralCode', value: 'Your Referral Code', valueRu: 'Ваш реферальный код', category: 'rewards', description: 'Referral code label' },

    // User management
    { key: 'totalUsers', value: 'Total Users', valueRu: 'Всего пользователей', category: 'user', description: 'Total users count' },
    { key: 'activeUsers', value: 'Active Users', valueRu: 'Активные пользователи', category: 'user', description: 'Active users count' },
    { key: 'userProfile', value: 'User Profile', valueRu: 'Профиль пользователя', category: 'user', description: 'User profile title' },
    { key: 'balance', value: 'Balance', valueRu: 'Баланс', category: 'user', description: 'Token balance label' },

    // Admin panel
    { key: 'addCourse', value: 'Add Course', valueRu: 'Добавить курс', category: 'admin', description: 'Add course button' },
    { key: 'addBook', value: 'Add Book', valueRu: 'Добавить книгу', category: 'admin', description: 'Add book button' },
    { key: 'manageUsers', value: 'Manage Users', valueRu: 'Управление пользователями', category: 'admin', description: 'Manage users button' },
    { key: 'analytics', value: 'Analytics', valueRu: 'Аналитика', category: 'admin', description: 'Analytics section' },
    { key: 'quickActions', value: 'Quick Actions', valueRu: 'Быстрые действия', category: 'admin', description: 'Quick actions section title' },

    // Messages
    { key: 'welcome', value: 'Welcome to MIND Token Platform', valueRu: 'Добро пожаловать на платформу MIND Token', category: 'messages', description: 'Welcome message' },
    { key: 'enrollmentSuccess', value: 'Successfully enrolled in course', valueRu: 'Успешно записались на курс', category: 'messages', description: 'Enrollment success message' },
    { key: 'purchaseSuccess', value: 'Book purchased successfully', valueRu: 'Книга успешно куплена', category: 'messages', description: 'Purchase success message' },
    { key: 'insufficientTokens', value: 'Insufficient MIND Tokens', valueRu: 'Недостаточно MIND Token', category: 'messages', description: 'Insufficient tokens error' },

    // Error messages
    { key: 'networkError', value: 'Network error occurred', valueRu: 'Произошла сетевая ошибка', category: 'errors', description: 'Network error message' },
    { key: 'serverError', value: 'Server error occurred', valueRu: 'Произошла ошибка сервера', category: 'errors', description: 'Server error message' },
    { key: 'notFound', value: 'Content not found', valueRu: 'Контент не найден', category: 'errors', description: 'Not found error' },
    { key: 'unauthorized', value: 'Unauthorized access', valueRu: 'Неавторизованный доступ', category: 'errors', description: 'Unauthorized error' },

    // General
    { key: 'yes', value: 'Yes', valueRu: 'Да', category: 'general', description: 'Yes confirmation' },
    { key: 'no', value: 'No', valueRu: 'Нет', category: 'general', description: 'No confirmation' },
    { key: 'confirm', value: 'Confirm', valueRu: 'Подтвердить', category: 'general', description: 'Confirm button' },
    { key: 'close', value: 'Close', valueRu: 'Закрыть', category: 'general', description: 'Close button' },
    { key: 'back', value: 'Back', valueRu: 'Назад', category: 'general', description: 'Back button' },
    { key: 'next', value: 'Next', valueRu: 'Далее', category: 'general', description: 'Next button' },
    { key: 'submit', value: 'Submit', valueRu: 'Отправить', category: 'general', description: 'Submit button' }
  ];

  // Insert text content
  for (const content of textContent) {
    try {
      await sql`
        INSERT INTO text_content (key, text_en, text_ru, category, description)
        VALUES (${content.key}, ${content.value}, ${content.valueRu}, ${content.category}, ${content.description})
        ON CONFLICT (key) DO UPDATE SET
          text_en = EXCLUDED.text_en,
          text_ru = EXCLUDED.text_ru,
          category = EXCLUDED.category,
          description = EXCLUDED.description
      `;
    } catch (error) {
      console.error(`Error seeding ${content.key}:`, error);
    }
  }

  console.log(`✅ Seeded ${textContent.length} text content items`);
}

// Run seeding automatically
seedTextContent()
  .then(() => {
    console.log('🎉 Text content seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Text content seeding failed:', error);
    process.exit(1);
  });

export { seedTextContent };