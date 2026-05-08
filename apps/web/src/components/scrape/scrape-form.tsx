'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useStartScrape } from '@/hooks/use-scrape';
import { useToast } from '@/components/ui/use-toast';

interface ScrapeFormValues {
  marketplace: string;
  query: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
}

const marketplaces = [
  { value: 'TWEEDEHANDS', label: 'Tweedehands / Marktplaats' },
  { value: 'EBAY', label: 'eBay' },
  { value: 'VINTED', label: 'Vinted' },
];

interface ScrapeFormProps {
  onSuccess?: () => void;
  compact?: boolean;
}

export function ScrapeForm({ onSuccess, compact = false }: ScrapeFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ScrapeFormValues>();
  const { mutate: startScrape, isPending } = useStartScrape();
  const { toast } = useToast();

  const selectedMarketplace = watch('marketplace');

  const onSubmit = (data: ScrapeFormValues) => {
    startScrape(
      {
        marketplace: data.marketplace,
        query: data.query,
        category: data.category,
      },
      {
        onSuccess: () => {
          toast({ title: 'Scrape started!', description: 'Job queued successfully.' });
          onSuccess?.();
        },
        onError: (err) => {
          toast({
            title: 'Error',
            description: err instanceof Error ? err.message : 'Failed to start scrape',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const content = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="marketplace">Marketplace</Label>
        <Select
          onValueChange={(v) => setValue('marketplace', v)}
          value={selectedMarketplace}
        >
          <SelectTrigger id="marketplace">
            <SelectValue placeholder="Select a marketplace" />
          </SelectTrigger>
          <SelectContent>
            {marketplaces.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.marketplace && (
          <p className="text-sm text-red-500 mt-1">Marketplace is required</p>
        )}
      </div>

      <div>
        <Label htmlFor="query">Search Query</Label>
        <Input
          id="query"
          placeholder="e.g. iPhone 14 Pro"
          {...register('query', { required: 'Query is required' })}
        />
        {errors.query && (
          <p className="text-sm text-red-500 mt-1">{errors.query.message}</p>
        )}
      </div>

      {!compact && (
        <>
          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="e.g. smartphones"
              {...register('category')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price (€)</Label>
              <Input
                id="minPrice"
                type="number"
                min={0}
                placeholder="0"
                {...register('minPrice', { valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="maxPrice">Max Price (€)</Label>
              <Input
                id="maxPrice"
                type="number"
                min={0}
                placeholder="1000"
                {...register('maxPrice', { valueAsNumber: true })}
              />
            </div>
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Starting...' : 'Start Scrape'}
      </Button>
    </form>
  );

  if (compact) return content;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Scrape Job</CardTitle>
        <CardDescription>
          Search for deals on the selected marketplace using AI-powered analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
