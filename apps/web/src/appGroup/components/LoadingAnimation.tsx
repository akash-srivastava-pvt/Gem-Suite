import { useState, useEffect } from "react";
import { theme } from "../../theme.js";

interface LoadingAnimationProps {
    app: 'resume' | 'trip' | 'invitation';
    customMessage?: string;
}

export function LoadingAnimation({ app, customMessage }: LoadingAnimationProps) {
    const [currentMessage, setCurrentMessage] = useState(0);

    const appThemes = {
        resume: {
            emojis: ["📄", "✍️", "🎯", "🚀", "💼"],
            messages: [
                "✨ Crafting your professional story...",
                "🎨 Designing ATS-friendly layouts...",
                "📝 Optimizing keywords and content...",
                "🎯 Tailoring for your target roles...",
                "🚀 Finalizing your career documents..."
            ],
            colors: {
                primary: ['#1E40AF', '#3B82F6'], // Blue tones
                secondary: ['#60A5FA', '#93C5FD'],
                accent: ['#FFFFFF', '#F59E0B']
            }
        },
        trip: {
            emojis: ["🗺️", "✈️", "🏖️", "🏔️", "🌟"],
            messages: [
                "🗺️ Mapping out perfect destinations...",
                "✈️ Finding the best travel routes...",
                "🏖️ Discovering hidden gems and experiences...",
                "🏔️ Optimizing your itinerary schedule...",
                "🌟 Creating unforgettable memories..."
            ],
            colors: {
                primary: ['#059669', '#10B981'], // Green tones
                secondary: ['#34D399', '#6EE7B7'],
                accent: ['#FFFFFF', '#F59E0B']
            }
        },
        invitation: {
            emojis: ["💒", "💍", "👰", "🤵", "🎊"],
            messages: [
                "✨ Crafting your perfect invitation...",
                "🎨 Adding beautiful designs and colors...",
                "📝 Personalizing your special message...",
                "🌟 Making it magical with AI...",
                "🎭 Almost ready for your celebration..."
            ],
            colors: {
                primary: ['#7C3AED', '#8B5CF6'], // Purple tones
                secondary: ['#A78BFA', '#C4B5FD'],
                accent: ['#FFFFFF', '#F59E0B']
            }
        }
    };

    const currentTheme = appThemes[app];
    const currentEmojis = currentTheme.emojis;
    const messages = customMessage ? [customMessage] : currentTheme.messages;

    useEffect(() => {
        if (messages.length > 1) {
            const interval = setInterval(() => {
                setCurrentMessage(prev => (prev + 1) % messages.length);
            }, 2200);
            return () => clearInterval(interval);
        }
    }, [messages.length]);

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
                    background: `linear-gradient(90deg, ${currentTheme.colors.primary[0]}, ${currentTheme.colors.primary[1]})`,
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
                    background: `linear-gradient(135deg, ${currentTheme.colors.primary[0]}, ${currentTheme.colors.primary[1]})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
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
                {app === 'resume' && "This usually takes 20-45 seconds. AI is crafting your career story! 📈"}
                {app === 'trip' && "This usually takes 15-30 seconds. AI is planning your perfect adventure! 🌍"}
                {app === 'invitation' && "This usually takes 15-30 seconds. AI is creating your special invitation! 💫"}
            </p>
        </div>
    );
}
