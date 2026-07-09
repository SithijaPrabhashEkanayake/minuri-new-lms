# Minuri LMS: Comprehensive Agile Project Guide

Welcome to the **Minuri LMS** project deep-dive. To give you the most comprehensive understanding of this system, we will explain the project through the lenses of the key roles in our Agile development team.

---

## 1. The Product Owner (PO) Perspective 🎯

**Role:** Defines the "Why" and "What". Maximizes the value of the product resulting from the work of the Development Team.

**Project Vision:**
Minuri LMS is a modern, full-stack Learning Management System tailored to provide a seamless educational experience for students, while offering robust management tools for teachers and administrators. We are not just building a repository of videos; we are building an interactive learning environment.

**Key Epics & Features:**
*   **Multi-Tiered Portals:** Distinct dashboards and access levels for Students (learning), Teachers (content creation), and Admins (system oversight).
*   **AI-Powered Tutor:** Integrating Google Gemini & Groq to provide students with 24/7 intelligent assistance, answering queries based on indexed course materials (`AiSource`).
*   **Live Interactive Classes:** Integration with streaming solutions (currently Zoom/Zoom SDK) to facilitate real-time learning (`LiveSession`).
*   **Rich Content Delivery:** A Video Library and CMS for asynchronous learning (`Module`, `Video`), complete with view-limit constraints (`VideoView`) to protect intellectual property.
*   **Assessment & Tracking:** Interactive Quizzes (`Quiz`, `Question`) to test knowledge, and detailed progress tracking for both students and teachers.
*   **E-Commerce Integration:** Secure enrollment and payment tracking (`Enrollment`), handling manual or automated receipt verifications.

**Current State & Roadmap:**
We have a solid MVP with core features functioning. Our next major focus is evaluating more cost-effective alternatives to the Zoom SDK for live video streaming (as discussed in recent sprints) and expanding our AI Tutor's capabilities.

---

## 2. The Scrum Master Perspective 🔄

**Role:** Facilitates the "How". Ensures the team adheres to Agile practices and clears any blockers.

**Workflow & Ceremonies:**
*   **Sprints:** We operate on 2-week iterations.
*   **Daily Standups:** Brief syncs to discuss progress on Frontend React components and Backend API endpoints.
*   **Backlog Refinement:** Continuously grooming user stories, such as refining the exact data needed for the `Blog` or `Quiz` schemas.

**Current Blockers & Focus Areas:**
*   **Blocker:** High costs associated with the current Zoom SDK implementation. The team is currently conducting spikes to evaluate alternatives.
*   **Environment Setup:** Ensuring all team members have proper `.env` configurations for local development, especially aligning `VITE_API_BASE_URL` with the backend, and securing Supabase and Gemini API keys.
*   **Concurrent Development:** We use `concurrently` in the root `package.json` so developers can run `npm run dev` to spin up both the Vite frontend and Node backend simultaneously, reducing friction.

---

## 3. The System Architect Perspective 🏗️

**Role:** Designs the structural blueprint. Ensures scalability, security, and maintainability.

**Architecture Overview:**
Minuri LMS utilizes a **Monorepo structure**, divided clearly into `/frontend` and `/backend`.

*   **Frontend (Client Layer):** A Single Page Application (SPA) built with React and Vite. It consumes RESTful APIs.
*   **Backend (API Layer):** A monolithic Express.js server acting as the central nervous system. It handles business logic, auth validation, and AI orchestration.
*   **Database (Data Layer):** A relational PostgreSQL database hosted on Supabase, managed via the **Prisma ORM**.
*   **Third-Party Integrations:**
    *   **Supabase Auth:** For secure, scalable JWT-based authentication.
    *   **VdoCipher:** Secure video hosting and DRM (Digital Rights Management) to prevent unauthorized downloading of course materials.
    *   **Google Gemini / Groq:** External LLMs for the AI Tutor feature.

**Why this Stack?**
*   *Prisma + Postgres* gives us absolute type safety from the DB up to the API.
*   *Vite* provides incredibly fast HMR (Hot Module Replacement) for developer velocity.
*   *Supabase* accelerates development by handling Auth and providing a robust Postgres instance out-of-the-box.

---

## 4. The UI/UX Designer Perspective 🎨

**Role:** Champions the user. Ensures the application is intuitive, accessible, and visually stunning.

**Design System & Aesthetics:**
*   **Framework:** TailwindCSS is our utility-first CSS framework of choice. It allows us to rapidly prototype and enforce a consistent design token system directly in our JSX.
*   **Philosophy:** We mandate a "Rich Aesthetic". The platform must feel premium. We achieve this through:
    *   Harmonious color palettes (moving away from generic primary colors).
    *   Glassmorphism effects for modals and overlays.
    *   Micro-interactions (hover states, subtle transitions) to make the UI feel alive.
    *   Sleek dark modes (where applicable) to reduce eye strain during long study sessions.

