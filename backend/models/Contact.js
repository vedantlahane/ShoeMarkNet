const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String },
    preview: { type: String },
    url: { type: String }
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    responder: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: String, enum: ['email', 'phone', 'chat', 'internal'], default: 'email' },
    sentAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: { type: String, default: 'general', trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium', index: true },
    preferredContact: { type: String, enum: ['email', 'phone', 'chat'], default: 'email' },
    orderNumber: { type: String, trim: true },
    status: { type: String, enum: ['new', 'in_progress', 'resolved', 'closed', 'archived'], default: 'new', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    attachments: [attachmentSchema],
    responseHistory: [responseSchema],
    timeline: [timelineSchema],
    confirmationNumber: { type: String, unique: true, default: uuidv4 },
    estimatedResponseTime: { type: Date },
    metadata: {
      source: { type: String, default: 'contact_page' },
      userAgent: { type: String },
      referrer: { type: String },
      ipAddress: { type: String },
      locale: { type: String },
      utm: {
        source: String,
        medium: String,
        campaign: String
      }
    }
  },
  {
    timestamps: true
  }
);

contactSchema.pre('save', function generateSla(next) {
  if (!this.estimatedResponseTime) {
    const slaHours = this.priority === 'urgent' ? 1 : this.priority === 'high' ? 4 : 12;
    this.estimatedResponseTime = new Date(Date.now() + slaHours * 60 * 60 * 1000);
  }

  if (!this.timeline || this.timeline.length === 0) {
    this.timeline = [
      {
        label: 'Ticket created',
        details: { status: 'new' }
      }
    ];
  }

  next();
});

contactSchema.virtual('responseTimeHours').get(function responseTimeHours() {
  if (!this.estimatedResponseTime) return null;
  const diff = this.estimatedResponseTime.getTime() - this.createdAt.getTime();
  return Math.max(Math.round(diff / (60 * 60 * 1000)), 1);
});

contactSchema.set('toJSON', { virtuals: true });
contactSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Contact', contactSchema);
