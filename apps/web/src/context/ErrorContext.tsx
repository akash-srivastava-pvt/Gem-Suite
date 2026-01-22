/**
 * Global error context for displaying network and server errors
 * Provides centralized error handling for API failures
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'server' | 'validation' | 'auth';
  timestamp: number;
  isDismissible: boolean;
}

interface ErrorContextType {
  errors: AppError[];
  addError: (message: string, type?: AppError['type']) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback(
    (message: string, type: AppError['type'] = 'server'): string => {
      const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const error: AppError = {
        id,
        message,
        type,
        timestamp: Date.now(),
        isDismissible: true,
      };

      setErrors((prev) => [...prev, error]);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        removeError(id);
      }, 8000);

      return id;
    },
    []
  );

  const removeError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Attach global window error handlers so unexpected runtime errors are surfaced in the UI
  React.useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      const msg = ev.message || 'Unknown error';
      addError(msg, 'server');
      // Send to main for logging when available
      try {
        if ((window as any).electron?.reportError) {
          (window as any).electron.reportError({ message: msg, stack: ev.error?.stack });
        }
      } catch (e) {
        // ignore
      }
    };

    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason = (ev.reason && (ev.reason.message || String(ev.reason))) || 'Unhandled promise rejection';
      addError(reason, 'server');
      try {
        if ((window as any).electron?.reportError) {
          (window as any).electron.reportError({ message: reason, stack: ev.reason?.stack });
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection as any);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection as any);
    };
  }, [addError]);

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrors = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrors must be used within ErrorProvider');
  }
  return context;
};
