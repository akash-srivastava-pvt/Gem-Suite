import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Activate from './auth/index.js';
import ActivationGuard from './auth/ActivationGuard.js';
import Home from './Home.js';
import ErrorModal from './components/ErrorModal.js';
import { activateService } from './services/activateService.js';

const App: React.FC = () => {
    const [activated, setActivated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    /**
     * Initialize API client and check activation status on mount
     */
    useEffect(() => {
        const init = async () => {
            try {
                // Check if stored key is still valid (no retries)
                const isActive = await activateService.get()|| false;
                setActivated(isActive);
            } catch (err: unknown) {
                console.error('Failed to initialize app:', err);
                setActivated(false);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return (
        <BrowserRouter>
            <ErrorModal />
            <Routes>
                {/* Activation Page */}
                <Route path="/activate" element={<Activate />} />

                {/* Protected App Routes */}
                <Route
                    path="/"
                    element={
                        <ActivationGuard activated={activated} loading={loading}>
                            <Home />
                        </ActivationGuard>
                    }
                />

                {/* 404 - Fallback to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;