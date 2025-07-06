import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface TestProps {
  testType: 'chapter' | 'lesson';
  testId: number;
  chapterId?: number;
  lessonId?: number;
  userId: string;
  onTestPassed?: () => void;
  onTestFailed?: () => void;
}

export default function Test({ testType, testId, chapterId, lessonId, userId, onTestPassed, onTestFailed }: TestProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Fetch test data
  const { data: tests = [] } = useQuery({
    queryKey: [`/api/${testType === 'chapter' ? 'chapters' : 'lessons'}/${testId}/tests`],
    retry: false,
  });

  // Get the first test (for now, we'll show one test at a time)
  const test = tests[0];

  // Check if user has already passed this test
  const { data: testStatus } = useQuery({
    queryKey: [`/api/users/${userId}/test-status`, { testType, testId: test?.id }],
    enabled: !!test,
    retry: false,
  });

  // Submit test answer mutation
  const submitMutation = useMutation({
    mutationFn: async (answer: number) => {
      return apiRequest('/api/test-attempts', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          testType,
          testId: test.id,
          chapterId: testType === 'chapter' ? chapterId : null,
          lessonId: testType === 'lesson' ? lessonId : null,
          selectedAnswer: answer,
          isCorrect: answer === test.correctAnswer,
        }),
      });
    },
    onSuccess: (data) => {
      setResult(data);
      setSubmitted(true);
      
      if (data.isCorrect) {
        toast({ 
          title: "Correct!", 
          description: "You answered correctly and can continue reading." 
        });
        onTestPassed?.();
      } else {
        toast({ 
          title: "Incorrect", 
          description: "You need to re-read the content from the beginning.",
          variant: "destructive"
        });
        onTestFailed?.();
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/test-status`]
      });
    },
    onError: (error) => {
      toast({ 
        title: "Error submitting answer", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      toast({ 
        title: "Please select an answer", 
        variant: "destructive" 
      });
      return;
    }
    
    submitMutation.mutate(selectedAnswer);
  };

  if (!test) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No test available for this {testType}</p>
        </CardContent>
      </Card>
    );
  }

  // If user has already passed this test, show success message
  if (testStatus?.hasPassed && !submitted) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Test Completed</h3>
          <p className="text-green-700">You have already passed this test and can continue reading.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            {testType === 'chapter' ? 'Chapter Test' : 'Lesson Test'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Complete this test to continue reading. If you answer incorrectly, you'll need to re-read from the beginning.
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-medium mb-4">
            {language === 'ru' && test.questionRu ? test.questionRu : test.question}
          </h4>

          {!submitted ? (
            <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => setSelectedAnswer(parseInt(value))}>
              {(language === 'ru' && test.optionsRu ? test.optionsRu : test.options)?.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2">
              {(language === 'ru' && test.optionsRu ? test.optionsRu : test.options)?.map((option: string, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    index === test.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : index === selectedAnswer && index !== test.correctAnswer
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {index === test.correctAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {index === selectedAnswer && index !== test.correctAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show explanation after submission */}
        {submitted && test.explanation && (
          <div className={`p-4 rounded-lg mb-4 ${
            result?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h5 className="font-medium mb-2">Explanation:</h5>
            <p className="text-sm">
              {language === 'ru' && test.explanationRu ? test.explanationRu : test.explanation}
            </p>
          </div>
        )}

        {/* Submit button or result */}
        {!submitted ? (
          <Button 
            onClick={handleSubmit}
            disabled={selectedAnswer === null || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit Answer'}
          </Button>
        ) : (
          <div className={`text-center p-4 rounded-lg ${
            result?.isCorrect 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {result?.isCorrect ? (
              <>
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-semibold">Correct!</h4>
                <p className="text-sm">You can continue reading.</p>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                <h4 className="font-semibold">Incorrect</h4>
                <p className="text-sm">You need to re-read from the beginning.</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}