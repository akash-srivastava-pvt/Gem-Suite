import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home.js';
import ErrorModal from './components/ErrorModal.js';

const App: React.FC = () => {
    useEffect(() => {
        const handleOnline = () => window.gem?.sendNetworkStatus?.('online');
        const handleOffline = () => window.gem?.sendNetworkStatus?.('offline');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <BrowserRouter>
            <ErrorModal />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;