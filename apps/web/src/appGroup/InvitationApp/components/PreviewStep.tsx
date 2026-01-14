import { TITLES, InvitationInput, Language } from "@gem/shared";
import { theme } from "../../../theme.js";

interface PreviewStepProps {
    data: InvitationInput;
    imageUrl?: string;
    loading?: boolean;
    onGenerate: () => void;
    onBack?: () => void;
}

export function PreviewStep({
    data,
    imageUrl,
    loading,
    onGenerate,
    onBack,
}: PreviewStepProps) {
    return (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {!imageUrl && (
                <>
                    <div>
                        <h2 style={{ fontSize: '24px', margin: '0 0 8px', color: theme.colors.primary }}>
                            Review Your Details
                        </h2>
                        <p style={{ margin: 0, color: theme.colors.textSecondary }}>
                            Title: {TITLES[data.language || "english" as Language]}
                        </p>
                    </div>

                    <div style={{
                        textAlign: 'left',
                        backgroundColor: theme.colors.background,
                        padding: '24px',
                        borderRadius: theme.borderRadius.md,
                        overflow: 'auto',
                        maxHeight: '300px',
                        border: `1px solid ${theme.colors.border}`
                    }}>
                        <pre style={{ margin: 0, fontSize: '14px', fontFamily: 'monospace' }}>
                            {JSON.stringify(data, null, 2)}
                        </pre>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                style={{
                                    flex: 1,
                                    backgroundColor: 'white',
                                    color: theme.colors.text,
                                    padding: '16px 24px',
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.md,
                                    cursor: 'pointer',
                                    transition: theme.transitions.default
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hoverOverlay}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Edit Details
                            </button>
                        )}
                        <button
                            onClick={onGenerate}
                            disabled={loading}
                            style={{
                                flex: 2,
                                backgroundColor: theme.colors.primary,
                                color: theme.colors.surface,
                                padding: '16px 32px',
                                fontSize: '18px',
                                fontWeight: 600,
                                border: 'none',
                                borderRadius: theme.borderRadius.md,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                transition: theme.transitions.default
                            }}
                            onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '1')}
                        >
                            {loading ? "Generating Magic..." : "Generate Invitation ✨"}
                        </button>
                    </div>
                </>
            )}

            {imageUrl && (
                <div style={{ animation: 'fadeIter 0.5s ease-out' }}>
                    <img
                        src={imageUrl}
                        style={{
                            display: 'block',
                            margin: '0 auto 24px',
                            maxWidth: '100%',
                            borderRadius: theme.borderRadius.lg,
                            boxShadow: theme.shadows.card,
                            border: `1px solid ${theme.colors.border}`
                        }}
                    />
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        {onBack && (
                            <button
                                onClick={onBack}
                                style={{
                                    backgroundColor: 'white',
                                    color: theme.colors.text,
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    border: `1px solid ${theme.colors.border}`,
                                    borderRadius: theme.borderRadius.md,
                                    cursor: 'pointer',
                                    transition: theme.transitions.default
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.hoverOverlay}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                                Back to Edit
                            </button>
                        )}
                        <a
                            href={imageUrl}
                            download="invitation.png"
                            style={{
                                display: 'inline-block',
                                backgroundColor: theme.colors.primary,
                                color: theme.colors.surface,
                                padding: '12px 48px',
                                borderRadius: theme.borderRadius.md,
                                textDecoration: 'none',
                                fontWeight: 600,
                                transition: theme.transitions.default
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Download PNG
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
