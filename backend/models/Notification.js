const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [140, 'Notification title cannot exceed 140 characters']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Notification message cannot exceed 500 characters']
  },
  category: {
    type: String,
    trim: true,
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  actions: [{
    label: { type: String, trim: true },
    url: { type: String, trim: true },
    method: { type: String, trim: true, default: 'GET' }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

NotificationSchema.pre('save', function(next) {
  if (!this.isModified('read')) return next();
  if (this.read && !this.readAt) {
    this.readAt = new Date();
  }
  if (!this.read) {
    this.readAt = null;
    this.readBy = null;
  }
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
