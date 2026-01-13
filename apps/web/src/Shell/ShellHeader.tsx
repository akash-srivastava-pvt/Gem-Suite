import React, { useRef } from "react";
import { ShellApp } from "@gem/shared";

type Props = {
    apps: ShellApp[];
    activeAppId: string;
    onSelect: (id: string) => void;
};

const ShellHeader: React.FC<Props> = ({
    apps,
    activeAppId,
    onSelect,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;

        scrollRef.current.scrollBy({
            left: dir === "left" ? -120 : 120,
            behavior: "smooth",
        });
    };

    return (
        <div style={styles.header}>
            <button onClick={() => scroll("left")} style={styles.arrow}>
                ◀
            </button>

            <div style={styles.iconContainer} ref={scrollRef}>
                {apps.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => onSelect(app.id)}
                        style={{
                            ...styles.icon,
                            borderBottom:
                                activeAppId === app.id
                                    ? "2px solid #4caf50"
                                    : "2px solid transparent",
                        }}
                    >
                        {app.icon}
                        <span style={styles.label}>{app.name}</span>
                    </div>
                ))}
            </div>

            <button onClick={() => scroll("right")} style={styles.arrow}>
                ▶
            </button>
        </div>
    );
};

export default ShellHeader;

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: "flex",
        alignItems: "center",
        height: 60,
        background: "#111",
        color: "#fff",
    },
    arrow: {
        width: 40,
        height: "100%",
        cursor: "pointer",
        background: "transparent",
        color: "#fff",
        border: "none",
        fontSize: 18,
    },
    iconContainer: {
        display: "flex",
        overflowX: "auto",
        flex: 1,
        gap: 16,
        padding: "0 10px",
    },
    icon: {
        cursor: "pointer",
        minWidth: 80,
        textAlign: "center",
        paddingBottom: 4,
    },
    label: {
        fontSize: 12,
        display: "block",
    },
};
