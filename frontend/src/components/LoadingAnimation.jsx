import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';

const STEPS = [
  { label: 'Parsing symptoms', icon: '🔍' },
  { label: 'Consulting AI engine', icon: '🤖' },
  { label: 'Analyzing conditions', icon: '🧬' },
  { label: 'Generating report', icon: '📋' },
];

export default function LoadingAnimation() {
  const orbRef = useRef(null);
  const ringRef = useRef(null);
  const stepsRef = useRef([]);

  useEffect(() => {
    const orbTween = gsap.to(orbRef.current, { scale: 1.15, opacity: 0.7, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    const ringTween = gsap.to(ringRef.current, { rotation: 360, duration: 2.5, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
    gsap.fromTo(stepsRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.35, ease: 'power2.out', delay: 0.2 });

    return () => { orbTween.kill(); ringTween.kill(); };
  }, []);

  return (
    <motion.div className="loading-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <div className="loading-card">
        <div className="loading-orb-wrapper">
          <div ref={ringRef} className="loading-ring" />
          <div ref={orbRef} className="loading-orb">
            <svg width="36" height="36" viewBox="0 0 100 100">
              <path d="M50 20 L50 80 M20 50 L80 50" stroke="white" strokeWidth="14" strokeLinecap="round" />
            </svg>
          </div>
        </div>
        <h3 className="loading-title">Analyzing your symptoms</h3>
        <p className="loading-subtitle">Please wait while our AI processes your data</p>
        <div className="loading-steps">
          {STEPS.map((step, i) => (
            <div key={step.label} ref={(el) => (stepsRef.current[i] = el)} className="loading-step">
              <span className="step-icon">{step.icon}</span>
              <span className="step-label">{step.label}</span>
              <motion.span className="step-dots" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}>···</motion.span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
