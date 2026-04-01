import { motion } from 'framer-motion';

const URGENCY_CONFIG = {
  low:       { label: 'Low',       color: '#10b981', bg: 'rgba(16,185,129,0.1)',  icon: '●' },
  moderate:  { label: 'Moderate',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '●' },
  high:      { label: 'High',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  icon: '●' },
  emergency: { label: 'Emergency', color: '#dc2626', bg: 'rgba(220,38,38,0.15)', icon: '🚨' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function ResultCard({ condition, index }) {
  const urgency = URGENCY_CONFIG[condition.urgency] || URGENCY_CONFIG.moderate;
  const rankLabel = ['Primary', 'Secondary', 'Tertiary'][index] || `#${index + 1}`;

  return (
    <motion.div className="result-card" variants={cardVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <div className="card-header">
        <div className="card-rank">{rankLabel}</div>
        <div className="card-urgency" style={{ color: urgency.color, background: urgency.bg }}>
          {urgency.icon} {urgency.label}
        </div>
      </div>

      <h3 className="card-title">{condition.name}</h3>
      {condition.description && <p className="card-description">{condition.description}</p>}

      <div className="probability-section">
        <div className="probability-label">
          <span>Probability Match</span>
          <span className="probability-value">{condition.probability}%</span>
        </div>
        <div className="probability-track">
          <motion.div
            className="probability-fill"
            style={{
              background: condition.probability >= 70
                ? 'linear-gradient(90deg, #0ea5e9, #6366f1)'
                : condition.probability >= 40
                ? 'linear-gradient(90deg, #f59e0b, #fb923c)'
                : 'linear-gradient(90deg, #94a3b8, #64748b)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${condition.probability}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="card-doctor">
        <span className="doctor-icon">👨‍⚕️</span>
        <span className="doctor-label">See a</span>
        <span className="doctor-type">{condition.doctorType}</span>
      </div>

      {condition.nextSteps?.length > 0 && (
        <div className="next-steps">
          <h4 className="steps-title">Recommended Actions</h4>
          <ul className="steps-list">
            {condition.nextSteps.map((step, i) => (
              <motion.li key={i} className="step-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <span className="step-num">{i + 1}</span>{step}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}
