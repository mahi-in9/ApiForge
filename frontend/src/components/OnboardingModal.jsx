import React from 'react';
import { useOnboarding, ONBOARDING_STEPS } from '../context/OnboardingContext';
import { Database, Sparkles, Play, GitGraph, Terminal, X, ArrowRight, ArrowLeft, Zap, Code2 } from 'lucide-react';
import './OnboardingModal.css';

const WelcomeScreen = ({ onNext, onSkip }) => (
  <div className="ob-welcome animate-scale-in">
    <div className="ob-welcome__logo">
      <Zap size={32} color="var(--accent-blue)" />
    </div>
    <h1 className="ob-welcome__title">
      Welcome to{' '}
      <span className="ob-welcome__accent">API Forge</span>
    </h1>
    <p className="ob-welcome__desc">
      Build production-ready REST APIs visually.<br />No server code. No boilerplate. Just results.
    </p>
    <div className="ob-features">
      {[
        { icon: <Database size={20} color="var(--accent-blue)" />, label: 'Visual Schema Design', desc: 'Design collections & relationships visually' },
        { icon: <Code2 size={20} color="var(--accent-purple)" />, label: 'Auto-Generated APIs', desc: 'REST endpoints ready in seconds' },
        { icon: <Play size={20} color="var(--accent-green)" />, label: 'Live Playground', desc: 'Test endpoints without leaving the app' },
      ].map(({ icon, label, desc }) => (
        <div key={label} className="ob-feature-card">
          <div className="ob-feature-card__icon">{icon}</div>
          <div className="ob-feature-card__label">{label}</div>
          <div className="ob-feature-card__desc">{desc}</div>
        </div>
      ))}
    </div>
    <div className="ob-welcome__cta">
      <button className="btn-primary" onClick={onNext} style={{ padding: '11px 24px' }}>
        Create your first API in 2 minutes <ArrowRight size={16} />
      </button>
      <button className="ob-skip-btn" onClick={onSkip}>Skip tour</button>
    </div>
  </div>
);

const STEP_ICONS = {
  dashboard:       <Terminal size={24} color="var(--accent-blue)" />,
  schemas:         <Database size={24} color="var(--accent-blue)" />,
  'visual-studio': <GitGraph size={24} color="var(--accent-blue)" />,
  playground:      <Play size={24} color="var(--accent-blue)" />,
};

const StepScreen = ({ step, stepIndex, totalSteps, onNext, onBack, onSkip }) => (
  <div className="ob-step animate-fade-up">
    <div className="ob-step__icon">
      {STEP_ICONS[step.id] || <Sparkles size={24} color="var(--accent-blue)" />}
    </div>
    <div className="ob-step__label">Step {stepIndex} of {totalSteps - 1}</div>
    <h2 className="ob-step__title">{step.title}</h2>
    <p className="ob-step__desc">{step.description}</p>
    {step.tip && (
      <div className="ob-step__tip">
        <span className="ob-step__tip-icon">💡</span>
        {step.tip}
      </div>
    )}
    <div className="ob-step__dots">
      {ONBOARDING_STEPS.slice(1).map((_, i) => (
        <div
          key={i}
          className={`ob-step__dot ${i === stepIndex - 1 ? 'ob-step__dot--active' : 'ob-step__dot--inactive'}`}
        />
      ))}
    </div>
    <div className="ob-step__nav">
      {stepIndex > 1 && (
        <button className="btn-glass" onClick={onBack} style={{ padding: '9px 16px' }}>
          <ArrowLeft size={15} /> Back
        </button>
      )}
      <button className="btn-primary" onClick={onNext} style={{ flex: 1, justifyContent: 'center' }}>
        {stepIndex === totalSteps - 1 ? 'Get Started 🎉' : 'Next'}
        {stepIndex < totalSteps - 1 && <ArrowRight size={15} />}
      </button>
      <button className="ob-skip-btn" onClick={onSkip}>Skip</button>
    </div>
  </div>
);

const OnboardingModal = () => {
  const { isActive, currentStep, step, totalSteps, next, back, skip, finish } = useOnboarding();
  if (!isActive) return null;

  return (
    <>
      <div className="ob-backdrop" />
      <div className="ob-modal" role="dialog" aria-modal="true" aria-label="Getting started with API Forge">
        <button className="ob-close" onClick={finish} aria-label="Close onboarding">
          <X size={14} />
        </button>
        <div className="ob-content">
          {step.type === 'welcome' ? (
            <WelcomeScreen onNext={next} onSkip={skip} />
          ) : (
            <StepScreen step={step} stepIndex={currentStep} totalSteps={totalSteps} onNext={next} onBack={back} onSkip={skip} />
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingModal;
