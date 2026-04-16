# 🏗️ Architecture — Collaborative Document Editor

## 📌 Overview
This project is a lightweight collaborative document editor inspired by Google Docs.  
It is built using the **MERN stack with TypeScript**, focusing on clean architecture, modular design, and production-ready practices.

The system enables users to create, edit, upload, and share documents with a smooth and modern UI experience.

---

## ✨ Features

- 🔐 **Authentication**: JWT-based login (seeded users)
- 📄 **Documents**:
  - Create, rename, edit, save, reopen
  - Stored as TipTap JSON
- ✍️ **Rich Text Editor**:
  - Bold, Italic, Underline
  - Headings (H1–H3)
  - Bullet & Numbered Lists
- 💾 **Auto-save**:
  - Debounced (2s)
  - Visual indicator ("Saving...", "Saved")
- 🤝 **Sharing**:
  - Share via email (seeded users)
  - Read/Write access
- 📂 **File Upload**:
  - Supports `.txt`, `.md`
  - Converts to editable document

---

## ⚙️ Tech Stack

### Frontend
- React (TypeScript)
- Tailwind CSS
- shadcn/ui
- Aceternity UI
- TipTap Editor
- React Query / Zustand

### Backend
- Node.js + Express (TypeScript)
- MongoDB (Mongoose)
- JWT Authentication

### Deployment
- Frontend → Vercel  
- Backend → Render  
- Database → MongoDB Atlas  

---

## 🧠 Architecture Overview

The application follows a **layered architecture**:

### Backend Layers

- **Routes** → Define API endpoints
- **Controllers** → Handle request/response
- **Services** → Business logic
- **Models** → Database schema
- **Utils/Middleware** → Shared helpers & cross-cutting concerns

---

### Frontend Layers

- **Pages** → Route-level UI
- **Components** → Reusable UI blocks
- **Hooks** → State + logic abstraction
- **Services** → API calls
- **Utils** → Helpers

---

## 📁 Folder Structure

### 🖥️ Backend (`/server`)
server/
├── src/
│ ├── config/
│ │ └── env.ts
│ ├── controllers/
│ │ ├── authController.ts
│ │ ├── docController.ts
│ │ ├── shareController.ts
│ │ └── uploadController.ts
│ ├── middleware/
│ │ ├── authMiddleware.ts
│ │ └── errorMiddleware.ts
│ ├── models/
│ │ ├── userModel.ts
│ │ └── documentModel.ts
│ ├── routes/
│ │ ├── authRoutes.ts
│ │ ├── docRoutes.ts
│ │ └── uploadRoutes.ts
│ ├── services/
│ │ ├── docService.ts
│ │ └── uploadService.ts
│ ├── utils/
│ │ ├── jwt.ts
│ │ ├── fileParser.ts
│ │ └── asyncHandler.ts
│ ├── scripts/
│ │ └── seedUsers.ts
│ ├── app.ts
│ └── index.ts
├── package.json
├── tsconfig.json
└── .env

---

### 🌐 Frontend (`/client`)
client/
├── src/
│ ├── components/
│ │ ├── EditorToolbar.tsx
│ │ ├── DocumentList.tsx
│ │ ├── ShareModal.tsx
│ │ └── UploadButton.tsx
│ ├── pages/
│ │ ├── Dashboard.tsx
│ │ ├── EditorPage.tsx
│ │ └── Login.tsx
│ ├── hooks/
│ │ └── useDocument.ts
│ ├── services/
│ │ └── api.ts
│ ├── store/
│ │ └── useStore.ts
│ ├── utils/
│ │ └── debounce.ts
│ ├── App.tsx
│ └── main.tsx
├── package.json
└── tailwind.config.js
