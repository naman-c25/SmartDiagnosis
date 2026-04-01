import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { diagnosisAPI } from '../services/api';
import HistoryList from '../components/HistoryList';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

export default function History() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await diagnosisAPI.getHistory(p, 8);
      setDiagnoses(res.data.diagnoses);
      setPagination(res.data.pagination);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleDelete = async (id) => {
    try {
      await diagnosisAPI.delete(id);
      setDiagnoses((prev) => prev.filter((d) => d._id !== id));
      if (diagnoses.length === 1 && page > 1) fetchHistory(page - 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div className="page history-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="history-header">
        <h1 className="page-title">Diagnosis History</h1>
        <p className="page-subtitle">Review your previous symptom analyses and their results.</p>
      </div>

      {error && (
        <motion.div className="error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="error-icon">⚠</span>{error}
        </motion.div>
      )}

      {loading ? (
        <div className="history-skeleton">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton-card" />)}
        </div>
      ) : (
        <HistoryList diagnoses={diagnoses} onDelete={handleDelete} />
      )}

      {pagination && pagination.pages > 1 && !loading && (
        <motion.div className="pagination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <button className="page-btn" disabled={!pagination.hasPrev} onClick={() => fetchHistory(page - 1)}>← Previous</button>
          <span className="page-indicator">Page {pagination.page} of {pagination.pages}</span>
          <button className="page-btn" disabled={!pagination.hasNext} onClick={() => fetchHistory(page + 1)}>Next →</button>
        </motion.div>
      )}
    </motion.div>
  );
}
