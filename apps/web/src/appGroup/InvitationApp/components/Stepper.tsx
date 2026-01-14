import React from 'react';
import { theme } from '../../../theme.js';
interface StepperProps {
    currentStep: number;
    steps: string[];
    onStepClick?: (step: number) => void;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps, onStepClick }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: isCompleted && onStepClick ? 'pointer' : 'default',
                            opacity: (isActive || isCompleted) ? 1 : 0.5
                        }}
                        onClick={() => isCompleted && onStepClick && onStepClick(stepNumber)}
                    >
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? theme.colors.primary : (isCompleted ? theme.colors.primary : 'transparent'),
                            border: `2px solid ${theme.colors.primary}`,
                            color: isActive || isCompleted ? theme.colors.surface : theme.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            transition: theme.transitions.default
                        }}>
                            {isCompleted ? '✓' : stepNumber}
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: isActive ? 600 : 500,
                            color: theme.colors.text
                        }}>
                            {label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
