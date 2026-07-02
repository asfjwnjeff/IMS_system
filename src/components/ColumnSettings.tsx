'use client';

// 列设置 Popover — 替代 Ant Design 的列设置面板
// 支持拖拽排序、勾选显隐、置顶
import { useState, useCallback } from 'react';
import { GripVertical, ChevronUp, RotateCcw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ColumnItem {
  key: string;
  label: string;
  visible: boolean;
}

interface ColumnSettingsProps {
  columns: ColumnItem[];
  onToggle: (key: string) => void;
  onReorder: (from: number, to: number) => void;
  onMoveToTop: (key: string) => void;
  onReset: () => void;
}

export function ColumnSettings({ columns, onToggle, onReorder, onMoveToTop, onReset }: ColumnSettingsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    onReorder(dragIndex, index);
    setDragIndex(index);
  }, [dragIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          列设置
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <span className="text-xs font-medium text-secondary">表格列设置</span>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onReset}>
            <RotateCcw className="w-3 h-3 mr-1" />
            恢复默认
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {columns.map((col, index) => (
            <div
              key={col.key}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-2 px-2 h-9 rounded-md hover:bg-hover transition-colors cursor-default',
                dragIndex === index && 'opacity-50'
              )}
            >
              <GripVertical className="w-3.5 h-3.5 text-tertiary cursor-grab shrink-0" />
              <Checkbox
                id={`col-${col.key}`}
                checked={col.visible}
                onCheckedChange={() => onToggle(col.key)}
                className="shrink-0"
              />
              <label
                htmlFor={`col-${col.key}`}
                className="text-sm flex-1 cursor-pointer truncate"
              >
                {col.label}
              </label>
              <button
                onClick={() => onMoveToTop(col.key)}
                className="text-tertiary hover:text-primary transition-colors shrink-0"
                title="置顶"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
