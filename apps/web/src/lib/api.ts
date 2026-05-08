import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DealListing {
  id: string;
  title: string;
  description: string;
  images: string[];
  askingPrice: number;
  currency: string;
  seller: string;
  location: string;
  postedAt: string;
  url: string;
  marketplace: string;
  category: string;
  condition: string;
}

export interface Deal {
  id: string;
  listingId: string;
  listing: DealListing;
  estimatedMarketValue: number;
  profitPotential: number;
  roi: number;
  confidence: number;
  dealScore: number;
  aiAnalysis: {
    productCategory: string;
    brand: string;
    model: string;
    condition: string;
    estimatedAge: string;
    keyFeatures: string[];
    reasoning: string;
    itemCondition?: string;
    priceJustification?: string;
    riskFactors?: string[];
    comparableSales?: Array<{ source: string; price: number }>;
  };
  similarSoldPrices: number[];
  status: string;
  createdAt: string;
}

export interface ScrapeJob {
  id: string;
  status: string;
  marketplace: string;
  query: string;
  category?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface DealStats {
  totalDeals: number;
  avgROI: number;
  totalProfitPotential: number;
  activeJobs?: number;
}

export interface DealsFilter {
  marketplace?: string;
  minROI?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
}

export const dealsApi = {
  getAll: async (filter?: DealsFilter): Promise<PaginatedResponse<Deal>> => {
    const params = new URLSearchParams();
    if (filter?.marketplace) params.set('marketplace', filter.marketplace);
    if (filter?.minROI !== undefined) params.set('minROI', String(filter.minROI));
    if (filter?.maxPrice !== undefined) params.set('maxPrice', String(filter.maxPrice));
    if (filter?.page) params.set('page', String(filter.page));
    if (filter?.offset !== undefined) params.set('offset', String(filter.offset));
    if (filter?.limit) params.set('limit', String(filter.limit));
    if (filter?.sortBy) params.set('sortBy', filter.sortBy);
    const { data } = await apiClient.get<PaginatedResponse<Deal>>(`/deals?${params.toString()}`);
    return data;
  },

  getOne: async (id: string): Promise<Deal> => {
    const { data } = await apiClient.get<Deal>(`/deals/${id}`);
    return data;
  },

  getStats: async (): Promise<DealStats> => {
    const { data } = await apiClient.get<DealStats>('/deals/stats');
    return data;
  },
};

export interface StartScrapePayload {
  marketplace: string;
  query: string;
  category?: string;
}

export const scrapeApi = {
  start: async (payload: StartScrapePayload): Promise<{ jobId: string; status: string }> => {
    const { data } = await apiClient.post<{ jobId: string; status: string }>(
      '/scrape/start',
      payload,
    );
    return data;
  },

  getJobs: async (page = 1, limit = 20): Promise<PaginatedResponse<ScrapeJob>> => {
    const { data } = await apiClient.get<PaginatedResponse<ScrapeJob>>(
      `/scrape/jobs?page=${page}&limit=${limit}`,
    );
    return data;
  },
};
