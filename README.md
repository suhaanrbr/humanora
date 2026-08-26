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

Setup instructions will be added as each phase introduces runnable code (frontend scaffold, backend scaffold, database, etc.).
