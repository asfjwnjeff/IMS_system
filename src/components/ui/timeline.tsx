// 自定义 Timeline 组件 — shadcn 无等价组件
// 替代 Ant Design Timeline
import { cn } from '@/lib/utils';

export interface TimelineItem {
  label?: string;
  content: string;
  time?: string;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'gray';
}

const colorMap = {
  blue: { dot: '#1677ff', line: '#1677ff' },
  green: { dot: '#52c41a', line: '#52c41a' },
  red: { dot: '#ff4d4f', line: '#ff4d4f' },
  orange: { dot: '#faad14', line: '#faad14' },
  gray: { dot: '#d9d9d9', line: '#d9d9d9' },
};

export function Timeline({
  items,
  className,
}: {
  items: TimelineItem[];
  className?: string;
}) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, i) => {
        const colors = colorMap[item.color || 'blue'];
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex gap-4">
            {/* 左侧时间轴 */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-2.5 h-2.5 rounded-full mt-1.5"
                style={{ backgroundColor: colors.dot }}
              />
              {!isLast && (
                <div
                  className="w-px flex-1 min-h-[24px]"
                  style={{ backgroundColor: colors.line, opacity: 0.3 }}
                />
              )}
            </div>
            {/* 右侧内容 */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              {item.label && (
                <span className="text-xs font-medium mr-2" style={{ color: colors.dot }}>
                  {item.label}
                </span>
              )}
              {item.time && (
                <span className="text-xs text-tertiary">{item.time}</span>
              )}
              <p className="text-sm text-secondary mt-0.5">{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
