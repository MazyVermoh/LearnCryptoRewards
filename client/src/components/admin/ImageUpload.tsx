import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentImageUrl?: string;
  onImageChange: (imageUrl: string) => void;
  accept?: string;
}

export function ImageUpload({ 
  label, 
  currentImageUrl, 
  onImageChange,
  accept = "image/*"
}: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreviewUrl(dataUrl);
        onImageChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlInput = (url: string) => {
    setPreviewUrl(url);
    onImageChange(url);
  };

  const clearImage = () => {
    setPreviewUrl('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-600 dark:text-gray-400">Image URL</Label>
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg или загрузите файл"
            value={previewUrl}
            onChange={(e) => handleUrlInput(e.target.value)}
            className="flex-1"
          />
          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* File Upload Area */}
      <Card
        className={`p-4 border-2 border-dashed transition-colors cursor-pointer ${
          dragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-center">
          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-40 mx-auto rounded-lg object-cover"
                onError={() => {
                  setPreviewUrl('');
                  onImageChange('');
                }}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Нажмите для изменения изображения
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Загрузите изображение
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Перетащите файл сюда или нажмите для выбора
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  PNG, JPG, GIF до 5MB
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}