export interface ProfitCalculation {
  profit: number;
  roi: number;
  profitMargin: number;
}

export interface DealScoreInput {
  roi: number;
  confidence: number;
  daysListed: number;
}

export class ProfitCalculator {
  calculateProfit(askingPrice: number, marketValue: number): ProfitCalculation {
    const profit = marketValue - askingPrice;
    const roi = askingPrice > 0 ? (profit / askingPrice) * 100 : 0;
    const profitMargin = marketValue > 0 ? (profit / marketValue) * 100 : 0;

    return {
      profit: Math.round(profit * 100) / 100,
      roi: Math.round(roi * 100) / 100,
      profitMargin: Math.round(profitMargin * 100) / 100,
    };
  }

  calculateDealScore(roi: number, confidence: number, daysListed: number): number {
    // ROI component: 0-50 points (50 points at 100% ROI)
    const roiScore = Math.min(50, Math.max(0, roi / 2));

    // Confidence component: 0-30 points
    const confidenceScore = Math.min(30, confidence * 30);

    // Freshness component: 0-20 points (newer listings score higher)
    // Full 20 points if listed today, 0 points if listed 30+ days ago
    const freshnessScore = Math.max(0, 20 - (daysListed / 30) * 20);

    const rawScore = roiScore + confidenceScore + freshnessScore;
    return Math.round(Math.min(100, Math.max(0, rawScore)));
  }
}
