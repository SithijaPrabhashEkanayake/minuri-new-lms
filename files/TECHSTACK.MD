# Technology Stack — TECHSTACK.MD
## ICT Academy LMS

**Author:** Minuri Alaharuwan
**Version:** 1.0 · 28 May 2026
**Selection principles:** free / open-source first, MERN-centric (as specified), production-credible at 1,000+ users, secure, PDPA-compliant, low operating cost.

---

## 1. Stack at a glance

| Layer | Choice | Why |
|-------|--------|-----|
| Front end | **React** + React Router + Vite | SPA, route code-splitting (public vs LMS), huge ecosystem, free |
| UI / styling | **CSS custom properties** (Liquid Glass tokens) + minimal utility CSS | exact control of the iOS-26 glass theme; no heavy framework lock-in |
| Client data | **React Query** (server state) + Context store (UI/session) | caching, retries, optimistic updates |
| Forms | **Formik + Yup** | matches server-side validation |
| Realtime | **Socket.IO** | live attendance, chat, polls, progress sync |
| Media player | **Video.js** + HLS | DRM-style protection, adaptive quality, capture blocking |
| Charts | **Chart.js** | pastel-themed reports & progress |
| API runtime | **Node.js + Express.js** | the "EN" of MERN; mature middleware |
| Auth | **jsonwebtoken** (RS256) + **bcrypt** + **passport-jwt** + **otplib** (TOTP) | stateless JWT, hashed passwords, MFA |
| Primary DB | **MongoDB** (+ Mongoose) | system of record; flexible docs; free tier |
| Cache / sessions | **Redis** | session store, JWT revocation list, RBAC cache, rate-limit counters |
| Object storage | **AWS S3** (Free Tier) | recordings, AI source PDFs, exports, blog media |
| Payments | **Stripe** SDK | PCI-compliant hosted fields, webhooks |
| Notifications | **Twilio** (SMS/WhatsApp) + **AWS SES** (email) | multi-channel, free tiers |
| Live streaming | **BigBlueButton** (or **Jitsi**) | open-source WebRTC, recording, polls, screen share |
| AI tutor (RAG) | **LangChain / Haystack** + **FAISS** + open LLM (HuggingFace), orchestrated by **N8N** | source-restricted retrieval, citations, no external data |
| PDF/CSV export | **PDFKit**, **csv** libs | reports & progress exports |
| Reverse proxy | **Nginx** | TLS termination, routing, gzip, rate-limit |
| Security tooling | **helmet**, **express-rate-limit**, **express-validator**, **reCAPTCHA**, **OWASP ZAP** | OWASP Top-10 mitigations |
| Logging | **Winston** + **Prometheus** | structured logs, metrics, anomaly alerts |
| Scheduling | **node-cron** | reminders, scheduled reports |
| Testing | **Jest** (unit/integration) + **Cypress** (e2e) | coverage across layers |
| Containerisation | **Docker** + Docker Compose | reproducible builds, easy updates |
| CI/CD | **GitHub Actions** | lint → test → build → deploy |
| Hosting | **AWS Free Tier** (EC2, S3, CloudFront) | scale-to-1,000 on minimal cost |

---

## 2. Front-end detail

- **React + Vite** for fast builds and code splitting. The public marketing site (Home, About, Contact, Blog) and the gated LMS load as separate chunks so visitors don't download dashboard code.
- **Design system** is delivered purely through CSS variables (the Liquid Glass tokens in DESIGN.MD): frosted `backdrop-filter` panels, pastel brand gradients, **pillar-shaped (pill) buttons**, large radii. This keeps the bundle light and the theme pixel-exact to the reference mockup.
- **Accessibility**: semantic HTML, focus management, `prefers-reduced-motion`, WCAG 2.1 AA contrast.
- **Icons**: Lucide (open-source, rounded line set).
- **Fonts**: Bricolage Grotesque (display) + Plus Jakarta Sans (body), self-hosted/Google Fonts.

## 3. Back-end detail

