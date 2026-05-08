import type { Deal } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ROIBadge } from './roi-badge';
import { Separator } from '@/components/ui/separator';
import {
  formatCurrency,
  formatDate,
  formatConfidence,
  formatROI,
} from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface DealDetailProps {
  deal: Deal;
}

export function DealDetail({ deal }: DealDetailProps) {
  const { listing } = deal;
  const profit = deal.profitPotential;
  const isProfit = profit >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{listing.marketplace}</Badge>
            <span className="text-sm text-gray-500">{listing.location}</span>
            <span className="text-sm text-gray-500">·</span>
            <span className="text-sm text-gray-500">{formatDate(deal.createdAt)}</span>
          </div>
        </div>
        <ROIBadge roi={deal.roi} className="text-base px-3 py-1" />
      </div>

      {/* Images */}
      {listing.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {listing.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${listing.title} image ${i + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Pricing breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Asking Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(listing.askingPrice, listing.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Market Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(deal.estimatedMarketValue, listing.currency)}</p>
          </CardContent>
        </Card>
        <Card className={isProfit ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Profit Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${isProfit ? 'text-green-700' : 'text-red-700'}`}>
              {isProfit ? '+' : ''}{formatCurrency(profit, listing.currency)}
            </p>
            <p className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatROI(deal.roi)} ROI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Confidence */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Confidence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Analysis confidence</span>
            <span className="font-semibold">{formatConfidence(deal.confidence)}</span>
          </div>
          <Progress value={deal.confidence * 100} />
          <p className="text-xs text-gray-500">
            Score: {deal.dealScore.toFixed(1)} / 100
          </p>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      {deal.aiAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deal.aiAnalysis.itemCondition && (
              <div>
                <p className="text-sm font-medium text-gray-700">Condition</p>
                <p className="text-sm text-gray-600">{deal.aiAnalysis.itemCondition}</p>
              </div>
            )}
            {deal.aiAnalysis.priceJustification && (
              <div>
                <Separator />
                <p className="text-sm font-medium text-gray-700 mt-4">Price Justification</p>
                <p className="text-sm text-gray-600">{deal.aiAnalysis.priceJustification}</p>
              </div>
            )}
            {deal.aiAnalysis.riskFactors && deal.aiAnalysis.riskFactors.length > 0 && (
              <div>
                <Separator />
                <p className="text-sm font-medium text-gray-700 mt-4">Risk Factors</p>
                <ul className="list-disc list-inside space-y-1">
                  {deal.aiAnalysis.riskFactors.map((risk, i) => (
                    <li key={i} className="text-sm text-red-600">{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            {deal.aiAnalysis.comparableSales && deal.aiAnalysis.comparableSales.length > 0 && (
              <div>
                <Separator />
                <p className="text-sm font-medium text-gray-700 mt-4">Comparable Sales</p>
                <div className="space-y-2">
                  {deal.aiAnalysis.comparableSales.map((sale, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{sale.source}</span>
                      <span className="font-medium">{formatCurrency(sale.price, listing.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Original listing link */}
      <div className="flex justify-end">
        <a
          href={listing.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View original listing <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
