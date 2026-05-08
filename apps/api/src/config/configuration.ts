export interface AppConfig {
  database: {
    url: string;
  };
  redis: {
    host: string;
    port: number;
  };
  openai: {
    apiKey: string;
  };
  api: {
    port: number;
  };
}

export default (): AppConfig => ({
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://dealfinder:password@localhost:5432/dealfinder',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
  api: {
    port: parseInt(process.env.API_PORT ?? '3001', 10),
  },
});
