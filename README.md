# AI-Powered Notes Summarizer

## Firebase & Vercel Public Deployment Guide

### Frontend (React)

- Uses only public Firebase config (REACT*APP*\*) in `src/config/firebaseClient.js`.
- Never include private keys or sensitive info in the frontend or in your repo.

### Backend (Vercel)

- Uses environment variables for all sensitive Firebase Admin credentials in `src/config/firebaseAdmin.js`.
- Never commit private keys or service account files.
- Set secrets in the Vercel dashboard (Settings → Environment Variables).

### API Security

- All backend API routes verify Firebase ID tokens.
- Never trust user input from the frontend for authentication.

### Environment Variables

- See `.env.local.sample` for required variables.
- `.env.local` and all secrets are gitignored.

### Deployment

- On Vercel, set all backend secrets as environment variables.
- Only public keys (REACT*APP*\*) are exposed to the frontend.

### Contributing

- Each contributor must set up their own Firebase project and secrets.
- Never commit `.env.local` or service account files.

---

**This project is safe for public release if you follow these instructions.**
