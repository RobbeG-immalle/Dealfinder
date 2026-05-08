'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Deal } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface ProfitChartProps {
  deals: Deal[];
}

export function ProfitChart({ deals }: ProfitChartProps) {
  const topDeals = [...deals]
    .sort((a, b) => b.profitPotential - a.profitPotential)
    .slice(0, 10)
    .map((d) => ({
      name: d.listing.title.slice(0, 20) + '...',
      profit: Number(d.profitPotential.toFixed(2)),
      roi: Number(d.roi.toFixed(1)),
      marketplace: d.listing.marketplace,
    }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topDeals} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          angle={-35}
          textAnchor="end"
          tick={{ fontSize: 11 }}
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v, 'EUR')}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value, 'EUR'), 'Profit']}
        />
        <Bar
          dataKey="profit"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
