# Lightweight Collaborative Document Editor (MERN)

Production-ready, lightweight document editor built with **MERN + TypeScript (strict)**, **Tailwind CSS**, and a **TipTap** rich text editor. Collaboration in v1 is implemented as **sharing + permissions** (not real-time multi-cursor editing).

## Features
- **Auth**: JWT-based login (seeded users only)
- **Documents**: create, rename, edit, save, reopen (content stored as TipTap JSON)
- **Rich text**: bold, italic, underline, headings (H1–H3), bullet/numbered lists
- **Auto-save**: debounced (2s) with Saving/Saved indicator
- **Sharing**: owner can share documents with other seeded users by email (read/write)
- **Upload**: `.txt` and `.md` (max 2MB) → converted into a new document

## Architecture (clean separation)
Backend follows a simple clean architecture style:
- **Routes**: HTTP wiring only (paths, middleware, controller binding)
- **Controllers**: request parsing + validation + calling a service (no business logic)
- **Services**: business rules (ownership, collaborator permission checks)
- **Models**: Mongoose schemas
- **Middleware**: auth + centralized error handling
- **Utils**: reusable helpers (async handler, API errors/responses, JWT helpers, etc.)

### Why TipTap?
- TipTap provides a modern, extensible rich-text editing experience with a clean JSON schema.

### Why JSON storage?
- **Pros**: preserves formatting/structure, easy to render back into TipTap, versionable in the future.\n- **Cons**: not directly human-readable, requires migrations if editor schema changes.

### Trade-offs in v1
- **No real-time collaboration** (no OT/CRDT, no WebSockets). Users can share access and edit, but concurrent edits are last-write-wins.

### Future improvements
- WebSockets + CRDT (e.g., Yjs) for real-time collaboration
- Version history (snapshots/diffs)
- Comments and suggestions

## Local development

### Backend (server)
1. Copy env file:
   - `cp server/.env.example server/.env` (Windows: copy manually)
2. Set a working MongoDB Atlas URI and JWT secret in `server/.env`.
3. Install and run:
   - `cd server`
   - `npm install`
   - `npm run seed`
   - `npm run dev`

Health endpoint: `GET /api/health`

### Frontend (frontend)
1. Copy env file:
   - `cp frontend/.env.example frontend/.env`
2. Install and run:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## API (summary)
- `POST /api/auth/login`
- `GET /api/docs`
- `POST /api/docs`
- `GET /api/docs/:id`
- `PUT /api/docs/:id`
- `DELETE /api/docs/:id`
- `POST /api/docs/:id/share`
- `POST /api/upload`

## Testing
Backend includes one Jest test for document creation:
- `cd server && npm test`

Uses `mongodb-memory-server` so it runs without a local MongoDB.

## Deployment
- **Frontend → Vercel**: set `VITE_API_URL` to your backend URL
- **Backend → Render/Railway**: set `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`
- **DB → MongoDB Atlas**

