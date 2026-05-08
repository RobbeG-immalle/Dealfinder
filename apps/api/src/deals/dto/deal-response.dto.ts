export class DealResponseDto {
  id!: string;
  listingId!: string;
  listing!: {
    id: string;
    title: string;
    description: string;
    images: string[];
    askingPrice: number;
    currency: string;
    seller: string;
    location: string;
    postedAt: Date;
    url: string;
    marketplace: string;
    category: string;
    condition: string;
  };
  estimatedMarketValue!: number;
  profitPotential!: number;
  roi!: number;
  confidence!: number;
  aiAnalysis!: Record<string, unknown>;
  similarSoldPrices!: number[];
  status!: string;
  createdAt!: Date;
}
