# System Architecture — ARCHITECTURE.MD
## ICT Academy LMS

**Architect:** Minuri Alaharuwan
**Version:** 1.0 · 28 May 2026
**Style:** Modular monolith (MERN) with service-oriented boundaries, deployable to AWS Free Tier, designed to scale to 1,000+ users.

---

## 1. Architectural overview

The system is a **web application** split into a public marketing site and a gated LMS, both served by a single React front end (SPA with route-level code splitting). A Node.js / Express API provides REST endpoints organised as logical service modules. MongoDB is the primary data store, Redis handles sessions/caching/rate-limits, and a set of integrations (Stripe, Twilio/SES, BigBlueButton, a RAG/vector service) provide payments, messaging, streaming and AI.

Design tenets: **stateless auth (JWT) + RBAC**, **defense-in-depth**, **zero-trust on every request**, **PDPA data minimisation**, and **graceful degradation** under free-tier limits.

```
                         ┌─────────────────────────────────────────────┐
                         │                 Clients (Web)                │
                         │  Public site  ·  Student app  ·  Admin/Teacher│
                         └───────────────────────┬─────────────────────┘
                                                  │ HTTPS / TLS 1.3
                                       ┌──────────▼───────────┐
                                       │   CDN + Static host   │  (React SPA build)
                                       └──────────┬───────────┘
                                                  │ REST / JSON
                            ┌─────────────────────▼──────────────────────┐
                            │          API Gateway / Reverse proxy        │  (Nginx)
                            │   TLS · rate-limit · routing · gzip         │
                            └─────────────────────┬──────────────────────┘
                                                  │
                    ┌─────────────────────────────▼──────────────────────────────┐
                    │              Node.js / Express  (modular monolith)          │
                    │                                                             │
                    │  Middleware:  auth (JWT verify) · RBAC · validation ·        │
                    │               rate-limit · audit logger · error handler     │
                    │                                                             │
                    │  Service modules:                                           │
                    │   Auth · Users · Catalog · Payments · Library/Streaming ·    │
                    │   Live · Quizzes · Progress · AI-Proxy · Reports ·           │
                    │   Notifications · CMS(Blog) · Admin                          │
                    └───┬───────┬───────┬─────────┬─────────┬──────────┬──────────┘
                        │       │       │         │         │          │
                ┌───────▼─┐ ┌───▼────┐ ┌▼───────┐ ┌▼──────┐ ┌▼───────┐ ┌▼─────────┐
                │ MongoDB │ │ Redis  │ │ Object │ │Stripe │ │Twilio/ │ │ RAG / AI  │
                │ primary │ │cache + │ │ store  │ │payment│ │ SES /  │ │ service   │
                │  store  │ │session │ │(S3)    │ │       │ │WhatsApp│ │(FAISS +   │
                │         │ │+ revoke│ │video/  │ │       │ │        │ │ LLM)      │
                └─────────┘ └────────┘ │ assets │ └───────┘ └────────┘ └───────────┘
                                       └────────┘
                                            │
                                   ┌────────▼─────────┐
                                   │  BigBlueButton/  │  live streaming + recording
                                   │  Jitsi (WebRTC)  │
                                   └──────────────────┘
```

---

## 2. Front end

- **Framework:** React (SPA) with React Router; route-level code splitting separates the *public site* bundle from the *LMS* bundle so unauthenticated visitors never download dashboard code.
- **State:** React Query for server state (catalog, library, reports) + lightweight context/store for session/UI.
- **Forms & validation:** Formik + Yup mirroring server validation.
- **Realtime:** WebSocket (Socket.IO) client for live-class attendance, chat/polls, and progress sync.
- **Media:** Video.js player with HLS + encryption hooks; capture-blocking event handlers + on-screen watermark of the student ID.
- **Visualisation:** Chart.js for progress and reports.
- **Design system:** CSS custom properties (the Liquid Glass tokens from DESIGN.MD); accessible, responsive, reduced-motion aware.

### 2.1 Routing map
```
Public:   /  /about  /contact  /blog  /blog/:slug  /lms (gateway → /login)
Auth:     /login  (Student | Admin-Teacher methods)  /register  /verify-otp  /recover
Student:  /app/library  /app/catalog  /app/live  /app/quizzes  /app/progress  /app/ai  /app/profile
Staff:    /admin/approvals  /admin/content  /admin/limits  /admin/users  /admin/ai-sources
          /admin/reports  /admin/cms  /admin/audit   /teach/stream  /teach/quizzes  /teach/reports
```

---

