import { cn } from '@/lib/utils';

interface SectionHeadProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHead({ title, action, className }: SectionHeadProps) {
  return (
    <div className={cn('flex items-center gap-2.5 mb-4', className)}>
      <span className="block w-[3px] h-[18px] rounded-full shrink-0 bg-[var(--accent)]" />
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)] flex-1">{title}</h3>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
