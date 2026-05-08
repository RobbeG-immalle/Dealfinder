import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Marketplace } from '@dealfinder/shared';

export class StartScrapeDto {
  @IsEnum(Marketplace)
  marketplace!: Marketplace;

  @IsString()
  query!: string;

  @IsString()
  @IsOptional()
  category?: string;
}
