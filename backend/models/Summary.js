import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Only required if user authentication is enabled
      return process.env.REQUIRE_AUTH === 'true';
    }
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  originalText: {
    type: String,
    required: [true, 'Original text is required'],
    maxlength: [50000, 'Text cannot exceed 50,000 characters']
  },
  summaryText: {
    type: String,
    required: [true, 'Summary text is required']
  },
  originalWordCount: {
    type: Number,
    required: true
  },
  summaryWordCount: {
    type: Number,
    required: true
  },
  compressionRatio: {
    type: Number,
    required: true
  },
  processingTime: {
    type: Number, // in milliseconds
    required: true
  },
  model: {
    type: String,
    enum: ['gemini-2.5-pro', 'gemini-pro', 'mock'],
    default: 'gemini-pro'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
summarySchema.index({ user: 1, createdAt: -1 });
summarySchema.index({ title: 'text', originalText: 'text' });
summarySchema.index({ tags: 1 });

// Calculate word counts and compression ratio before saving
summarySchema.pre('save', function(next) {
  if (this.isModified('originalText') || this.isModified('summaryText')) {
    this.originalWordCount = this.originalText.split(/\s+/).filter(word => word.length > 0).length;
    this.summaryWordCount = this.summaryText.split(/\s+/).filter(word => word.length > 0).length;
    this.compressionRatio = this.originalWordCount > 0 ? 
      Math.round((1 - this.summaryWordCount / this.originalWordCount) * 100) : 0;
  }
  
  // Auto-generate title if not provided
  if (!this.title && this.originalText) {
    this.title = this.originalText.substring(0, 50).trim() + 
      (this.originalText.length > 50 ? '...' : '');
  }
  
  next();
});

export default mongoose.model('Summary', summarySchema);