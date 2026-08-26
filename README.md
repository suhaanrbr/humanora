# HUMANORA

**AI drafts. Human impact.**

HUMANORA is a premium AI-assisted writing SaaS that transforms stiff or generic AI-assisted writing into clearer, more natural writing — while preserving meaning, facts, terminology, quotations, and citations.

See [HUMANORA_SPEC.md](./HUMANORA_SPEC.md) for the full product and technical specification. That document is the single source of truth for this project's design, features, architecture, and development phases.

## Project Structure

```
C:\HUMANORA
├── frontend/   # Next.js + TypeScript + React + Tailwind CSS
├── backend/    # Python + FastAPI + Pydantic
├── docs/       # Additional architecture and process notes
├── HUMANORA_SPEC.md
├── README.md
└── .gitignore
```

## Status

Project is in early foundation stage. Follow the phased development plan in `HUMANORA_SPEC.md` (Section 20). Each phase is built, verified, and approved before the next begins.

## Development Principles

- Frontend and backend are kept clearly separated.
- No AI provider is configured yet; the humanization engine will use a provider-independent abstraction (see spec Section 15).
- No paid services or billing are introduced without explicit approval.
- Secrets are never committed; environment variables are used for configuration (see `.gitignore`).

## Setup

### Frontend

The frontend is a Next.js (App Router) + TypeScript + Tailwind CSS project.

```bash
cd frontend
npm install
npm run dev      # start local dev server (http://localhost:3000)
npm run lint      # run ESLint
npm run build     # production build
```

Design tokens (colors, radii, shadows) live in `frontend/src/app/globals.css`.
Reusable UI primitives (Button, Input, Card, Badge, Container, Logo) live in
`frontend/src/components/ui/` and `frontend/src/components/brand/`.

The home page (`frontend/src/app/page.tsx`) is the HUMANORA marketing
landing page, assembled from the sections in
`frontend/src/components/landing/` (Header, Hero, Features, My Voice
preview, How It Works, Use Cases, Pricing, Trust, Final CTA, Footer).
Pricing plan data is configuration-driven — see
`frontend/src/lib/config/pricing.ts`.

### Backend

Not yet scaffolded — added in a later phase.
