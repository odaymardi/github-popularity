
# GitHub Popularity Score API

Backend service that queries GitHub repositories and assigns each a **popularity score** based on:

- Stars
- Forks
- Recency of last update

This project is intentionally **small and focused**, showcasing a pragmatic, layered architecture suitable for the given coding challenge.

---

## Tech Stack

- **Node.js** + **TypeScript**
- **Express** for HTTP
- **Axios** for GitHub API calls
- **Zod** for request validation
- **Jest** + **ts-jest** for tests

---

## Environment Variables & `.env` file

This service can be configured using environment variables.  
You may set them via your shell or by creating a `.env` file in the project root.

### `.env` example

Create a file named:

```bash
.env
```

With the following contents:

```env
# ─────────────────────────────────────────────
# Server Configuration
# ─────────────────────────────────────────────

# Port for Express to listen on (default: 3000)
PORT=3000

# Log level: debug | info | warn | error
LOG_LEVEL=info

# ─────────────────────────────────────────────
# GitHub API Configuration
# ─────────────────────────────────────────────

# Personal Access Token (recommended)
# Improves rate limits from ~10/min → 5000/hour
GITHUB_TOKEN=your_github_pat_here

# Base URL for GitHub API (default is correct)
GITHUB_API_BASE_URL=https://api.github.com

# Request timeout in milliseconds
REQUEST_TIMEOUT_MS=5000

# ─────────────────────────────────────────────
# Optional defaults for search parameters
# ─────────────────────────────────────────────

# Default language if not provided by user
# Example: DEFAULT_LANGUAGE=TypeScript
DEFAULT_LANGUAGE=

# Default minimum creation date if user does not provide one
# Example: DEFAULT_CREATED_AFTER=2024-01-01
DEFAULT_CREATED_AFTER=
```

Use a GitHub Personal Access Token to avoid rate limiting during local testing.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Load environment variables

Either:

- Create a `.env` file as shown above and use a tool like `dotenv` or your IDE's env support, or
- Export variables directly in your shell:

```bash
export GITHUB_TOKEN=ghp_your_token_here
export PORT=3000
```

### 3. Run in development

```bash
npm run dev
```

Server will start on `http://localhost:3000`.

### 4. Build and run

```bash
npm run build
npm start
```

---

## API

### `GET /repos/popular`

Returns GitHub repositories scored by popularity.

#### Query parameters

- `language` – optional `string`, GitHub language filter (e.g. `TypeScript`)
- `created_after` – optional ISO datetime string, e.g. `2024-01-01T00:00:00.000Z`
- `page` – optional `number`, default `1`, must be `>= 1`
- `per_page` – optional `number`, default `20`, between `1` and `100`

#### Example

```bash
curl "http://localhost:3000/repos/popular?language=TypeScript&created_after=2024-01-01T00:00:00.000Z&per_page=10"
```

#### Example response shape

```json
{
  "items": [
    {
      "id": 123,
      "name": "awesome-lib",
      "fullName": "user/awesome-lib",
      "htmlUrl": "https://github.com/user/awesome-lib",
      "stars": 1234,
      "forks": 100,
      "updatedAt": "2024-03-01T10:00:00.000Z",
      "createdAt": "2023-05-01T10:00:00.000Z",
      "language": "TypeScript",
      "popularityScore": 92.5
    }
  ],
  "total": 1000,
  "page": 1,
  "perPage": 10
}
```

---

## Popularity Scoring

The popularity score combines:

- **Stars** (normalized within the result set)
- **Forks** (normalized within the result set)
- **Recency** of `updated_at` (exponential decay)

Steps:

1. For each repo we compute a **recency score** in `[0, 1]`:

   - `ageDays = (now - updatedAt) / 1 day`
   - `recencyScore = exp(-ageDays / halfLifeDays)`
   - Using a **30-day half-life**, recent activity is rewarded while older activity decays smoothly.

2. Stars and forks are normalized relative to the max in the current result set:

   - `starsScore = repo.stars / maxStars`
   - `forksScore = repo.forks / maxForks`

3. Final score is a weighted combination:

   - `score = 0.6 * starsScore + 0.3 * forksScore + 0.1 * recencyScore`
   - Then scaled to `[0, 100]` for readability.

Weights and half-life are centralized and easy to tune in `src/domain/scoring.ts`.

This design keeps the scoring **framework-agnostic** and easy to unit-test.

---

## Architecture

The codebase uses a **lightweight layered structure**:

- `src/routes` – Express routers (HTTP paths, wiring controllers)
- `src/controllers` – HTTP-level logic (validation, mapping to services)
- `src/services` – Application logic:
  - `GitHubService` handles GitHub API calls
  - `RepoService` orchestrates fetching + scoring
- `src/domain` – Core domain models and scoring logic
- `src/validators` – Zod schemas for input validation
- `src/utils` – Mapping helpers (e.g. GitHub → domain types)
- `src/errors` – Custom error classes
- `src/lib` – Logger
- `src/config` – Configuration / environment handling

This is intentionally **not** a full-blown Clean Architecture with ports/adapters and DI containers everywhere. For the scope of this challenge:

- There is a single external dependency (GitHub API).
- One primary use case (`get popular repositories`).
- No persistence layer.

So a lighter structure keeps the code **readable** and **easy to navigate**, while cleanly separating:

- HTTP concerns (Express)
- External API (GitHub)
- Domain concerns (scoring)

If the system evolved (more data sources, caching layers, additional use cases), this structure can naturally grow into a more formal ports-and-adapters architecture.

---

## Error Handling

- Validation errors (from Zod) return **400 Bad Request** with details.
- GitHub errors:
  - Rate limit (HTTP 403 with zero remaining) → **503 Service Unavailable** and optional `retryAfter`.
  - Other GitHub 4xx/5xx → **502 Bad Gateway**.
- Unknown or unhandled errors → **500 Internal Server Error**.

All errors are logged via a small `logger` wrapper.

---

## Tests

Run tests:

```bash
npm test
```

Currently included:

- Unit tests for the scoring logic (`src/domain/scoring.spec.ts`).

Given the challenge timebox, test coverage is intentionally focused on the **core domain behavior** (the popularity score). In a real project, I would extend this with:

- Integration tests for `RepoService` (with a mocked GitHubService).
- HTTP-level tests using Supertest.

---

## Possible Extensions

If this service were to evolve in a real environment, some natural next steps would be:

- Configurable scoring weights via environment or config service.
- Response caching for popular queries.
- Observability: request tracing, metrics (latency, error rates), dashboards.
- More endpoints (e.g. by owner, by topic).
- Real DI container and interfaces for better testability and swapping implementations.

For the purposes of this challenge, I kept the implementation focused on the **core use case** and **clarity of structure** within a reasonable timebox.
