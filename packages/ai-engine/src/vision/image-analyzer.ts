import OpenAI from 'openai';

export interface ImageAnalysisResult {
  productCategory: string;
  brand: string;
  model: string;
  condition: string;
  estimatedAge: string;
  keyFeatures: string[];
}

export class ImageAnalyzer {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyze(imageUrls: string[]): Promise<ImageAnalysisResult> {
    const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = imageUrls
      .slice(0, 5)
      .map((url) => ({
        type: 'image_url' as const,
        image_url: { url, detail: 'high' as const },
      }));

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze the product shown in these listing images and respond with a JSON object containing:
{
  "productCategory": "category name",
  "brand": "brand name or 'Unknown'",
  "model": "model name or 'Unknown'",
  "condition": "one of: New, Like New, Good, Fair, Poor",
  "estimatedAge": "estimated age e.g. '2-3 years'",
  "keyFeatures": ["feature1", "feature2", ...]
}
Only return the JSON, no additional text.`,
            },
            ...imageContent,
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content ?? '{}';
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();

    try {
      const parsed = JSON.parse(cleaned) as Partial<ImageAnalysisResult>;
      return {
        productCategory: parsed.productCategory ?? 'Unknown',
        brand: parsed.brand ?? 'Unknown',
        model: parsed.model ?? 'Unknown',
        condition: parsed.condition ?? 'Unknown',
        estimatedAge: parsed.estimatedAge ?? 'Unknown',
        keyFeatures: parsed.keyFeatures ?? [],
      };
    } catch {
      return {
        productCategory: 'Unknown',
        brand: 'Unknown',
        model: 'Unknown',
        condition: 'Unknown',
        estimatedAge: 'Unknown',
        keyFeatures: [],
      };
    }
  }
}
