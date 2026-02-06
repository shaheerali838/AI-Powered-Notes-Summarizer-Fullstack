# 🤖 AI-Powered Notes Summarizer

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?logo=firebase)
![Vite](https://img.shields.io/badge/Vite-7.1.5-646CFF?logo=vite)

A powerful AI-driven web application that transforms lengthy notes, documents, and research materials into concise, actionable summaries. Built with modern React, Firebase, and deployed on Vercel.

[Demo](#) • [Features](#-features) • [Installation](#-installation) • [Documentation](#-project-structure)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **🤖 AI-Powered Summarization**: Generate intelligent summaries and extract key points from any text using advanced AI
- **📁 Multi-Format Support**: Process text files (`.txt`, `.md`, `.rtf`), PDFs, Word documents (`.docx`), and images with OCR
- **⚡ Real-time Processing**: Upload and process files with live progress tracking
- **📦 Batch Processing**: Handle multiple files simultaneously with efficient processing

### 🎨 User Experience
- **✍️ Multiple Input Methods**: Paste text directly or upload files - your choice!
- **📱 Fully Responsive**: Seamless experience across desktop, tablet, and mobile devices
- **📜 History Management**: Track and revisit your previous summaries anytime
- **📋 Copy & Share**: Easily copy summaries for external use

### 🔐 Authentication & Storage
- **🔑 Firebase Authentication**: Sign in with Google, Facebook, or email/password
- **👤 Guest Mode**: Use the app without registration (temporary session storage)
- **☁️ Cloud Storage**: Persistent history for registered users via Firestore
- **💾 Session Storage**: Temporary history for guest users

### 🚀 Advanced Features
- **🔍 Smart File Processing**: OCR for images, PDF text extraction, Word document parsing
- **📊 Progress Tracking**: Visual feedback during file uploads and processing
- **⚠️ Error Handling**: Comprehensive validation and user-friendly error messages
- **🎭 Modern UI**: Clean, intuitive interface built with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.22.2-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

### Backend & Services
![Firebase](https://img.shields.io/badge/Firebase-12.2.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)

### Key Libraries
- **PDF.js** (v5.4.149) - PDF text extraction
- **Mammoth.js** (v1.10.0) - Word document processing
- **Tesseract.js** (v4.1.1) - OCR for images
- **Lucide React** (v0.344.0) - Beautiful icons
- **UUID** (v13.0.0) - Unique identifiers

---

## 🚀 Installation

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- **Firebase project** (for authentication and storage)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaheerali838/AI-Powered-Notes-Summarizer.git
   cd AI-Powered-Notes-Summarizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the sample environment file:
   ```bash
   cp .env.local.sample .env
   ```
   
   Update `.env` with your actual values:
   ```env
   # Frontend Configuration
   VITE_APP_API_URL=https://your-backend-api.vercel.app
   
   # Firebase Configuration (Public Keys - Safe for Frontend)
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

4. **Configure Firebase**
   
   Update `src/config/firebaseClient.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
     storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.REACT_APP_FIREBASE_APP_ID
   };
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` 🎉

---

## 📁 Project Structure

```
AI-Powered-Notes-Summarizer/
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── AuthModal.jsx        # Authentication modal
│   │   ├── UploadNotes.jsx      # File upload interface
│   │   ├── NotesDisplay.jsx     # Original notes viewer
│   │   ├── SummaryDisplay.jsx   # Summary output viewer
│   │   ├── Header.jsx           # Navigation header
│   │   └── Footer.jsx           # Footer component
│   ├── pages/                   # Page components
│   │   ├── HomePage.jsx         # Main application page
│   │   ├── HistoryPage.jsx      # Summary history
│   │   ├── AboutPage.jsx        # About page
│   │   ├── ProfilePage.jsx      # User profile
│   │   └── NotFoundPage.jsx     # 404 page
│   ├── context/                 # React Context providers
│   │   ├── AuthContext.jsx      # Authentication state
│   │   ├── NotesContext.jsx     # Notes and summary state
│   │   └── UIContext.jsx        # UI state management
│   ├── config/                  # Configuration files
│   │   └── firebaseClient.js    # Firebase client setup
│   ├── utils/                   # Utility functions
│   │   ├── fileProcessor.js     # File processing logic
│   │   └── apiClient.js         # API communication
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env.local.sample            # Sample environment variables
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Project dependencies
└── README.md                    # This file
```

---

## 📱 Usage Guide

### Basic Workflow

1. **📤 Upload Content**
   - Paste text directly into the input area, or
   - Upload files (PDF, DOCX, images, text files)
   - Support for batch uploads

2. **⚡ Generate Summary**
   - Click "Generate Summary" to process your content
   - AI analyzes and creates a concise summary
   - Real-time progress tracking

3. **👀 Review Results**
   - View original notes alongside AI-generated summary
   - See key points and main ideas extracted
   - Easy-to-read formatting

4. **💾 Save & Share**
   - Copy summary to clipboard
   - Save to your history (registered users)
   - Export options available

### Supported File Types

| Category | Formats | Features |
|----------|---------|----------|
| **Text Files** | `.txt`, `.md`, `.rtf` | Direct text extraction |
| **Documents** | `.pdf`, `.docx` | Advanced parsing |
| **Images** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp` | OCR processing with Tesseract.js |

### File Size Limits
- **Maximum file size**: 10MB per file
- **Batch upload**: Multiple files can be processed simultaneously

---

## ⚙️ Configuration

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use an existing one

2. **Enable Authentication**
   - Navigate to Authentication → Sign-in method
   - Enable: Google, Facebook, Email/Password

3. **Create Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Choose your region

4. **Set Security Rules**
   
   Copy these rules to your Firestore:
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

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API (Vercel Serverless Function)
VITE_APP_API_URL=https://your-vercel-deployment.vercel.app

# Firebase Public Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

> **Note**: For backend private keys (service account), set these as **Vercel secrets** - never commit them!

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

This project is optimized for serverless deployment on Vercel with lazy loading and cold start optimization.

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   Or connect your GitHub repository for automatic deployments.

4. **Set Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:
   - Add all `VITE_*` and `REACT_APP_*` variables
   - For backend secrets, add `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`, etc.

5. **Production Deployment**
   ```bash
   vercel --prod
   ```

### Alternative: Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

3. **Configure Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add all required environment variables

### Alternative: Manual Deployment

```bash
# Build for production
npm run build

# The 'dist' folder is ready for deployment
# Upload to your hosting provider (AWS S3, Azure, etc.)
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
   
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary

4. **Test thoroughly**
   - Test across different browsers
   - Verify mobile responsiveness
   - Check all file upload scenarios

5. **Commit your changes**
   ```bash
   git commit -m "Add: amazing new feature"
   ```
   
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Add screenshots for UI changes

### Development Guidelines
- ✅ Follow React best practices and hooks patterns
- ✅ Use functional components over class components
- ✅ Write meaningful commit messages
- ✅ Test on multiple devices and browsers
- ✅ Ensure accessibility (ARIA labels, keyboard navigation)
- ✅ Keep components small and focused
- ✅ Use Tailwind CSS utilities (avoid custom CSS unless necessary)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software as per the MIT License terms.

---

## 🙏 Acknowledgments

Special thanks to these amazing projects and services:

- 🔥 **[Firebase](https://firebase.google.com/)** - Authentication, Firestore, and hosting
- 🤖 **AI Services** - For powerful summarization capabilities
- 📄 **[PDF.js](https://mozilla.github.io/pdf.js/)** - Excellent PDF processing
- 📝 **[Mammoth.js](https://github.com/mwilliamson/mammoth.js)** - Word document parsing
- 🔍 **[Tesseract.js](https://tesseract.projectnaptha.com/)** - OCR functionality
- 🎨 **[Tailwind CSS](https://tailwindcss.com/)** - Beautiful, utility-first CSS
- ⚡ **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- ⚛️ **[React](https://react.dev/)** - The amazing React community

---

## 📞 Support

Need help? Here's how to get support:

- 📖 **Documentation**: Check this README first
- 🐛 **Bug Reports**: [Open an issue](https://github.com/shaheerali838/AI-Powered-Notes-Summarizer/issues)
- 💡 **Feature Requests**: [Request a feature](https://github.com/shaheerali838/AI-Powered-Notes-Summarizer/issues/new)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/shaheerali838/AI-Powered-Notes-Summarizer/discussions)

---

## 🗺️ Roadmap

Exciting features coming soon:

- [ ] 🌙 Dark mode theme toggle
- [ ] 📑 Support for more file formats (Excel, PowerPoint, etc.)
- [ ] 🎛️ Advanced summarization options (length control, style preferences)
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 👥 Collaborative features (share summaries with teams)
- [ ] 🔌 API for third-party integrations
- [ ] 📨 Export summaries to multiple formats (Word, PDF, Markdown)
- [ ] 🌐 Multi-language support
- [ ] 📊 Analytics dashboard for summary insights
- [ ] 🔒 Enhanced privacy controls

---

## 📊 Project Stats

- 🌟 **Star this repo** if you find it useful!
- 🍴 **Fork count**: Growing community
- 📈 **Version**: 0.1.0
- 🛠️ **Status**: Active Development

---

<div align="center">

**Made with ❤️ by [Shaheer Ali](https://github.com/shaheerali838)**

If you found this project helpful, please consider giving it a ⭐!

[Report Bug](https://github.com/shaheerali838/AI-Powered-Notes-Summarizer/issues) • [Request Feature](https://github.com/shaheerali838/AI-Powered-Notes-Summarizer/issues/new)

</div>
