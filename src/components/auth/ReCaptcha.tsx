import React, { useEffect, useRef, useCallback } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  action?: string;
  className?: string;
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

interface ReCaptchaRef {
  execute: () => Promise<string>;
}

const ReCaptcha = React.forwardRef<ReCaptchaRef, ReCaptchaProps>(({
  siteKey,
  onVerify,
  onExpire,
  onError,
  action = 'LOGIN',
  className = ''
}, ref) => {
  const isReadyRef = useRef(false);

  const execute = useCallback(async (): Promise<string> => {
    if (!window.grecaptcha || !window.grecaptcha.enterprise) {
      throw new Error('reCAPTCHA Enterprise not loaded');
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA execution error:', error);
          reject(error);
        }
      });
    });
  }, [siteKey, action]);

  // Expose execute method to parent component
  React.useImperativeHandle(ref, () => ({
    execute
  }));

  useEffect(() => {
    // Check if grecaptcha is loaded
    const checkGrecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.enterprise) {
        isReadyRef.current = true;
        return true;
      }
      return false;
    };

    if (!checkGrecaptcha()) {
      // Wait for grecaptcha to load
      const interval = setInterval(() => {
        if (checkGrecaptcha()) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
    }

    return () => {
      isReadyRef.current = false;
    };
  }, []);

  // Auto-execute when component mounts (for invisible reCAPTCHA)
  useEffect(() => {
    if (isReadyRef.current) {
      execute()
        .then(token => {
          onVerify(token);
        })
        .catch(error => {
          console.error('Auto-execute reCAPTCHA error:', error);
          onError?.();
        });
    }
  }, [execute, onVerify, onError]);

  // reCAPTCHA Enterprise v3 is invisible, so we don't render anything visible
  return (
    <div 
      className={`recaptcha-enterprise ${className}`}
      style={{ display: 'none' }}
      data-testid="recaptcha-enterprise"
    />
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha; 