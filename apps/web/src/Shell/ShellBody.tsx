import React from "react";
import { ShellApp } from "@gem/shared";
import { ErrorBoundary } from "../components/ErrorBoundary.js";

type Props = {
    apps: ShellApp[];
    activeAppId: string;
};

const ShellBody: React.FC<Props> = ({ apps, activeAppId }) => {
    const activeComponent = apps.find((a) => a.id === activeAppId);

    if (!activeComponent) {
        return <div>Select an app</div>;
    }

    const ActiveComponent = activeComponent.component;

    return (
        <div style={styles.body}>
            <ErrorBoundary appName={activeComponent.name} key={activeAppId}>
                <ActiveComponent />
            </ErrorBoundary>
        </div>
    );
};

export default ShellBody;

const styles = {
    body: {
        flex: 1,
        // Remove padding and overflow so apps can handle their own layout (fitting to screen)
        height: "100%",
        display: "flex",
        flexDirection: "column" as const,
    },
};
