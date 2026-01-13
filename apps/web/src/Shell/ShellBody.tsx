import React from "react";
import { ShellApp } from "@gem/shared";

type Props = {
    apps: ShellApp[];
    activeAppId: string;
};

const ShellBody: React.FC<Props> = ({ apps, activeAppId }) => {
    const activeApp = apps.find((a) => a.id === activeAppId);

    if (!activeApp) {
        return <div>Select an app</div>;
    }

    const ActiveComponent = activeApp.component;

    return (
        <div style={styles.body}>
            <ActiveComponent />
        </div>
    );
};

export default ShellBody;

const styles = {
    body: {
        flex: 1,
        padding: 16,
        overflow: "auto",
    },
};
