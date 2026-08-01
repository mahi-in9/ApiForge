import React from 'react';
import { useOnboarding, ONBOARDING_STEPS } from '../context/OnboardingContext';
import { Database, Sparkles, Play, GitGraph, Terminal, X, ArrowRight, ArrowLeft, Zap, Shield, Code2 } from 'lucide-react';

// ─── Welcome Screen (Step 0) ──────────────────────────────────────────────────
const WelcomeScreen = ({ onNext, onSkip }) => (
  <div className="animate-scale-in" style={{ textAlign: 'center', maxWidth: '540px' }}>
    {/* Logo */}
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '80px', height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(138,43,226,0.2))',
      border: '1px solid rgba(0,240,255,0.3)',
      marginBottom: '28px',
      animation: 'pulseNeon 3s ease-in-out infinite',
    }}>
      <Zap size={36} color="var(--accent-neon)" />
    </div>

    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-main)', lineHeight: 1.2 }}>
      Welcome to{' '}
      <span style={{ color: 'var(--accent-neon)', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
        API Forge
      </span>
    </h1>

    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: '0 0 36px 0', lineHeight: 1.6 }}>
      Build production-ready REST APIs visually.<br />No server code. No boilerplate. Just results.
    </p>

    {/* Feature highlights */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '36px' }}>
      {[
        { icon: <Database size={22} color="var(--accent-neon)" />, label: 'Visual Schema Design', desc: 'Design collections & relationships visually' },
        { icon: <Code2 size={22} color="var(--accent-purple)" />, label: 'Auto-Generated APIs', desc: 'REST endpoints ready in seconds' },
        { icon: <Play size={22} color="var(--accent-green)" />, label: 'Live Playground', desc: 'Test endpoints without leaving the app' },
      ].map(({ icon, label, desc }) => (
        <div key={label} style={{
          padding: '16px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ marginBottom: '10px' }}>{icon}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{desc}</div>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
      <button className="btn-primary" onClick={onNext} style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
        Create your first API in 2 minutes
        <ArrowRight size={18} />
      </button>
      <button
        onClick={onSkip}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.875rem', padding: '12px' }}
      >
        Skip tour
      </button>
    </div>
  </div>
);

// ─── Step Screen (Steps 1–4) ──────────────────────────────────────────────────
const STEP_ICONS = {
  dashboard:      <Terminal size={28} color="var(--accent-neon)" />,
  schemas:        <Database size={28} color="var(--accent-neon)" />,
  'visual-studio':<GitGraph size={28} color="var(--accent-neon)" />,
  playground:     <Play size={28} color="var(--accent-neon)" />,
};

const StepScreen = ({ step, stepIndex, totalSteps, onNext, onBack, onSkip }) => (
  <div className="animate-fade-up" style={{ maxWidth: '480px' }}>
    {/* Step icon */}
    <div style={{
      width: '56px', height: '56px',
      borderRadius: '50%',
      background: 'var(--accent-neon-dim)',
      border: '1px solid rgba(0,240,255,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '20px',
    }}>
      {STEP_ICONS[step.id] || <Sparkles size={28} color="var(--accent-neon)" />}
    </div>

    <div style={{ fontSize: '0.8rem', color: 'var(--accent-neon)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
      Step {stepIndex} of {totalSteps - 1}
    </div>

    <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
      {step.title}
    </h2>

    <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.65 }}>
      {step.description}
    </p>

    {step.tip && (
      <div style={{
        padding: '12px 16px',
        background: 'rgba(0,240,255,0.06)',
        border: '1px solid rgba(0,240,255,0.2)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        color: 'var(--accent-neon)',
        marginBottom: '28px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
      }}>
        <span style={{ flexShrink: 0, marginTop: '1px' }}>💡</span>
        {step.tip}
      </div>
    )}

    {/* Progress dots */}
    <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
      {ONBOARDING_STEPS.slice(1).map((_, i) => (
        <div key={i} style={{
          width: i === stepIndex - 1 ? '24px' : '8px',
          height: '8px',
          borderRadius: '4px',
          background: i === stepIndex - 1 ? 'var(--accent-neon)' : 'var(--border-glass-bright)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>

    {/* Navigation */}
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {stepIndex > 1 && (
        <button className="btn-glass" onClick={onBack} style={{ padding: '10px 16px' }}>
          <ArrowLeft size={16} /> Back
        </button>
      )}
      <button className="btn-primary" onClick={onNext} style={{ flex: 1, justifyContent: 'center' }}>
        {stepIndex === totalSteps - 1 ? 'Get Started 🎉' : 'Next'}
        {stepIndex < totalSteps - 1 && <ArrowRight size={16} />}
      </button>
      <button
        onClick={onSkip}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
      >
        Skip
      </button>
    </div>
  </div>
);

// ─── Onboarding Modal ─────────────────────────────────────────────────────────
const OnboardingModal = () => {
  const { isActive, currentStep, step, totalSteps, next, back, skip, finish } = useOnboarding();

  if (!isActive) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9000,
      }} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Getting started with API Forge"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass-bright)',
          borderRadius: 'var(--radius-xl)',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), var(--shadow-neon)',
          padding: '48px',
          width: '620px',
          maxWidth: '92vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 9001,
        }}
      >
        {/* Close button */}
        <button
          onClick={finish}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-glass)',
            borderRadius: '50%',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          aria-label="Close onboarding"
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {step.type === 'welcome' ? (
            <WelcomeScreen onNext={next} onSkip={skip} />
          ) : (
            <StepScreen
              step={step}
              stepIndex={currentStep}
              totalSteps={totalSteps}
              onNext={next}
              onBack={back}
              onSkip={skip}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingModal;
