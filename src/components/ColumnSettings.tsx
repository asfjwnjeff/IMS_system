'use client';

// 列设置 Popover — 替代 Ant Design 的列设置面板
// 支持拖拽排序、上下移动、置顶、勾选显隐
import { useState, useCallback } from 'react';
import { GripVertical, ChevronUp, ChevronDown, Pin, RotateCcw, Settings2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColumnItem {
  key: string;
  label?: string;
  visible: boolean;
  order?: number;
}

interface ColumnSettingsProps {
  columns: ColumnItem[];
  onToggle: (key: string) => void;
  onReorder: (from: number, to: number) => void;
  onMoveToTop: (key: string) => void;
  onReset: () => void;
  labelMap?: Record<string, string>;
}

export function ColumnSettings({ columns, onToggle, onReorder, onMoveToTop, onReset, labelMap }: ColumnSettingsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  }, [dragIndex]);

  const handleDrop = useCallback((index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    onReorder(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleMoveUp = useCallback((index: number) => {
    if (index <= 0) return;
    onReorder(index, index - 1);
  }, [onReorder]);

  const handleMoveDown = useCallback((index: number) => {
    if (index >= columns.length - 1) return;
    onReorder(index, index + 1);
  }, [columns.length, onReorder]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="w-3.5 h-3.5" />
          列设置
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-light)]">
          <span className="text-sm font-semibold text-[var(--text-primary)]">表格列设置</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            onClick={onReset}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            恢复默认
          </Button>
        </div>

        {/* 提示文字 */}
        <div className="px-3 py-1.5 text-[11px] text-[var(--text-tertiary)] border-b border-[var(--border-light)]">
          拖拽 <GripVertical className="w-3 h-3 inline-block mx-0.5 -mt-0.5" /> 排序，或使用 ↑↓ 按钮调整顺序
        </div>

        {/* 列列表 */}
        <div className="max-h-[420px] overflow-y-auto py-1">
          {columns.map((col, index) => {
            const isFirst = index === 0;
            const isLast = index === columns.length - 1;
            const isDragging = dragIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={col.key}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'flex items-center gap-1.5 px-2 h-9 transition-colors group',
                  isDragging && 'opacity-40 bg-[var(--accent-light)]',
                  isDragOver && 'border-t-2 border-[var(--accent)]',
                  !isDragging && !isDragOver && 'hover:bg-[var(--bg-subtle)]'
                )}
              >
                {/* 拖拽手柄 */}
                <GripVertical className="w-3.5 h-3.5 text-[var(--text-tertiary)] cursor-grab active:cursor-grabbing shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />

                {/* 序号 */}
                <span className="w-5 text-center text-[11px] text-[var(--text-tertiary)] shrink-0 tabular-nums select-none">
                  {index + 1}
                </span>

                {/* 复选框 + 标签 */}
                <Checkbox
                  id={`col-${col.key}`}
                  checked={col.visible}
                  onCheckedChange={() => onToggle(col.key)}
                  className="shrink-0"
                />
                <label
                  htmlFor={`col-${col.key}`}
                  className={cn(
                    'text-sm flex-1 cursor-pointer truncate select-none',
                    col.visible ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {labelMap?.[col.key] || col.label || col.key}
                </label>

                {/* 操作按钮组 */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* 上移 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                    disabled={isFirst}
                    className="p-0.5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="上移"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* 下移 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                    disabled={isLast}
                    className="p-0.5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="下移"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* 分隔线 */}
                  <span className="w-px h-4 bg-[var(--border-light)] mx-0.5" />

                  {/* 置顶 */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onMoveToTop(col.key); }}
                    disabled={isFirst}
                    className="p-0.5 rounded-sm text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                    title="置顶"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部统计 */}
        <div className="px-3 py-2 border-t border-[var(--border-light)] text-[11px] text-[var(--text-tertiary)]">
          共 {columns.length} 列，已显示 {columns.filter((c) => c.visible).length} 列
        </div>
      </PopoverContent>
    </Popover>
  );
}
