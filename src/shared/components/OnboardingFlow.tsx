import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

import { Icon } from '@/shared/components/Icon';
import type { IconName } from '@/shared/components/Icon';

const STORAGE_KEY = 'requestkit_onboarding_completed';

interface OnboardingFlowProps {
  onComplete: () => void;
}

/** Total number of steps in the onboarding wizard. */
const TOTAL_STEPS = 5;

// ---------------------------------------------------------------------------
// Step 1 -- Welcome
// ---------------------------------------------------------------------------

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      {/* Logo placeholder */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-lg">
        <Icon name="shield" size={40} className="text-white" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Welcome to RequestKit
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md leading-relaxed">
        Your powerful companion for intercepting and modifying HTTP requests.
        Debug faster, test smarter, and take full control of your browser&apos;s
        network traffic.
      </p>

      <div className="mt-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Icon name="zap" size={14} className="text-primary-500" />
        <span>Takes less than a minute to get started</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 -- Key Features
// ---------------------------------------------------------------------------

interface FeatureItemProps {
  icon: IconName;
  color: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItemProps[] = [
  {
    icon: 'file-text',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    title: 'Header Modification',
    description:
      'Set, append, or remove request and response headers on the fly.',
  },
  {
    icon: 'shield',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    title: 'URL Blocking & Redirects',
    description:
      'Block unwanted requests or redirect URLs to different endpoints.',
  },
  {
    icon: 'flask-conical',
    color:
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    title: 'Response Mocking',
    description: 'Return custom responses for any URL to test edge cases.',
  },
  {
    icon: 'layers',
    color:
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    title: 'Profile-Based Organization',
    description: 'Group rules into profiles like Dev, Staging, and Production.',
  },
  {
    icon: 'package',
    color:
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    title: 'Template Library',
    description:
      'Kickstart your workflow with pre-built templates for common patterns.',
  },
];

function FeatureCard({
  icon,
  color,
  title,
  description,
}: Readonly<FeatureItemProps>) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div
        className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function KeyFeaturesStep() {
  return (
    <div className="px-6 py-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        Key Features
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
        Everything you need to intercept and modify network traffic
      </p>

      <div className="space-y-1">
        {FEATURES.map(feature => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 -- Quick Start
// ---------------------------------------------------------------------------

interface QuickStartItemProps {
  step: number;
  icon: IconName;
  title: string;
  description: string;
}

const QUICK_START_STEPS: QuickStartItemProps[] = [
  {
    step: 1,
    icon: 'plus',
    title: 'Create a New Rule',
    description:
      'Click the "+" button or use the "Add Rule" action in the options page.',
  },
  {
    step: 2,
    icon: 'target',
    title: 'Set a URL Pattern',
    description: 'Enter a URL pattern to match (e.g., *://api.example.com/*).',
  },
  {
    step: 3,
    icon: 'edit',
    title: 'Configure Your Action',
    description:
      'Choose to modify headers, block, redirect, or mock the response.',
  },
  {
    step: 4,
    icon: 'play',
    title: 'Enable & Test',
    description:
      'Toggle the rule on, reload the target page, and see it in action.',
  },
];

function QuickStartStep() {
  return (
    <div className="px-6 py-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        Quick Start
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        Create your first rule in four simple steps
      </p>

      <div className="relative space-y-5">
        {/* Vertical connecting line */}
        <div className="absolute left-[18px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {QUICK_START_STEPS.map(item => (
          <div key={item.step} className="flex items-start gap-4 relative">
            <div className="shrink-0 w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold z-10">
              {item.step}
            </div>
            <div className="pt-0.5 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon
                  name={item.icon}
                  size={14}
                  className="text-gray-400 dark:text-gray-500"
                />
                {item.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 -- Tips
// ---------------------------------------------------------------------------

interface TipItemProps {
  icon: IconName;
  text: string;
}

const TIPS: TipItemProps[] = [
  {
    icon: 'layers',
    text: 'Use profiles to organize rules by environment -- keep Dev, Staging, and Production separate.',
  },
  {
    icon: 'package',
    text: 'Browse the template library for ready-made rules like CORS fixes, auth headers, and cache busting.',
  },
  {
    icon: 'eye',
    text: 'Toggle rules on and off quickly from the popup without opening the full options page.',
  },
  {
    icon: 'download',
    text: 'Export your rules as JSON to share with teammates or back them up.',
  },
  {
    icon: 'code',
    text: 'Open DevTools and check the RequestKit panel for real-time request monitoring.',
  },
];

function TipsStep() {
  return (
    <div className="px-6 py-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
        Tips & Best Practices
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
        Get the most out of RequestKit
      </p>

      <div className="space-y-3">
        {TIPS.map(tip => (
          <div
            key={tip.text}
            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700"
          >
            <div className="shrink-0 mt-0.5">
              <Icon
                name={tip.icon}
                size={16}
                className="text-primary-500 dark:text-primary-400"
              />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {tip.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 -- Done
// ---------------------------------------------------------------------------

function DoneStep({ onOpenOptions }: Readonly<{ onOpenOptions: () => void }>) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-5">
        <Icon
          name="check"
          size={32}
          className="text-green-600 dark:text-green-400"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        You&apos;re All Set!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed mb-8">
        RequestKit is ready to go. Start creating rules to take control of your
        network requests.
      </p>

      <button
        type="button"
        onClick={onOpenOptions}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
      >
        Open Options Page
        <Icon name="external-link" size={16} className="text-white/80" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progress Indicator
// ---------------------------------------------------------------------------

function ProgressDots({
  current,
  total,
}: Readonly<{ current: number; total: number }>) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Go to step ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-2 bg-primary-600 dark:bg-primary-400'
              : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main OnboardingFlow component
// ---------------------------------------------------------------------------

/**
 * Multi-step onboarding wizard shown on first install. Guides the user through
 * key features and quick-start instructions.
 *
 * The component stores a completion flag in `chrome.storage.sync` so that the
 * onboarding is only shown once.
 *
 * @example
 * ```tsx
 * <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
 * ```
 */
export function OnboardingFlow({ onComplete }: Readonly<OnboardingFlowProps>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Mark onboarding as complete in storage and invoke the callback.
  const markComplete = useCallback(async () => {
    try {
      await chrome.storage.sync.set({ [STORAGE_KEY]: true });
    } catch {
      // Storage may be unavailable in some contexts; proceed regardless.
    }
    onComplete();
  }, [onComplete]);

  // Transition helpers
  const transitionTo = useCallback(
    (next: number, dir: 'forward' | 'backward') => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);

      // After the exit animation completes, switch the step.
      const timeout = setTimeout(() => {
        setCurrentStep(next);
        // Allow the enter animation to finish before re-enabling navigation.
        const enterTimeout = setTimeout(() => setIsAnimating(false), 300);
        return () => clearTimeout(enterTimeout);
      }, 200);

      return () => clearTimeout(timeout);
    },
    [isAnimating]
  );

  const goNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      transitionTo(currentStep + 1, 'forward');
    }
  }, [currentStep, transitionTo]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      transitionTo(currentStep - 1, 'backward');
    }
  }, [currentStep, transitionTo]);

  const handleSkip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const handleOpenOptions = useCallback(() => {
    markComplete();
    try {
      if (chrome.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      }
    } catch {
      // Silently handle environments where this API is not available.
    }
  }, [markComplete]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (currentStep < TOTAL_STEPS - 1) {
          goNext();
        }
      } else if (e.key === 'ArrowLeft') {
        goBack();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, goNext, goBack, handleSkip]);

  // Determine the animation CSS class applied to the step content.
  const animationClass = isAnimating
    ? direction === 'forward'
      ? 'opacity-0 translate-x-4'
      : 'opacity-0 -translate-x-4'
    : 'opacity-100 translate-x-0';

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Skip button */}
        {!isLastStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Skip onboarding"
          >
            <Icon name="close" size={18} />
          </button>
        )}

        {/* Step content */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out transform ${animationClass}`}
        >
          {currentStep === 0 && <WelcomeStep />}
          {currentStep === 1 && <KeyFeaturesStep />}
          {currentStep === 2 && <QuickStartStep />}
          {currentStep === 3 && <TipsStep />}
          {currentStep === 4 && <DoneStep onOpenOptions={handleOpenOptions} />}
        </div>

        {/* Footer: progress indicator + navigation */}
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <div className="w-24">
              {currentStep > 0 && !isLastStep && (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={isAnimating}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md px-2 py-1"
                >
                  <Icon name="arrow-left" size={14} />
                  Back
                </button>
              )}
            </div>

            {/* Progress dots */}
            <ProgressDots current={currentStep} total={TOTAL_STEPS} />

            {/* Next / Finish button */}
            <div className="w-24 flex justify-end">
              {!isLastStep && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={isAnimating}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Next
                  <Icon
                    name="arrow-right"
                    size={14}
                    className="text-white/80"
                  />
                </button>
              )}
              {isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Done
                  <Icon
                    name="check-simple"
                    size={14}
                    className="text-white/80"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Checks whether the onboarding has already been completed.
 * Returns `true` if it has, `false` otherwise.
 */
export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    return result[STORAGE_KEY] === true;
  } catch {
    return false;
  }
}

/**
 * Resets the onboarding flag so the flow will be shown again.
 * Useful for testing or when the user wants to replay the onboarding.
 */
export async function resetOnboarding(): Promise<void> {
  try {
    await chrome.storage.sync.remove(STORAGE_KEY);
  } catch {
    // Silently handle environments where storage is unavailable.
  }
}
