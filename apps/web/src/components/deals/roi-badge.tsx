import { cn } from '@/lib/utils';

interface ROIBadgeProps {
  roi: number;
  className?: string;
}

export function ROIBadge({ roi, className }: ROIBadgeProps) {
  const isPositive = roi >= 0;
  const isHigh = roi >= 50;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        isHigh
          ? 'bg-green-100 text-green-800'
          : isPositive
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800',
        className,
      )}
    >
      {roi >= 0 ? '+' : ''}
      {roi.toFixed(1)}%
    </span>
  );
}
