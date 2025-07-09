import React, { useEffect, useRef } from 'react';

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

const ReCaptcha = React.forwardRef<ReCaptchaRef, ReCaptchaProps>(({
  siteKey,
  onVerify,
  onExpire,
  onError,
  className = ''
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const loadReCaptcha = () => {
      if (window.grecaptcha && containerRef.current && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'expired-callback': onExpire,
            'error-callback': onError,
            theme: 'light',
            size: 'normal'
          });
        } catch (error) {
          console.error('Error rendering reCAPTCHA:', error);
          // If there's an error, try to reset and render again
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            try {
              widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                callback: onVerify,
                'expired-callback': onExpire,
                'error-callback': onError,
                theme: 'light',
                size: 'normal'
              });
            } catch (retryError) {
              console.error('Error on reCAPTCHA retry:', retryError);
            }
          }
        }
      }
    };

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
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (error) {
          console.error('Error resetting reCAPTCHA:', error);
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey, onVerify, onExpire, onError]);

  const reset = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (error) {
        console.error('Error resetting reCAPTCHA:', error);
        // If reset fails, try to re-render
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          widgetIdRef.current = null;
          // Trigger a re-render by calling loadReCaptcha
          setTimeout(() => {
            if (window.grecaptcha && containerRef.current) {
              try {
                widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
                  sitekey: siteKey,
                  callback: onVerify,
                  'expired-callback': onExpire,
                  'error-callback': onError,
                  theme: 'light',
                  size: 'normal'
                });
              } catch (renderError) {
                console.error('Error re-rendering reCAPTCHA:', renderError);
              }
            }
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