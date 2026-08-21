<div align="center">

# 🧠 AI-Powered Notes Summarizer

**A full-stack, AI-driven document intelligence platform that transforms lengthy documents, notes, and images into structured, high-yield summaries.**

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

<br />

[Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Environment Variables](#-environment-variables) • [API Documentation](#-api-documentation) • [Deployment](#-deployment-guide-vercel)

</div>

---

## ✨ Key Features

- **📄 Multi-Format Document Ingestion**
  - Extract readable content from **PDF**, **DOCX**, **RTF**, **TXT**, **Markdown**, and **CSV** files.
  - Built-in **Optical Character Recognition (OCR)** powered by Tesseract.js for scanned images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`).

- **⚡ Google Gemini AI Summarization**
  - Powered by Google Gemini (`gemini-3.5-flash-lite` / `gemini-1.5-flash`) for rapid, high-context comprehension.
  - **Tone Controls**: Choose between *Academic*, *Executive*, or *Simple Plain English*.
  - **Depth & Length Controls**: Select *Concise* (high-priority bullets), *Balanced* (standard overview), or *Deep* (hierarchical nested outline).

- **🔐 Flexible Authentication & Guest Mode**
  - **Firebase Authentication**: Sign in via Google, Facebook, or Email/Password.
  - **Guest Mode**: Full feature access without sign-in, persisting history temporarily in `sessionStorage`.
  - **Cloud Sync**: Persistent history synchronization in **Cloud Firestore** for logged-in accounts.

- **🎨 Modern & Responsive User Interface**
  - Crafted with React 18, Vite, and Tailwind CSS.
  - Collapsible sidebar with quick history previews and item management.
  - Single-click copy to clipboard, dynamic word counting, and instant output export.

- **🛡️ Enterprise-Grade Backend Security**
  - In-memory rate limiting with automated token window management.
  - Helmet security headers and HTTP compression.
  - Request logging and structured Joi input validation.
  - Production-ready serverless compatibility for **Vercel**.

---

## 🏗️ Architecture

```
AI-Powered-Notes-Summarizer-Monorepo/
│
├── backend/                       # Node.js & Express REST API
│   ├── config/                    # App constants, Firebase Admin SDK
│   ├── controllers/               # Route request & response handlers
│   ├── middleware/                # Rate limiter, logger, file upload (Multer)
│   ├── routes/                    # API endpoints (/summarize, /notes, /history)
│   ├── services/                  # Gemini AI service, Document & OCR processors
│   ├── utils/                     # Formatters, loggers & validation helpers
│   ├── index.js                   # Application entry point & serverless export
│   ├── vercel.json                # Serverless deployment configuration
│   └── package.json               # Backend dependencies
│
├── frontend/                      # React SPA (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/            # Header, Sidebar, Modals, Summary Cards
│   │   ├── context/               # AuthContext, NotesContext, UIContext
│   │   ├── pages/                 # HomePage, HistoryPage, SettingsPage
│   │   ├── config/                # Firebase Client SDK configuration
│   │   └── index.css              # Global styling & Tailwind directives
│   ├── vercel.json                # Client-side SPA routing rewrites
│   └── package.json               # Frontend dependencies
│
└── README.md                      # Monorepo documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/app/apikey))
- *(Optional)* A **Firebase Project** for cloud authentication & Firestore sync.

---

### 1. Clone the Repository
```bash
git clone https://github.com/shaheerali838/AI-Powered-Notes-Summarizer-Fullstack.git
cd AI-Powered-Notes-Summarizer-Monorepo
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Configure your .env file with your GEMINI_API_KEY
# Start the backend development server (default port: 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env

# Start the Vite development server (default: http://localhost:5173)
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | No | `5000` | Local server port |
| `NODE_ENV` | Yes | `development` | Environment (`development` \| `production`) |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API Key |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Model identifier |
| `PROD_ORIGIN` | No | `https://*.vercel.app` | Allowed CORS origin for production |
| `ALLOWED_ORIGINS` | No | — | Comma-separated list of additional allowed origins |
| `ENABLE_REQUEST_LOGGING` | No | `true` | Enable Morgan / custom console logging |
| `FIREBASE_PROJECT_ID` | No | — | Firebase Admin project ID |
| `FIREBASE_CLIENT_EMAIL` | No | — | Firebase Admin service account email |
| `FIREBASE_PRIVATE_KEY` | No | — | Firebase Admin service account private key |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_APP_API_URL` | No | `http://localhost:5000` | Base URL of the backend API |

---

## 📡 API Documentation

### 1. Health Check
`GET /health`

**Response:**
```json
{
  "status": "healthy",
  "uptime": 120.45,
  "timestamp": "2026-08-21T12:00:00.000Z"
}
```

---

### 2. Summarize Raw Text
`POST /api/summarize`

**Headers:**
`Content-Type: application/json`

**Request Body:**
```json
{
  "text": "Artificial intelligence is revolutionizing modern productivity...",
  "tone": "academic",
  "length": "balanced",
  "model": "gemini-3.5-flash-lite"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Artificial intelligence is fundamentally transforming workflows...",
    "keyPoints": [
      "1. Accelerates analytical processing across multiple domains.",
      "2. Enables automated synthesis of unstructured textual assets."
    ],
    "original": "...",
    "model": "gemini-3.5-flash-lite"
  }
}
```

---

### 3. Upload & Summarize Document
`POST /api/notes/upload`

**Headers:**
`Content-Type: multipart/form-data`

**Form Data:**
- `file`: `[Binary document or image]`
- `tone`: `academic` | `executive` | `simple`
- `length`: `concise` | `balanced` | `deep`

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "quarterly-report.pdf",
    "extractedText": "...",
    "summary": "...",
    "keyPoints": ["..."],
    "fileType": "application/pdf",
    "fileSize": 1048576
  }
}
```

---

## ☁️ Deployment Guide (Vercel)

Both `backend` and `frontend` are decoupled and pre-configured with their own `vercel.json` for independent Vercel deployment.

### 🔹 Backend Deployment
1. Go to the [Vercel Dashboard](https://vercel.com/new) and import the repository.
2. Under **Project Settings**, set:
   - **Root Directory**: `backend`
   - **Framework Preset**: `Other`
3. Add the **Environment Variables**:
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `NODE_ENV`: `production`
4. Click **Deploy**. Note your generated URL (e.g., `https://my-backend-api.vercel.app`).

### 🔹 Frontend Deployment
1. Import the same repository as a new Vercel project.
2. Under **Project Settings**, set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. Add the **Environment Variable**:
   - `VITE_APP_API_URL`: `https://my-backend-api.vercel.app`
4. Click **Deploy**.

---

## 🛡️ Security & Best Practices

- **Never commit `.env` files**: All sensitive credentials (`GEMINI_API_KEY`, Firebase private keys) are excluded via `.gitignore`.
- **CORS Protection**: Configured with dynamic origin validation supporting local development and secure Vercel production domains.
- **Payload Boundaries**: 10MB maximum file size limit and 50,000 maximum character limit per text submission.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
