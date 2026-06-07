# Product Requirements Document (PRD)
## ICT Academy — Learning Management System

**Product owner / lead:** Minuri Alaharuwan
**Document status:** Draft v1.0
**Last updated:** 28 May 2026
**Region:** Sri Lanka

---

## 1. Overview

The ICT Academy LMS is a custom-built, web-based educational platform for an ICT academy serving **Grade 10 and Grade 11 students** in Sri Lanka. It delivers curriculum-aligned ICT education (programming, networking, digital literacy) through purchasable recorded modules, scheduled live classes, interactive assessments, and AI-assisted query resolution restricted to official sources.

The product is delivered as a public-facing **marketing website** (Home, About Us, Contact, Blog) plus a gated **Learning Management System** reached from the site's *LMS* section. The platform emphasises anti-piracy controls, PDPA compliance for minors, single-device session enforcement, and streamlined administrative oversight, all on a free / open-source technology base.

### 1.1 Problem statement

ICT is a core national-exam subject in Sri Lanka, yet quality, affordable, structured online ICT instruction for Grade 10–11 students is scarce. Existing options either lack curriculum alignment, leak paid content through piracy, or fail to protect minors' data. The academy needs one controlled environment that combines content delivery, live teaching, assessment, and analytics while remaining cheap to operate.

### 1.2 Goals

| # | Goal | Success measure |
|---|------|-----------------|
| G1 | Deliver structured, curriculum-aligned ICT content | ≥ 1,000 active students in first cohort |
| G2 | Protect paid content from piracy | < 1% of recordings flagged as leaked |
| G3 | Comply with Sri Lanka PDPA for minors | 100% of accounts carry logged parental consent |
| G4 | Operate on free / open-source tiers | Monthly infrastructure cost near zero at launch |
| G5 | Provide one administrator with full operational control | All payments approved within 24h |

### 1.3 Non-goals (current release)

- No parent portal or parent login (consent acknowledgment only).
- No competitive features such as leaderboards or group competitions.
- No native mobile app (responsive web only).
- No integration with national exam boards.

---

## 2. Target users & personas

| Persona | Role | Primary needs |
|---------|------|---------------|
| **Student** | Grade 10–11 learner (minor) | Register, purchase modules, watch recordings, attend live classes, take quizzes, track progress, ask the AI tutor |
| **Teacher** | Single designated instructor | Stream live classes, create custom quizzes, view class performance analytics |
| **Admin** | Operations owner (the academy) | Upload content, approve payments, configure view limits, manage AI sources, manage users, generate reports |
| **Developer** | One-time technical setup | Index AI source material into the vector store; deploy and maintain |
| **Parent** | Indirect stakeholder | Provide consent at registration; receive progress shares (with consent) |

---

## 3. Site map & navigation

The product splits cleanly into a **public website** and a **private LMS application**.

### 3.1 Public website pages
1. **Home** — hero, value proposition, featured modules, how-it-works, testimonials, CTA into the LMS.
2. **About Us** — academy mission, the instructor, pedagogy, PDPA/safety commitments.
3. **Contact** — contact form, academy details, support channels (email / WhatsApp).
4. **Blog** — ICT learning articles, exam tips, announcements (admin-authored).
5. **LMS** — gateway/landing that routes the user to the **login screen**.

### 3.2 LMS login
A single login screen presents **two clearly separated entry methods**:
- **Student — "Connect to Class"**: for learners to access their library, live classes, quizzes, progress and the AI tutor.
- **Admin / Teacher — "Manage LMS"**: for staff to manage the LMS *and the public website* (content, blog, users, payments, reports, view limits).

### 3.3 Authenticated areas
- **Student dashboard:** Library, Module Catalog, Live Classes, Quizzes, Progress, AI Tutor, Notifications, Profile.
- **Teacher dashboard:** Live Streaming console, Quiz builder, Class reports.
- **Admin dashboard:** Content management, Pending payment approvals, View-limit configuration, User management, AI source management, Reports, Blog/website CMS, Audit log.

---

## 4. Functional requirements

Requirements are grouped by capability. Each is traceable to the source use cases (UC1–UC13).

