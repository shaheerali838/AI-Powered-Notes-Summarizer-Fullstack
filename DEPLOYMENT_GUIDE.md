# Complete Deployment Guide

This guide covers deploying both the frontend and Firebase backend for the AI Notes Summarizer application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                    (React + Vite)                            │
│                                                              │
│  • File Upload Interface                                     │
│  • Text Input Area                                           │
│  • Summary Display                                           │
│  • History Management                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTPS Requests
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Firebase Backend                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Cloud Functions                             │  │
│  │  • summarize() - Text summarization                   │  │
│  │  • uploadFile() - File processing & extraction        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Firebase Auth                               │  │
│  │  • Email/Password                                     │  │
│  │  • Google OAuth                                       │  │
│  │  • Facebook OAuth                                     │  │
│  │  • Anonymous (Guest)                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Firestore Database                          │  │
│  │  users/{userId}                                       │  │
│  │    └── summaries/{summaryId}                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           OpenAI API (Optional)                       │  │
│  │  • GPT-3.5-turbo for intelligent summaries            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project
- OpenAI API key (optional, for AI summaries)
- Vercel/Netlify account (for frontend hosting)

## Part 1: Firebase Backend Setup

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Navigate to Functions Directory

```bash
cd functions
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Configure OpenAI (Optional)

For AI-powered summaries, configure your OpenAI API key:

```bash
firebase functions:config:set openai.key="sk-your-api-key-here"
```

For local development, create `functions/.env`:

```
OPENAI_API_KEY=sk-your-api-key-here
```

### Step 6: Deploy Firebase Backend

Deploy functions:

```bash
firebase deploy --only functions
```

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

Deploy Firestore indexes:

```bash
firebase deploy --only firestore:indexes
```

Deploy everything at once:

```bash
firebase deploy
```

### Step 7: Get Function URLs

After deployment, Firebase will show your function URLs:

```
Function URL (summarize): https://us-central1-ai-notes-summarize.cloudfunctions.net/summarize
Function URL (uploadFile): https://us-central1-ai-notes-summarize.cloudfunctions.net/uploadFile
```

## Part 2: Frontend Deployment

### Option A: Vercel (Recommended)

#### Quick Deploy

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure environment variables:

```env
VITE_APP_API_URL=https://us-central1-ai-notes-summarize.cloudfunctions.net
```

5. Deploy

#### CLI Deploy

```bash
npm install -g vercel
vercel login
vercel
```

### Option B: Netlify

#### Quick Deploy

1. Build the project:

```bash
npm run build
```

2. Deploy to Netlify:

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

3. Set environment variables in Netlify dashboard

### Option C: Firebase Hosting

Deploy frontend to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

## Part 3: Environment Configuration

### Frontend Environment Variables

Create `.env` in the root directory:

```env
# Firebase Backend API URL
VITE_APP_API_URL=https://us-central1-ai-notes-summarize.cloudfunctions.net

# Optional: Supabase (if needed)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local Development Environment

Create `.env.local`:

```env
# For local Firebase emulator
VITE_APP_API_URL=http://localhost:5001/ai-notes-summarize/us-central1
```

## Part 4: Testing

### Test Backend Functions Locally

1. Start Firebase emulators:

```bash
cd functions
npm run serve
```

2. Functions will be available at:
   - Summarize: `http://localhost:5001/ai-notes-summarize/us-central1/summarize`
   - Upload: `http://localhost:5001/ai-notes-summarize/us-central1/uploadFile`

### Test Frontend Locally

```bash
npm run dev
```

Open `http://localhost:5173`

### Test Production Build Locally

```bash
npm run build
npm run preview
```

## Part 5: Verification Checklist

### Backend Verification

- [ ] Functions deployed successfully
- [ ] Function URLs are accessible
- [ ] CORS is working (no CORS errors in browser)
- [ ] Authentication works with Firebase Auth
- [ ] Firestore rules deployed
- [ ] Test summarize endpoint with Postman/curl
- [ ] Test file upload with different file types
- [ ] Check logs: `firebase functions:log`

### Frontend Verification

- [ ] Site is accessible at production URL
- [ ] Authentication flow works (login/signup)
- [ ] File uploads work
- [ ] Text summarization works
- [ ] History page shows saved summaries
- [ ] Guest mode works without auth
- [ ] Responsive design works on mobile
- [ ] No console errors

## Part 6: Monitoring & Maintenance

### View Function Logs

```bash
firebase functions:log
```

Or in Firebase Console:
https://console.firebase.google.com/project/ai-notes-summarize/functions

### Monitor Costs

Firebase Console → Usage & Billing:
- Function invocations
- Firestore reads/writes
- Storage usage
- Network egress

### Set Up Alerts

1. Go to Firebase Console
2. Navigate to "Alerts"
3. Set up budget alerts
4. Configure performance monitoring

## Part 7: Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem:** CORS policy blocking requests

**Solution:**
- Ensure functions include proper CORS headers
- Check OPTIONS request handling
- Verify frontend URL in CORS config

#### 2. Function Timeouts

**Problem:** File processing taking too long

**Solution:**
- Increase function timeout in `functions/index.js`
- Reduce file size before upload
- Use smaller images

#### 3. Authentication Errors

**Problem:** Token verification failing

**Solution:**
- Check Firebase config in frontend
- Verify token in request headers
- Ensure Auth domain matches

#### 4. File Upload Failures

**Problem:** Files not processing correctly

**Solution:**
- Check file size (must be < 10MB)
- Verify file type is supported
- Check function logs for errors

#### 5. Firestore Permission Errors

**Problem:** Can't read/write to Firestore

**Solution:**
- Deploy firestore.rules
- Verify user authentication
- Check security rules match your structure

## Part 8: Performance Optimization

### Frontend Optimization

1. **Code Splitting:**
```javascript
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
```

2. **Image Optimization:**
- Use WebP format
- Lazy load images
- Compress before upload

3. **Bundle Size:**
- Analyze with `npm run build -- --stats`
- Remove unused dependencies
- Use dynamic imports

### Backend Optimization

1. **Function Cold Starts:**
- Set minimum instances for critical functions
- Use Cloud Run for better performance

2. **Caching:**
- Cache frequent summaries in Firestore
- Implement client-side caching

3. **Rate Limiting:**
- Add rate limits to prevent abuse
- Use Firebase App Check

## Part 9: Security Hardening

### Firestore Security

Ensure rules are restrictive:

```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Function Security

1. Validate all inputs
2. Sanitize file uploads
3. Implement rate limiting
4. Use App Check
5. Never expose API keys in frontend

### Authentication Security

1. Enable email verification
2. Configure password policies
3. Enable MFA (Multi-Factor Authentication)
4. Monitor suspicious activity

## Part 10: Scaling Considerations

### When to Scale

- Function invocations > 1M/month
- Firestore reads > 50K/day
- Response times > 3 seconds
- Cost exceeding budget

### Scaling Strategies

1. **Caching Layer:**
   - Redis/Memorystore for frequent queries
   - CDN for static assets

2. **Database Optimization:**
   - Add composite indexes
   - Denormalize data where needed
   - Archive old summaries

3. **Function Optimization:**
   - Increase memory allocation
   - Use Cloud Run for high-traffic functions
   - Implement background processing

4. **Frontend Optimization:**
   - Implement pagination
   - Virtual scrolling for history
   - Service workers for offline support

## Support & Resources

### Documentation

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [OpenAI API Docs](https://platform.openai.com/docs)

### Community

- Firebase Discord
- Stack Overflow
- GitHub Issues

---

**Congratulations! Your AI Notes Summarizer is now fully deployed with a complete serverless backend.**
