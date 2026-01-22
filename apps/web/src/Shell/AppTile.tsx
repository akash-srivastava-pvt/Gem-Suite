import React, { useState } from "react";
import { ShellApp } from "@gem/shared";

type Props = {
    app: ShellApp;
    onClick: () => void;
    disabled?: boolean;
};

const AppTile: React.FC<Props> = ({ app, onClick, disabled }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            style={{
                ...styles.container,
                ...(isHovered && !disabled ? styles.containerHover : {}),
                ...(disabled ? styles.containerDisabled : {}),
            }}
            onClick={disabled ? undefined : onClick}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={styles.header}>
                <div style={{ ...styles.icon, opacity: disabled ? 0.4 : 1 }}>{app.icon}</div>
                {disabled && (
                    <div style={styles.lockBadge}>
                        <span style={{ fontSize: '10px' }}>Locked</span>
                    </div>
                )}
            </div>
            <div style={styles.body}>
                <h3 style={{ ...styles.title, opacity: disabled ? 0.6 : 1 }}>{app.name}</h3>
                <p style={{ ...styles.description, opacity: disabled ? 0.4 : 1 }}>
                    {app.description || "Experimental AI tool for laboratory testing."}
                </p>
            </div>
            <div style={{
                ...styles.footer,
                opacity: isHovered && !disabled ? 1 : 0,
                transform: isHovered && !disabled ? 'translateX(0)' : 'translateX(-8px)',
            }}>
                Launch App →
            </div>
        </div>
    );
};

const styles = {
    container: {
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        padding: "32px",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "space-between",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid var(--border)",
        height: "240px",
        position: "relative" as const,
        overflow: "hidden" as const,
    },
    containerHover: {
        transform: "translateY(-8px)",
        boxShadow: "var(--shadow-hover)",
        borderColor: "var(--primary)",
    },
    containerDisabled: {
        background: "rgba(0,0,0,0.02)",
        cursor: "not-allowed",
        borderStyle: "dashed",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    icon: {
        fontSize: "40px",
        marginBottom: "20px",
        transition: "transform 0.3s ease",
    },
    lockBadge: {
        background: "var(--border)",
        padding: "4px 8px",
        borderRadius: "var(--radius-full)",
        color: "var(--text-secondary)",
        fontWeight: 700,
        textTransform: "uppercase" as const,
    },
    body: {
        flex: 1,
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: 700,
        margin: "0 0 8px 0",
        color: "var(--text)",
    },
    description: {
        fontSize: "0.875rem",
        color: "var(--text-secondary)",
        lineHeight: 1.5,
        margin: 0,
    },
    footer: {
        marginTop: "20px",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "var(--primary)",
        transition: "all 0.3s ease",
    }
};

export default AppTile;
