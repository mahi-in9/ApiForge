import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ONBOARDING_KEY = 'apiforge_onboarding_done';

const OnboardingContext = createContext(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to API Forge',
    subtitle: 'Build production-ready backend APIs without writing server code',
    type: 'welcome',
  },
  {
    id: 'dashboard',
    title: 'Step 1: Create a Project',
    description: 'Every API starts with a Project. Each project gets its own API key for secure access.',
    tip: 'Projects are like workspaces — you can have one for staging, one for production.',
    target: '[data-tour="dashboard"]',
    position: 'right',
  },
  {
    id: 'schemas',
    title: 'Step 2: Design Your Schema',
    description: 'Define your data collections and fields in the Schema Builder. Choose types, validations, and relationships.',
    tip: 'Tip: Use the "Relationship (ObjectId)" field type to link collections together.',
    target: '[data-tour="schemas"]',
    position: 'right',
  },
  {
    id: 'visual-studio',
    title: 'Step 3: Visualize & Connect',
    description: 'The Visual Schema Designer shows your collections as nodes. Connect them to create relationships.',
    tip: 'You can drag nodes to rearrange the layout — positions are saved automatically.',
    target: '[data-tour="visual-studio"]',
    position: 'right',
  },
  {
    id: 'playground',
    title: 'Step 4: Test Your API',
    description: 'The API Playground lets you make live GET, POST, PUT, DELETE requests right inside API Forge — no deployment needed.',
    tip: 'Your API key is pre-filled automatically from your selected project.',
    target: '[data-tour="playground"]',
    position: 'right',
  },
];

export const OnboardingProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-show on first visit
  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay to let the app render first
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finish();
    }
  }, [currentStep]);

  const back = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  const finish = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  }, []);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  return (
    <OnboardingContext.Provider value={{
      isActive, currentStep,
      step: ONBOARDING_STEPS[currentStep],
      totalSteps: ONBOARDING_STEPS.length,
      start, next, back, skip, finish,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
