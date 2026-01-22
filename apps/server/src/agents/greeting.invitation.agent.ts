import { GreetingInvitation } from '@gem/shared';

function greetingTypeStyle(greetingType?: string) {
    switch (greetingType?.toLowerCase()) {
        case 'birthday':
            return 'Celebratory birthday greeting design with balloons, cake motifs, and festive colors';
        case 'festival':
            return 'Traditional festival greeting design with cultural decorations and festive elements';
        case 'religious':
            return 'Sacred religious greeting design with traditional symbols and spiritual colors';
        default:
            return 'Elegant greeting card design with clean and modern aesthetics';
    }
}

function languageInstruction(language?: string) {
    if (language === 'hindi')
        return 'All text must be in Hindi (Devanagari script)';
    if (language === 'urdu')
        return 'All text must be in Urdu (Nastaliq script)';
    return 'All text must be in English';
}

export function buildGreetingInvitationPrompt(data: GreetingInvitation): string {
    return `
Create a vertical greeting card.

Style:
- ${greetingTypeStyle(data.greetingType)}
- Premium, clean, print-ready
- No spelling mistakes
- No watermark

Language:
- ${languageInstruction(data.language)}

Text content (exact):
"${data.greeting}"
Date: ${data.date}
From: ${data.fromName}

Output:
- High-resolution PNG
- Suitable for WhatsApp and print
`;
}
