import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Table } from 'lucide-react';

interface TableEditorProps {
  onInsertTable: (tableHtml: string) => void;
  onClose: () => void;
}

export default function TableEditor({ onInsertTable, onClose }: TableEditorProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [tableData, setTableData] = useState<string[][]>(() => 
    Array(3).fill(null).map(() => Array(3).fill(''))
  );
  const [headers, setHeaders] = useState<string[]>(Array(3).fill(''));
  const [hasHeaders, setHasHeaders] = useState(true);

  // Update table dimensions
  const updateDimensions = (newRows: number, newCols: number) => {
    const newTableData = Array(newRows).fill(null).map((_, rowIndex) =>
      Array(newCols).fill(null).map((_, colIndex) => 
        tableData[rowIndex]?.[colIndex] || ''
      )
    );
    const newHeaders = Array(newCols).fill(null).map((_, colIndex) => 
      headers[colIndex] || ''
    );
    
    setTableData(newTableData);
    setHeaders(newHeaders);
    setRows(newRows);
    setCols(newCols);
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newTableData = [...tableData];
    newTableData[rowIndex][colIndex] = value;
    setTableData(newTableData);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const generateTableHtml = () => {
    let html = '<table class="min-w-full border-collapse border border-gray-300 my-4">';
    
    // Headers
    if (hasHeaders) {
      html += '<thead><tr>';
      headers.forEach(header => {
        html += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">${header}</th>`;
      });
      html += '</tr></thead>';
    }
    
    // Body
    html += '<tbody>';
    tableData.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td class="border border-gray-300 px-4 py-2">${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    return html;
  };

  const handleInsert = () => {
    const tableHtml = generateTableHtml();
    onInsertTable(tableHtml);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Table Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Rows:</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateDimensions(Math.max(1, rows - 1), cols)}
                disabled={rows <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{rows}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateDimensions(rows + 1, cols)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Columns:</label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateDimensions(rows, Math.max(1, cols - 1))}
                disabled={cols <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{cols}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateDimensions(rows, cols + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasHeaders"
                checked={hasHeaders}
                onChange={(e) => setHasHeaders(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="hasHeaders" className="text-sm font-medium">Include Headers</label>
            </div>
          </div>

          {/* Table Editor */}
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full">
              {/* Headers */}
              {hasHeaders && (
                <thead>
                  <tr className="bg-gray-50">
                    {headers.map((header, colIndex) => (
                      <th key={colIndex} className="border border-gray-300 p-2">
                        <Input
                          value={header}
                          onChange={(e) => updateHeader(colIndex, e.target.value)}
                          placeholder={`Header ${colIndex + 1}`}
                          className="border-0 focus:ring-0 bg-transparent"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              
              {/* Body */}
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-gray-300 p-2">
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          placeholder={`Cell ${rowIndex + 1}, ${colIndex + 1}`}
                          className="border-0 focus:ring-0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Preview */}
          <div>
            <h4 className="font-medium mb-2">Preview:</h4>
            <div 
              className="border rounded-lg p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: generateTableHtml() }}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleInsert}>
              Insert Table
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}