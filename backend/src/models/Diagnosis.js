const mongoose = require('mongoose');

// har ek condition ka structure
const conditionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    probability: { type: Number, required: true, min: 0, max: 100 },
    description: { type: String, default: '' },
    nextSteps: [{ type: String }],
    doctorType: { type: String, default: 'General Practitioner' },
    urgency: {
      type: String,
      enum: ['low', 'moderate', 'high', 'emergency'],
      default: 'moderate',
    },
  },
  { _id: false }
);

// poori diagnosis ka structure jo MongoDB mein save hoga
const diagnosisSchema = new mongoose.Schema(
  {
    symptoms: {
      type: String,
      required: [true, 'Symptoms are required'],
      trim: true,
      maxlength: [1000, 'Symptoms cannot exceed 1000 characters'],
    },
    parsedSymptoms: [{ type: String }],
    conditions: {
      type: [conditionSchema],
      validate: {
        validator: (v) => v.length >= 1 && v.length <= 5,
        message: 'Conditions must have between 1 and 5 entries',
      },
    },
    disclaimer: {
      type: String,
      default:
        'This is not a substitute for professional medical advice. Always consult a qualified healthcare provider.',
    },
    aiGenerated: { type: Boolean, default: true },
    processingTime: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// history page pe jaldi fetch hone ke liye index
diagnosisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Diagnosis', diagnosisSchema);
