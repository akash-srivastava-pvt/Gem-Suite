import React from "react";
import { ShellApp } from "@gem/shared";
import { theme } from "../theme.js";
import { useShell } from "../context/ShellContext.js";

type Props = {
    activeApp: ShellApp;
    onBack: () => void;
};

const AppHeader: React.FC<Props> = ({ activeApp, onBack }) => {
    const { headerActions } = useShell();

    return (
        <div style={styles.header}>
            <div style={styles.left}>
                <button onClick={onBack} style={styles.backButton} title="Go Back">
                    ←
                </button>
                <div style={styles.titleContainer}>
                    <span style={styles.icon}>{activeApp.icon}</span>
                    <span style={styles.title}>{activeApp.name}</span>
                </div>
            </div>
            <div style={styles.right}>
                {headerActions}
            </div>
        </div>
    );
};

const styles = {
    header: {
        height: "64px",
        background: "var(--surface)",
        borderBottom: `1px solid var(--border)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        zIndex: 100,
    },
    left: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    right: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    backButton: {
        background: "transparent",
        border: "none",
        fontSize: "20px",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "var(--radius-full)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text)",
        width: "40px",
        height: "40px",
    },
    titleContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    icon: {
        fontSize: "24px",
    },
    title: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "var(--text)",
    },
};

export default AppHeader;
