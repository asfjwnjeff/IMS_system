import * as React from 'react';
import { cn } from '@/lib/utils';

type TableSize = 'default' | 'sm';

const TableContext = React.createContext<{ size: TableSize }>({ size: 'default' });

function Table({ className, size = 'default', ...props }: React.HTMLAttributes<HTMLTableElement> & { size?: TableSize }) {
  return (
    <TableContext.Provider value={{ size }}>
      <div className="relative w-full overflow-auto">
        <table className={cn('w-full caption-bottom text-[13px]', className)} {...props} />
      </div>
    </TableContext.Provider>
  );
}

function useTableSize() { return React.useContext(TableContext).size; }

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-[var(--border-light)]', className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn(
        '[&_tr:nth-child(even)]:bg-[var(--bg-subtle)]',
        '[&_tr:last-child]:border-0',
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--border-light)] transition-colors duration-[var(--transition)] hover:bg-[var(--accent-light)]',
        'data-[selected=true]:bg-[var(--accent-light)]',
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
        'text-left align-middle font-semibold text-[var(--text-secondary)] bg-[var(--bg-subtle)]',
        'sticky top-0 z-[5]',
        size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-3 text-xs tracking-wide',
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
        size === 'sm' ? 'px-3 py-1.5' : 'px-3 py-2.5',
        '[&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mt-4 text-sm text-[var(--text-tertiary)]', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableFooter }; function TableFooter({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) { return <tfoot className={cn('bg-[var(--bg-subtle)] font-medium border-t border-[var(--border-light)]', className)} {...props} />; }
