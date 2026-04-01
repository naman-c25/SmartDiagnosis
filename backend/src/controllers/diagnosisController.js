const { validationResult } = require('express-validator');
const Diagnosis = require('../models/Diagnosis');
const { parseSymptoms } = require('../services/symptomParser');
const { generateDiagnosis } = require('../services/aiService');

// jab user symptoms bhejta hai tab yeh function chalega
// POST /api/diagnose
exports.diagnose = async (req, res, next) => {
  try {
    // pehle check karo ki user ne sahi data bheja hai ya nahi
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { symptoms } = req.body;
    const startTime = Date.now();

    // Step 1: symptoms ko parse karo
    const parsedSymptoms = parseSymptoms(symptoms);

    // Step 2: Groq AI se diagnosis lo, agar AI fail ho toh rule-based fallback
    const { conditions, disclaimer, aiGenerated } = await generateDiagnosis(
      symptoms,
      parsedSymptoms
    );

    const processingTime = Date.now() - startTime;

    // Step 3: result ko MongoDB mein save karo
    const diagnosis = await Diagnosis.create({
      symptoms,
      parsedSymptoms,
      conditions,
      disclaimer,
      aiGenerated,
      processingTime,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: diagnosis._id,
        symptoms: diagnosis.symptoms,
        parsedSymptoms: diagnosis.parsedSymptoms,
        conditions: diagnosis.conditions,
        disclaimer: diagnosis.disclaimer,
        aiGenerated: diagnosis.aiGenerated,
        processingTime: diagnosis.processingTime,
        createdAt: diagnosis.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// purani sabhi diagnosis history laane ke liye
// GET /api/history
exports.getHistory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [diagnoses, total] = await Promise.all([
      Diagnosis.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Diagnosis.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        diagnoses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ek specific diagnosis ID se dhundhna
// GET /api/history/:id
exports.getDiagnosisById = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findById(req.params.id).select('-__v').lean();

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    return res.json({ success: true, data: diagnosis });
  } catch (err) {
    next(err);
  }
};

// kisi ek diagnosis ko delete karna
// DELETE /api/history/:id
exports.deleteDiagnosis = async (req, res, next) => {
  try {
    const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);

    if (!diagnosis) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found' });
    }

    return res.json({ success: true, message: 'Diagnosis deleted successfully' });
  } catch (err) {
    next(err);
  }
};
