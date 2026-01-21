import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Activate: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/', { replace: true });
    }, [navigate]);

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
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                textAlign: 'center'
            }}>
                <h1 style={{ marginBottom: '10px' }}>Redirecting...</h1>
                <p style={{ color: '#666' }}>
                    Please configure your API keys in Gem Profile to continue.
                </p>
            </div>
        </div>
    );
};

export default Activate;