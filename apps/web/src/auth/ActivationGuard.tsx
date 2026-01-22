import React from 'react';
import { Navigate } from 'react-router-dom';

interface ActivationGuardProps {
    activated: boolean;
    loading: boolean;
    children: React.ReactNode;
}

/**
 * Guard component that redirects to activation page if not activated
 */
const ActivationGuard: React.FC<ActivationGuardProps> = ({
    activated,
    loading,
    children,
}) => {
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div>
                    <p>Checking activation status...</p>
                </div>
            </div>
        );
    }

    if (!activated) {
        return <Navigate to="/activate" replace />;
    }

    return <>{children}</>;
};

export default ActivationGuard;
