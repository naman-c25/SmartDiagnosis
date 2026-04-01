import { useState } from 'react';
import { motion } from 'framer-motion';
import DiagnosisForm from '../components/DiagnosisForm';
import ResultCard from '../components/ResultCard';
import LoadingAnimation from '../components/LoadingAnimation';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

const resultsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDiagnosis = (data) => { setResult(data); setError(null); };
  const handleError = (msg) => { setError(msg); setResult(null); };
  const handleReset = () => { setResult(null); setError(null); };

  return (
    <motion.div className="page home-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <section className="hero">
        <motion.div className="hero-badge" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <span className="badge-dot" />
          AI-Powered Diagnosis
        </motion.div>
        <motion.h1 className="hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
          Understand Your <span className="gradient-text">Symptoms</span>
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.5 }}>
          Describe what you're feeling and get AI-powered insights into possible conditions,
          recommended next steps, and which specialist to consult.
        </motion.p>
      </section>

      <DiagnosisForm onLoading={setLoading} onResult={handleDiagnosis} onError={handleError} onReset={handleReset} isLoading={loading} />

      {loading && <LoadingAnimation />}

      {error && !loading && (
        <motion.div className="error-banner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="error-icon">⚠</span>{error}
        </motion.div>
      )}

      {result && !loading && (
        <motion.section className="results-section" variants={resultsContainerVariants} initial="hidden" animate="visible">
          <div className="results-header">
            <h2 className="results-title">Possible Conditions</h2>
            <div className="results-meta">
              <span className={`ai-badge ${result.aiGenerated ? 'ai' : 'fallback'}`}>
                {result.aiGenerated ? '✦ AI Generated' : '⚙ Rule-Based'}
              </span>
              {result.processingTime && <span className="timing">{result.processingTime}ms</span>}
            </div>
          </div>

          {result.parsedSymptoms?.length > 0 && (
            <div className="parsed-symptoms">
              <span className="parsed-label">Detected symptoms:</span>
              {result.parsedSymptoms.map((s) => <span key={s} className="symptom-tag">{s}</span>)}
            </div>
          )}

          <div className="cards-grid">
            {result.conditions.map((condition, i) => (
              <ResultCard key={condition.name} condition={condition} index={i} />
            ))}
          </div>

          {result.disclaimer && (
            <motion.div className="disclaimer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <span className="disclaimer-icon">ℹ</span>{result.disclaimer}
            </motion.div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}