### 4.1 Registration & onboarding (UC1)
- FR-1.1 Self-registration form: full name, email, phone, grade (10/11), password + confirmation.
- FR-1.2 Mandatory **parental consent** checkbox (PDPA) before submission.
- FR-1.3 Client + server validation: unique email, strong password (≥ 8 chars).
- FR-1.4 Email verification managed by Supabase Auth (with auto-confirm enabled for dev/prototyping).
- FR-1.5 Rate-limiting and abuse protection handled natively by Supabase Auth.
- FR-1.6 On success: Register user in Supabase, trigger backend profile completion (Prisma/PostgreSQL) to assign `Student` role and link the Supabase UUID, then redirect to dashboard.

### 4.2 Authentication & session management (UC4)
- FR-2.1 Credential login and JWT issuance managed securely by **Supabase Auth**.
- FR-2.2 Optional **MFA** (Multi-Factor Authentication) natively provided by Supabase.
- FR-2.3 Session state, short-lived JWTs, and secure refresh tokens handled seamlessly by Supabase client libraries.
- FR-2.4 Failed-login lockouts and brute force protection managed by Supabase Auth.
- FR-2.5 Password recovery via Supabase secure email reset links.
- FR-2.6 The custom LMS backend authenticates requests by verifying the Supabase JWT signature (`Authorization: Bearer <token>`).
- FR-2.7 Inactivity timeout (30 min) with auto-logout.
- FR-2.8 All auth events written to the audit log.

### 4.3 Content purchase & access (UC2, UC7)
- FR-3.1 Module catalog with grade/subject filters, search, previews, price, duration, instructor.
- FR-3.2 Cart supporting single modules, bundles and discount/promo codes.
- FR-3.3 Per-module one-time purchase and monthly subscription (for live access).
- FR-3.4 Payment via Stripe; **access held pending admin approval**.
- FR-3.5 Admin approve/deny with eligibility check (grade match, fraud flags); refunds on denial.
- FR-3.6 Approved content appears in the student's personal **Library**.

### 4.4 Content viewing & anti-piracy (UC5)
- FR-4.1 Encrypted streaming, **no download**.
- FR-4.2 DRM-style player blocks screenshots, screen recording and capture.
- FR-4.3 Admin-configurable **view limit** per recording (default max 8); increment only on > 50% completion.
- FR-4.4 Pause/resume with saved timestamp; adaptive quality; subtitles.
- FR-4.5 Limit-reached → repurchase prompt; suspicious activity → admin alert.

### 4.5 Live classes (UC3, UC11)
- FR-5.1 Scheduled sessions streamed by the single teacher (BigBlueButton / Jitsi).
- FR-5.2 Only subscribed, admin-approved students may join; real-time attendance tracking.
- FR-5.3 In-session chat, polls, Q&A, screen sharing.
- FR-5.4 Auto-record → upload for admin approval → optional post-session viewing under limits.
- FR-5.5 Absentee notifications; fallback to audio-only on poor connection.

### 4.6 Progress tracking (UC8)
- FR-6.1 Dashboard: overall %, per-module bars, time spent, completed sections.
- FR-6.2 Real-time sync on viewing/quizzes/attendance.
- FR-6.3 Milestone **badges** at 100% (no leaderboards).
- FR-6.4 Export progress to PDF/CSV; optional consented share link for parents.

### 4.7 Quizzes & assessments (UC9)
- FR-7.1 MCQs imported from past papers via CSV; custom quizzes by admin/teacher.
- FR-7.2 Randomised questions with timers; anti-cheat (full-screen, tab-switch detection).
- FR-7.3 Auto-grading with immediate scores, explanations, wrong-answer feedback.
- FR-7.4 Retake limit (e.g. 3); progress-linked unlocking; improvement suggestions.

### 4.8 AI-assisted query resolution (UC10)
- FR-8.1 In-module RAG chat **restricted to uploaded official sources** (textbooks, guides, past-paper answers).
- FR-8.2 One-time developer indexing into a vector DB (FAISS); citations in every answer (e.g. page numbers).
- FR-8.3 Daily query limit (e.g. 10); query logging for admin review.
- FR-8.4 No external data; off-topic queries redirected to ICT scope.

### 4.9 Reporting & analytics (UC12)
- FR-9.1 Aggregate reports: average scores, completion rates, attendance, pass/fail ratios.
- FR-9.2 Chart/table visualisations; filters by grade/module/date; PDF/CSV export.
- FR-9.3 **Anonymised** aggregates (no PII) for PDPA; scheduled email delivery.

### 4.10 Notifications (UC13)
- FR-10.1 Triggers: payment confirmation, deadlines, low progress, session start, limit exceedance.
- FR-10.2 Channels: Email (AWS SES), WhatsApp, SMS (Twilio) by user preference.
- FR-10.3 Templated + personalised; bulk send; delivery logging; ≤ 3 retries; opt-out honoured.

