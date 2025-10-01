# Firebase Backend Setup Guide

This guide will help you set up and deploy the Firebase backend for the AI Notes Summarizer application.

## Prerequisites

1. Node.js (v18 or higher)
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. A Firebase project (the one you're already using for auth)
4. OpenAI API key (optional, for AI-powered summarization)

## Setup Steps

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Functions

Already done in this project, but if starting fresh:

```bash
firebase init functions
```

### 4. Install Dependencies

```bash
cd functions
npm install
```

### 5. Configure Environment Variables

Set your OpenAI API key (optional but recommended for better summaries):

```bash
firebase functions:config:set openai.key="your-openai-api-key"
```

For local development, create `functions/.env`:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 6. Deploy Functions

Deploy all functions:

```bash
firebase deploy --only functions
```

Or deploy specific functions:

```bash
firebase deploy --only functions:summarize
firebase deploy --only functions:uploadFile
```

### 7. Update Frontend Configuration

After deployment, update your frontend `.env` file with the function URLs:

```env
VITE_APP_API_URL=https://us-central1-ai-notes-summarize.cloudfunctions.net
```

The endpoints will be:
- Summarize: `https://us-central1-ai-notes-summarize.cloudfunctions.net/summarize`
- Upload: `https://us-central1-ai-notes-summarize.cloudfunctions.net/uploadFile`

## Local Development

### Run Functions Locally

```bash
cd functions
npm run serve
```

This starts the Firebase emulator at `http://localhost:5001`

Update your frontend `.env.local` for local development:

```env
VITE_APP_API_URL=http://localhost:5001/ai-notes-summarize/us-central1
```

## Firebase Functions Overview

### 1. `summarize` Function

**Endpoint:** POST `/summarize`

**Request Body:**
```json
{
  "text": "Your text to summarize..."
}
```

**Response:**
```json
{
  "original": "Original text",
  "summary": "Generated summary",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}
```

**Features:**
- Uses OpenAI GPT-3.5-turbo for intelligent summarization
- Falls back to basic summarization if API key is not configured
- Automatically saves to Firestore for authenticated users
- Supports guest users without storage

### 2. `uploadFile` Function

**Endpoint:** POST `/uploadFile`

**Request:** multipart/form-data with file

**Response:**
```json
{
  "filename": "document.pdf",
  "extractedText": "Extracted text from file...",
  "summary": "Generated summary",
  "keyPoints": ["Key point 1", "Key point 2"],
  "fileType": "application/pdf",
  "fileSize": 123456
}
```

**Features:**
- Supports multiple file formats: PDF, DOCX, TXT, MD, RTF, Images
- OCR processing for images using Tesseract.js
- Automatic text extraction and summarization
- 10MB file size limit
- 2GB memory allocation for processing large files
- Saves to Firestore for authenticated users

## File Processing Capabilities

### Supported File Types

1. **Text Files** (.txt, .md, .rtf)
   - Direct text reading

2. **PDF Files** (.pdf)
   - Uses pdf-parse library
   - Extracts text from all pages

3. **Word Documents** (.docx)
   - Uses mammoth.js
   - Extracts plain text content

4. **Images** (.jpg, .jpeg, .png, .gif, .bmp, .webp)
   - Uses Tesseract.js for OCR
   - Pre-processes images with sharp for better accuracy
   - Grayscale conversion, normalization, and sharpening

## Firestore Data Structure

```
users (collection)
  └── {userId} (document)
      ├── email: string
      ├── displayName: string
      ├── photoURL: string
      ├── createdAt: timestamp
      ├── lastLoginAt: timestamp
      └── summaries (subcollection)
          └── {summaryId} (document)
              ├── originalContent: string
              ├── summarizedContent: string
              ├── keyPoints: array
              ├── filename: string (optional)
              ├── fileType: string (optional)
              ├── wordCount: number (optional)
              └── createdAt: timestamp
```

## Security Rules

The Firestore security rules ensure:
- Users can only read/write their own data
- Authentication is required for all operations
- Guest users rely on session storage only

## Cost Optimization

### Firebase Functions Pricing

- **Free Tier:**
  - 2M invocations/month
  - 400,000 GB-seconds, 200,000 GHz-seconds compute time
  - 5GB egress

- **Tips to Reduce Costs:**
  - Use caching for frequently summarized texts
  - Implement rate limiting for API calls
  - Monitor function execution time
  - Use OpenAI API sparingly (or use basic summarization)

### OpenAI API Costs

- GPT-3.5-turbo: ~$0.002 per 1K tokens
- For a typical 1000-word document: ~$0.003-0.005 per summary
- The function falls back to basic summarization if API key is missing

## Monitoring and Logs

View function logs:

```bash
firebase functions:log
```

Or use the Firebase Console:
https://console.firebase.google.com/project/ai-notes-summarize/functions

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - The functions include CORS headers
   - Check that OPTIONS requests are handled

2. **Authentication Errors**
   - Verify Firebase Auth is properly configured
   - Check token verification in function code

3. **File Upload Timeouts**
   - Large files may take time to process
   - Function timeout is set to 540 seconds (9 minutes)
   - Consider increasing timeout for very large files

4. **Memory Errors**
   - Function has 2GB memory for file processing
   - Very large images may still cause issues
   - Consider reducing image size before upload

### Debug Mode

To see detailed logs during local development:

```bash
export DEBUG=* && npm run serve
```

## Deployment Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Functions dependencies installed
- [ ] Environment variables configured
- [ ] Functions deployed successfully
- [ ] Frontend `.env` updated with function URLs
- [ ] Firestore security rules deployed
- [ ] Storage rules deployed (if using Firebase Storage)
- [ ] Test all endpoints with authenticated and guest users
- [ ] Monitor function logs for errors

## Production Recommendations

1. **Enable Function Monitoring:**
   - Set up Firebase Performance Monitoring
   - Configure error alerting

2. **Implement Rate Limiting:**
   - Add rate limiting to prevent abuse
   - Use Firebase App Check

3. **Add Caching:**
   - Cache frequent summaries
   - Use Cloud Firestore or Cloud Memorystore

4. **Optimize Cold Starts:**
   - Use minimum instances for critical functions
   - Consider using Cloud Run instead for better performance

5. **Add Request Validation:**
   - Validate all inputs thoroughly
   - Sanitize file uploads

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review function logs: `firebase functions:log`
3. Test locally with emulators
4. Check Firestore security rules

## Next Steps

After deploying the backend:
1. Test file uploads with different formats
2. Verify authentication flow works
3. Check Firestore data is being saved correctly
4. Monitor costs in Firebase Console
5. Set up billing alerts

---

**Backend is ready! Your AI Notes Summarizer now has a complete serverless backend powered by Firebase.**
