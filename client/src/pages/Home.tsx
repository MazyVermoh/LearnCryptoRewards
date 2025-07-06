import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  BookOpen, 
  Gift, 
  Settings, 
  Home as HomeIcon, 
  TrendingUp, 
  Wallet, 
  User, 
  Bell,
  Briefcase,
  Dumbbell,
  Bitcoin,
  Brain,
  Star,
  Search,
  Plus,
  UserPlus,
  Check,
  Copy,
  Share,
  BarChart3,
  Users,
  BookMarked,
  Target,
  Coins,
  Globe,
  Lightbulb,
  Heart,
  Megaphone,
  MessageCircle
} from 'lucide-react';

// Mock user data - in real app this would come from auth
const mockUserId = "user123";

export default function Home() {
  const { language, changeLanguage, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('courses');
  const [activeView, setActiveView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: [`/api/users/${mockUserId}`],
    retry: false,
  });

  // Fetch courses
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/courses', selectedCategory],
    retry: false,
  });

  // Fetch books
  const { data: books = [] } = useQuery({
    queryKey: ['/api/books', selectedCategory, searchQuery],
    retry: false,
  });

  // Fetch user enrollments
  const { data: enrollments = [] } = useQuery({
    queryKey: [`/api/users/${mockUserId}/enrollments`],
    retry: false,
  });

  // Fetch user books
  const { data: userBooks = [] } = useQuery({
    queryKey: [`/api/users/${mockUserId}/books`],
    retry: false,
  });

  // Fetch transactions
  const { data: transactions = [] } = useQuery({
    queryKey: [`/api/users/${mockUserId}/transactions`],
    retry: false,
  });

  // Fetch daily challenge
  const { data: dailyChallenge } = useQuery({
    queryKey: [`/api/users/${mockUserId}/daily-challenge`],
    retry: false,
  });

  // Fetch sponsor channels
  const { data: sponsorChannels = [] } = useQuery({
    queryKey: ['/api/sponsor-channels'],
    retry: false,
  });

  // Fetch user subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: [`/api/users/${mockUserId}/subscriptions`],
    retry: false,
  });

  // Fetch admin stats
  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Fetch all users for admin
  const { data: allUsers = [] } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Admin panel states
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    titleRu: '',
    description: '',
    descriptionRu: '',
    instructor: '',
    instructorRu: '',
    category: 'mind-thinking',
    duration: 60,
    price: '0'
  });
  const [newBook, setNewBook] = useState({
    title: '',
    titleRu: '',
    description: '',
    descriptionRu: '',
    author: '',
    authorRu: '',
    category: 'psychology-thinking-development',
    pages: 200,
    price: '0'
  });
  
  // Admin view states
  const [adminView, setAdminView] = useState('overview');
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingCourseContent, setEditingCourseContent] = useState(null);
  const [editingBookContent, setEditingBookContent] = useState(null);
  const [addingLesson, setAddingLesson] = useState(null);
  const [addingChapter, setAddingChapter] = useState(null);

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async ({ courseId, coursePrice, courseTitle }: { courseId: number; coursePrice: string; courseTitle: string }) => {
      await apiRequest('POST', '/api/enrollments', {
        userId: mockUserId,
        courseId,
        coursePrice,
        courseTitle,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully enrolled in course!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${mockUserId}/enrollments`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Purchase book mutation
  const purchaseMutation = useMutation({
    mutationFn: async ({ bookId, bookPrice, bookTitle }: { bookId: number; bookPrice: string; bookTitle: string }) => {
      await apiRequest('POST', '/api/book-purchases', {
        userId: mockUserId,
        bookId,
        bookPrice,
        bookTitle,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully purchased book!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${mockUserId}/books`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Subscribe to channel mutation
  const subscribeMutation = useMutation({
    mutationFn: async (channelId: number) => {
      await apiRequest('POST', '/api/channel-subscriptions', {
        userId: mockUserId,
        channelId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully subscribed to channel!",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${mockUserId}/subscriptions`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add course mutation
  const addCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      await apiRequest('POST', '/api/courses', courseData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      setShowAddCourse(false);
      setNewCourse({
        title: '',
        titleRu: '',
        description: '',
        descriptionRu: '',
        instructor: '',
        instructorRu: '',
        category: 'mind-thinking',
        duration: 60,
        price: '0'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add course",
        variant: "destructive",
      });
    },
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: async (bookData: any) => {
      await apiRequest('POST', '/api/books', bookData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Book added successfully",
      });
      setShowAddBook(false);
      setNewBook({
        title: '',
        titleRu: '',
        description: '',
        descriptionRu: '',
        author: '',
        authorRu: '',
        category: 'psychology-thinking-development',
        pages: 200,
        price: '0'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    },
  });

  // Copy referral code
  const copyReferralCode = async () => {
    if (user?.referralCode) {
      await navigator.clipboard.writeText(user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  // Course categories only
  const courseCategoryIcons = {
    'mind-thinking': <Brain className="h-6 w-6" />,
    'finance-economics': <TrendingUp className="h-6 w-6" />,
    'career-skills': <Briefcase className="h-6 w-6" />,
    'future-thinking': <Lightbulb className="h-6 w-6" />,
    'health-body': <Heart className="h-6 w-6" />,
  };

  const courseCategoryColors = {
    'mind-thinking': "bg-purple-50 border-purple-200 text-purple-900",
    'finance-economics': "bg-green-50 border-green-200 text-green-900",
    'career-skills': "bg-orange-50 border-orange-200 text-orange-900",
    'future-thinking': "bg-yellow-50 border-yellow-200 text-yellow-900",
    'health-body': "bg-pink-50 border-pink-200 text-pink-900",
  };

  // Book categories only
  const bookCategoryIcons = {
    'psychology-thinking-development': <Brain className="h-6 w-6" />,
    'financial-literacy-economics': <TrendingUp className="h-6 w-6" />,
    'marketing': <Megaphone className="h-6 w-6" />,
    'health-fitness-nutrition': <Heart className="h-6 w-6" />,
    'communication-soft-skills': <MessageCircle className="h-6 w-6" />,
    'entrepreneurship-career': <Briefcase className="h-6 w-6" />,
    'technology-future': <Lightbulb className="h-6 w-6" />,
    'relationships': <Users className="h-6 w-6" />,
    'popular-personalities': <Star className="h-6 w-6" />,
  };

  const bookCategoryColors = {
    'psychology-thinking-development': "bg-purple-50 border-purple-200 text-purple-900",
    'financial-literacy-economics': "bg-green-50 border-green-200 text-green-900",
    'marketing': "bg-red-50 border-red-200 text-red-900",
    'health-fitness-nutrition': "bg-pink-50 border-pink-200 text-pink-900",
    'communication-soft-skills': "bg-cyan-50 border-cyan-200 text-cyan-900",
    'entrepreneurship-career': "bg-orange-50 border-orange-200 text-orange-900",
    'technology-future': "bg-yellow-50 border-yellow-200 text-yellow-900",
    'relationships': "bg-rose-50 border-rose-200 text-rose-900",
    'popular-personalities': "bg-indigo-50 border-indigo-200 text-indigo-900",
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <GraduationCap className="text-white h-4 w-4" />
            </div>
            <span className="font-semibold text-lg text-neutral-900">MIND Token</span>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={changeLanguage}>
              <SelectTrigger className="w-16 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Bell className="h-5 w-5 text-neutral-500" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">3</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Home View */}
      {activeView === 'home' && (
        <>
          {/* User Profile */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4">
            <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{user?.firstName || "User"} {user?.lastName || ""}</h2>
            <p className="text-blue-100 text-sm">{t('level')} {user?.level || 1} {t('explorer')}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-medium">{user?.tokenBalance || "0"} MIND</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">{t('todaysSteps')}</div>
            <div className="text-2xl font-bold">{user?.dailySteps || 0}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-b border-gray-200 rounded-none h-auto">
          <TabsTrigger value="courses" className="flex flex-col py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <BookOpen className="h-4 w-4 mb-1" />
            <span className="text-sm">{t('courses')}</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="flex flex-col py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <BookMarked className="h-4 w-4 mb-1" />
            <span className="text-sm">{t('library')}</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex flex-col py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Gift className="h-4 w-4 mb-1" />
            <span className="text-sm">{t('rewards')}</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex flex-col py-3 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Settings className="h-4 w-4 mb-1" />
            <span className="text-sm">Admin</span>
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="p-4 pb-20">
          {/* Course Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('browseCategories')}</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(courseCategoryIcons).map(([category, icon]) => (
                <Card 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  className={`p-4 cursor-pointer transition-colors ${courseCategoryColors[category as keyof typeof courseCategoryColors]} ${selectedCategory === category ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="text-center">
                      {icon}
                      <h4 className="font-medium mt-2">{t(category as any)}</h4>
                      <p className="text-sm opacity-70">
                        {courses.filter(c => c.category === category).length} {t('courses').toLowerCase()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Courses by Category */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {selectedCategory === 'all' ? t('allCourses') : t(selectedCategory as any)}
              </h3>
              {selectedCategory !== 'all' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  {t('showAll')}
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {courses
                .filter(course => selectedCategory === 'all' || course.category === selectedCategory)
                .map((course) => (
                  <Card key={course.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          {courseCategoryIcons[course.category as keyof typeof courseCategoryIcons]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {language === 'ru' && course.titleRu ? course.titleRu : course.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {language === 'ru' && course.descriptionRu ? course.descriptionRu : course.description}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-sm text-gray-500">👨‍🏫 {language === 'ru' && course.instructorRu ? course.instructorRu : course.instructor}</span>
                            <span className="text-sm text-gray-500">⏱️ {course.duration} min</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600">{course.rating}</span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                // Handle course enrollment
                                toast({
                                  title: "Course enrolled!",
                                  description: `You've enrolled in ${course.title}`,
                                });
                              }}
                            >
                              {t('enroll')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* My Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('myCourses')}</h3>
            {enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {courseCategoryIcons[enrollment.course.category as keyof typeof courseCategoryIcons]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {language === 'ru' && enrollment.course.titleRu ? enrollment.course.titleRu : enrollment.course.title}
                          </h4>
                          <p className="text-gray-600 text-sm">{t('courseProgress')}: {enrollment.progress}%</p>
                          <Progress value={enrollment.progress} className="mt-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <CardContent className="p-0 text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No courses enrolled yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="p-4 pb-20">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchBooks')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Book Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('categories')}</h3>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['all', 'psychology-thinking-development', 'financial-literacy-economics', 'marketing', 'health-fitness-nutrition', 'communication-soft-skills', 'entrepreneurship-career', 'technology-future', 'relationships', 'popular-personalities'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === 'all' ? t('all') : t(category as any)}
                </Button>
              ))}
            </div>
          </div>

          {/* Available Books */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('availableBooks')}</h3>
            <div className="grid grid-cols-1 gap-4">
              {books.filter(book => {
                const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
                const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    book.author.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
              }).map((book) => (
                <Card key={book.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {language === 'ru' && book.titleRu ? book.titleRu : book.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-1">
                          {language === 'ru' && book.authorRu ? book.authorRu : book.author}
                        </p>
                        <p className="text-gray-500 text-xs mb-2">
                          {language === 'ru' && book.descriptionRu ? book.descriptionRu : book.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{book.pageCount} {t('pages')}</span>
                          <Button 
                            size="sm"
                            onClick={() => purchaseMutation.mutate({
                              bookId: book.id,
                              bookPrice: book.price,
                              bookTitle: book.title
                            })}
                            disabled={purchaseMutation.isPending}
                          >
                            {t('getBook')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {books.filter(book => {
              const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
              const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  book.author.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesCategory && matchesSearch;
            }).length === 0 && (
              <Card className="p-4">
                <CardContent className="p-0 text-center text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('noBooksFound')}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Library */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('myLibrary')}</h3>
            {userBooks.length > 0 ? (
              <div className="space-y-3">
                {userBooks.map((userBook) => (
                  <Card key={userBook.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {language === 'ru' && userBook.book.titleRu ? userBook.book.titleRu : userBook.book.title}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {language === 'ru' && userBook.book.authorRu ? userBook.book.authorRu : userBook.book.author}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button size="sm">{t('read')}</Button>
                            <Button size="sm" variant="outline">{t('download')}</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <CardContent className="p-0 text-center text-gray-500">
                  <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No books purchased yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="p-4 pb-20">
          {/* Daily Rewards */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('dailyRewards')}</h3>
            <Card className="bg-gradient-to-r from-secondary to-green-600 text-white p-4 mb-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{t('stepsChallenge')}</h4>
                    <p className="text-sm text-green-100">{t('walkSteps')}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{user?.dailySteps || 0}</div>
                    <div className="text-sm text-green-100">/10,000 {t('steps')}</div>
                  </div>
                </div>
                <Progress value={((user?.dailySteps || 0) / 10000) * 100} className="mt-3" />
                <div className="mt-3 text-sm">
                  <Coins className="inline h-4 w-4 text-accent mr-1" />
                  <span>{t('earnTokens')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Rewards */}
            <Card className="p-4">
              <CardContent className="p-0">
                <h4 className="font-medium text-gray-900 mb-3">{t('sponsorChannelRewards')}</h4>
                <div className="space-y-3">
                  {sponsorChannels.map((channel) => {
                    const isSubscribed = subscriptions.some(sub => sub.channelId === channel.id && sub.verified);
                    return (
                      <div key={channel.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            isSubscribed ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {isSubscribed ? <Check className="h-4 w-4 text-green-600" /> : <Users className="h-4 w-4 text-blue-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{channel.name}</p>
                            <p className="text-xs text-gray-500">
                              {isSubscribed ? `Subscribed - ${channel.reward} EDU earned` : `Subscribe & earn ${channel.reward} EDU`}
                            </p>
                          </div>
                        </div>
                        {isSubscribed ? (
                          <span className="text-sm text-green-600 font-medium">{t('completed')}</span>
                        ) : (
                          <Button 
                            size="sm"
                            onClick={() => subscribeMutation.mutate(channel.id)}
                            disabled={subscribeMutation.isPending}
                          >
                            {t('subscribe')}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referral System */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('referralProgram')}</h3>
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-sm text-gray-600">{t('friendsReferred')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-2">{t('yourReferralCode')}</p>
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-sm bg-white px-2 py-1 rounded">
                      {user?.referralCode || 'Generate code'}
                    </code>
                    <Button size="sm" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4 mr-1" />
                      {t('copy')}
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">{t('earnForFriend')}</p>
                  <Button className="bg-secondary text-white">
                    <Share className="h-4 w-4 mr-1" />
                    {t('shareReferralLink')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('recentTransactions')}</h3>
            <Card className="p-4">
              <CardContent className="p-0">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Plus className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {Number(transaction.amount) > 0 ? '+' : ''}{transaction.amount} EDU
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="p-4 pb-20">
          {/* Admin Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('adminDashboard')}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-primary">{adminStats?.totalUsers || 0}</div>
                  <p className="text-sm text-gray-600">{t('totalUsers')}</p>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-secondary">{adminStats?.activeCourses || 0}</div>
                  <p className="text-sm text-gray-600">{t('activeCourses')}</p>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-accent">{adminStats?.totalBooks || 0}</div>
                  <p className="text-sm text-gray-600">{t('libraryBooks')}</p>
                </CardContent>
              </Card>
              <Card className="p-4 text-center">
                <CardContent className="p-0">
                  <div className="text-2xl font-bold text-purple-600">{adminStats?.tokensDistributed || 0}</div>
                  <p className="text-sm text-gray-600">{t('eduDistributed')}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                className="bg-primary text-white p-3 h-auto flex flex-col"
                onClick={() => setShowAddCourse(true)}
              >
                <Plus className="h-5 w-5 mb-1" />
                {t('addCourse')}
              </Button>
              <Button 
                className="bg-secondary text-white p-3 h-auto flex flex-col"
                onClick={() => setShowAddBook(true)}
              >
                <BookOpen className="h-5 w-5 mb-1" />
                {t('addBook')}
              </Button>
              <Button 
                className="bg-accent text-white p-3 h-auto flex flex-col"
                onClick={() => setAdminView('users')}
              >
                <Gift className="h-5 w-5 mb-1" />
                {t('manageUsers')}
              </Button>
              <Button 
                className="bg-purple-600 text-white p-3 h-auto flex flex-col"
                onClick={() => setAdminView('analytics')}
              >
                <BarChart3 className="h-5 w-5 mb-1" />
                {t('analytics')}
              </Button>
            </div>
          </div>

          {/* Admin Navigation */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={adminView === 'overview' ? "default" : "outline"}
                size="sm"
                onClick={() => setAdminView('overview')}
              >
                Overview
              </Button>
              <Button
                variant={adminView === 'analytics' ? "default" : "outline"}
                size="sm"
                onClick={() => setAdminView('analytics')}
              >
                Analytics
              </Button>
              <Button
                variant={adminView === 'users' ? "default" : "outline"}
                size="sm"
                onClick={() => setAdminView('users')}
              >
                Users
              </Button>
              <Button
                variant={adminView === 'courses' ? "default" : "outline"}
                size="sm"
                onClick={() => setAdminView('courses')}
              >
                Courses
              </Button>
              <Button
                variant={adminView === 'books' ? "default" : "outline"}
                size="sm"
                onClick={() => setAdminView('books')}
              >
                Books
              </Button>
            </div>
          </div>

          {/* Admin Content */}
          {adminView === 'overview' && (
            <div>
              {/* Recent Activity */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('recentActivity')}</h3>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t('newUserRegistered')}</p>
                          <p className="text-xs text-gray-500">5 {t('minutesAgo')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{t('courseCompleted')}</p>
                          <p className="text-xs text-gray-500">12 {t('minutesAgo')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {adminView === 'analytics' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Analytics Dashboard</h3>
              <div className="grid grid-cols-1 gap-4">
                <Card className="p-4">
                  <CardContent className="p-0">
                    <h4 className="font-medium mb-2">User Growth</h4>
                    <div className="text-2xl font-bold text-primary">{adminStats?.totalUsers || 0}</div>
                    <p className="text-sm text-gray-600">Total registered users</p>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <h4 className="font-medium mb-2">Content Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-secondary">{adminStats?.activeCourses || 0}</div>
                        <p className="text-sm text-gray-600">Active Courses</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-accent">{adminStats?.totalBooks || 0}</div>
                        <p className="text-sm text-gray-600">Total Books</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="p-4">
                  <CardContent className="p-0">
                    <h4 className="font-medium mb-2">Token Distribution</h4>
                    <div className="text-2xl font-bold text-purple-600">{adminStats?.tokensDistributed || 0}</div>
                    <p className="text-sm text-gray-600">MIND Token distributed</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {adminView === 'users' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">User Management</h3>
              <div className="space-y-3">
                {allUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.email || user.id}</p>
                            <p className="text-sm text-gray-600">{user.tokens || 0} MIND Token</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {adminView === 'courses' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Course Management</h3>
              <div className="space-y-3">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-600">{course.category} • {course.duration} min</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCourse(course)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingCourseContent(course)}
                          >
                            Content
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {adminView === 'books' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Book Management</h3>
              <div className="space-y-3">
                {books.map((book) => (
                  <Card key={book.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author} • {book.pages} pages</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingBook(book)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditingBookContent(book)}
                          >
                            Content
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}



          {/* User Management */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('userManagement')}</h3>
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">{t('recentUsers')}</h4>
                  <Button size="sm">{t('viewAll')}</Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">New User</p>
                        <p className="text-xs text-gray-500">{t('joined')} 2 {t('daysAgo')}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">0 EDU</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
        </>
      )}

      {/* Progress View */}
      {activeView === 'progress' && (
        <div className="p-4 pb-20">
          <h2 className="text-2xl font-bold mb-6">{t('progress')}</h2>
          
          {/* Learning Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('learningProgress')}</h3>
            <Card className="p-4 mb-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{t('coursesCompleted')}</span>
                  <span className="text-2xl font-bold text-primary">
                    {enrollments?.filter((e: any) => e.progress === 100).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{t('totalCourses')}</span>
                  <span className="text-2xl font-bold text-secondary">
                    {enrollments?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t('booksRead')}</span>
                  <span className="text-2xl font-bold text-accent">
                    {userBooks?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('courseProgress')}</h3>
            {enrollments?.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enrollment: any) => (
                  <Card key={enrollment.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{enrollment.course.title}</h4>
                        <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="mb-2" />
                      <p className="text-sm text-gray-500">
                        {enrollment.progress === 100 ? t('completed') : t('inProgress')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">{t('noCoursesEnrolled')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Wallet View */}
      {activeView === 'wallet' && (
        <div className="p-4 pb-20">
          <h2 className="text-2xl font-bold mb-6">{t('wallet')}</h2>
          
          {/* Balance Card */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 mb-6">
            <CardContent className="p-0">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {user?.tokenBalance || "0"} MIND
                </div>
                <p className="text-blue-100">{t('totalBalance')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('quickActions')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-secondary text-white p-4 h-auto flex flex-col">
                <Gift className="h-6 w-6 mb-2" />
                {t('earnRewards')}
              </Button>
              <Button className="bg-accent text-white p-4 h-auto flex flex-col">
                <Share className="h-6 w-6 mb-2" />
                {t('referFriends')}
              </Button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('recentTransactions')}</h3>
            {transactions?.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction: any) => (
                  <Card key={transaction.id} className="p-4">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <Coins className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.type}</p>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{transaction.amount} EDU</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <CardContent className="p-0">
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500">{t('noTransactions')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Profile View */}
      {activeView === 'profile' && (
        <div className="p-4 pb-20">
          <h2 className="text-2xl font-bold mb-6">{t('profile')}</h2>
          
          {/* Profile Info */}
          <Card className="p-6 mb-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {user?.firstName || "User"} {user?.lastName || ""}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <Badge variant="secondary">{t('level')} {user?.level || 1}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{enrollments?.length || 0}</div>
                  <p className="text-sm text-gray-600">{t('courses')}</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{userBooks?.length || 0}</div>
                  <p className="text-sm text-gray-600">{t('books')}</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{user?.tokenBalance || "0"}</div>
                  <p className="text-sm text-gray-600">MIND</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('settings')}</h3>
            <div className="space-y-3">
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-600" />
                      <span>{t('language')}</span>
                    </div>
                    <Select value={language} onValueChange={changeLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="p-4">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span>{t('notifications')}</span>
                    </div>
                    <Button variant="outline" size="sm">{t('manage')}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Account Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('account')}</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                {t('shareApp')}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                {t('help')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-sm mx-auto">
        <div className="flex">
          <button 
            onClick={() => setActiveView('home')}
            className={`flex-1 py-3 px-4 text-center ${activeView === 'home' ? 'text-primary' : 'text-neutral-500'}`}
          >
            <HomeIcon className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('home')}</span>
          </button>
          <button 
            onClick={() => setActiveView('progress')}
            className={`flex-1 py-3 px-4 text-center ${activeView === 'progress' ? 'text-primary' : 'text-neutral-500'}`}
          >
            <TrendingUp className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('progress')}</span>
          </button>
          <button 
            onClick={() => setActiveView('wallet')}
            className={`flex-1 py-3 px-4 text-center ${activeView === 'wallet' ? 'text-primary' : 'text-neutral-500'}`}
          >
            <Wallet className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('wallet')}</span>
          </button>
          <button 
            onClick={() => setActiveView('profile')}
            className={`flex-1 py-3 px-4 text-center ${activeView === 'profile' ? 'text-primary' : 'text-neutral-500'}`}
          >
            <User className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('profile')}</span>
          </button>
        </div>
      </nav>

      {/* Add Course Dialog */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                <input
                  type="text"
                  value={newCourse.titleRu}
                  onChange={(e) => setNewCourse({...newCourse, titleRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Название курса"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Course description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Russian)</label>
                <textarea
                  value={newCourse.descriptionRu}
                  onChange={(e) => setNewCourse({...newCourse, descriptionRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Описание курса"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor (English)</label>
                <input
                  type="text"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Instructor name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor (Russian)</label>
                <input
                  type="text"
                  value={newCourse.instructorRu}
                  onChange={(e) => setNewCourse({...newCourse, instructorRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Имя инструктора"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="mind-thinking">Mind & Thinking</option>
                  <option value="finance-economics">Finance & Economics</option>
                  <option value="career-skills">Career Skills</option>
                  <option value="future-thinking">Future Thinking</option>
                  <option value="health-body">Health & Body</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({...newCourse, duration: Number(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                  placeholder="60"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => addCourseMutation.mutate(newCourse)}
                  disabled={addCourseMutation.isPending}
                  className="flex-1"
                >
                  {addCourseMutation.isPending ? 'Adding...' : 'Add Course'}
                </Button>
                <Button 
                  onClick={() => setShowAddCourse(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Dialog */}
      {showAddBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Book</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Book title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                <input
                  type="text"
                  value={newBook.titleRu}
                  onChange={(e) => setNewBook({...newBook, titleRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Название книги"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Book description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Russian)</label>
                <textarea
                  value={newBook.descriptionRu}
                  onChange={(e) => setNewBook({...newBook, descriptionRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Описание книги"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author (English)</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author (Russian)</label>
                <input
                  type="text"
                  value={newBook.authorRu}
                  onChange={(e) => setNewBook({...newBook, authorRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  placeholder="Имя автора"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newBook.category}
                  onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="psychology-thinking-development">Psychology & Thinking Development</option>
                  <option value="financial-literacy-economics">Financial Literacy & Economics</option>
                  <option value="marketing">Marketing</option>
                  <option value="health-fitness-nutrition">Health, Fitness & Nutrition</option>
                  <option value="communication-soft-skills">Communication & Soft Skills</option>
                  <option value="entrepreneurship-career">Entrepreneurship & Career</option>
                  <option value="technology-future">Technology & Future</option>
                  <option value="relationships">Relationships</option>
                  <option value="popular-personalities">Popular Personalities</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pages</label>
                <input
                  type="number"
                  value={newBook.pages}
                  onChange={(e) => setNewBook({...newBook, pages: Number(e.target.value)})}
                  className="w-full p-2 border rounded-md"
                  placeholder="200"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => addBookMutation.mutate(newBook)}
                  disabled={addBookMutation.isPending}
                  className="flex-1"
                >
                  {addBookMutation.isPending ? 'Adding...' : 'Add Book'}
                </Button>
                <Button 
                  onClick={() => setShowAddBook(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-3">
              <div>
                <strong>ID:</strong> {selectedUser.id}
              </div>
              <div>
                <strong>Email:</strong> {selectedUser.email || 'N/A'}
              </div>
              <div>
                <strong>MIND Token:</strong> {selectedUser.tokens || 0}
              </div>
              <div>
                <strong>Steps:</strong> {selectedUser.steps || 0}
              </div>
              <div>
                <strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowUserDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Dialog */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Course</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                <input
                  type="text"
                  value={editingCourse.titleRu || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, titleRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Russian)</label>
                <textarea
                  value={editingCourse.descriptionRu || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, descriptionRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor (English)</label>
                <input
                  type="text"
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructor (Russian)</label>
                <input
                  type="text"
                  value={editingCourse.instructorRu || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, instructorRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={editingCourse.duration || ''}
                  onChange={(e) => setEditingCourse({...editingCourse, duration: Number(e.target.value) || 0})}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={async () => {
                    try {
                      // Remove timestamp fields that cause validation errors
                      const { createdAt, updatedAt, ...courseData } = editingCourse;
                      await apiRequest('PUT', `/api/courses/${editingCourse.id}`, courseData);
                      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
                      setEditingCourse(null);
                      toast({
                        title: "Success",
                        description: "Course updated successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update course",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setEditingCourse(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Dialog */}
      {editingBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Book</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                <input
                  type="text"
                  value={editingBook.titleRu || ''}
                  onChange={(e) => setEditingBook({...editingBook, titleRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (English)</label>
                <textarea
                  value={editingBook.description || ''}
                  onChange={(e) => setEditingBook({...editingBook, description: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (Russian)</label>
                <textarea
                  value={editingBook.descriptionRu || ''}
                  onChange={(e) => setEditingBook({...editingBook, descriptionRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author (English)</label>
                <input
                  type="text"
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Author (Russian)</label>
                <input
                  type="text"
                  value={editingBook.authorRu || ''}
                  onChange={(e) => setEditingBook({...editingBook, authorRu: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pages</label>
                <input
                  type="number"
                  value={editingBook.pages || ''}
                  onChange={(e) => setEditingBook({...editingBook, pages: Number(e.target.value) || 0})}
                  className="w-full p-2 border rounded-md"
                  min="0"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={async () => {
                    try {
                      // Remove timestamp fields that cause validation errors  
                      const { createdAt, updatedAt, ...bookData } = editingBook;
                      await apiRequest('PUT', `/api/books/${editingBook.id}`, bookData);
                      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
                      setEditingBook(null);
                      toast({
                        title: "Success",
                        description: "Book updated successfully",
                      });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update book",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setEditingBook(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Content Management Modal */}
      {editingCourseContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Manage Course Content: {editingCourseContent.title}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Lessons</h4>
                <Button
                  onClick={() => setAddingLesson({
                    courseId: editingCourseContent.id,
                    title: '',
                    titleRu: '',
                    description: '',
                    descriptionRu: '',
                    content: '',
                    contentRu: '',
                    videoUrl: '',
                    duration: 0,
                    orderIndex: 1
                  })}
                  className="bg-primary text-white"
                >
                  Add Lesson
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-600">Lessons will be displayed here. Click "Add Lesson" to create your first lesson.</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setEditingCourseContent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Book Content Management Modal */}
      {editingBookContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Manage Book Content: {editingBookContent.title}</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Chapters</h4>
                <Button
                  onClick={() => setAddingChapter({
                    bookId: editingBookContent.id,
                    title: '',
                    titleRu: '',
                    content: '',
                    contentRu: '',
                    orderIndex: 1
                  })}
                  className="bg-primary text-white"
                >
                  Add Chapter
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 border rounded-lg">
                  <p className="text-gray-600">Chapters will be displayed here. Click "Add Chapter" to create your first chapter.</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button
                variant="outline"
                onClick={() => setEditingBookContent(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {addingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add New Lesson</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title (English)*</label>
                  <input
                    type="text"
                    value={addingLesson.title}
                    onChange={(e) => setAddingLesson({...addingLesson, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                  <input
                    type="text"
                    value={addingLesson.titleRu}
                    onChange={(e) => setAddingLesson({...addingLesson, titleRu: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (English)</label>
                  <textarea
                    value={addingLesson.description}
                    onChange={(e) => setAddingLesson({...addingLesson, description: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Russian)</label>
                  <textarea
                    value={addingLesson.descriptionRu}
                    onChange={(e) => setAddingLesson({...addingLesson, descriptionRu: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (English)*</label>
                  <textarea
                    value={addingLesson.content}
                    onChange={(e) => setAddingLesson({...addingLesson, content: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (Russian)</label>
                  <textarea
                    value={addingLesson.contentRu}
                    onChange={(e) => setAddingLesson({...addingLesson, contentRu: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <input
                    type="text"
                    value={addingLesson.videoUrl}
                    onChange={(e) => setAddingLesson({...addingLesson, videoUrl: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={addingLesson.duration}
                      onChange={(e) => setAddingLesson({...addingLesson, duration: Number(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Index</label>
                    <input
                      type="number"
                      value={addingLesson.orderIndex}
                      onChange={(e) => setAddingLesson({...addingLesson, orderIndex: Number(e.target.value)})}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setAddingLesson(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await apiRequest('POST', `/api/courses/${addingLesson.courseId}/lessons`, addingLesson);
                    setAddingLesson(null);
                    toast({ title: "Success", description: "Lesson added successfully" });
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to add lesson", variant: "destructive" });
                  }
                }}
              >
                Add Lesson
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {addingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add New Chapter</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title (English)*</label>
                  <input
                    type="text"
                    value={addingChapter.title}
                    onChange={(e) => setAddingChapter({...addingChapter, title: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title (Russian)</label>
                  <input
                    type="text"
                    value={addingChapter.titleRu}
                    onChange={(e) => setAddingChapter({...addingChapter, titleRu: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (English)*</label>
                  <textarea
                    value={addingChapter.content}
                    onChange={(e) => setAddingChapter({...addingChapter, content: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content (Russian)</label>
                  <textarea
                    value={addingChapter.contentRu}
                    onChange={(e) => setAddingChapter({...addingChapter, contentRu: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    rows={10}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order Index</label>
                  <input
                    type="number"
                    value={addingChapter.orderIndex}
                    onChange={(e) => setAddingChapter({...addingChapter, orderIndex: Number(e.target.value)})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setAddingChapter(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await apiRequest('POST', `/api/books/${addingChapter.bookId}/chapters`, addingChapter);
                    setAddingChapter(null);
                    toast({ title: "Success", description: "Chapter added successfully" });
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to add chapter", variant: "destructive" });
                  }
                }}
              >
                Add Chapter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
