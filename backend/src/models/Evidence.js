const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        'log_file', 'screenshot', 'document',
        'malware_sample', 'other',
      ],
      required: true,
    },
    fileName: { type: String, required: true },
    originalName: String,
    mimeType: String,
    fileSize: Number,
    filePath: { type: String, required: true },
    sha256Hash: { type: String, required: true },
    isCompromised: { type: Boolean, default: false },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chainOfCustody: [
      {
        timestamp: { type: Date, default: Date.now },
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    tags: [String],
  },
  { timestamps: true }
);

evidenceSchema.index({ caseId: 1 });
evidenceSchema.index({ sha256Hash: 1 });

module.exports = mongoose.model('Evidence', evidenceSchema);