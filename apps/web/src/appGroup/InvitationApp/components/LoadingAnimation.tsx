import { useState, useEffect } from "react";
import { theme } from "../../../theme.js";

interface LoadingAnimationProps {
    theme: string;
}

export function LoadingAnimation({ theme: invitationTheme }: LoadingAnimationProps) {
    const [currentMessage, setCurrentMessage] = useState(0);

    const messages = [
        "✨ Crafting your perfect invitation...",
        "🎨 Adding beautiful designs and colors...",
        "📝 Personalizing your special message...",
        "🌟 Making it magical with AI...",
        "🎭 Almost ready for your celebration...",
        "💫 Final touches and polish..."
    ];

    const themeEmojis = {
        wedding: ["💒", "💍", "👰", "🤵", "🎊"],
        event: ["🎉", "🎈", "🎊", "🎪", "🎵"],
        greetings: ["🎂", "🎁", "🎈", "✨", "🎊"]
    };

    const currentEmojis = themeEmojis[invitationTheme as keyof typeof themeEmojis] || ["✨", "🎨", "📝", "🌟", "🎭"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessage(prev => (prev + 1) % messages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
            padding: '48px 24px',
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.lg,
            border: `2px solid ${theme.colors.border}`,
            minHeight: '400px',
            justifyContent: 'center'
        }}>
            {/* Animated Emoji Ring */}
            <div style={{
                position: 'relative',
                width: '120px',
                height: '120px'
            }}>
                {currentEmojis.map((emoji, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            fontSize: '32px',
                            animation: `spin ${3 + index * 0.5}s linear infinite, pulse ${2 + index * 0.3}s ease-in-out infinite`,
                            animationDelay: `${index * 0.2}s`,
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) rotate(${index * 72}deg) translateY(-60px)`,
                            opacity: 0.8
                        }}
                    >
                        {emoji}
                    </div>
                ))}
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '80%',
                maxWidth: '300px',
                height: '8px',
                backgroundColor: theme.colors.hoverOverlay,
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    backgroundColor: theme.colors.primary,
                    borderRadius: '4px',
                    animation: 'progress 6s ease-in-out infinite',
                    width: '100%'
                }} />
            </div>

            {/* Animated Text */}
            <div style={{
                textAlign: 'center',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center'
            }}>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: theme.colors.primary,
                    margin: 0,
                    animation: 'fadeIn 0.5s ease-in-out',
                    opacity: 1
                }}>
                    {messages[currentMessage]}
                </h3>
            </div>

            {/* Subtle Hint */}
            <p style={{
                fontSize: '14px',
                color: theme.colors.textSecondary,
                margin: 0,
                textAlign: 'center',
                maxWidth: '300px'
            }}>
                This usually takes 15-30 seconds. Our AI is working its magic! 🎨✨
            </p>
        </div>
    );
}
