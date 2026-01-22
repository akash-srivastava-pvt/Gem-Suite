export interface ResumeData {
    name: string;
    contacts: { key: string; value: string }[];
    links: { key: string; value: string }[];
    work_history: any[];
    education: any[];
    personal_projects: any[];
    skills: { key: string; value: string }[];
    cover_letter_para: string;
}

export const AnonymisationService = {
    anonymise: (data: ResumeData) => {
        const originalPII: any = {
            name: data.name,
            contacts: [...data.contacts],
            links: [...data.links],
        };

        const anonymisedData = {
            ...data,
            name: "CANDIDATE_NAME",
            contacts: data.contacts.map((c, i) => ({
                key: c.key,
                value: `${c.key.toUpperCase().replace(/\s+/g, '_')}_PLACEHOLDER_${i + 1}`,
            })),
            links: data.links.map((l, i) => ({
                key: l.key,
                value: `PROFILE_LINK_${i + 1}`,
            })),
        };

        return { anonymisedData, originalPII };
    },

    reinsert: (anonymisedText: string, originalPII: any): string => {
        let result = anonymisedText;

        // Replace Name
        result = result.replace(/CANDIDATE_NAME/g, originalPII.name);

        // Replace Contacts
        originalPII.contacts.forEach((c: any, i: number) => {
            const placeholder = `${c.key.toUpperCase().replace(/\s+/g, '_')}_PLACEHOLDER_${i + 1}`;
            const regex = new RegExp(placeholder, 'g');
            result = result.replace(regex, c.value);
        });

        // Replace Links
        originalPII.links.forEach((l: any, i: number) => {
            const placeholder = `PROFILE_LINK_${i + 1}`;
            const regex = new RegExp(placeholder, 'g');
            result = result.replace(regex, l.value);
        });

        return result;
    },

    reinsertIntoJson: (jsonObj: any, originalPII: any): any => {
        let jsonString = JSON.stringify(jsonObj);
        const reinsertedString = AnonymisationService.reinsert(jsonString, originalPII);
        try {
            return JSON.parse(reinsertedString);
        } catch (e) {
            console.error("Failed to parse reinserted JSON", e);
            return jsonObj; // Fallback
        }
    }
};
