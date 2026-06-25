# KO Client Platform

Client-facing portal for [KO Broker Platform](https://github.com/) — mortgage clients invited by their broker can track application progress, complete fact-find forms, upload documents, and message their adviser.

**Sibling repo:** KO-Broker — broker CRM and API backend.

## Quick start

```bash
pnpm install
cp .env.example .env.local
pnpm dev   # http://localhost:3002
```

## Routes

| Path | Description |
|------|-------------|
| `/invite?token=` | Welcome modal + OTP (entry point) |
| `/overview` | Dashboard home |
| `/application` | Fact-find wizard |
| `/messages` | Adviser messaging |
| `/tools` | Mortgage calculators (Phase 2) |

## Mock API

Set `NEXT_PUBLIC_USE_MOCK_API=true` (default) to run without the broker API on port 3001. Use any 6-digit OTP on `/verify`.

## Shared types

`packages/types` is copied from KO-Broker. Keep in sync via git submodule, private npm, or manual copy — see `Doc/API-CONTRACT.md`.