## 3. Back end — service modules

Each module owns its routes, controllers, services and data access. Cross-cutting middleware is shared.

| Module | Responsibility | Key data |
|--------|----------------|----------|
| **Auth** | Register, OTP, login, MFA, refresh, recovery, single-device enforcement | users, sessions(Redis), revocation list |
| **Users** | Profiles, roles, consent records, status flags | users, roles, consents |
| **Catalog** | Modules, previews, pricing, bundles, search/filter | modules, bundles |
| **Payments** | Stripe checkout, webhooks, pending-approval queue, refunds | orders, transactions |
| **Library / Streaming** | Access grants, view-count tracking, signed stream URLs, DRM | grants, viewLogs |
| **Live** | Schedule, join eligibility, attendance, recording handoff | sessions, attendance |
| **Quizzes** | Banks (CSV import), randomisation, timing, auto-grade, retakes | quizzes, questions, attempts |
| **Progress** | Aggregate completion, time, milestones/badges | progress, badges |
| **AI-Proxy** | Forward queries to RAG service, enforce daily limits, log, citation passthrough | aiQueries |
| **Reports** | Aggregations, anonymised analytics, PDF/CSV export, schedules | (read models) |
| **Notifications** | Templated multi-channel send, retries, delivery logs, opt-out | notifLogs, prefs |
| **CMS (Blog)** | Public-site copy + blog posts authored by admin | posts, pages |
| **Admin** | View-limit config, content upload, user mgmt, audit access | config, auditLogs |

---

## 4. Authentication & authorization (security core)

### 4.1 AuthN
1. **Registration:** validate → parental-consent capture → OTP (Twilio SMS / SES email, 5-min TTL, 3 tries) → bcrypt hash → create `Student` → issue JWT.
2. **Login:** verify bcrypt → optional TOTP MFA → compute **device fingerprint** (user-agent, IP, browser) → check Redis for an active session → **invalidate prior session** if device differs (add old JWT id to revocation list) → issue short-lived JWT (15–60 min, RS256) + refresh token → notify the previous device.
3. **Recovery:** OTP-gated password reset with attempt limits.

```
User ─▶ /login {creds}
Express ─▶ verify bcrypt ─▶ [MFA?] ─▶ fingerprint
        ─▶ Redis: active session? differs ─▶ revoke old JWT id
        ─▶ issue JWT(userId, role, deviceHash) + refresh
        ─▶ Notification: "logged out from another device"
```

### 4.2 AuthZ — RBAC
- Roles: `Student`, `Teacher`, `Admin`; permissions stored in a roles/permissions collection (e.g. `watchRecording`, `approveAccess`, `streamClass`, `manageCMS`).
- **RBAC middleware** runs on every protected route: verify JWT signature + expiry → load role permissions (cached in Redis) → check action (and contextual rules, e.g. `viewCount < limit`) → allow or `403`.
- Segregation of duties enforced by the permission matrix (PRD §6) to limit insider risk.

### 4.3 Hardening
TLS 1.3 everywhere; bcrypt; AES-at-rest for sensitive fields; `helmet`, CORS allow-list, `express-rate-limit` (Redis-backed), reCAPTCHA on public forms; input validation against XSS/injection; refresh-token rotation; 90-day audit log retention; periodic OWASP ZAP scans + pen-test pre-launch.

---

## 5. Data architecture

