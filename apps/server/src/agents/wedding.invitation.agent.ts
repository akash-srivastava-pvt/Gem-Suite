import { WeddingInvitation } from '@gem/shared';

function religionStyle(religion?: string) {
    switch (religion) {
        case 'hindu':
            return 'Traditional Hindu wedding motifs, mandap, marigold flowers';
        case 'muslim':
            return 'Elegant Islamic geometric patterns, crescent motifs';
        case 'christian':
            return 'Soft floral Christian wedding invitation style';
        default:
            return 'Elegant wedding invitation design';
    }
}

function languageInstruction(language?: string) {
    if (language === 'hindi')
        return 'All text must be in Hindi (Devanagari script)';
    if (language === 'urdu')
        return 'All text must be in Urdu (Nastaliq script)';
    return 'All text must be in English';
}

export function buildInvitationPrompt(data: WeddingInvitation): string {
    return `
Create a vertical wedding invitation card.

Style:
- ${religionStyle(data.religion)}
- Premium, clean, print-ready
- No spelling mistakes
- No watermark

Language:
- ${languageInstruction(data.language)}

Text content (exact):
"${data.groomName} & ${data.brideName}"
Date: ${data.date}
Time: ${data.time}
Venue: ${data.venue}
${data.familyDetails ? `Family: ${data.familyDetails}` : ''}
${data.rsvpContact ? `RSVP: ${data.rsvpContact}` : ''}

Output:
- High-resolution PNG
- Suitable for WhatsApp and print
`;
}
