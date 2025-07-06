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
            <span className="font-semibold text-lg text-neutral-900">EduCrypto</span>
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
              <span className="font-medium">{user?.tokenBalance || "0"} EDU</span>
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
            <span className="text-sm">{t('admin')}</span>
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
              <Button className="bg-primary text-white p-3 h-auto flex flex-col">
                <Plus className="h-5 w-5 mb-1" />
                {t('addCourse')}
              </Button>
              <Button className="bg-secondary text-white p-3 h-auto flex flex-col">
                <BookOpen className="h-5 w-5 mb-1" />
                {t('addBook')}
              </Button>
              <Button className="bg-accent text-white p-3 h-auto flex flex-col">
                <Gift className="h-5 w-5 mb-1" />
                {t('manageRewards')}
              </Button>
              <Button className="bg-purple-600 text-white p-3 h-auto flex flex-col">
                <BarChart3 className="h-5 w-5 mb-1" />
                {t('analytics')}
              </Button>
            </div>
          </div>

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
                  <p className="text-sm text-gray-600">EDU</p>
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
    </div>
  );
}
