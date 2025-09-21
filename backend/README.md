# AI Notes Summarizer Backend

A robust Node.js + Express backend for the AI Notes Summarizer application with Firebase integration, file processing, and AI-powered text summarization.

## 🚀 Features

- **File Processing**: Support for TXT, PDF, DOCX, and image files (OCR)
- **AI Summarization**: Intelligent text summarization with key point extraction
- **Firebase Integration**: Authentication (Google, Facebook, Guest) and Firestore database
- **RESTful APIs**: Clean, consistent API endpoints
- **Security**: Rate limiting, CORS, input validation, and helmet security headers
- **Scalable**: Designed for Vercel serverless deployment

## 📁 Project Structure

```
backend/
├── index.js                 # Main application entry point
├── package.json            # Dependencies and scripts
├── vercel.json            # Vercel deployment configuration
├── config/
│   ├── config.js          # Application configuration
│   └── firebase.js        # Firebase Admin SDK setup
├── controllers/
│   ├── summarizeController.js
│   └── historyController.js
├── middleware/
│   └── validateInput.js   # Input validation and auth middleware
├── routes/
│   ├── summarize.js       # Text summarization routes
│   ├── history.js         # User history routes
│   └── notes.js           # File upload and processing routes
├── services/
│   ├── fileProcessorService.js  # File processing logic
│   ├── summarizerService.js     # AI summarization logic
│   └── historyService.js        # Database operations
├── utils/
│   └── responseFormatter.js     # Consistent API responses
└── api/
    └── ocr.js             # OCR-specific endpoints
```

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase credentials:
   ```env
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 API Endpoints

### Summarization
- `POST /api/summarize` - Generate summary from text input
  ```json
  {
    "text": "Your text content here..."
  }
  ```

### File Processing
- `POST /api/notes/upload` - Upload and process files (TXT, PDF, DOCX, Images)
- `POST /api/ocr` - Extract text from files using OCR

### History Management
- `GET /api/history` - Get user's summary history
- `GET /api/history/:id` - Get specific summary
- `DELETE /api/history/:id` - Delete summary

### Health Check
- `GET /health` - Service health status

## 🔐 Authentication

The backend supports three authentication modes:

1. **Google OAuth** - Via Firebase Auth
2. **Facebook OAuth** - Via Firebase Auth  
3. **Guest Mode** - Anonymous access with session-only data

Authentication is handled via Bearer tokens in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

## 📄 File Support

| File Type | Extension | Processing Method |
|-----------|-----------|-------------------|
| Text | .txt, .md, .rtf | Direct text reading |
| PDF | .pdf | PDF.js text extraction |
| Word | .docx | Mammoth.js processing |
| Images | .jpg, .png, .gif, .bmp, .webp | Tesseract.js OCR |

**File Limits:**
- Maximum size: 10MB per file
- Text limit: 50,000 characters for summarization

## 🗄️ Database Schema

### Firestore Structure
```
users/
  {uid}/
    summaries/
      {summaryId}/
        - originalContent: string
        - summarizedContent: string
        - keyPoints: array
        - filename?: string
        - fileType: string
        - fileSize?: number
        - wordCount: number
        - compressionRatio: number
        - createdAt: timestamp
        - updatedAt: timestamp
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard**
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `FRONTEND_URL`

### Environment Variables for Production

Set these in your Vercel project settings:

```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific frontend origins
- **Helmet**: Security headers
- **Input Validation**: File type, size, and content validation
- **Firebase Auth**: Secure token-based authentication

## 🧪 Testing

```bash
# Run development server
npm run dev

# Test health endpoint
curl http://localhost:5000/health

# Test summarization
curl -X POST http://localhost:5000/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Your text to summarize here"}'
```

## 📝 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `FRONTEND_URL` is set correctly
   - Check that your frontend domain is in the CORS origins list

2. **Firebase Connection Issues**
   - Verify Firebase credentials are correct
   - Ensure private key formatting includes proper line breaks

3. **File Processing Errors**
   - Check file size limits (10MB max)
   - Verify file types are supported
   - For PDF issues, ensure PDF.js worker is properly configured

4. **OCR Not Working**
   - Tesseract.js requires good image quality
   - Ensure images have clear, readable text

## 📄 License

MIT License - see LICENSE file for details.