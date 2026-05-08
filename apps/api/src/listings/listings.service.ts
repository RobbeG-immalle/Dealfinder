import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

export interface ListingsFilter {
  marketplace?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: ListingsFilter) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ListingWhereInput = {};

    if (filter.marketplace) where.marketplace = filter.marketplace;
    if (filter.category) where.category = { contains: filter.category, mode: 'insensitive' };
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      where.askingPrice = {};
      if (filter.minPrice !== undefined) where.askingPrice.gte = filter.minPrice;
      if (filter.maxPrice !== undefined) where.askingPrice.lte = filter.maxPrice;
    }

    const [listings, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: listings,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.listing.findUnique({
      where: { id },
      include: { deal: true },
    });
  }
}
