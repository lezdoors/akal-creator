# AKAL Creator

Managed creator marketing for B2B SaaS and AI/dev-tool companies. We source,
price, contract and pay creators; every placement carries a tracked link, so the
client sees clicks and signups per creator.

Operated by Akal Digital Services Ltd, registered in England & Wales, No. 17229387.

Read `REGISTER.md` before touching any UI file. The design register is locked.

## Stack

- Vite + React 19 + TypeScript + react-router-dom
- Tailwind CSS + radix + lucide
- Vercel serverless functions in `api/`
- Neon Postgres (`db/schema.sql`, `DATABASE_URL` in `.env.local`)

## Development

```sh
pnpm install
pnpm dev
```

## Checks

```sh
pnpm typecheck
pnpm build
```

Verify at 390 / 768 / 1440. No horizontal scroll at 390px.
