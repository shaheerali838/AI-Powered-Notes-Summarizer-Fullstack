# AI Notes Summarizer

A powerful web application that uses AI to transform your lengthy notes, documents, and research materials into concise, actionable summaries. Built with React and Firebase, featuring advanced file processing capabilities and seamless user experience.

## 🌟 Features

### Core Functionality
- **AI-Powered Summarization**: Generate intelligent summaries and extract key points from any text
- **Multi-Format Support**: Process text files (.txt, .md, .rtf), PDFs, Word documents (.docx), and images (OCR)
- **Real-time Processing**: Upload and process files with live progress tracking
- **Batch Processing**: Handle multiple files simultaneously

### User Experience
- **Multiple Input Methods**: Paste text directly or upload files
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **History Management**: Track and revisit your previous summaries
- **Copy & Share**: Easily copy summaries for external use

### Authentication & Storage
- **Firebase Authentication**: Sign in with Google, Facebook, or email
- **Guest Mode**: Use the app without registration (temporary storage)
- **Cloud Storage**: Persistent history for registered users
- **Session Storage**: Temporary history for guest users

### Advanced Features
- **Smart File Processing**: OCR for images, PDF text extraction, Word document parsing
- **Progress Tracking**: Visual feedback during file uploads and processing
- **Error Handling**: Comprehensive validation and user-friendly error messages
- **Dark/Light Theme**: Customizable appearance (coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for authentication and storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaheerali838/ai-notes-summarizer.git
   cd ai-notes-summarizer
   ```

2. **Install dependencies**
   ```bash
   cd Frontend
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the Frontend directory:
   ```env
   VITE_APP_API_URL=your-backend-url
   ```

4. **Configure Firebase**
   Update `src/config/firebaseClient.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     // ... other config
   };
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Frontend Structure
```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthModal.jsx    # Authentication modal
│   │   ├── UploadNotes.jsx  # File upload interface
│   │   ├── NotesDisplay.jsx # Original notes viewer
│   │   ├── SummaryDisplay.jsx # Summary output viewer
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx     # Main application page
│   │   ├── HistoryPage.jsx  # Summary history
│   │   └── AboutPage.jsx    # About page
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   ├── NotesContext.jsx # Notes and summary state
│   │   └── UIContext.jsx    # UI state management
│   ├── config/              # Configuration files
│   │   └── firebaseClient.js # Firebase setup
│   └── utils/               # Utility functions
│       └── fileProcessor.js # File processing logic
```

### Key Technologies
- **React 18**: Modern React with hooks and context
- **Firebase**: Authentication and Firestore database
- **Tailwind CSS**: Utility-first CSS framework
- **PDF.js**: PDF text extraction
- **Mammoth.js**: Word document processing
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icons

## 📱 Usage

### Basic Workflow
1. **Upload Content**: Either paste text or upload files (PDF, DOCX, images, etc.)
2. **Generate Summary**: Click "Generate Summary" to process your content
3. **Review Results**: View your original notes alongside the AI-generated summary
4. **Save & Share**: Copy the summary or save it to your history

### Supported File Types
- **Text Files**: .txt, .md, .rtf
- **Documents**: .pdf, .docx
- **Images**: .jpg, .jpeg, .png, .gif, .bmp, .webp (OCR processing)

### File Size Limits
- Maximum file size: 10MB per file
- Multiple files can be processed simultaneously

## 🔧 Configuration

### Environment Variables
```env
# Backend API URL
VITE_APP_API_URL=https://your-api-domain.com

# Firebase Configuration (set in firebaseClient.js)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Google, Facebook, Email/Password)
3. Create a Firestore database
4. Set up security rules for user data protection

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /summaries/{summaryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

#### Manual Deployment
```bash
npm run build
# Upload the 'dist' folder to your hosting provider
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines
- Follow React best practices
- Use TypeScript where possible
- Write meaningful commit messages
- Test your changes across different devices
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Firebase** for authentication and database services
- **OpenAI/Claude** for AI summarization capabilities
- **PDF.js** for PDF processing
- **Tailwind CSS** for styling
- **React Community** for excellent documentation and resources

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/ai-notes-summarizer/issues) page
2. Create a new issue with detailed information
3. Contact: your-email@example.com

---

## 🔮 Roadmap

- [ ] Dark mode theme
- [ ] More file format support
- [ ] Advanced summarization options
- [ ] Mobile app version
- [ ] Collaborative features
- [ ] API for third-party integrations
- [ ] Export summaries to various formats

---

**Made with ❤️ by [Shaheer Ali](https://github.com/shaheerali838)**
