import * as React from 'react';
import { cn } from '@/lib/utils';

type TableSize = 'default' | 'sm';

const TableContext = React.createContext<{ size: TableSize }>({ size: 'default' });

function Table({ className, size = 'default', ...props }: React.HTMLAttributes<HTMLTableElement> & { size?: TableSize }) {
  return (
    <TableContext.Provider value={{ size }}>
      <div className="relative w-full overflow-auto">
        <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
      </div>
    </TableContext.Provider>
  );
}

function useTableSize() { return React.useContext(TableContext).size; }

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-light', className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        '[&_tr:nth-child(even)]:bg-muted/20',  // 斑马纹
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn('bg-muted/30 font-medium border-t border-light', className)} {...props} />;
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-light transition-colors hover:bg-accent-light/50',
        'data-[selected=true]:bg-accent-light/80',
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  const size = useTableSize();
  return (
    <th
      className={cn(
        'text-left align-middle font-medium text-muted-foreground',
        'sticky top-0 z-[5] bg-background',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const size = useTableSize();
  return (
    <td
      className={cn(
        'align-middle',
        size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
