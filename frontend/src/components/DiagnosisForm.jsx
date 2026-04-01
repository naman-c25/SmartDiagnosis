import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { diagnosisAPI } from '../services/api';

const EXAMPLE_SYMPTOMS = [
  'fever, cough, chest pain',
  'headache, nausea, dizziness',
  'chest pain, palpitations, shortness of breath',
  'rash, itching, swollen eyes',
];

export default function DiagnosisForm({ onLoading, onResult, onError, onReset, isLoading }) {
  const [symptoms, setSymptoms] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || isLoading) return;
    onLoading(true);
    onReset();
    try {
      const res = await diagnosisAPI.diagnose(symptoms.trim());
      onResult(res.data);
    } catch (err) {
      onError(err.message);
    } finally {
      onLoading(false);
    }
  };

  const fillExample = (example) => { setSymptoms(example); textareaRef.current?.focus(); };
  const handleClear = () => { setSymptoms(''); onReset(); textareaRef.current?.focus(); };

  return (
    <motion.div className="form-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}>
      <form onSubmit={handleSubmit} className="diagnosis-form">
        <div className="field-group">
          <label htmlFor="symptoms" className="field-label">Describe your symptoms</label>
          <div className="textarea-wrapper">
            <textarea
              ref={textareaRef}
              id="symptoms"
              className="symptoms-textarea"
              placeholder="e.g. fever, persistent cough, chest pain, fatigue..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
              maxLength={1000}
              disabled={isLoading}
            />
            {symptoms && (
              <button type="button" className="clear-btn" onClick={handleClear} title="Clear input" aria-label="Clear symptoms">✕</button>
            )}
          </div>
          <div className="char-count">{symptoms.length}/1000</div>
        </div>

        <div className="example-chips">
          <span className="examples-label">Try an example:</span>
          {EXAMPLE_SYMPTOMS.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => fillExample(ex)} disabled={isLoading}>{ex}</button>
          ))}
        </div>

        <motion.button type="submit" className="submit-btn" disabled={!symptoms.trim() || isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {isLoading ? (
            <span className="btn-loading"><span className="spinner" />Analyzing...</span>
          ) : (
            <><span>Analyze Symptoms</span><span className="btn-arrow">→</span></>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
