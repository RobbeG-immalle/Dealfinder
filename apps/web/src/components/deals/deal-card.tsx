import type { Deal } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROIBadge } from './roi-badge';
import { formatCurrency, formatDate, formatConfidence, truncate } from '@/lib/utils';
import Link from 'next/link';

interface DealCardProps {
  deal: Deal;
}

const marketplaceColors: Record<string, string> = {
  TWEEDEHANDS: 'bg-orange-100 text-orange-800',
  EBAY: 'bg-blue-100 text-blue-800',
  VINTED: 'bg-teal-100 text-teal-800',
  FACEBOOK: 'bg-indigo-100 text-indigo-800',
};

export function DealCard({ deal }: DealCardProps) {
  const profit = deal.profitPotential;
  const isProfit = profit >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              marketplaceColors[deal.listing.marketplace] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {deal.listing.marketplace}
          </span>
          <ROIBadge roi={deal.roi} />
        </div>
        <CardTitle className="text-base mt-2">
          {truncate(deal.listing.title, 60)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deal.listing.images[0] && (
          <img
            src={deal.listing.images[0]}
            alt={deal.listing.title}
            className="w-full h-40 object-cover rounded-md"
          />
        )}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Asking</p>
            <p className="font-semibold">{formatCurrency(deal.listing.askingPrice, deal.listing.currency)}</p>
          </div>
          <div>
            <p className="text-gray-500">Market Value</p>
            <p className="font-semibold">{formatCurrency(deal.estimatedMarketValue, deal.listing.currency)}</p>
          </div>
          <div>
            <p className="text-gray-500">Profit</p>
            <p className={`font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : ''}{formatCurrency(profit, deal.listing.currency)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Confidence</p>
            <p className="font-semibold">{formatConfidence(deal.confidence)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-gray-400">{formatDate(deal.createdAt)}</span>
          <Link
            href={`/deals/${deal.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View details →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
