import React, { useEffect, useRef, useCallback } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
  className?: string;
}

interface ReCaptchaOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact' | 'invisible';
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: string | HTMLElement, options: ReCaptchaOptions) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
  }
}

interface ReCaptchaRef {
  reset: () => void;
  getResponse: () => string;
}

// Global registry to track rendered reCAPTCHA instances
const recaptchaRegistry = new Map<HTMLElement, number>();

const ReCaptcha = React.forwardRef<ReCaptchaRef, ReCaptchaProps>(({
  siteKey,
  onVerify,
  onExpire,
  onError,
  className = ''
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isRenderedRef = useRef(false);

  const loadReCaptcha = useCallback(() => {
    if (!window.grecaptcha || !containerRef.current || isRenderedRef.current) {
      return;
    }

    // Check if this container already has a reCAPTCHA instance
    if (recaptchaRegistry.has(containerRef.current)) {
      const existingWidgetId = recaptchaRegistry.get(containerRef.current);
      if (existingWidgetId !== undefined) {
        widgetIdRef.current = existingWidgetId;
        isRenderedRef.current = true;
        return;
      }
    }

    // Clear the container first
    containerRef.current.innerHTML = '';

    try {
      const widgetId = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
        theme: 'light',
        size: 'normal'
      });

      widgetIdRef.current = widgetId;
      isRenderedRef.current = true;
      recaptchaRegistry.set(containerRef.current, widgetId);
    } catch (error) {
      console.error('Error rendering reCAPTCHA:', error);
      isRenderedRef.current = false;
    }
  }, [siteKey, onVerify, onExpire, onError]);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    // Check if grecaptcha is already loaded
    if (window.grecaptcha) {
      loadReCaptcha();
    } else {
      // Wait for grecaptcha to load
      checkInterval = setInterval(() => {
        if (window.grecaptcha) {
          clearInterval(checkInterval);
          loadReCaptcha();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => {
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      }, 10000);
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [loadReCaptcha]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current && recaptchaRegistry.has(containerRef.current)) {
        recaptchaRegistry.delete(containerRef.current);
      }
      isRenderedRef.current = false;
    };
  }, []);

  const reset = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
        // If reset fails, clear the registry and re-render
        if (containerRef.current) {
          recaptchaRegistry.delete(containerRef.current);
          containerRef.current.innerHTML = '';
          widgetIdRef.current = null;
          isRenderedRef.current = false;
          // Trigger a re-render
          setTimeout(() => {
            loadReCaptcha();
          }, 100);
        }
      }
    }
  };

  const getResponse = (): string => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      return window.grecaptcha.getResponse(widgetIdRef.current);
    }
    return '';
  };

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    reset,
    getResponse
  }));

  return (
    <div 
      ref={containerRef} 
      className={`recaptcha-container flex justify-center ${className}`}
      style={{
        minHeight: '78px', // Height of reCAPTCHA widget
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      data-testid="recaptcha-widget"
    />
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha; 