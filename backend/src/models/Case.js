const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: String,
});

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    attackType: {
      type: String,
      enum: [
        'sql_injection', 'xss', 'brute_force',
        'ddos', 'malware', 'phishing',
        'unauthorized_access', 'unknown',
      ],
      default: 'unknown',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    affectedSystems: [String],
    sourceIPs: [String],
    threatScore: { type: Number, default: 0 },
    timeline: [timelineSchema],
    aiAnalysis: {
      summary: String,
      riskLevel: String,
      recommendations: [String],
      analyzedAt: Date,
    },
    resolvedAt: Date,
    tags: [String],
  },
  { timestamps: true }
);

// Auto generate case number
caseSchema.pre('save', async function () {
  if (!this.caseNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `CYF-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

caseSchema.index({ status: 1, priority: 1 });
caseSchema.index({ createdBy: 1 });
caseSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Case', caseSchema);