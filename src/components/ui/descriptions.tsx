// Descriptions 组件 — 替代 Ant Design Descriptions
// 使用 CSS Grid 实现 2 列描述列表
import { cn } from '@/lib/utils';

export interface DescItem {
  label: string;
  value: React.ReactNode;
  span?: 1 | 2;
}

export function Descriptions({
  items,
  column = 2,
  bordered = false,
  className,
}: {
  items: DescItem[];
  column?: 1 | 2;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-0',
        column === 2 ? 'grid-cols-2' : 'grid-cols-1',
        bordered && 'border border-light rounded-md overflow-hidden',
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'flex',
            item.span === 2 && 'col-span-2',
            bordered && 'border-b border-light last:border-b-0',
            bordered && 'odd:border-r border-light'
          )}
          style={!bordered ? { paddingBottom: i < items.length - 1 ? 12 : 0 } : {}}
        >
          <div
            className={cn(
              'text-sm text-secondary shrink-0',
              bordered ? 'px-4 py-2.5 bg-hover w-[140px]' : 'w-[120px] pr-3'
            )}
          >
            {item.label}
          </div>
          <div className={cn('text-sm text-primary flex-1', bordered && 'px-4 py-2.5')}>
            {item.value ?? <span className="text-tertiary">-</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
