/**
 * Error display modal component
 * Shows network, server, and application errors to the user
 */

import React from 'react';
import { useErrors, AppError } from '../context/ErrorContext.js';

const ErrorModal: React.FC = () => {
  const { errors, removeError } = useErrors();

  if (errors.length === 0) {
    return null;
  }

  const getErrorIcon = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return '🌐';
      case 'auth':
        return '🔐';
      case 'validation':
        return '⚠️';
      case 'server':
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: AppError['type']) => {
    switch (type) {
      case 'network':
        return '#ff9800'; // Orange
      case 'auth':
        return '#f44336'; // Red
      case 'validation':
        return '#ff9800'; // Orange
      case 'server':
      default:
        return '#d32f2f'; // Dark Red
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
        maxWidth: 400,
        width: '90%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        pointerEvents: 'auto',
        overflowY: 'auto',
      }}
    >
      {errors.map((error) => (
        <div
          key={error.id}
          style={{
            backgroundColor: 'white',
            borderLeft: `4px solid ${getErrorColor(error.type)}`,
            borderRadius: 6,
            padding: 16,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ fontSize: 20, flexShrink: 0 }}>
              {getErrorIcon(error.type)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: 4,
                  fontSize: 14,
                }}
              >
                {error.type === 'network' && 'Connection Error'}
                {error.type === 'server' && 'Server Error'}
                {error.type === 'auth' && 'Authentication Error'}
                {error.type === 'validation' && 'Validation Error'}
              </div>

              <div
                style={{
                  color: '#666',
                  fontSize: 13,
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {error.message}
              </div>

              {error.type === 'network' && (
                <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                  Please check your connection and try again.
                </div>
              )}
            </div>

            {error.isDismissible && (
              <button
                onClick={() => removeError(error.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#999',
                  fontSize: 18,
                  padding: 0,
                  flexShrink: 0,
                }}
                title="Dismiss"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ErrorModal;
