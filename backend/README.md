# AI Notes Summarizer Backend

A comprehensive Node.js/Express backend for the AI Notes Summarizer application with MongoDB integration, user authentication, and Google Gemini AI.

## Features

### 🔐 Authentication System
- JWT-based user registration and login
- Password hashing with bcrypt
- Protected routes with middleware
- User profile management

### 📝 Summary Management
- Create, read, update, delete summaries
- Pagination and search functionality
- Word count and compression ratio tracking
- Processing time metrics
- Public/private summary visibility

### 📁 File Upload Support
- Handle .txt and .pdf files
- Text extraction from PDFs
- File size and type validation
- 10MB file size limit

### 🛡️ Security & Performance
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- Error handling middleware

### 🤖 AI Integration
- Google Gemini 2.5 Pro and Gemini Pro support
- Automatic fallback to mock responses
- Processing time tracking
- Model usage statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Summaries
- `POST /api/summaries` - Create new summary
- `GET /api/summaries` - Get summaries with pagination
- `GET /api/summaries/:id` - Get specific summary
- `PUT /api/summaries/:id` - Update summary (protected)
- `DELETE /api/summaries/:id` - Delete summary (protected)
- `GET /api/summaries/stats/user` - Get user statistics (protected)

### File Upload
- `POST /api/upload` - Upload and extract text from files
- `GET /api/upload/supported-types` - Get supported file types

### Legacy Endpoints (Backward Compatibility)
- `POST /api/summarize` - Legacy summarization endpoint
- `GET /api/history` - Legacy history endpoint
- `GET /api/summary/:id` - Legacy get summary endpoint
- `DELETE /api/summary/:id` - Legacy delete summary endpoint

### System
- `GET /api/health` - Health check and system status

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-notes-summarizer

# JWT Secret (change this to a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env` file

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update all environment variables

4. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Generate an API key
   - Add it to your `.env` file

5. **Start the Server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Schema

### User Model
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `summaryCount` - Number of summaries created
- `lastLogin` - Last login timestamp
- `createdAt` - Account creation date
- `updatedAt` - Last profile update

### Summary Model
- `user` - Reference to User (optional for anonymous summaries)
- `title` - Summary title (auto-generated if not provided)
- `originalText` - Original text content
- `summaryText` - AI-generated summary
- `originalWordCount` - Word count of original text
- `summaryWordCount` - Word count of summary
- `compressionRatio` - Percentage of text reduction
- `processingTime` - Time taken to generate summary (ms)
- `model` - AI model used (gemini-2.5-pro, gemini-pro, mock)
- `tags` - Array of tags for categorization
- `isPublic` - Whether summary is publicly visible
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Security Features

- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Validates all user inputs
- **Password Hashing**: Uses bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with 7-day expiry
- **CORS**: Configured for cross-origin requests
- **Helmet**: Security headers for protection
- **File Upload Security**: Type and size validation

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": ["Additional error details if applicable"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js             # User model
│   └── Summary.js          # Summary model
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── summaries.js        # Summary CRUD routes
│   └── upload.js           # File upload routes
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation
├── index.js                # Main server file
├── package.json
└── README.md
```

## Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production MongoDB URI

2. **Security Considerations**
   - Enable HTTPS
   - Set up proper CORS origins
   - Configure rate limiting for production load
   - Regular security updates

3. **Monitoring**
   - Set up logging
   - Monitor API usage
   - Track error rates
   - Database performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.