- **Express** modular monolith with shared middleware: JWT verify, RBAC, validation, rate-limit, audit logging, error handling.
- **Mongoose** schemas for users, roles, modules, orders, grants, sessions, quizzes, progress, posts, logs.
- **Stripe webhooks** drive the pending-approval queue; **Twilio/SES** power OTP and notifications; **Socket.IO** handles realtime.
- **AI-Proxy** module brokers all calls to the isolated RAG service and enforces daily query caps + logging.

## 4. Data store decision (resolving the spec)

The source requirements are internally inconsistent: the architecture/auth sections specify **MongoDB**, while some individual use-case "technical notes" mention **PostgreSQL** (e.g. for question banks or config).

**Decision:** standardise on **MongoDB** as the single system of record, with **Redis** for ephemeral/hot data. Rationale:

- Matches the explicitly chosen **free MERN stack** and the architecture's user/role/session model.
- One database simplifies operations, backups and the single-admin model.
- Document flexibility suits evolving educational content, flexible permissions, and quiz/question structures.
- At the stated scale (1,000+ users), MongoDB comfortably handles the transactional and read patterns described.

A relational engine (PostgreSQL) is recorded as a **future option** only if heavy, strongly-transactional reporting later demands it — it is not required for launch. CSV question-bank imports map cleanly to MongoDB documents.

## 5. Security & compliance stack

- **Transport:** TLS 1.3 (Nginx); HSTS.
- **Identity:** bcrypt password hashing; RS256 JWT (short TTL) + rotating refresh tokens; TOTP MFA (optional); single-device enforcement via device-bound claims + Redis revocation list.
- **App hardening:** helmet headers, CORS allow-list, express-validator input sanitisation (XSS/injection), express-rate-limit (Redis-backed), reCAPTCHA on public forms.
- **Payments:** Stripe-hosted fields keep card data off our servers (PCI DSS scope reduction).
- **Data protection (PDPA):** parental-consent logging, data minimisation, phone hashing, AES-at-rest for sensitive fields, anonymised analytics, 90-day audit-log retention.
- **Assurance:** OWASP ZAP scanning + pre-launch penetration test; zero-trust verification on every request.

## 6. AI tutor stack (source-restricted RAG)

- **Indexing (one-time, developer):** official PDFs → chunk → embed → **FAISS** vector store, orchestrated with **N8N** and **LangChain/Haystack**.
- **Serving:** retrieval-augmented generation with an open **HuggingFace** model; every answer carries **citations** (e.g. "Grade 10 Textbook, p.45").
- **Guardrails:** no external web retrieval; off-topic queries redirected to ICT scope; daily per-student cap; full query logging for admin review.

## 7. DevOps & operations

- **Docker** images per concern; **Compose** for local dev; deploy to **AWS** (EC2 for API + BBB node, S3 + CloudFront for SPA/media).
- **GitHub Actions** pipeline: install → lint → Jest/Cypress → build → deploy.
- **Observability:** Winston structured logs + Prometheus metrics + health checks; alerts on auth anomalies and piracy signals.
- **Backups/DR:** daily MongoDB snapshots with versioning; S3 versioning on media.
- **Scaling path:** stateless API + load balancer + horizontal autoscale; Redis cache; CDN; staggered live sessions with recorded fallback.

## 8. Cost posture

All core components run on **free or open-source tiers** at launch (MERN, Redis, AWS Free Tier, Stripe pay-per-use, Twilio/SES free allowances, self-hosted BBB/Jitsi, HuggingFace/FAISS). Costs scale only with genuine usage (streaming minutes, SMS volume, storage beyond free limits), keeping the platform viable for an independent academy.

---

### Summary
The stack is a security-hardened **MERN core** (React · Express · MongoDB · Node) with **Redis** for sessions/cache, **Stripe/Twilio/SES** for payments and messaging, **BigBlueButton** for live teaching, and an **isolated FAISS-backed RAG** AI tutor — all on free/open-source tiers, containerised, CI/CD-driven, and deployable to AWS Free Tier while meeting the PRD's performance, security and PDPA targets.
