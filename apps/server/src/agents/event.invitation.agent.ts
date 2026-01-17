import { EventInvitation } from '@gem/shared';

function eventTypeStyle(eventType?: string) {
    switch (eventType?.toLowerCase()) {
        case 'birthday':
            return 'Celebratory birthday design with balloons, cake motifs, and festive colors';
        case 'festival':
            return 'Traditional festival motifs, cultural decorations, and festive elements';
        case 'religious':
            return 'Sacred religious symbols, traditional motifs, and spiritual colors';
        case 'technical_event':
            return 'Modern tech design with digital elements, code patterns, and innovative layouts';
        case 'social_event':
            return 'Elegant social gathering design with modern elements and sophisticated styling';
        case 'college_event':
            return 'Youthful college event design with energetic colors and contemporary elements';
        default:
            return 'Elegant event invitation design with modern and clean aesthetics';
    }
}

function languageInstruction(language?: string) {
    if (language === 'hindi')
        return 'All text must be in Hindi (Devanagari script)';
    if (language === 'urdu')
        return 'All text must be in Urdu (Nastaliq script)';
    return 'All text must be in English';
}

export function buildEventInvitationPrompt(data: EventInvitation): string {
    return `
Create a vertical event invitation card.

Style:
- ${eventTypeStyle(data.eventType)}
- Premium, clean, print-ready
- No spelling mistakes
- No watermark

Language:
- ${languageInstruction(data.language)}

Text content (exact):
"${data.eventName}"
Type: ${data.eventType}
Date: ${data.date}
Venue: ${data.venue}
${data.description ? `Description: ${data.description}` : ''}
${data.rsvpContact ? `RSVP: ${data.rsvpContact}` : ''}

Output:
- High-resolution PNG
- Suitable for WhatsApp and print
`;
}
