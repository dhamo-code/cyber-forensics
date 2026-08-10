const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Plain English explanation of this file:
// This defines the shape of a User document in MongoDB.
// Every user stored in the database follows this schema.
// Key security decisions:
//   - password has select:false → never returned in queries by default
//   - refreshTokens has select:false → same reason
//   - bcrypt hashes the password before saving (pre-save hook)
//   - isLocked() checks if account is temporarily blocked

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Never include password in query results
    },
    role: {
      type: String,
      enum: ['admin', 'analyst', 'viewer'],
      default: 'viewer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    lastLogin: {
      type: Date,
    },
    refreshTokens: {
      type: [String],
      select: false, // Never include tokens in query results
    },
    // Payment record — stored when user registers via Razorpay
    payment: {
      orderId: String,
      paymentId: String,
      amount: Number,
      currency: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
      },
      paidAt: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Hash password before saving to database
// Only runs if password field was actually modified
// This way if we update name/email, we don't re-hash unnecessarily
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  // 12 rounds = good balance of security vs speed
  // 10 rounds = too fast (easier to brute force)
  // 14 rounds = too slow (bad user experience)
});

// Instance method to compare login password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if account is locked
// lockUntil is set when user fails login 5 times
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Indexes speed up database queries on these fields
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);