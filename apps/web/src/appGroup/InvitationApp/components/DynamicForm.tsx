import { useState } from "react";
import { ThemeFormConfig } from "../config/invitationFormConfig.js";
import { theme } from "../../../theme.js";

export function DynamicForm({
    config,
    onSubmit,
    onBack,
}: {
    config: ThemeFormConfig;
    onSubmit: (data: any) => void;
    onBack?: () => void;
}) {
    const [form, setForm] = useState<any>(config.defaultValues);

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.sm,
        fontSize: '16px',
        outline: 'none',
        transition: theme.transitions.default,
        backgroundColor: theme.colors.surface,
        color: theme.colors.text
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 500,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    };

    const handleFocus = (e: any) => {
        e.target.style.borderColor = theme.colors.primary;
        e.target.style.boxShadow = `0 0 0 2px ${theme.colors.hoverOverlay}`;
    };

    const handleBlur = (e: any) => {
        e.target.style.borderColor = theme.colors.border;
        e.target.style.boxShadow = 'none';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '24px', margin: 0, color: theme.colors.primary }}>{config.title}</h2>
                    <p style={{ margin: '8px 0 0', color: theme.colors.textSecondary }}>Please fill in the details below</p>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: theme.colors.textSecondary,
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        ← Back
                    </button>
                )}
            </div>

            {config.fields.map((field) => {
                const commonProps = {
                    key: field.name,
                    value: form[field.name] || "",
                    onChange: (e: any) => setForm({ ...form, [field.name]: e.target.value }),
                    style: inputStyle,
                    onFocus: handleFocus,
                    onBlur: handleBlur
                };

                return (
                    <div key={field.name}>
                        <label style={labelStyle}>{field.label}</label>
                        {field.type === "textarea" ? (
                            <textarea
                                {...commonProps}
                                placeholder={field.label}
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical' }}
                            />
                        ) : field.type === "select" ? (
                            <select {...commonProps}>
                                {field.options?.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                {...commonProps}
                                type={field.type}
                                placeholder={field.label}
                            />
                        )}
                    </div>
                );
            })}

            <div style={{
                paddingTop: '24px',
                borderTop: `1px solid ${theme.colors.border}`,
                display: 'flex',
                gap: '16px'
            }}>
                {onBack && (
                    <button
                        onClick={onBack}
                        style={{
                            flex: 1,
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
                        Back
                    </button>
                )}
                <button
                    onClick={() => onSubmit(form)}
                    style={{
                        flex: 2,
                        backgroundColor: theme.colors.primary,
                        color: theme.colors.surface,
                        padding: '12px 32px',
                        fontSize: '16px',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        transition: theme.transitions.default
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
