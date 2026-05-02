# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- `artifacts/api-server` — Express API server (port 8080).
- `artifacts/mockup-sandbox` — Vite component preview server for design exploration (path `/__mockup`).

## WHIMSEY Project Context

- WHIMSEY ($CNDY) — Indian-launched NFT collection. 30,000 supply, ₹60,000 / NFT. Mint in ~15 days. Currently NOT yet on-chain.
- Brand vibe: doodly, soft, dreamy — Cool Cats × Pudgy Penguins quality. Brand emojis: 💗 ❄️ 🌌 🩵 🌷.
- Master reference doc: `docs/WHIMSEY_DISCORD_SETUP.md` (~4,000+ lines, 4 phases READ/BUILD/AUTOPILOT/REFERENCE).
