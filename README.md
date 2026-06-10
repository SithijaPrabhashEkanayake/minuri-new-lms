# Minuri LMS

Minuri LMS is a modern, full-stack Learning Management System designed to provide a comprehensive educational experience with an integrated AI Tutor, Live Classes, Video Streaming, and robust Admin/Teacher portals.

## 🚀 Tech Stack

- **Frontend:** React, Vite, TailwindCSS (assumed)
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL), Prisma ORM
- **AI Integrations:** Google Generative AI (Gemini), Groq SDK
- **Authentication:** Supabase Auth (JWT)
- **Deployment:** Vercel (Frontend), Render.com (Backend)

## 📂 Project Structure

The project is structured as a monorepo containing both the frontend and backend applications:

- `/frontend` - The React application (Vite). Contains the UI, context, and components for Student, Teacher, and Admin portals.
- `/backend` - The Node.js Express server. Handles API requests, database interactions via Prisma, AI generation, and secure file uploads.

## ✨ Key Features

- **Multi-role Portals:** Dedicated dashboards for Students, Teachers, and Admins.
- **AI Tutor:** Integrated AI assistance using Google Gemini & Groq for answering student queries.
- **Live Classes:** Live streaming and scheduling capabilities.
- **Video Library & CMS:** Content Management System for uploading course materials, videos, and managing blogs.
- **Quizzes & Progress Tracking:** Interactive quiz builder and student progress monitoring.

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v16+)
- A Supabase account (for database and auth)
- API Keys for Google Generative AI

### 2. Environment Variables

**Backend (`/backend/.env`):**
Create a `.env` file in the `backend` folder and add your credentials:
```env
DATABASE_URL="your-supabase-postgres-connection-string"
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-service-role-key"
GEMINI_API_KEY="your-gemini-key"
GROQ_API_KEY="your-groq-key"
JWT_SECRET="your-jwt-secret"
```

**Frontend (`/frontend/.env`):**
Create a `.env` file in the `frontend` folder:
```env
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_API_BASE_URL="http://localhost:5000"
```

### 3. Installation & Running

From the root directory, you can install dependencies and run both servers:

```bash
# Install dependencies for both frontend and backend
npm install
cd frontend && npm install
cd ../backend && npm install

# Run the development servers (usually configured via root package.json)
npm run dev
```

The frontend will typically run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## 🌐 Deployment Instructions

### Frontend (Vercel)
1. Import the repository into Vercel.
2. Set the Root Directory to `frontend`.
3. Add the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`).
4. Set `VITE_API_BASE_URL` to your deployed backend URL.
5. Deploy!

### Backend (Render)
1. Create a New Web Service on Render.com.
2. Connect the repository and set the Root Directory to `backend`.
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `node server.js`
5. Add all backend environment variables.
6. Deploy!
