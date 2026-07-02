import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

function EmptyState({
  icon,
  title = '暂无数据',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="text-tertiary mb-4">
        {icon || <Inbox className="w-12 h-12" />}
      </div>
      <p className="text-sm font-medium text-secondary mb-1">{title}</p>
      {description && (
        <p className="text-xs text-tertiary mb-4 text-center max-w-xs">{description}</p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
