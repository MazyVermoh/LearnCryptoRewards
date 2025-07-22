import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Book, GraduationCap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: number;
  title: string;
  titleRu: string;
  category: string;
  isVisible: boolean;
  isActive: boolean;
}

interface BookType {
  id: number;
  title: string;
  titleRu: string;
  author: string;
  category: string;
  isVisible: boolean;
  isActive: boolean;
}

export function ContentVisibilityManager() {
  const [selectedTab, setSelectedTab] = useState<'courses' | 'books'>('courses');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/admin/courses'],
    enabled: selectedTab === 'courses'
  });

  const { data: books, isLoading: booksLoading } = useQuery<BookType[]>({
    queryKey: ['/api/admin/books'],
    enabled: selectedTab === 'books'
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      return apiRequest(`/api/admin/courses/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: "Курс обновлен",
        description: "Видимость курса изменена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить курс",
        variant: "destructive",
      });
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      return apiRequest(`/api/admin/books/${id}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify({ isVisible })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Книга обновлена",
        description: "Видимость книги изменена",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить книгу",
        variant: "destructive",
      });
    }
  });

  const handleCourseVisibilityChange = (courseId: number, isVisible: boolean) => {
    updateCourseMutation.mutate({ id: courseId, isVisible });
  };

  const handleBookVisibilityChange = (bookId: number, isVisible: boolean) => {
    updateBookMutation.mutate({ id: bookId, isVisible });
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      'mind-thinking': 'bg-purple-100 text-purple-800',
      'finance-economics': 'bg-green-100 text-green-800',
      'career-skills': 'bg-blue-100 text-blue-800',
      'future-thinking': 'bg-orange-100 text-orange-800',
      'health-body': 'bg-red-100 text-red-800',
      'psychology-thinking-development': 'bg-purple-100 text-purple-800',
      'financial-literacy-economics': 'bg-green-100 text-green-800',
      'marketing': 'bg-yellow-100 text-yellow-800',
      'health-fitness-nutrition': 'bg-red-100 text-red-800',
      'communication-soft-skills': 'bg-blue-100 text-blue-800',
      'entrepreneurship-career': 'bg-indigo-100 text-indigo-800',
      'technology-future': 'bg-gray-100 text-gray-800',
      'relationships': 'bg-pink-100 text-pink-800',
      'popular-personalities': 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Управление видимостью контента</h2>
          <p className="text-muted-foreground">
            Скрывайте или показывайте курсы и книги для пользователей
          </p>
        </div>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={selectedTab === 'courses' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('courses')}
          className="flex items-center gap-2"
        >
          <GraduationCap className="h-4 w-4" />
          Курсы
        </Button>
        <Button
          variant={selectedTab === 'books' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('books')}
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          Книги
        </Button>
      </div>

      {selectedTab === 'courses' && (
        <div className="space-y-4">
          {coursesLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => (
                <Card key={course.id} className={`transition-opacity ${course.isVisible ? '' : 'opacity-60'}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {course.isVisible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className={getCategoryBadgeColor(course.category)}>
                        {course.category}
                      </Badge>
                      {course.titleRu && (
                        <CardDescription className="text-xs">
                          {course.titleRu}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {course.isVisible ? 'Видимый' : 'Скрытый'}
                      </span>
                      <Switch
                        checked={course.isVisible}
                        onCheckedChange={(checked) => handleCourseVisibilityChange(course.id, checked)}
                        disabled={updateCourseMutation.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'books' && (
        <div className="space-y-4">
          {booksLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {books?.map((book) => (
                <Card key={book.id} className={`transition-opacity ${book.isVisible ? '' : 'opacity-60'}`}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {book.isVisible ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary" className={getCategoryBadgeColor(book.category)}>
                        {book.category}
                      </Badge>
                      <CardDescription className="text-xs">
                        Автор: {book.author}
                      </CardDescription>
                      {book.titleRu && (
                        <CardDescription className="text-xs">
                          {book.titleRu}
                        </CardDescription>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {book.isVisible ? 'Видимая' : 'Скрытая'}
                      </span>
                      <Switch
                        checked={book.isVisible}
                        onCheckedChange={(checked) => handleBookVisibilityChange(book.id, checked)}
                        disabled={updateBookMutation.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}