import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activateService } from '../services/activateService.js';

const Activate: React.FC = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    // Remove loading state and activation check
    const [isActivating, setIsActivating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);



    /**
     * Handle activation submission
     */
    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!apiKey.trim()) {
            setError('API key is required');
            return;
        }

        if (apiKey.trim().length < 20) {
            setError('API key appears to be too short');
            return;
        }

        setIsActivating(true);
        setError(null);

        try {
            const success = await activateService.create(apiKey.trim());

            if (success) {
                // Activation successful, redirect to app and reload to update activation state
                navigate('/', { replace: true });
                window.location.reload();
            } else {
                setError('Invalid API key or activation failed');
            }
        } catch (err: any) {
            console.error('Activation error:', err);
            setError(err.message || 'Unable to activate. Please try again.');
        } finally {
            setIsActivating(false);
        }
    };



    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5'
        }}>
            <div style={{
                maxWidth: 450,
                width: '100%',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ marginBottom: '10px', textAlign: 'center' }}>Gem Suite</h1>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>
                    Activate with your Gemini API Key
                </p>

                <form onSubmit={handleActivate}>
                    <div style={{ marginBottom: '15px' }}>
                        <label htmlFor="apiKey" style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: '500'
                        }}>
                            Gemini API Key
                        </label>

                        <div style={{ position: 'relative' }}>
                            <input
                                id="apiKey"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Paste your Gemini API key here"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setError(null);
                                }}
                                disabled={isActivating}
                                style={{
                                    width: '100%',
                                    padding: '10px 35px 10px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '14px',
                                    boxSizing: 'border-box'
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '5px'
                                }}
                                disabled={isActivating}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#fee',
                            color: '#c33',
                            padding: '10px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isActivating || !apiKey.trim()}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: isActivating ? 'not-allowed' : 'pointer',
                            opacity: isActivating || !apiKey.trim() ? 0.6 : 1
                        }}
                    >
                        {isActivating ? 'Activating...' : 'Activate'}
                    </button>
                </form>

                <p style={{
                    marginTop: '20px',
                    fontSize: '12px',
                    color: '#999',
                    textAlign: 'center'
                }}>
                    Get your API key from{' '}
                    <a
                        href="https://aistudio.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'none' }}
                    >
                        Google AI Studio
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Activate;
