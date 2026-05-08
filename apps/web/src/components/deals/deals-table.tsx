'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import type { SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown } from 'lucide-react';
import type { Deal } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROIBadge } from './roi-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatConfidence, truncate } from '@/lib/utils';

const columnHelper = createColumnHelper<Deal>();

const marketplaceVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
  TWEEDEHANDS: 'default',
  EBAY: 'secondary',
  VINTED: 'outline',
  FACEBOOK: 'secondary',
};

const columns = [
  columnHelper.accessor('listing.marketplace', {
    header: 'Marketplace',
    cell: (info) => (
      <Badge variant={marketplaceVariants[info.getValue()] ?? 'outline'}>
        {info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('listing.title', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => (
      <span className="font-medium text-gray-900">{truncate(info.getValue(), 50)}</span>
    ),
  }),
  columnHelper.accessor('listing.askingPrice', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Asking Price <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => formatCurrency(info.getValue(), info.row.original.listing.currency),
  }),
  columnHelper.accessor('estimatedMarketValue', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Market Value <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => formatCurrency(info.getValue(), info.row.original.listing.currency),
  }),
  columnHelper.accessor('profitPotential', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Profit <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => {
      const profit = info.getValue();
      const currency = info.row.original.listing.currency;
      return (
        <span className={profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {profit >= 0 ? '+' : ''}
          {formatCurrency(profit, currency)}
        </span>
      );
    },
  }),
  columnHelper.accessor('roi', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        ROI% <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => <ROIBadge roi={info.getValue()} />,
  }),
  columnHelper.accessor('confidence', {
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Confidence <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${info.getValue() * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600">{formatConfidence(info.getValue())}</span>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={`/deals/${row.original.id}`}>
        <Button variant="outline" size="sm">
          View
        </Button>
      </Link>
    ),
  }),
];

interface DealsTableProps {
  deals: Deal[];
  isLoading?: boolean;
}

export function DealsTable({ deals, isLoading }: DealsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: deals,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter by title..."
        value={(table.getColumn('listing.title')?.getFilterValue() as string) ?? ''}
        onChange={(e) =>
          table.getColumn('listing.title')?.setFilterValue(e.target.value)
        }
        className="max-w-sm"
      />
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                  No deals found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-sm text-gray-500">
        Showing {table.getRowModel().rows.length} of {deals.length} deals
      </div>
    </div>
  );
}
