import React, { useState, useEffect } from "react";
import ShellBody from "./ShellBody.js";
import HomeView from "./HomeView.js";
import AppHeader from "./AppHeader.js";
import { ShellApp } from "@gem/shared";
import { theme } from "../theme.js";
import { unlockService } from "../services/unlockService.js";

type Props = {
    apps: ShellApp[];
};

const Shell: React.FC<Props> = ({ apps }) => {
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [unlockStatus, setUnlockStatus] = useState<any>({ unlocked: false, hasActiveApiKey: false, acceptedAgreement: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const checkUnlockStatus = async () => {
            try {
                const statusRes = await unlockService.getStatus();
                if (mounted) {
                    setUnlockStatus(statusRes.data || { unlocked: false, hasActiveApiKey: false, acceptedAgreement: true });
                }
            } catch (err) {
                console.error("Unlock status check failed:", err);
                if (mounted) {
                    // Fallback: allow access to profile for configuration
                    setUnlockStatus({ unlocked: false, hasActiveApiKey: false, acceptedAgreement: true });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        // Initial check with timeout
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Unlock check timeout, proceeding with fallback');
                setUnlockStatus({ unlocked: false, hasActiveApiKey: false, acceptedAgreement: true });
                setLoading(false);
            }
        }, 3000);

        checkUnlockStatus().finally(() => {
            clearTimeout(timeoutId);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    const handleSelectApp = (appId: string) => {
        if (appId === 'profile') {
            setActiveAppId(appId);
            return;
        }

        if (!unlockStatus?.unlocked || unlockStatus?.lockedApps?.includes(appId)) {
            return;
        }
        setActiveAppId(appId);
    };

    const activeApp = apps.find((a) => a.id === activeAppId);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '16px' }}>
                <div>Loading Gem Suite...</div>
            </div>
        );
    }

    if (!activeAppId || !activeApp) {
        return <HomeView apps={apps} onSelectApp={handleSelectApp} unlockStatus={unlockStatus} />;
    }

    return (
        <div style={styles.shell}>
            <AppHeader
                activeApp={activeApp}
                onBack={() => setActiveAppId(null)}
            />
            <ShellBody
                apps={apps}
                activeAppId={activeAppId}
            />
        </div>
    );
};

export default Shell;

const styles = {
    shell: {
        display: "flex",
        flexDirection: "column" as const,
        height: "100vh",
        background: theme.colors.background,
    },
};
