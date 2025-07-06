import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import type { Course, CourseLesson } from "@/lib/types";

interface CourseWithLessons extends Course {
  lessons: CourseLesson[];
}

export default function CourseReader() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showLessonList, setShowLessonList] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLessonList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { data: course, isLoading } = useQuery<CourseWithLessons>({
    queryKey: ["/api/courses", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error("Failed to fetch course");
      return response.json();
    },
  });

  const { data: lessons = [] } = useQuery<CourseLesson[]>({
    queryKey: ["/api/courses", id, "lessons"],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}/lessons`);
      if (!response.ok) throw new Error("Failed to fetch lessons");
      return response.json();
    },
    enabled: !!id,
  });

  const currentLesson = lessons[currentLessonIndex];
  const progress = lessons.length > 0 ? ((currentLessonIndex + 1) / lessons.length) * 100 : 0;

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  const goToLesson = (index: number) => {
    setCurrentLessonIndex(index);
    setShowLessonList(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Курс не найден</p>
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
                  {language === "ru" ? course.titleRu || course.title : course.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLessonIndex + 1} / {lessons.length}
                </span>
                <Progress value={progress} className="w-20" />
              </div>
              
              <div className="relative" ref={menuRef}>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLessonList(!showLessonList)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                
                {showLessonList && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Уроки</h3>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {lessons.map((lesson, index) => (
                          <button
                            key={lesson.id}
                            onClick={() => goToLesson(index)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg transition-colors",
                              index === currentLessonIndex
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
                                  {language === "ru" ? lesson.titleRu || lesson.title : lesson.title}
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
          {currentLesson ? (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      {language === "ru" ? currentLesson.titleRu || currentLesson.title : currentLesson.title}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Урок {currentLessonIndex + 1} из {lessons.length}
                    </p>
                    {currentLesson.duration && (
                      <p className="text-gray-500 dark:text-gray-500 mt-1">
                        Продолжительность: {currentLesson.duration} мин
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {Math.round(progress)}% завершено
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {currentLesson.videoUrl && (
                  <div className="mb-6">
                    <video 
                      controls 
                      className="w-full rounded-lg"
                      poster="/placeholder-video.jpg"
                    >
                      <source src={currentLesson.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {language === "ru" ? currentLesson.contentRu || currentLesson.content : currentLesson.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Уроки не найдены
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
              onClick={goToPrevLesson}
              disabled={currentLessonIndex === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Предыдущий урок</span>
            </Button>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentLessonIndex + 1} из {lessons.length}
                </p>
                <Progress value={progress} className="w-32 mt-1" />
              </div>
            </div>

            <Button
              variant="outline"
              onClick={goToNextLesson}
              disabled={currentLessonIndex === lessons.length - 1}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline">Следующий урок</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}