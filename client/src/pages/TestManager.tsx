import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface TestForm {
  question: string;
  questionRu?: string;
  options: string[];
  optionsRu?: string[];
  correctAnswer: number;
  explanation?: string;
  explanationRu?: string;
  optionsCount: number;
}

export default function TestManager() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<'chapter' | 'lesson'>('chapter');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [testForm, setTestForm] = useState<TestForm>({
    question: '',
    questionRu: '',
    options: ['', ''],
    optionsRu: ['', ''],
    correctAnswer: 0,
    explanation: '',
    explanationRu: '',
    optionsCount: 2,
  });

  // Fetch chapters or lessons based on type
  const { data: items = [] } = useQuery({
    queryKey: [selectedType === 'chapter' ? '/api/books' : '/api/courses'],
    retry: false,
  });

  // Fetch tests for selected item
  const { data: tests = [] } = useQuery({
    queryKey: selectedId ? [`/api/${selectedType === 'chapter' ? 'chapters' : 'lessons'}/${selectedId}/tests`] : [],
    enabled: !!selectedId,
    retry: false,
  });

  // Get items for dropdown (chapters or lessons)
  const { data: subItems = [] } = useQuery({
    queryKey: selectedId 
      ? [`/api/${selectedType === 'chapter' ? 'books' : 'courses'}/${selectedId}/${selectedType === 'chapter' ? 'chapters' : 'lessons'}`]
      : [],
    enabled: !!selectedId,
    retry: false,
  });

  // Create test mutation
  const createMutation = useMutation({
    mutationFn: async (data: TestForm) => {
      if (!selectedId) throw new Error('No item selected');
      return apiRequest(`/api/${selectedType === 'chapter' ? 'chapters' : 'lessons'}/${selectedId}/tests`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/${selectedType === 'chapter' ? 'chapters' : 'lessons'}/${selectedId}/tests`]
      });
      setShowForm(false);
      resetForm();
      toast({ title: "Test created successfully" });
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast({ 
        title: "Error creating test", 
        description: "Please check that all required fields are filled",
        variant: "destructive" 
      });
    },
  });

  // Update test mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TestForm) => {
      if (!editingTest) throw new Error('No test selected for editing');
      return apiRequest(`/api/${selectedType === 'chapter' ? 'chapter' : 'lesson'}-tests/${editingTest.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/${selectedType === 'chapter' ? 'chapters' : 'lessons'}/${selectedId}/tests`]
      });
      setEditingTest(null);
      setShowForm(false);
      resetForm();
      toast({ title: "Test updated successfully" });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({ title: "Error updating test", description: "Please try again", variant: "destructive" });
    },
  });

  // Delete test mutation
  const deleteMutation = useMutation({
    mutationFn: async (testId: number) => {
      return apiRequest(`/api/${selectedType === 'chapter' ? 'chapter' : 'lesson'}-tests/${testId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/${selectedType === 'chapter' ? 'chapters' : 'lessons'}/${selectedId}/tests`]
      });
      toast({ title: "Test deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting test", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTestForm({
      question: '',
      questionRu: '',
      options: ['', ''],
      optionsRu: ['', ''],
      correctAnswer: 0,
      explanation: '',
      explanationRu: '',
      optionsCount: 2,
    });
  };

  const handleEdit = (test: any) => {
    setEditingTest(test);
    setTestForm({
      question: test.question || '',
      questionRu: test.questionRu || '',
      options: test.options || ['', ''],
      optionsRu: test.optionsRu || ['', ''],
      correctAnswer: test.correctAnswer || 0,
      explanation: test.explanation || '',
      explanationRu: test.explanationRu || '',
      optionsCount: test.options ? test.options.length : 2,
    });
    setShowForm(true);
  };

  const handleOptionsCountChange = (count: number) => {
    const newOptions = [...testForm.options];
    const newOptionsRu = [...testForm.optionsRu];
    
    if (count > testForm.options.length) {
      // Add empty options
      for (let i = testForm.options.length; i < count; i++) {
        newOptions.push('');
        newOptionsRu.push('');
      }
    } else if (count < testForm.options.length) {
      // Remove excess options
      newOptions.splice(count);
      newOptionsRu.splice(count);
    }
    
    setTestForm({
      ...testForm,
      options: newOptions,
      optionsRu: newOptionsRu,
      optionsCount: count,
      // Reset correct answer if it's out of range
      correctAnswer: testForm.correctAnswer >= count ? 0 : testForm.correctAnswer,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty options and clean the data
    const cleanedOptions = testForm.options.filter(option => option.trim() !== '');
    const cleanedOptionsRu = testForm.optionsRu.filter(option => option.trim() !== '');
    
    // Validate form data
    if (!testForm.question.trim()) {
      toast({ title: "Error", description: "Please provide a question", variant: "destructive" });
      return;
    }
    
    if (cleanedOptions.length < 2) {
      toast({ title: "Error", description: "Please provide at least 2 answer options", variant: "destructive" });
      return;
    }
    
    if (!selectedId) {
      toast({ title: "Error", description: "Please select a chapter or lesson first", variant: "destructive" });
      return;
    }
    
    // Adjust correct answer if it's out of range
    const adjustedCorrectAnswer = testForm.correctAnswer >= cleanedOptions.length ? 0 : testForm.correctAnswer;
    
    const cleanedForm = {
      ...testForm,
      options: cleanedOptions,
      optionsRu: cleanedOptionsRu,
      correctAnswer: adjustedCorrectAnswer,
      // Remove the optionsCount field as it's not needed in the API
      optionsCount: undefined,
    };
    
    console.log('Submitting form data:', cleanedForm);
    console.log('Selected ID:', selectedId);
    console.log('Selected Type:', selectedType);
    
    if (editingTest) {
      updateMutation.mutate(cleanedForm);
    } else {
      createMutation.mutate(cleanedForm);
    }
  };

  const updateOption = (index: number, value: string, isRussian = false) => {
    const field = isRussian ? 'optionsRu' : 'options';
    const newOptions = [...testForm[field]];
    newOptions[index] = value;
    setTestForm({ ...testForm, [field]: newOptions });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold">Test Manager</h1>
          </div>
        </div>

        {/* Type Selection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex space-x-4 mb-4">
              <Button
                variant={selectedType === 'chapter' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('chapter');
                  setSelectedId(null);
                }}
              >
                Chapter Tests
              </Button>
              <Button
                variant={selectedType === 'lesson' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('lesson');
                  setSelectedId(null);
                }}
              >
                Lesson Tests
              </Button>
            </div>

            {/* Item Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select {selectedType === 'chapter' ? 'Book' : 'Course'}
                </label>
                <Select value={selectedId?.toString()} onValueChange={(value) => setSelectedId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${selectedType === 'chapter' ? 'book' : 'course'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {language === 'ru' && item.titleRu ? item.titleRu : item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedId && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select {selectedType === 'chapter' ? 'Chapter' : 'Lesson'}
                  </label>
                  <Select value={selectedId?.toString()} onValueChange={(value) => setSelectedId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Choose a ${selectedType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {subItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {language === 'ru' && item.titleRu ? item.titleRu : item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tests List */}
        {selectedId && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Tests</h3>
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setEditingTest(null);
                    resetForm();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              </div>

              {tests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tests created yet</p>
              ) : (
                <div className="space-y-4">
                  {tests.map((test: any) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            {language === 'ru' && test.questionRu ? test.questionRu : test.question}
                          </h4>
                          <div className="space-y-1">
                            {(language === 'ru' && test.optionsRu ? test.optionsRu : test.options)?.map((option: string, index: number) => (
                              <div
                                key={index}
                                className={`p-2 rounded text-sm ${
                                  index === test.correctAnswer
                                    ? 'bg-green-100 text-green-800 font-medium'
                                    : 'bg-gray-100'
                                }`}
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                          {test.explanation && (
                            <p className="text-sm text-gray-600 mt-2">
                              <strong>Explanation:</strong> {language === 'ru' && test.explanationRu ? test.explanationRu : test.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(test)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(test.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Test Form */}
        {showForm && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingTest ? 'Edit Test' : 'Create New Test'}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTest(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question (English)</label>
                    <Textarea
                      value={testForm.question}
                      onChange={(e) => setTestForm({ ...testForm, question: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Question (Russian)</label>
                    <Textarea
                      value={testForm.questionRu}
                      onChange={(e) => setTestForm({ ...testForm, questionRu: e.target.value })}
                    />
                  </div>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Answer Options</h4>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Number of options:</label>
                      <Select
                        value={testForm.optionsCount.toString()}
                        onValueChange={(value) => handleOptionsCountChange(parseInt(value))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">English Options</label>
                      {testForm.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            required
                          />
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={testForm.correctAnswer === index}
                            onChange={() => setTestForm({ ...testForm, correctAnswer: index })}
                            className="ml-2"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Russian Options</label>
                      {testForm.optionsRu.map((option, index) => (
                        <div key={index} className="mb-2">
                          <Input
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value, true)}
                            placeholder={`Вариант ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation (English)</label>
                    <Textarea
                      value={testForm.explanation}
                      onChange={(e) => setTestForm({ ...testForm, explanation: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Explanation (Russian)</label>
                    <Textarea
                      value={testForm.explanationRu}
                      onChange={(e) => setTestForm({ ...testForm, explanationRu: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingTest(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingTest ? 'Update Test' : 'Create Test'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}