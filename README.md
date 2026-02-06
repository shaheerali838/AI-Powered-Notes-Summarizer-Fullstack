# 📝 AI-Powered Notes Summarizer - Backend

> A powerful backend API for intelligent document processing and text summarization using AI

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-lightgrey.svg)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange.svg)](https://firebase.google.com/)

## 🌟 Features

- **🤖 AI-Powered Summarization** - Generate concise summaries using OpenRouter API (DeepSeek)
- **📄 Multi-Format Support** - Process PDF, DOCX, and image files (OCR)
- **🔒 Secure Authentication** - Firebase Admin SDK for user authentication
- **📊 History Management** - Track and manage summarization history with pagination
- **🚀 Serverless Ready** - Optimized for Vercel deployment with lazy loading
- **⚡ High Performance** - Response compression, rate limiting, and efficient caching
- **📝 Request Logging** - Comprehensive logging with color-coded output
- **🛡️ Rate Limiting** - Prevent API abuse (100 requests per 15 minutes)
- **✅ Input Validation** - Robust validation and sanitization for all inputs
- **🌐 CORS Enabled** - Secure cross-origin resource sharing

## 📚 Tech Stack

### Core
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin** - Authentication & Firestore database

### AI & Processing
- **OpenRouter API** - AI summarization (DeepSeek model)
- **Tesseract.js** - OCR for image processing
- **pdf-parse** - PDF text extraction
- **Mammoth** - DOCX text extraction

### Security & Performance
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Compression** - Response compression (~70% size reduction)
- **Custom Rate Limiter** - API abuse prevention

### Development
- **Nodemon** - Development auto-reload
- **dotenv** - Environment variable management

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ installed
- Firebase project with Firestore enabled
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/AI-Powered-Notes-Summarizer-Backend.git
cd AI-Powered-Notes-Summarizer-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Firebase Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_private_key_here\n-----END PRIVATE KEY-----\n"

# CORS
PROD_ORIGIN=https://your-frontend-url.vercel.app
```

4. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Health Check

#### `GET /`
Get API status
```json
{
  "status": "API is working",
  "environment": "development",
  "timestamp": "2026-02-06T11:05:56.269Z",
  "version": "1.0.0"
}
```

#### `GET /health`
Get detailed health information
```json
{
  "status": "healthy",
  "uptime": 1234.56,
  "timestamp": "2026-02-06T11:05:56.269Z",
  "memory": { ... }
}
```

### Summarization

#### `POST /api/summarize`
Summarize plain text

**Request:**
```json
{
  "text": "Your long text to summarize..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "original": "Your text...",
    "summary": "Concise summary...",
    "keyPoints": ["Point 1", "Point 2"],
    "timestamp": "2026-02-06T11:05:56.269Z"
  }
}
```

**Validation:**
- Minimum text length: 10 characters
- Maximum text length: 50,000 characters

#### `POST /api/notes/upload`
Upload and process files (PDF, DOCX, Images)

**Request:**
- Form-data with `file` field
- Supported formats: PDF, DOCX, JPEG, PNG, GIF, BMP, TIFF, WEBP
- Maximum file size: 10MB

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "extractedText": "Extracted text...",
    "summary": "Summary...",
    "keyPoints": ["Point 1", "Point 2"]
  },
  "timestamp": "2026-02-06T11:05:56.269Z"
}
```

### History

#### `GET /api/history?page=1&limit=10`
Get summarization history with pagination

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-100, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id",
      "original": "Text...",
      "summary": "Summary...",
      "keyPoints": ["..."],
      "timestamp": "2026-02-06T11:05:56.269Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasMore": true
  },
  "timestamp": "2026-02-06T11:05:56.269Z"
}
```

#### `DELETE /api/history/:id`
Delete a history item

**Response:**
```json
{
  "success": true,
  "data": { "id": "doc_id" },
  "message": "History item deleted successfully",
  "timestamp": "2026-02-06T11:05:56.269Z"
}
```

### Authentication

#### `GET /api/auth/profile`
Get user profile (requires authentication)

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user_id",
      "email": "user@example.com",
      ...
    }
  },
  "message": "User profile fetched successfully"
}
```

## 🛠️ Project Structure

```
AI-Powered-Notes-Summarizer-Backend/
├── config/
│   ├── constants.js          # Application constants
│   ├── firebase.js            # Firebase exports
│   └── firebaseAdmin.js       # Firebase Admin initialization
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── notesController.js     # File upload & processing
│   └── summarizeController.js # Text summarization
├── middleware/
│   ├── authMiddleware.js      # JWT authentication
│   ├── rateLimiter.js         # Rate limiting
│   ├── requestLogger.js       # Request logging
│   ├── uploadFile.js          # File upload handling
│   └── validateInput.js       # Input validation
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── history.js             # History endpoints
│   ├── notes.js               # File upload endpoints
│   └── summarize.js           # Summarization endpoints
├── services/
│   ├── fileProcessor.js       # File text extraction
│   ├── historyServices.js     # Firestore operations
│   └── summarizerService.js   # AI summarization
├── utils/
│   ├── logger.js              # Logging utility
│   ├── responseFormatter.js   # API response formatting
│   └── validators.js          # Validation functions
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── index.js                   # Main server file
├── package.json               # Dependencies & scripts
├── vercel.json                # Vercel configuration
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment (development/production) | No |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `PROD_ORIGIN` | Production frontend URL | No |

### Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per IP address
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### File Upload Limits

- **Max Size:** 10MB
- **Allowed Types:** PDF, DOCX, JPEG, PNG, GIF, BMP, TIFF, WEBP

### Text Processing Limits

- **Minimum Length:** 10 characters
- **Maximum Length:** 50,000 characters

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel --prod
```

3. **Set environment variables** in Vercel dashboard

### Configuration

The project includes optimized `vercel.json`:
- Serverless functions with 30s timeout
- Lazy loading to prevent cold start timeouts
- Production environment variables

## 📊 Performance Optimizations

- **Compression:** ~70% reduction in response size
- **Lazy Loading:** Firebase initialized only when needed
- **Efficient Pagination:** Limit database queries
- **Response Caching:** Firestore query optimization
- **Memory Management:** Automatic cleanup of rate limit data

## 🔐 Security Features

- **Helmet:** Security headers
- **CORS:** Controlled cross-origin access
- **Input Validation:** All inputs validated and sanitized
- **Rate Limiting:** Prevent API abuse
- **Environment-based Error Details:** Hide sensitive info in production
- **Firebase Authentication:** Secure user authentication

## 📝 Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run build    # No build step required
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- OpenRouter for AI API
- Firebase for authentication and database
- Tesseract.js for OCR capabilities
- Express.js community

## 📞 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

Made with ❤️ for better note-taking
