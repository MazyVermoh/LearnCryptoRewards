import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Search, Globe, Type, Hash } from 'lucide-react';

export function TextContentManager() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState({
    key: '',
    textEn: '',
    textRu: '',
    category: '',
    description: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch text content
  const { data: textContent = [], isLoading } = useQuery({
    queryKey: selectedCategory ? [`/api/admin/text-content?category=${selectedCategory}`] : ['/api/admin/text-content'],
    retry: false,
  });

  // Available categories for text content
  const categories = [
    { value: 'ui', label: 'User Interface' },
    { value: 'navigation', label: 'Navigation' },
    { value: 'course', label: 'Courses' },
    { value: 'book', label: 'Books' },
    { value: 'user', label: 'User Management' },
    { value: 'rewards', label: 'Rewards & Tokens' },
    { value: 'admin', label: 'Admin Panel' },
    { value: 'messages', label: 'Messages & Notifications' },
    { value: 'errors', label: 'Error Messages' },
    { value: 'general', label: 'General' }
  ];

  // Create text content mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/admin/text-content`, 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/text-content'] });
      setNewItem({ key: '', textEn: '', textRu: '', category: '', description: '' });
      setShowAddForm(false);
      toast({ title: "Text content created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating text content",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update text content mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest(`/api/admin/text-content/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/text-content'] });
      setEditingItem(null);
      toast({ title: "Text content updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating text content",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete text content mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/text-content/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/text-content'] });
      toast({ title: "Text content deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting text content",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Filter text content based on search and category
  const filteredContent = (textContent as any[]).filter((item: any) => {
    const matchesSearch = !searchQuery || 
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.textRu && item.textRu.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = () => {
    if (!newItem.key || !newItem.textEn || !newItem.category) {
      toast({ 
        title: "Missing required fields",
        description: "Key, text, and category are required",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate(newItem);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !editingItem.key || !editingItem.textEn) {
      toast({ 
        title: "Missing required fields",
        description: "Key and text are required",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate({ id: editingItem.id, data: editingItem });
  };

  if (isLoading) {
    return <div className="p-4">Loading text content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Text Content Management</h3>
        <Button onClick={() => setShowAddForm(true)} className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Text Content
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by key, value, or translation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add New Text Content Form */}
      {showAddForm && (
        <Card className="p-4">
          <CardContent className="p-0">
            <h4 className="font-medium mb-4">Add New Text Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key *</label>
                <Input
                  value={newItem.key}
                  onChange={(e) => setNewItem({...newItem, key: e.target.value})}
                  placeholder="e.g., welcome_message, button_save"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">English Text *</label>
                <Textarea
                  value={newItem.textEn}
                  onChange={(e) => setNewItem({...newItem, textEn: e.target.value})}
                  placeholder="Enter English text..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Russian Text</label>
                <Textarea
                  value={newItem.textRu}
                  onChange={(e) => setNewItem({...newItem, textRu: e.target.value})}
                  placeholder="Enter Russian translation..."
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Brief description of where this text is used..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateItem}
                disabled={createMutation.isPending}
                className="bg-primary"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Content List */}
      <div className="space-y-3">
        {filteredContent.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="p-0">
              <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h4 className="font-medium mb-2">No text content found</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || selectedCategory 
                  ? "Try adjusting your filters or search query"
                  : "Start by adding your first text content item"
                }
              </p>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)} className="bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Text Content
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((item: any) => (
            <Card key={item.id} className="p-4">
              <CardContent className="p-0">
                {editingItem?.id === item.id ? (
                  // Edit mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Edit Text Content</h4>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingItem(null)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleUpdateItem}
                          disabled={updateMutation.isPending}
                          className="bg-primary"
                        >
                          {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Key</label>
                        <Input
                          value={editingItem.key}
                          onChange={(e) => setEditingItem({...editingItem, key: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <Select 
                          value={editingItem.category} 
                          onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">English Text</label>
                        <Textarea
                          value={editingItem.textEn}
                          onChange={(e) => setEditingItem({...editingItem, textEn: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Russian Text</label>
                        <Textarea
                          value={editingItem.textRu || ''}
                          onChange={(e) => setEditingItem({...editingItem, textRu: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Input
                          value={editingItem.description || ''}
                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {item.key}
                          </code>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        )}
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <Type className="h-3 w-3" />
                              <span className="text-xs font-medium text-muted-foreground">English</span>
                            </div>
                            <p className="text-sm">{item.textEn}</p>
                          </div>
                          {item.textRu && (
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Type className="h-3 w-3" />
                                <span className="text-xs font-medium text-muted-foreground">Russian</span>
                              </div>
                              <p className="text-sm">{item.textRu}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Total: {filteredContent.length} text content items
        {(searchQuery || selectedCategory) && ` (filtered from ${(textContent as any[]).length})`}
      </div>
    </div>
  );
}