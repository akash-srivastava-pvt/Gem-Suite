import { InvitationTheme } from "@gem/shared";
import { invitationFormConfig } from "../config/invitationFormConfig.js";
import { theme } from "../../../theme.js";

export function ThemeSelector({
    onSelect,
}: {
    onSelect: (theme: InvitationTheme) => void;
}) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {Object.entries(invitationFormConfig).map(([key, cfg]) => (
                <button
                    key={key}
                    onClick={() => onSelect(key as InvitationTheme)}
                    style={{
                        padding: '32px',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.colors.surface,
                        cursor: 'pointer',
                        transition: theme.transitions.default,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '16px',
                        textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.primary;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = theme.shadows.hover;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = theme.colors.border;
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: theme.colors.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                    }}>
                        {/* Placeholder icon based on theme name could go here */}
                        ✨
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: theme.colors.text }}>
                            {cfg.title}
                        </h3>
                        {/* Add a description if available, or just keeping it clean */}
                    </div>
                </button>
            ))}
        </div>
    );
}
