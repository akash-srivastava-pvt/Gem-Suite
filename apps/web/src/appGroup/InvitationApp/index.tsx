import { useInvitationWizard } from "./hooks/useInvitationWizard.js";
import { ThemeSelector } from "./components/ThemeSelector.js";
import { DynamicForm } from "./components/DynamicForm.js";
import { PreviewStep } from "./components/PreviewStep.js";
import { invitationFormConfig } from "./config/invitationFormConfig.js";

import { theme as appTheme } from "../../theme.js";
import { Stepper } from "./components/Stepper.js";

export const InvitationApp = () => {
    const wizard = useInvitationWizard();
    const { step, theme, formData } = wizard.state;

    const steps = ["Select Theme", "Enter Details", "Review & Download"];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: appTheme.colors.background
        }}>
            {/* LEFT: SIDEBAR */}
            <div style={{
                borderRight: `1px solid ${appTheme.colors.border}`,
                padding: '24px 20px',
                backgroundColor: appTheme.colors.surface,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h1 style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '32px',
                    color: appTheme.colors.primary
                }}>
                    Invitation Maker
                </h1>
                <Stepper
                    currentStep={step}
                    steps={steps}
                    onStepClick={(s) => {
                        // Only allow clicking steps we've already reached or are current
                        if (s < step) {
                            // Simple jump back logic
                            while (wizard.state.step > s) {
                                wizard.back();
                            }
                        }
                    }}
                />

                <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
                    <button
                        onClick={wizard.reset}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: appTheme.borderRadius.md,
                            border: `1px solid ${appTheme.colors.border}`,
                            backgroundColor: 'transparent',
                            color: appTheme.colors.textSecondary,
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            transition: appTheme.transitions.default
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = appTheme.colors.hoverOverlay;
                            e.currentTarget.style.color = appTheme.colors.primary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = appTheme.colors.textSecondary;
                        }}
                    >
                        <span>↺</span> Create New
                    </button>
                </div>
            </div>

            {/* RIGHT: CONTENT */}
            <div style={{
                overflowY: 'auto',
                padding: '24px 40px',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '800px', // Limit width for readability
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{
                    backgroundColor: appTheme.colors.surface,
                    borderRadius: appTheme.borderRadius.lg,
                    padding: '24px',
                    boxShadow: appTheme.shadows.card,
                    minHeight: 'min-content'
                }}>
                    {step === 1 && (
                        <ThemeSelector onSelect={wizard.selectTheme} />
                    )}

                    {step === 2 && theme && (
                        <DynamicForm
                            config={invitationFormConfig[theme]}
                            onSubmit={(data) => {
                                wizard.updateForm(data);
                                wizard.next();
                            }}
                            onBack={wizard.back}
                        />
                    )}

                    {step === 3 && formData && (
                        <PreviewStep
                            data={formData}
                            imageUrl={wizard.state.imageUrl}
                            loading={wizard.state.loading}
                            onGenerate={wizard.generate}
                            onBack={wizard.back}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}   
