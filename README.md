# DYORA

**An AI that understands more than your words.**

DYORA is a full-stack, production-style personal AI assistant — a conversational companion that chats naturally in English, Hindi, and Hinglish, reads and reasons over your documents, adapts its tone to how you're feeling, remembers what matters, and turns your questions into structured, useful output (study plans, interview prep, roadmaps, notes, and more).

This is not a ChatGPT clone. DYORA has its own visual identity: a dark, editorial, cinematic interface built around a sculptural signature entity (the "DYORA orb") — no blue gradients, no glassmorphism clichés.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Architecture](#architecture)
4. [Folder structure](#folder-structure)
5. [Requirements](#requirements)
6. [Environment setup](#environment-setup)
7. [Database setup](#database-setup)
8. [Backend setup](#backend-setup)
9. [Frontend setup](#frontend-setup)
10. [Running locally](#running-locally)
11. [API documentation](#api-documentation)
12. [AI provider configuration](#ai-provider-configuration)
13. [PDF / document processing](#pdf--document-processing)
14. [Mood detection](#mood-detection)
15. [Memory system](#memory-system)
16. [Security notes](#security-notes)
17. [Future improvements](#future-improvements)

---

## Features

**Conversation**
- Natural, warm, emotionally-aware chat — not robotic, not corporate
- Understands casual English, Hindi, and Hinglish, and mirrors the user's style
- New conversation, rename, delete, search
- Markdown rendering, syntax-highlighted code blocks with copy buttons
- Copy response, regenerate response, retry on failure, auto-scroll
- Loading and error states throughout

**Document intelligence**
- Upload PDF / DOCX / TXT
- Text extraction (Apache PDFBox / Apache POI), metadata, chunking
- Ask questions grounded strictly in the uploaded document (no hallucinated specifics)
- Summarize, generate notes, MCQs, flashcards, and revision/study plans

**Personalization & memory**
- Short-term memory: full context of the current conversation
- Long-term memory: explicit, non-sensitive facts (preferred language/style, career goals, ongoing projects, learning goals) — never auto-captures sensitive personal information
- Memory settings: view, delete individual memories, or clear all

**Mood-aware responses**
- Lightweight, explainable tone detection (HAPPY, EXCITED, CALM, NEUTRAL, CONFUSED, FRUSTRATED, SAD, STRESSED, ANGRY, TIRED)
- Adapts response style (shorter & calmer vs. energetic vs. detailed) — never claims to diagnose mental health
- Subtle, non-intrusive mood indicator in the UI

**Structured generation**
- Study plans, interview prep plans, learning roadmaps, resume feedback, professional emails/messages, cover letters, project ideas, notes, checklists, timelines — rendered with appropriate structure instead of forcing everything into plain text

**Product experience**
- Command menu (`Ctrl/Cmd + K`) for quick actions
- Fully responsive: desktop, tablet, and mobile (dedicated mobile navigation)
- Keyboard navigation, focus states, semantic HTML, `prefers-reduced-motion` support
- JWT authentication with BCrypt password hashing

---

## Tech stack

**Frontend:** React 19 + Vite, Tailwind CSS v4, Framer Motion, Lucide React, React Router, Axios, react-markdown + react-syntax-highlighter

**Backend:** Java 17, Spring Boot 3, Spring Security, JWT (jjwt), BCrypt, Apache PDFBox, Apache POI

**Database:** MySQL 8

**AI:** Provider-agnostic abstraction over any OpenAI-compatible `/chat/completions` endpoint (OpenAI, Azure OpenAI, OpenRouter, Groq, Together AI, self-hosted gateways, etc.)

---

## Architecture

```
Frontend (React/Vite)  ──HTTP/JWT──▶  Backend (Spring Boot)  ──HTTP──▶  AI Provider
                                              │
                                              ▼
                                          MySQL
```

Backend responsibilities are cleanly separated:

- `controller` — thin REST endpoints
- `service` — business logic (chat orchestration, conversations, documents, memory, mood, auth)
- `repository` — Spring Data JPA repositories
- `entity` — JPA entities
- `dto` — request/response contracts
- `security` — JWT issuing/validation, auth filter, security config
- `ai` — provider-agnostic AI abstraction (`AIProvider` interface + implementations)
- `document` — PDF/DOCX/TXT extraction & chunking
- `memory` — long-term memory extraction heuristics
- `mood` — conversational tone detection
- `exception` — centralized error handling

The `AIProvider` interface means swapping OpenAI for Anthropic, Gemini, or a local model later is a matter of adding one new class and one line in `AIProviderFactory` — no other code changes.

---

## Folder structure

```
DYORA/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/dyora/
│       │   ├── ai/            AIProvider abstraction + OpenAI-compatible implementation
│       │   ├── config/        Security & CORS configuration
│       │   ├── controller/    REST controllers
│       │   ├── document/      PDF/DOCX/TXT extraction + chunking
│       │   ├── dto/           Request/response DTOs
│       │   ├── entity/        JPA entities
│       │   ├── exception/     Custom exceptions + global handler
│       │   ├── memory/        Long-term memory extraction
│       │   ├── mood/          Mood/tone detector
│       │   ├── repository/    Spring Data repositories
│       │   ├── security/      JWT utilities & filter
│       │   ├── service/       Business logic
│       │   └── DyoraApplication.java
│       └── resources/application.yml
├── frontend/
│   └── src/
│       ├── api/            Axios client
│       ├── components/     chat/, documents/, layout/, orb/, ui/
│       ├── context/        Auth, Theme, CommandPalette
│       ├── hooks/
│       ├── layouts/        AppLayout, AuthLayout
│       ├── pages/          Landing, Login, Register, Chat, Documents, Settings
│       ├── services/       API service modules
│       ├── App.jsx / main.jsx
│       └── index.css       Design system
├── database/schema.sql
├── docs/
├── .env.example
├── .gitignore
└── README.md
```

---

## Requirements

- Java 17+
- Maven 3.9+ (or use your IDE's bundled Maven)
- Node.js 18+ and npm
- MySQL 8+
- An API key for any OpenAI-compatible LLM provider

---

## Environment setup

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

Never commit `.env` — only `.env.example` is tracked in git.

Key variables:

| Variable | Description |
|---|---|
| `AI_API_KEY` | Your LLM provider API key |
| `AI_BASE_URL` | Base URL of the OpenAI-compatible API (e.g. `https://api.openai.com/v1`) |
| `AI_MODEL` | Model name (e.g. `gpt-4o-mini`) |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | MySQL connection |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins for CORS |
| `MAX_FILE_SIZE` | Max upload size (Spring format, e.g. `15MB`) |

Spring Boot reads these via `${VAR_NAME:default}` placeholders in `application.yml`, so you can also export them directly as OS environment variables instead of using a `.env` file.

---

## Database setup

Option A — let Hibernate create the schema automatically (default, `ddl-auto: update`): just make sure a `dyora` database exists or is creatable by your MySQL user, then start the backend.

Option B — run the schema manually:

```bash
mysql -u root -p < database/schema.sql
```

---

## Backend setup

```bash
cd backend
mvn clean install
```

> Note: this repository is built and organized to run with a standard Maven Central setup. If your environment restricts network access to Maven Central, point `mvn` at an internal mirror in `~/.m2/settings.xml`.

---

## Frontend setup

```bash
cd frontend
npm install
```

---

## Running locally

**Backend** (from `backend/`):

```bash
export $(cat ../.env | xargs)   # or configure env vars in your IDE run config
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`.

**Frontend** (from `frontend/`):

```bash
npm run dev
```

The app will be available at `http://localhost:5173`. The dev server proxies `/api/*` requests to `http://localhost:8080` (see `vite.config.js`).

**Production build:**

```bash
npm run build
```

---

## API documentation

All endpoints are prefixed with `/api`. Authenticated endpoints require `Authorization: Bearer <token>`.

**Auth**
```
POST /api/auth/register   { name, email, password } → { token, userId, name, email }
POST /api/auth/login      { email, password }        → { token, userId, name, email }
```

**Conversations**
```
GET    /api/conversations
POST   /api/conversations                 { title? }
GET    /api/conversations/{id}
PATCH  /api/conversations/{id}            { title }
DELETE /api/conversations/{id}
GET    /api/conversations/{id}/messages
```

**Chat**
```
POST /api/chat   { conversationId?, message, documentId? } → { conversationId, messageId, content, responseType, detectedMood }
```

**Documents**
```
POST   /api/documents/upload        multipart/form-data: file
GET    /api/documents
GET    /api/documents/{id}
DELETE /api/documents/{id}
POST   /api/documents/{id}/ask            { question }
POST   /api/documents/{id}/summary
POST   /api/documents/{id}/mcqs?count=10
POST   /api/documents/{id}/flashcards
POST   /api/documents/{id}/notes
POST   /api/documents/{id}/study-plan?timeframe=3%20days
```

**Memory**
```
GET    /api/memory
DELETE /api/memory/{id}
DELETE /api/memory
```

**Mood**
```
POST /api/mood/analyze   { text } → { mood, intensity, suggestedTone }
```

**Settings**
```
GET /api/settings
PUT /api/settings   { responseLength?, personality?, preferredLanguage?, theme? }
```

---

## AI provider configuration

DYORA never talks to an LLM directly from the frontend — all calls go through the backend, keeping API keys server-side.

The `AIProvider` interface (`backend/.../ai/AIProvider.java`) is implemented by `OpenAICompatibleProvider`, which works with any OpenAI-style `/chat/completions` endpoint. Configure it purely through environment variables:

```
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai-compatible
```

To add a new provider (Anthropic, Gemini, a local model server, etc.), implement `AIProvider`, annotate it as a `@Component`, and register it in `AIProviderFactory` — no other application code needs to change.

---

## PDF / document processing

- **Extraction:** Apache PDFBox for PDF, Apache POI for DOCX, plain UTF-8 read for TXT
- **Chunking:** simple overlapping character-window chunks (`ChunkingService`), designed so it can be swapped for a token-aware/embedding-based chunker feeding a vector database later without touching calling code
- **Retrieval:** naive keyword-overlap scoring selects the most relevant chunks for a given question (`ChunkingService.findRelevantChunks`) — a placeholder for future embeddings/vector search
- Document Q&A is explicitly instructed to say when an answer isn't present in the document, rather than inventing one
- Encrypted/password-protected PDFs, oversized files, and unsupported formats are rejected with clear error messages

---

## Mood detection

`MoodDetector` is a transparent, keyword/pattern-based classifier — not a clinical tool. It only reads the tone of the *current message* to adjust DYORA's response style (calmer/shorter vs. energetic vs. detailed). It never labels or diagnoses the user, and the UI only ever shows a small, non-intrusive indicator.

---

## Memory system

- **Short-term:** the current conversation's message history is passed to the model on each turn (bounded to the most recent ~20 turns)
- **Long-term:** `MemoryExtractor` only captures explicit, structured signals (e.g. "I want to become a backend engineer", "I'm learning Rust", "I'm building a chatbot") — it does not attempt to infer or store sensitive personal information from general conversation
- Users can view, delete individual memories, or clear everything from **Settings → Memory**

---

## Security notes

- Passwords hashed with BCrypt (strength 12), never stored or logged in plain text
- Stateless JWT authentication; tokens signed with HMAC-SHA256 using `JWT_SECRET`
- CORS restricted to `ALLOWED_ORIGINS`
- File upload validation: type allow-list (PDF/DOCX/TXT) and size limit (`MAX_FILE_SIZE`)
- No API keys or secrets are ever sent to or stored in the frontend
- Global exception handler ensures stack traces and internal errors are never exposed to clients
- `.env` is git-ignored; only `.env.example` is committed

---

## Future improvements

- Real token-streaming (SSE/WebSocket) instead of single-shot responses
- Vector database integration (pgvector/Pinecone/Weaviate) for semantic document retrieval, replacing the current keyword-overlap heuristic
- OAuth/social login
- Multi-file document workspaces and cross-document comparison
- Voice input/output
- Team/shared workspaces
