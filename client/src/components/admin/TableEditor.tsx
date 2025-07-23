import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, X } from 'lucide-react';

interface TableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tableHtml: string) => void;
  language: 'en' | 'ru';
}

export function TableEditor({ isOpen, onClose, onInsert, language }: TableEditorProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>(() => 
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [hasHeader, setHasHeader] = useState(true);

  if (!isOpen) return null;

  const updateTableSize = (newRows: number, newCols: number) => {
    const newData = Array(newRows).fill(null).map((_, rowIndex) =>
      Array(newCols).fill(null).map((_, colIndex) => {
        if (rowIndex < tableData.length && colIndex < tableData[0]?.length) {
          return tableData[rowIndex][colIndex] || '';
        }
        return '';
      })
    );
    setTableData(newData);
    setRows(newRows);
    setCols(newCols);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  const generateTableHtml = () => {
    let html = '\n<table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #d1d5db;">\n';
    
    if (hasHeader && tableData.length > 0) {
      html += '  <thead>\n    <tr style="background-color: #f3f4f6;">\n';
      tableData[0].forEach(cell => {
        html += `      <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">${cell || (language === 'ru' ? 'Заголовок' : 'Header')}</th>\n`;
      });
      html += '    </tr>\n  </thead>\n';
    }
    
    html += '  <tbody>\n';
    const startRow = hasHeader ? 1 : 0;
    for (let i = startRow; i < tableData.length; i++) {
      html += '    <tr>\n';
      tableData[i].forEach(cell => {
        html += `      <td style="border: 1px solid #d1d5db; padding: 8px;">${cell || (language === 'ru' ? 'Ячейка' : 'Cell')}</td>\n`;
      });
      html += '    </tr>\n';
    }
    html += '  </tbody>\n</table>\n';
    
    return html;
  };

  const handleInsert = () => {
    const tableHtml = generateTableHtml();
    onInsert(tableHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{language === 'ru' ? 'Создать таблицу' : 'Create Table'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table Size Controls */}
          <div className="flex space-x-4">
            <div>
              <Label>{language === 'ru' ? 'Строки' : 'Rows'}</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => rows > 1 && updateTableSize(rows - 1, cols)}
                  disabled={rows <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input 
                  type="number" 
                  value={rows} 
                  onChange={(e) => updateTableSize(parseInt(e.target.value) || 1, cols)}
                  className="w-16 text-center"
                  min="1"
                  max="10"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => rows < 10 && updateTableSize(rows + 1, cols)}
                  disabled={rows >= 10}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label>{language === 'ru' ? 'Столбцы' : 'Columns'}</Label>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => cols > 1 && updateTableSize(rows, cols - 1)}
                  disabled={cols <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input 
                  type="number" 
                  value={cols} 
                  onChange={(e) => updateTableSize(rows, parseInt(e.target.value) || 1)}
                  className="w-16 text-center"
                  min="1"
                  max="6"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => cols < 6 && updateTableSize(rows, cols + 1)}
                  disabled={cols >= 6}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={hasHeader} 
                  onChange={(e) => setHasHeader(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">{language === 'ru' ? 'Заголовки' : 'Headers'}</span>
              </label>
            </div>
          </div>

          {/* Table Editor */}
          <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                {hasHeader && (
                  <thead>
                    <tr className="bg-blue-50 dark:bg-blue-900">
                      {tableData[0]?.map((_, colIndex) => (
                        <th key={colIndex} className="border border-gray-300 dark:border-gray-600 p-2">
                          <Input
                            value={tableData[0][colIndex]}
                            onChange={(e) => updateCell(0, colIndex, e.target.value)}
                            placeholder={`${language === 'ru' ? 'Заголовок' : 'Header'} ${colIndex + 1}`}
                            className="border-0 bg-transparent text-center font-semibold"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {tableData.slice(hasHeader ? 1 : 0).map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 dark:border-gray-600 p-2">
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(hasHeader ? rowIndex + 1 : rowIndex, colIndex, e.target.value)}
                            placeholder={`${language === 'ru' ? 'Ячейка' : 'Cell'} ${rowIndex + 1}.${colIndex + 1}`}
                            className="border-0 bg-transparent text-center"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleInsert} className="flex-1">
              {language === 'ru' ? 'Вставить таблицу' : 'Insert Table'}
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}