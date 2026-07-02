'use client';

// 文件上传组件 — 替代 Ant Design Upload
import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: string[];
  onChange?: (files: string[]) => void;
  disabled?: boolean;
  accept?: string;
  className?: string;
}

export function FileUpload({ value = [], onChange, disabled, accept, className }: FileUploadProps) {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([]);

  function handleAdd() {
    // 模拟文件选择（实际项目中会对接真实文件上传）
    const name = window.prompt('输入文件名:');
    if (name) {
      const newFiles = [...value, name];
      onChange?.(newFiles);
      setFiles((prev) => [...prev, { name, size: 0 }]);
    }
  }

  function handleRemove(index: number) {
    const newFiles = value.filter((_, i) => i !== index);
    onChange?.(newFiles);
  }

  return (
    <div className={cn('space-y-2', className)}>
      {(value.length > 0 || files.length > 0) && (
        <div className="space-y-1">
          {value.map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded border border-light bg-surface text-sm"
            >
              <FileText className="w-4 h-4 text-tertiary shrink-0" />
              <span className="flex-1 truncate">{name}</span>
              {!disabled && (
                <button
                  onClick={() => handleRemove(i)}
                  className="text-tertiary hover:text-error transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          上传文件
        </Button>
      )}
    </div>
  );
}
