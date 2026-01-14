import React from "react";
import { ShellApp } from "@gem/shared";
import { theme } from "../theme.js";

type Props = {
    activeApp: ShellApp;
    onBack: () => void;
};

const AppHeader: React.FC<Props> = ({ activeApp, onBack }) => {
    return (
        <div style={styles.header}>
            <button onClick={onBack} style={styles.backButton}>
                ←
            </button>
            <div style={styles.titleContainer}>
                <span style={styles.icon}>{activeApp.icon}</span>
                <span style={styles.title}>{activeApp.name}</span>
            </div>
        </div>
    );
};

const styles = {
    header: {
        height: "60px",
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "20px",
        flexShrink: 0,
    },
    backButton: {
        background: "transparent",
        border: "none",
        fontSize: "24px",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: theme.colors.primary,
        transition: theme.transitions.default,
        width: "40px",
        height: "40px",
    },
    titleContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    icon: {
        fontSize: "20px",
    },
    title: {
        fontSize: "18px",
        fontWeight: 600,
        color: theme.colors.text,
    },
};

export default AppHeader;