**User Flows:**
*   **Student Flow:** Login -> Dashboard -> Select Enrolled Module -> Watch Video/Take Quiz -> Interact with AI Tutor. The focus is on distraction-free learning.
*   **Teacher Flow:** Login -> Dashboard -> Create Module -> Upload Video (VdoCipher) -> Create Quiz -> Publish. The focus is on ease of content management.

---

## 5. The Frontend Developer Perspective 💻

**Role:** Brings the design to life. Builds the interactive components and integrates with the backend.

**Tech Stack:** React, Vite, TailwindCSS.

**Implementation Details:**
*   **Routing:** We use React Router to navigate between the marketing pages (like `Blog.jsx`, `Gateway.jsx`) and the secure portal routes.
*   **State Management:** Leveraging React Context for global state (like user session data from Supabase Auth) and local state (`useState`, `useReducer`) for component-level interactions.
*   **API Communication:** We use `fetch` or `axios` to hit our backend endpoints (e.g., `http://localhost:5000/api/...`). We must ensure JWT tokens are passed in the Authorization header for protected routes.
*   **Component Structure:**
    *   `src/pages/`: Full views like `Blog.jsx` and `Gateway.jsx`.
    *   `src/components/`: Reusable UI elements (Buttons, Cards, Modals).

**Current Tasks:**
*   Refining the `Gateway.jsx` registration flow. Specifically, handling the `STAFF_INVITE_CODE` mechanism where users need a specific environment variable code to register as staff.

---

## 6. The Backend Developer Perspective ⚙️

**Role:** Builds the engine. Handles data integrity, business logic, and external API orchestration.

**Tech Stack:** Node.js, Express.js, Prisma, PostgreSQL (Supabase).

**Implementation Details:**
*   **Prisma Schema (`/backend/prisma/schema.prisma`):** This is our source of truth.
    *   `User`: Handles auth metadata, role linking, and MFA.
    *   `Module` & `Video`: Core curriculum structures.
    *   `Enrollment`: The crucial many-to-many link between `User` (student) and `Module`.
    *   `VideoView`: Tracks usage to enforce limits (`viewLimit` in `Module`).
*   **Controllers & Routes:** The `/backend` directory is organized into `/routes` (defining API endpoints) and `/controllers` (the actual business logic).
*   **Security:**
    *   Middleware verifies JWTs from Supabase before allowing access to protected routes.
    *   Role-based Access Control (RBAC) ensures a Student cannot hit Admin endpoints.
*   **AI Integration:** We have specific controllers that format student questions, append course context from the `AiSource` table, and send prompts to the Gemini/Groq APIs.

---

## 7. The QA (Quality Assurance) Engineer Perspective 🐛

**Role:** Protects the product. Ensures everything works as expected under various conditions.

**Testing Strategy:**
*   **Authentication Testing:** Verifying Supabase login/logout, JWT expiration, and testing the `STAFF_INVITE_CODE` bypass in `Gateway.jsx`.
*   **Role Validation:** Ensuring Students can only see enrolled modules, while Teachers can edit their own modules, and Admins can see everything.
*   **Video View Limits:** A critical test case is ensuring the `VideoView` counter accurately increments and locks out the user once `viewLimit` is reached.
*   **AI Hallucination Checks:** Testing the AI Tutor with out-of-scope questions to ensure it gracefully declines rather than providing incorrect information.

---

## 8. The DevOps Engineer Perspective 🚀

**Role:** Bridges development and operations. Handles deployment, infrastructure, and CI/CD.

**Deployment Strategy:**
*   **Frontend (Vercel):** We utilize Vercel for the React/Vite app. It provides edge caching and automatic preview deployments on PRs. Key environment variables like `VITE_SUPABASE_URL` and `VITE_API_BASE_URL` are injected at build time.
*   **Backend (Render.com):** The Express server is hosted on Render as a Web Service.
    *   **Build Command:** `npm install && npx prisma generate` (Crucial to generate the Prisma Client before the app starts).
    *   **Start Command:** `node server.js`.
*   **Database (Supabase):** Production database is hosted on Supabase's managed PostgreSQL infrastructure.

**Local Environment Management:**
We rely heavily on `.env` files. A common developer issue is missing the `STAFF_INVITE_CODE` in the backend `.env` or having a mismatch between the frontend's API base URL and the backend's actual running port.

---
*This guide serves as a living document of the Minuri LMS architecture and Agile processes.*
