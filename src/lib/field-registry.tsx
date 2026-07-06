// 字段渲染器注册表 — 根据 FieldDef.type 返回对应的 shadcn 表单控件
// 详情页和编辑页共用

import type { FieldDef } from './field-defs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';

interface RenderContext {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  options?: string[];
  label: string;
}

export function renderReadonlyField(def: FieldDef, value: unknown): React.ReactNode {
  if (value === undefined || value === null || value === '') {
    return <span className="text-tertiary text-sm">-</span>;
  }

  switch (def.type) {
    case 'tag':
      return <Badge variant="outline">{String(value)}</Badge>;
    case 'upload': {
      const files = Array.isArray(value) ? value : [];
      if (files.length === 0) return <span className="text-tertiary text-sm">无附件</span>;
      return (
        <div className="space-y-1">
          {files.map((f: string, i: number) => (
            <span key={i} className="text-sm text-blue-600 dark:text-blue-400 block">{f}</span>
          ))}
        </div>
      );
    }
    case 'number':
      return <span className="text-sm tabular-nums">
        {typeof value === 'number' ? (isNaN(value) ? '-' : value.toLocaleString()) : String(value)}
      </span>;
    case 'textarea':
      return <span className="text-sm whitespace-pre-wrap">{String(value)}</span>;
    case 'select':
    case 'text':
    case 'date':
    default:
      return <span className="text-sm">{String(value)}</span>;
  }
}

export function renderEditField(def: FieldDef, ctx: RenderContext): React.ReactNode {
  const { value, onChange, disabled, options = [] } = ctx;

  switch (def.type) {
    case 'select':
      return (
        <select
          value={(value ?? '') as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">请选择</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={(value as string | number | undefined) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <Input
          type="date"
          value={(value ?? '') as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case 'textarea':
      return (
        <Textarea
          value={(value ?? '') as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
        />
      );

    case 'upload':
      return (
        <FileUpload
          value={Array.isArray(value) ? value : []}
          onChange={(files) => onChange(files)}
          disabled={disabled}
        />
      );

    case 'tag':
      return <Badge variant="outline">{String(value ?? '')}</Badge>;

    case 'text':
    default:
      return (
        <Input
          type="text"
          value={(value ?? '') as string}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}
