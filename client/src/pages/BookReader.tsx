import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Menu, ChevronLeft, ChevronRight, BookOpen, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import type { Book, BookChapter } from "@/lib/types";

interface BookWithChapters extends Book {
  chapters: BookChapter[];
}

export default function BookReader() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: book, isLoading } = useQuery<BookWithChapters>({
    queryKey: ["/api/books", id],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}`);
      if (!response.ok) throw new Error("Failed to fetch book");
      return response.json();
    },
  });

  // Get current user
  const { data: user } = useQuery({
    queryKey: ["/api/users/user123"],
    queryFn: async () => {
      const response = await fetch(`/api/users/user123`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  // Get reading progress
  const { data: progress } = useQuery({
    queryKey: ["/api/users", user?.id, "books", id, "progress"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/books/${id}/progress`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!id && !!user?.id,
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowChapterList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update chapter index when progress is loaded
  useEffect(() => {
    if (progress && progress.currentChapter > 0) {
      setCurrentChapterIndex(progress.currentChapter - 1);
    }
  }, [progress]);

  // Update reading progress
  const updateProgressMutation = useMutation({
    mutationFn: async (currentChapter: number) => {
      if (!user?.id) throw new Error("User not found");
      const response = await fetch(`/api/users/${user.id}/books/${id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentChapter }),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "books", id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      
      // Check if book was completed
      if (data.isCompleted && !data.rewardClaimed) {
        toast({
          title: "🎉 Congratulations!",
          description: "You completed the book and earned 100 MIND tokens!",
          duration: 5000,
        });
      }
    },
  });

  const { data: chapters = [] } = useQuery<BookChapter[]>({
    queryKey: ["/api/books", id, "chapters"],
    queryFn: async () => {
      const response = await fetch(`/api/books/${id}/chapters`);
      if (!response.ok) throw new Error("Failed to fetch chapters");
      return response.json();
    },
    enabled: !!id,
  });

  // Complete book manually
  const completeBookMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const response = await fetch(`/api/users/${user.id}/books/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to complete book");
      return response.json();
    },
    onSuccess: () => {
      // Force refresh of progress data
      queryClient.removeQueries({ queryKey: ["/api/users", user?.id, "books", id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "books", id, "progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "transactions"] });
      
      // Force refetch immediately
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/users", user?.id, "books", id, "progress"] });
      }, 100);
      
      toast({
        title: "🎉 Congratulations!",
        description: "You completed the book and earned 100 MIND tokens!",
        duration: 5000,
      });
    },
  });

  // Initialize progress for first time reading
  useEffect(() => {
    if (user?.id && id && chapters.length > 0 && progress === null && !updateProgressMutation.isPending) {
      console.log("Initializing progress for first time reading");
      updateProgressMutation.mutate(1);
    }
  }, [user?.id, id, chapters.length, progress, updateProgressMutation.isPending]);

  const currentChapter = chapters[currentChapterIndex];
  const progressPercent = chapters.length > 0 ? ((currentChapterIndex + 1) / chapters.length) * 100 : 0;

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const newIndex = currentChapterIndex + 1;
      setCurrentChapterIndex(newIndex);
      updateProgressMutation.mutate(newIndex + 1);
    }
  };

  const goToPrevChapter = () => {
    if (currentChapterIndex > 0) {
      const newIndex = currentChapterIndex - 1;
      setCurrentChapterIndex(newIndex);
      updateProgressMutation.mutate(newIndex + 1);
    }
  };

  const goToChapter = (index: number) => {
    setCurrentChapterIndex(index);
    setShowChapterList(false);
    updateProgressMutation.mutate(index + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Книга не найдена</p>
          <Button 
            onClick={() => setLocation("/")} 
            className="mt-4"
          >
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Назад</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h1 className="font-semibold text-gray-900 dark:text-white">
                  {language === "ru" ? book.titleRu || book.title : book.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentChapterIndex + 1} / {chapters.length}
                </span>
                <Progress value={progressPercent} className="w-20" />
              </div>
              
              {/* Reading Progress & Reward Info */}
              {progress && (
                <div className="flex items-center space-x-2">
                  {progress.isCompleted && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Gift className="w-3 h-3" />
                      <span className="text-xs">Completed!</span>
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="relative" ref={menuRef}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowChapterList(!showChapterList)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                
                {showChapterList && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Содержание</h3>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {chapters.map((chapter, index) => (
                          <button
                            key={chapter.id}
                            onClick={() => goToChapter(index)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg transition-colors",
                              index === currentChapterIndex
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            )}
                          >
                            <div className="flex items-start space-x-3">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {language === "ru" ? chapter.titleRu || chapter.title : chapter.title}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Book Completion Reward Alert */}
          {progress && progress.is_completed && (
            <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <Gift className="h-4 w-4" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                🎉 Congratulations! You have completed this book and earned 100 MIND tokens as a reward!
              </AlertDescription>
            </Alert>
          )}
          {currentChapter ? (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {language === "ru" ? currentChapter.titleRu || currentChapter.title : currentChapter.title}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Глава {currentChapterIndex + 1} из {chapters.length}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {Math.round(progressPercent)}% завершено
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                    {language === "ru" ? currentChapter.contentRu || currentChapter.content : currentChapter.content}
                  </div>
                  {(!currentChapter.content && !currentChapter.contentRu) && (
                    <div className="text-center text-gray-500 py-8">
                      <p>Содержимое главы пока не добавлено</p>
                      <p className="text-sm mt-2">Вы можете добавить содержимое через админ-панель</p>
                    </div>
                  )}
                </div>
                
                {/* Complete Chapter Button */}
                {currentChapter && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Закончили читать эту главу?
                        </p>
                        <Button 
                          onClick={() => completeBookMutation.mutate()}
                          disabled={completeBookMutation.isPending || (progress && progress.is_completed)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {completeBookMutation.isPending ? (
                            "Завершаем..."
                          ) : (progress && progress.is_completed) ? (
                            "✓ Книга завершена"
                          ) : (
                            "Завершить книгу"
                          )}
                        </Button>
                        {!(progress && progress.is_completed) && (
                          <p className="text-xs text-gray-500 mt-2">
                            Получите 100 MIND токенов за завершение
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Главы не найдены
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPrevChapter}
              disabled={currentChapterIndex === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Предыдущая глава</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentChapterIndex + 1} из {chapters.length}
                </p>
                <Progress value={progress} className="w-32 mt-1" />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={goToNextChapter}
              disabled={currentChapterIndex === chapters.length - 1}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Следующая глава</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}