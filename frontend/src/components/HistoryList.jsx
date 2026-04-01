import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const URGENCY_COLORS = {
  low: '#10b981', moderate: '#f59e0b', high: '#ef4444', emergency: '#dc2626',
};

function HistoryItem({ diagnosis, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const topCondition = diagnosis.conditions?.[0];
  const urgencyColor = URGENCY_COLORS[topCondition?.urgency] || '#64748b';

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await onDelete(diagnosis._id);
  };

  return (
    <motion.div className="history-item" layout initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: deleting ? 0 : 1, y: 0, scale: deleting ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
      <div className="history-item-header" onClick={() => setExpanded((v) => !v)}>
        <div className="history-item-left">
          <div className="history-urgency-dot" style={{ background: urgencyColor }} />
          <div>
            <p className="history-symptoms">{diagnosis.symptoms}</p>
            <p className="history-date">{formatDate(diagnosis.createdAt)}</p>
          </div>
        </div>
        <div className="history-item-right">
          <span className={`history-ai-badge ${diagnosis.aiGenerated ? 'ai' : 'rule'}`}>
            {diagnosis.aiGenerated ? 'AI' : 'Rule'}
          </span>
          <span className="history-count">
            {diagnosis.conditions?.length} condition{diagnosis.conditions?.length !== 1 ? 's' : ''}
          </span>
          <button className="delete-btn" onClick={handleDelete} disabled={deleting} aria-label="Delete diagnosis">
            {deleting ? '...' : '✕'}
          </button>
          <span className={`expand-arrow ${expanded ? 'expanded' : ''}`}>›</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div className="history-item-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
            <div className="history-conditions">
              {diagnosis.conditions?.map((c) => (
                <div key={c.name} className="history-condition-row">
                  <div className="history-condition-info">
                    <span className="history-condition-name">{c.name}</span>
                    <span className="history-condition-doctor">{c.doctorType}</span>
                  </div>
                  <div className="history-condition-prob">
                    <div className="mini-bar">
                      <div className="mini-fill" style={{ width: `${c.probability}%`, background: 'linear-gradient(90deg, #0ea5e9, #6366f1)' }} />
                    </div>
                    <span className="mini-pct">{c.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
            {diagnosis.parsedSymptoms?.length > 0 && (
              <div className="history-tags">
                {diagnosis.parsedSymptoms.map((s) => <span key={s} className="symptom-tag small">{s}</span>)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoryList({ diagnoses, onDelete }) {
  if (!diagnoses || diagnoses.length === 0) {
    return (
      <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="empty-icon">📋</div>
        <h3 className="empty-title">No diagnoses yet</h3>
        <p className="empty-sub">Run your first symptom analysis and it'll appear here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div className="history-list" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.07 } } }}>
      <AnimatePresence>
        {diagnoses.map((d) => <HistoryItem key={d._id} diagnosis={d} onDelete={onDelete} />)}
      </AnimatePresence>
    </motion.div>
  );
}
