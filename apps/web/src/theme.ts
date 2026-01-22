export const theme = {
    colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        primaryHover: "var(--primary-hover)",
        text: "var(--text)",
        textSecondary: "var(--text-secondary)",
        border: "var(--border)",
        hoverOverlay: "var(--hover-overlay)",
        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",
    },
    shadows: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        modal: "var(--shadow-modal)",
    },
    borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h1: {
            fontSize: "2rem",
            fontWeight: 800,
        },
        h2: {
            fontSize: "1.5rem",
            fontWeight: 700,
        },
        h3: {
            fontSize: "1.25rem",
            fontWeight: 600,
        },
        body: {
            fontSize: "1rem",
            fontWeight: 400,
        },
        caption: {
            fontSize: "0.875rem",
            fontWeight: 400,
        },
    },
    transitions: {
        default: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    }
};
