import React, { useState } from "react";
import { ShellApp } from "@gem/shared";
import { theme } from "../theme.js";

type Props = {
    app: ShellApp;
    onClick: () => void;
    disabled?: boolean;
};

const AppTile: React.FC<Props> = ({ app, onClick, disabled }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const style = {
        ...styles.container,
        ...(isHovered && !disabled ? styles.containerHover : {}),
        ...(isPressed && !disabled ? styles.containerActive : {}),
        ...(disabled ? styles.containerDisabled : {}),
    };

    return (
        <div
            style={style}
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setIsPressed(false);
            }}
            onMouseDown={() => !disabled && setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
        >
            <div style={{ ...styles.icon, opacity: disabled ? 0.4 : 1 }}>{app.icon}</div>
            <div style={styles.content}>
                <span style={{ ...styles.title, opacity: disabled ? 0.6 : 1 }}>{app.name}</span>
                {disabled && <span style={styles.lockedBadge}>Locked</span>}
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: theme.colors.surface,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.card,
        padding: "24px",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: theme.transitions.default,
        border: `1px solid ${theme.colors.border}`,
        width: "140px",
        height: "140px",
        userSelect: "none" as const,
    },
    containerHover: {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows.hover,
    },
    containerActive: {
        transform: "scale(0.96)",
    },
    containerDisabled: {
        background: "#f5f5f5",
        cursor: "not-allowed",
        border: `1px dashed ${theme.colors.border}`,
        boxShadow: "none",
    },
    icon: {
        fontSize: "48px",
        marginBottom: "16px",
    },
    content: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: "4px",
    },
    title: {
        fontSize: "15px",
        fontWeight: 600,
        color: theme.colors.text,
        textAlign: "center" as const,
    },
    lockedBadge: {
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase" as const,
        color: theme.colors.textSecondary,
        background: theme.colors.border,
        padding: "2px 6px",
        borderRadius: "4px",
        marginTop: "4px",
    },
};

export default AppTile;
