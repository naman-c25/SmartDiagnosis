const express = require('express');
const { body, query } = require('express-validator');
const diagnosisController = require('../controllers/diagnosisController');

const router = express.Router();

// POST /api/diagnose — user symptoms bhejta hai, diagnosis milti hai
router.post(
  '/diagnose',
  [
    body('symptoms')
      .trim()
      .notEmpty()
      .withMessage('Symptoms are required')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Symptoms must be between 3 and 1000 characters'),
  ],
  diagnosisController.diagnose
);

// GET /api/history — purani saari diagnoses
router.get(
  '/history',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  diagnosisController.getHistory
);

// GET /api/history/:id — ek specific diagnosis
router.get('/history/:id', diagnosisController.getDiagnosisById);

// DELETE /api/history/:id — ek diagnosis delete karo
router.delete('/history/:id', diagnosisController.deleteDiagnosis);

module.exports = router;