**Primary store: MongoDB** (document model fits evolving educational content and flexible role/permission docs; matches the project's free-tier MERN direction). **Redis** for sessions, JWT revocation list, permission cache, rate-limit counters and hot reads. **Object storage (S3 Free Tier)** for video recordings, AI source PDFs, exports and blog media.

> Note on the source spec: some use-case "technical notes" reference PostgreSQL while the architecture sections specify MongoDB. This design **standardises on MongoDB** as the system of record for consistency and operational simplicity at this scale; a relational store can be introduced later only if strong transactional reporting demands it. See TECHSTACK.MD §"Data store decision".

### 5.1 Core collections (indicative)
```
users        { _id, name, email(uniq), phoneHash, grade, roleId,
               consent{given,ts}, mfaEnabled, status, createdAt }
roles        { _id, name, permissions[] }
modules      { _id, title, subject, grade, price, durationSec,
               previewUrl, instructor, published }
orders       { _id, studentId, items[], amount, status(pending|approved|denied),
               approvedBy, ts }
grants       { _id, studentId, moduleId, viewLimit, viewCount, lastTimestamp }
viewLogs     { _id, studentId, moduleId, pct, ip, ua, flagged, ts }
liveSessions { _id, topic, startsAt, teacherId, recordingUrl, status }
attendance   { _id, sessionId, studentId, joinedAt, leftAt }
quizzes      { _id, moduleId, type, questions[], timerSec, retakeLimit }
attempts     { _id, quizId, studentId, answers[], score, ts }
progress     { _id, studentId, moduleId, pct, timeSpent, sections[], badges[] }
aiQueries    { _id, studentId, prompt, answer, citations[], ts }
posts        { _id, slug, title, body, cover, category, published, ts }
notifLogs    { _id, userId, channel, template, status, attempts, ts }
auditLogs    { _id, actorId, action, target, meta, ts }     // retained 90d
```
PII is minimised; phone stored hashed; analytics built from anonymised read models.

---

## 6. Content delivery & anti-piracy pipeline

1. Admin uploads a recording → stored in S3 (private bucket) → transcoded to HLS renditions.
2. Student requests playback → API checks **grant + view limit + > 50% rule** → issues a **short-lived signed URL**.
3. Video.js streams HLS with encryption; client blocks downloads/screenshots/screen-record events and overlays a per-student watermark.
4. `viewLogs` record progress; view-count increments only past 50% completion; anomalies (rapid repeat views, same-IP bursts) raise admin alerts.

---

## 7. Live classes

BigBlueButton / Jitsi (self-hosted, open source) provides WebRTC streaming, chat, polls and screen share. The API gates join links to **subscribed + approved** students, opens a Socket.IO channel for real-time attendance, and on session end ingests the auto-recording into the same S3/HLS pipeline (pending admin approval before library availability).

---

## 8. AI tutor (RAG) — isolated service

A standalone RAG service (set up once by a developer via N8N / LangChain / Haystack) indexes **only official sources** (Grade 10–11 textbooks, teacher guides, past-paper answers) into a **FAISS vector DB**. The Express **AI-Proxy** module enforces the daily query cap, forwards the prompt, returns the cited answer, and logs the exchange. The service has **no external internet retrieval**, preventing hallucinated/off-curriculum answers. Auth flows never touch the AI service directly; all access inherits RBAC checks at the proxy.

---

## 9. Notifications

Event hooks and `node-cron` jobs trigger templated messages; the Notifications module chooses the channel by user preference (WhatsApp → SMS → Email), sends via Twilio / AWS SES / WhatsApp Business, logs delivery, retries ≤ 3 times, and honours opt-outs (PDPA / anti-spam).

---

## 10. Deployment, scaling & observability

- **Hosting:** AWS Free Tier — EC2 (API), S3 + CloudFront (static SPA + media), managed/self-hosted MongoDB, Redis, and a BBB node. Nginx reverse proxy terminates TLS and rate-limits.
- **Containers:** Docker images per concern; Compose for dev, simple ECS/EC2 for prod; easy rolling updates.
- **Scaling:** stateless API behind a load balancer → horizontal auto-scaling; Redis caching for hot reads; CDN for media; staggered live scheduling and recorded fallback to stay within free-tier streaming limits.
- **CI/CD:** GitHub Actions → lint, test (Jest/Cypress), build, deploy.
- **Observability:** Winston structured logs, health checks, Prometheus metrics; anomaly alerts for auth/piracy.
- **Backup/DR:** automated daily MongoDB backups with versioning; S3 versioning on media.

---

## 11. Cross-cutting non-functionals (traceability)

| NFR | Mechanism |
|-----|-----------|
| < 2s pages | code-split SPA, CDN, Redis cache |
| < 500ms live | WebRTC (BBB/Jitsi), regional node |
| 1,000+ users | stateless API + autoscale + cache |
| Security | JWT/RBAC, TLS, bcrypt, AES, OWASP, PCI (Stripe-hosted fields) |
| PDPA | consent logging, data minimisation, anonymised reports, 90d audit |
| Accessibility | WCAG 2.1 AA front end |
| Cost | free / open-source tiers throughout |

---

## 12. Key risks & mitigations (architecture-level)

- **Free-tier streaming ceiling** → recorded-fallback + staggered live + CDN edge caching.
- **Screen-camera piracy** (DRM can't stop it) → watermark + view limits + behavioural anomaly alerts.
- **JWT theft** → short TTL + refresh rotation + revocation list + device binding.
- **Single admin bottleneck** → 24h approval SLA, bulk approval, optional auto-approve rules for clear grade matches.
- **Datastore divergence in spec** → standardised on MongoDB (see §5 note and TECHSTACK.MD).
