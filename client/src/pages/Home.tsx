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
  Coins
} from 'lucide-react';

// Mock user data - in real app this would come from auth
const mockUserId = "user123";

export default function Home() {
  const { language, changeLanguage, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('courses');
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

  const categoryIcons = {
    business: <Briefcase className="h-6 w-6" />,
    fitness: <Dumbbell className="h-6 w-6" />,
    crypto: <Bitcoin className="h-6 w-6" />,
    'self-development': <Brain className="h-6 w-6" />,
  };

  const categoryColors = {
    business: "bg-blue-50 border-blue-200 text-blue-900",
    fitness: "bg-green-50 border-green-200 text-green-900",
    crypto: "bg-yellow-50 border-yellow-200 text-yellow-900",
    'self-development': "bg-purple-50 border-purple-200 text-purple-900",
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
              {Object.entries(categoryIcons).map(([category, icon]) => (
                <Card key={category} className={`p-4 cursor-pointer transition-colors ${categoryColors[category as keyof typeof categoryColors]}`}>
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

          {/* Featured Courses */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('featuredCourses')}</h3>
            <div className="space-y-3">
              {courses.slice(0, 3).map((course) => (
                <Card key={course.id} className="p-4">
                  <CardContent className="p-0">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {categoryIcons[course.category as keyof typeof categoryIcons]}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                        <p className="text-gray-600 text-sm mb-2">{course.instructor}</p>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < Math.floor(Number(course.rating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{course.rating} ({course.reviewCount})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-secondary">{course.price} EDU</span>
                          <Button 
                            size="sm" 
                            onClick={() => enrollMutation.mutate({
                              courseId: course.id,
                              coursePrice: course.price,
                              courseTitle: course.title
                            })}
                            disabled={enrollMutation.isPending}
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
                          {categoryIcons[enrollment.course.category as keyof typeof categoryIcons]}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                          <p className="text-gray-600 text-sm">{t('progress')}: {enrollment.progress}%</p>
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
              {['all', 'business', 'psychology', 'technology', 'finance'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {t(category as any)}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Books */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{t('featuredBooks')}</h3>
            <div className="grid grid-cols-2 gap-4">
              {books.slice(0, 4).map((book) => (
                <Card key={book.id} className="p-3">
                  <CardContent className="p-0">
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{book.title}</h4>
                    <p className="text-gray-600 text-xs mb-2">{book.author}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary font-medium">{book.price} EDU</span>
                      <Button 
                        size="sm" 
                        className="text-xs px-2 py-1"
                        onClick={() => purchaseMutation.mutate({
                          bookId: book.id,
                          bookPrice: book.price,
                          bookTitle: book.title
                        })}
                        disabled={purchaseMutation.isPending}
                      >
                        {t('buy')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                          <h4 className="font-medium text-gray-900">{userBook.book.title}</h4>
                          <p className="text-gray-600 text-sm">{userBook.book.author}</p>
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-sm mx-auto">
        <div className="flex">
          <button className="flex-1 py-3 px-4 text-center text-primary">
            <HomeIcon className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('home')}</span>
          </button>
          <button className="flex-1 py-3 px-4 text-center text-neutral-500">
            <TrendingUp className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('progress')}</span>
          </button>
          <button className="flex-1 py-3 px-4 text-center text-neutral-500">
            <Wallet className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('wallet')}</span>
          </button>
          <button className="flex-1 py-3 px-4 text-center text-neutral-500">
            <User className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">{t('profile')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
