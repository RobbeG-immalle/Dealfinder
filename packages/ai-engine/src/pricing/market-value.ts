import OpenAI from 'openai';
import type { ImageAnalysisResult } from '../vision/image-analyzer';

export interface MarketValueResult {
  estimatedValue: number;
  confidence: number;
  reasoning: string;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface ListingContext {
  title: string;
  description: string;
  askingPrice: number;
  currency: string;
  category: string;
  condition: string;
  marketplace: string;
}

export class MarketValueEstimator {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async estimate(
    listing: ListingContext,
    imageAnalysis: ImageAnalysisResult,
  ): Promise<MarketValueResult> {
    const prompt = `You are a resale market expert. Analyze this second-hand listing and estimate its fair market value.

Listing details:
- Title: ${listing.title}
- Description: ${listing.description.slice(0, 500)}
- Asking Price: ${listing.askingPrice} ${listing.currency}
- Category: ${listing.category}
- Condition: ${listing.condition}
- Marketplace: ${listing.marketplace}

AI Image Analysis:
- Category: ${imageAnalysis.productCategory}
- Brand: ${imageAnalysis.brand}
- Model: ${imageAnalysis.model}
- Condition: ${imageAnalysis.condition}
- Age: ${imageAnalysis.estimatedAge}
- Key Features: ${imageAnalysis.keyFeatures.join(', ')}

Based on current market prices for similar items, provide a JSON response:
{
  "estimatedValue": <number in ${listing.currency}>,
  "confidence": <0.0-1.0>,
  "reasoning": "<brief explanation>",
  "priceRange": {
    "min": <number>,
    "max": <number>
  }
}
Only return the JSON, no additional text.`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned) as Partial<{
        estimatedValue: number;
        confidence: number;
        reasoning: string;
        priceRange: { min: number; max: number };
      }>;
      return {
        estimatedValue: parsed.estimatedValue ?? listing.askingPrice,
        confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
        reasoning: parsed.reasoning ?? 'Unable to determine market value',
        priceRange: {
          min: parsed.priceRange?.min ?? listing.askingPrice * 0.8,
          max: parsed.priceRange?.max ?? listing.askingPrice * 1.2,
        },
      };
    } catch {
      return {
        estimatedValue: listing.askingPrice,
        confidence: 0.1,
        reasoning: 'Failed to parse AI response',
        priceRange: {
          min: listing.askingPrice * 0.8,
          max: listing.askingPrice * 1.2,
        },
      };
    }
  }
}
