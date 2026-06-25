# Portal API Contract

Broker team implements these endpoints on KO-Broker. Client app calls `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

**Types sync:** `@ko/types` from `packages/types` — manual copy from KO-Broker as of scaffold date.

## Authentication

- After OTP: `Authorization: Bearer <clerk-jwt>`
- During invite bootstrap: `X-Portal-Token: <portalAccessToken>`

## Response envelope

```json
{ "success": true, "data": {}, "meta": { "total": 0, "page": 1, "perPage": 20 } }
```

```json
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "fields": {}, "details": [] } }
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/portal/invite/validate` | Validate `?token=` from invite link; return client + case + adviser summary |
| POST | `/api/portal/invite/send-otp` | Send OTP to client email |
| POST | `/api/portal/invite/verify-otp` | Verify OTP; return session / Clerk sign-in token |
| GET | `/api/portal/me` | Authenticated client profile |
| GET | `/api/portal/cases` | Client's case(s) — read-only |
| GET | `/api/portal/cases/:id` | Case detail + factFind + adviser |
| GET | `/api/portal/cases/:id/tasks` | Pending actions checklist |
| PUT | `/api/portal/cases/:id/fact-find` | Client submits fact-find sections (`UpsertFactFindSchema`) |
| GET | `/api/portal/messages` | Message thread |
| POST | `/api/portal/messages` | Client reply (`direction: INBOUND`, `sourceType: CLIENT_REPLY`) |
| GET | `/api/portal/documents` | List documents |
| POST | `/api/portal/documents` | Upload document (multipart) |

## Integration checklist (broker)

- [ ] Generate `portalAccessToken` on invite
- [ ] POST `/api/portal/invite/send-otp` + email via Resend
- [ ] Portal-scoped auth middleware (token + Clerk client app)
- [ ] `portalEnabled` gate on all portal routes
- [ ] Plan feature check: `client_portal` on PROFESSIONAL+ orgs

## Integration checklist (client)

- [ ] Set `NEXT_PUBLIC_USE_MOCK_API=false`
- [ ] Point `NEXT_PUBLIC_API_URL` to broker production API
- [ ] E2E: invite link → OTP → overview → upload doc → send message
