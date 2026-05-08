import type { Deal } from '@dealfinder/shared';
import { ProfitCalculator } from './calculator';

const calculator = new ProfitCalculator();

export class DealRanker {
  rankDeals(deals: Deal[]): Deal[] {
    return [...deals].sort((a, b) => {
      const daysListedA = this.getDaysListed(a.createdAt);
      const daysListedB = this.getDaysListed(b.createdAt);

      const scoreA = calculator.calculateDealScore(a.roi, a.confidence, daysListedA);
      const scoreB = calculator.calculateDealScore(b.roi, b.confidence, daysListedB);

      return scoreB - scoreA;
    });
  }

  getDealScore(deal: Deal): number {
    const daysListed = this.getDaysListed(deal.createdAt);
    return calculator.calculateDealScore(deal.roi, deal.confidence, daysListed);
  }

  private getDaysListed(createdAt: Date): number {
    const now = new Date();
    const listed = new Date(createdAt);
    const diffMs = now.getTime() - listed.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}
