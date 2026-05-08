import OpenAI from 'openai';

export class SimilarityEngine {
  private client: OpenAI;
  private readonly model = 'text-embedding-3-small';

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: text,
    });
    return response.data[0]?.embedding ?? [];
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.model,
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }

  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] ?? 0) * (b[i] ?? 0);
      normA += (a[i] ?? 0) ** 2;
      normB += (b[i] ?? 0) ** 2;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  async computeSimilarity(textA: string, textB: string): Promise<number> {
    const [embA, embB] = await this.createEmbeddings([textA, textB]);
    if (!embA || !embB) return 0;
    return this.cosineSimilarity(embA, embB);
  }

  async findDuplicates(
    target: string,
    candidates: string[],
    threshold = 0.92,
  ): Promise<number[]> {
    if (candidates.length === 0) return [];

    const allTexts = [target, ...candidates];
    const embeddings = await this.createEmbeddings(allTexts);
    const targetEmbedding = embeddings[0];
    if (!targetEmbedding) return [];

    const duplicateIndices: number[] = [];
    for (let i = 1; i < embeddings.length; i++) {
      const candidateEmbedding = embeddings[i];
      if (!candidateEmbedding) continue;
      const similarity = this.cosineSimilarity(targetEmbedding, candidateEmbedding);
      if (similarity >= threshold) {
        duplicateIndices.push(i - 1);
      }
    }
    return duplicateIndices;
  }
}