### 4.11 Admin, teacher & website management (UC6, UC11)
- FR-11.1 Role-based dashboards (RBAC) for Student / Teacher / Admin.
- FR-11.2 Admin: upload recordings & AI sources, configure limits, approve payments, manage users.
- FR-11.3 Teacher: streaming, quiz creation, report viewing.
- FR-11.4 **Website CMS**: admin authors/publishes Blog posts and edits public-site copy.
- FR-11.5 Audit trails retained 90 days.

---

## 5. Non-functional requirements

| Category | Requirement |
|----------|-------------|
| Performance | < 2 s page load; < 500 ms live-stream latency; < 1 s quiz grading; < 3 s AI response |
| Scalability | ≥ 1,000 initial users; 500+ concurrent checkouts; auto-scaling on free tier |
| Availability | > 95% uptime target |
| Security | HTTPS / TLS 1.3; bcrypt password hashing; AES at rest; OWASP Top-10 mitigations; PCI DSS for payments; zero-trust request verification |
| Privacy / Compliance | Sri Lanka PDPA: parental consent logging, data minimisation, anonymised analytics, 90-day audit retention |
| Accessibility | WCAG 2.1 AA: screen-reader support, keyboard navigation, high-contrast mode |
| Responsiveness | Fully responsive web; no native app required at launch |
| Cost | Free / open-source tiers (React, Express, Prisma, PostgreSQL, Supabase, VdoCipher trial, Stripe) |

---

## 6. Roles & permissions matrix

| Capability | Student | Teacher | Admin |
|-----------|:------:|:------:|:----:|
| Register / login | ✅ | ✅ | ✅ |
| Purchase modules (post-approval) | ✅ | — | — |
| Watch recordings (within limit) | ✅ | — | ✅ |
| Take quizzes | ✅ | — | — |
| Track own progress | ✅ | — | — |
| Query AI tutor | ✅ | — | — |
| Attend live class (if subscribed) | ✅ | — | — |
| Stream live class | — | ✅ | ✅ |
| Create / edit quizzes | — | ✅ | ✅ |
| View class reports | — | ✅ | ✅ |
| Approve payments | — | — | ✅ |
| Upload recordings / AI sources | — | — | ✅ |
| Configure view limits | — | — | ✅ |
| Manage users & roles | — | — | ✅ |
| Manage website / blog | — | — | ✅ |

---

## 7. Key user flows (summary)

1. **Discover → Register → Verify → Dashboard** (UC1).
2. **Browse catalog → Cart → Pay → Admin approves → Library** (UC2, UC7).
3. **Open library → Stream recording (DRM, view-count) → Progress updates** (UC5, UC8).
4. **Subscribe → Join live class → Attendance tracked → Recording available** (UC3, UC11).
5. **Take quiz → Auto-grade → Feedback → Progress + report update** (UC9, UC12).
6. **Ask AI tutor → RAG retrieves official source → Cited answer** (UC10).
7. **Admin authors blog post → Publishes to public website** (UC11).

---

## 8. Assumptions, constraints & risks

- **Assumption:** Students have a personal device and intermittent broadband typical of LK home connections.
- **Constraint:** Single teacher; single admin operationally.
- **Constraint:** Budget mandates free tiers; features must degrade gracefully under tier limits.
- **Constraint:** VdoCipher DRM video hosting trial is strictly limited to 4 videos. Older videos must be deleted to upload new ones during the trial phase.
- **Risk:** DRM cannot fully prevent camera-of-screen piracy → mitigate with watermarking + view limits + behavioural alerts.
- **Risk:** Free-tier streaming may struggle at 1,000 concurrent viewers → mitigate with recorded fallback and staggered live scheduling.
- **Risk:** Handling minors' data raises PDPA exposure → mitigate with consent logging, data minimisation, anonymised analytics, audits.

## 9. Release scope

**MVP (Release 1):** Public website (Home/About/Contact/Blog), registration + auth (single-device, OTP), catalog + purchase + admin approval, library + DRM streaming with view limits, quizzes, progress, notifications, admin/teacher dashboards, website/blog CMS.

**Release 2:** Live classes at full scale, AI tutor (RAG), MFA, scheduled report emails.

**Future:** Mobile app, predictive at-risk analytics, exam-board integrations, parent portal.
