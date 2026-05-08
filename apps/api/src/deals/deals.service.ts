import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export interface DealsFilter {
  marketplace?: string;
  minROI?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: DealsFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DealWhereInput = {};
    const listingWhere: Prisma.ListingWhereInput = {};

    if (filter.marketplace) {
      listingWhere.marketplace = filter.marketplace;
    }
    if (filter.maxPrice !== undefined) {
      listingWhere.askingPrice = { lte: filter.maxPrice };
    }
    if (filter.marketplace || filter.maxPrice !== undefined) {
      where.listing = listingWhere;
    }
    if (filter.minROI !== undefined) {
      where.roi = { gte: filter.minROI };
    }

    const [deals, total] = await this.prisma.$transaction([
      this.prisma.deal.findMany({
        where,
        include: { listing: true },
        orderBy: { roi: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data: deals,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }

    return deal;
  }

  async getStats() {
    const [totalDeals, avgROI, totalPotential] = await this.prisma.$transaction([
      this.prisma.deal.count(),
      this.prisma.deal.aggregate({ _avg: { roi: true } }),
      this.prisma.deal.aggregate({ _sum: { profitPotential: true } }),
    ]);

    return {
      totalDeals,
      avgROI: avgROI._avg.roi ?? 0,
      totalProfitPotential: totalPotential._sum.profitPotential ?? 0,
    };
  }
}
