import React, { useState } from "react";
import ShellHeader from "./ShellHeader.js";
import ShellBody from "./ShellBody.js";
import { ShellApp } from "@gem/shared";


type Props = {
    apps: ShellApp[];
};

const Shell: React.FC<Props> = ({ apps }) => {
    const [activeAppId, setActiveAppId] = useState(apps[0]?.id);

    return (
        <div style={styles.shell}>
            <ShellHeader
                apps={apps}
                activeAppId={activeAppId}
                onSelect={setActiveAppId}
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
        background: "#f5f5f5",
    },
};
