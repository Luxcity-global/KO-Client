# KO Client Platform — Project Overview

Standalone client-facing Next.js app for UK mortgage clients invited by their broker on KO Broker Platform.

## Relationship to KO-Broker

- **KO-Broker** (`localhost:3001`): Broker CRM, compliance, AI reports, and portal API (`/api/portal/*`)
- **KO-Client** (`localhost:3002`): Client portal UI only — no database, no broker routes

## Core flows

1. **Invite** — Broker emails `https://client.koplatform.co.uk/invite?token={portalAccessToken}`
2. **OTP** — Client verifies email, receives Clerk session
3. **Dashboard** — Overview, fact-find, messages, tools

## Constraints

- No marketing/landing page
- No self-registration
- No modifications to KO-Broker from this repo
