# Dealfinder 🔍

AI-powered marketplace deal scanner. Scrapes listings from Tweedehands/Marktplaats, eBay, Vinted and Facebook Marketplace, uses GPT-4o vision to estimate market value, then ranks deals by ROI.

## Architecture

```
Dealfinder/
├── apps/
│   ├── api/          NestJS REST API (port 3001)
│   └── web/          Next.js 14 App Router dashboard (port 3000)
├── packages/
│   ├── shared/       Shared TypeScript types & enums
│   ├── scraper-core/ Playwright-based marketplace scrapers
│   ├── ai-engine/    OpenAI GPT-4o vision + embeddings
│   └── pricing-engine/ Profit calculator & deal ranker
├── docker-compose.yml
└── turbo.json
```

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| API | NestJS 10, BullMQ, Prisma 5, PostgreSQL 16 |
| Queue | Redis 7 |
| AI | OpenAI GPT-4o (vision + embeddings) |
| Scrapers | Playwright |
| Web | Next.js 14 App Router, TanStack Query v5, TanStack Table |
| UI | Radix UI + Tailwind CSS + shadcn-style components |
| Charts | Recharts |
| Forms | react-hook-form |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- pnpm 9.1.0 (`npm install -g pnpm@9.1.0`)

### 1. Clone & install

```bash
git clone https://github.com/RobbeG-immalle/Dealfinder.git
cd Dealfinder
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set OPENAI_API_KEY at minimum
```

### 3. Start with Docker Compose

```bash
docker compose up -d postgres redis
```

### 4. Run database migrations

```bash
cd apps/api
pnpm exec prisma migrate dev --schema src/prisma/schema.prisma
```

### 5. Start development servers

```bash
pnpm dev
```

- Web dashboard: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health

## Running in Docker

```bash
docker compose up --build
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /deals | Paginated deals (filters: marketplace, minRoi, sortBy) |
| GET | /deals/stats | Aggregate stats |
| GET | /deals/:id | Single deal with AI analysis |
| POST | /scrape/start | Queue a new scrape job |
| GET | /scrape/jobs | List recent scrape jobs |
| GET | /listings | Paginated raw listings |
| GET | /listings/:id | Single listing |

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Required for AI analysis |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `PROXY_LIST` | Optional comma-separated proxy URLs |

## Scrapers

| Marketplace | Status |
|---|---|
| Tweedehands / Marktplaats | ✅ Full Playwright implementation |
| eBay | ✅ Full Playwright implementation |
| Vinted | ✅ Full Playwright implementation |
| Facebook Marketplace | ⚠️ Stub — requires authenticated session (ToS restrictions) |

## Development

```bash
pnpm build          # build all packages
pnpm lint           # lint all packages
pnpm --filter @dealfinder/api dev    # API only
pnpm --filter @dealfinder/web dev    # Web only
```
