# osl-web

Next.js frontend for **Open Support Ledger**, a transparent funding page and public payment ledger for open-source projects, powered by Stellar.

> **Status:** early. The foundation (Next.js, Tailwind, tests, CI) is in place. Features are being built through the issues in this repo.

## How the repos fit together

| Repo                                                          | Role                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| [osl-api](https://github.com/open-support-ledger/osl-api)     | Backend API, database, payment indexer                        |
| **osl-web** (this repo)                                       | Next.js frontend                                              |
| [osl-chain](https://github.com/open-support-ledger/osl-chain) | TypeScript library for reading and verifying Stellar payments |

## Requirements

- Node.js 22 (see `.nvmrc`)
- [pnpm](https://pnpm.io/installation)

You do not need the backend running to work on most frontend issues.

## Getting started

```bash
git clone https://github.com/open-support-ledger/osl-web.git
cd osl-web
pnpm install
pnpm dev
```

Open <http://localhost:3001>. The dev server uses port 3001 so it does not clash with `osl-api`, which uses 3000.

Use **Stellar testnet** for all development. Never commit `.env` files or any secret key.

## Scripts

| Command                             | What it does                                       |
| ----------------------------------- | -------------------------------------------------- |
| `pnpm dev`                          | Start the dev server on port 3001                  |
| `pnpm build`                        | Production build                                   |
| `pnpm start`                        | Serve the production build on port 3001            |
| `pnpm lint`                         | Lint with ESLint                                   |
| `pnpm format` / `pnpm format:check` | Format with Prettier / check formatting            |
| `pnpm typecheck`                    | Generate Next.js types, then type-check            |
| `pnpm test`                         | Unit and component tests (Vitest, Testing Library) |
| `pnpm test:e2e`                     | End-to-end tests (Playwright, see below)           |

Run lint, format check, typecheck, test, build, and `pnpm test:e2e` before opening a PR. CI runs the same steps.

## End-to-end tests

`e2e/` holds Playwright tests that load real pages in Chromium. They only talk to localhost.

```bash
pnpm exec playwright install chromium   # one-time browser download
pnpm test:e2e                           # builds the app, starts it, runs the tests
```

The web server is the production build (`next build` + `next start`), the same thing we ship, which avoids dev-server compile delays. Vitest (`pnpm test`) only runs `src/**/*.test.*` and never picks up `e2e/`. After a failed run, open `playwright-report/index.html` (CI uploads it as an artifact). `playwright-report/` and `test-results/` are git-ignored.

## Project structure

```
src/
  app/            Next.js App Router (layout, pages, global styles)
  components/     shared UI (site header and footer, loading/error/empty states)
  __tests__/      tests
```

Add new tests as `*.test.ts` or `*.test.tsx` files under `src/`.

## Funding progress

`FundingProgress` (`src/components/funding-progress.tsx`) shows `raised` and an optional `goal`
for one asset. Amounts are decimal strings with up to 7 decimals and are handled with `BigInt`
(`src/lib/decimal.ts`), never floating point. The percentage is truncated so it only reads 100%
when the goal is really reached, and it is not capped, so 130% shows as 130% while the bar stays full.

## Notes for contributors

- This project uses a recent major version of Next.js. If something behaves differently from what you expect, check the docs bundled in `node_modules/next/dist/docs/`. `AGENTS.md` points AI coding tools at the same place.
- Privacy matters here: anonymous supporters' names and messages must never be shown. The API is responsible for redaction, and the UI must not work around it.
- Never display fabricated payment data as real. Mock data must be clearly marked.

## Contributing

Read the [contributing guide](https://github.com/open-support-ledger/.github/blob/main/CONTRIBUTING.md), then pick an issue. Please read the whole issue, including scope and acceptance criteria, before starting.

## License

Apache License 2.0. See [LICENSE](LICENSE).
