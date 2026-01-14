import React, { useState, useEffect } from "react";
import ShellBody from "./ShellBody.js";
import HomeView from "./HomeView.js";
import AppHeader from "./AppHeader.js";
import { ShellApp } from "@gem/shared";
import { theme } from "../theme.js";
import { userService } from "../services/userService.js";

type Props = {
    apps: ShellApp[];
};

const Shell: React.FC<Props> = ({ apps }) => {
    // Start with no app selected (Home screen)
    const [activeAppId, setActiveAppId] = useState<string | null>(null);
    const [isAgreed, setIsAgreed] = useState<boolean>(true); // Default to true to avoid flicker

    useEffect(() => {
        let interval: any;
        const checkAgreement = async () => {
            try {
                const status = await userService.getStatus();
                setIsAgreed(status.agreed);
                if (status.agreed && interval) {
                    clearInterval(interval);
                }
            } catch (err) {
                console.error("Failed to check agreement status", err);
            }
        };

        checkAgreement().then(() => {
            // Only poll if not agreed
            if (!isAgreed) {
                interval = setInterval(checkAgreement, 3000);
            }
        });

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isAgreed]);

    const handleSelectApp = (appId: string) => {
        if (!isAgreed && appId !== 'profile') {
            return;
        }
        setActiveAppId(appId);
    };

    const activeApp = apps.find((a) => a.id === activeAppId);

    if (!activeAppId || !activeApp) {
        return <HomeView apps={apps} onSelectApp={handleSelectApp} isAgreed={isAgreed} />;
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
