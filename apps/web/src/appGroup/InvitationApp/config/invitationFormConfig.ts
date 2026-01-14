import {
    InvitationTheme,
    Language,
    Religion,
} from "@gem/shared";

export type FieldType =
    | "text"
    | "date"
    | "time"
    | "textarea"
    | "select";

export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    options?: { label: string; value: string }[];
}

export interface ThemeFormConfig {
    title: string;
    defaultValues: Record<string, any>;
    fields: FormField[];
}

export const invitationFormConfig: Record<
    InvitationTheme,
    ThemeFormConfig
> = {
    wedding: {
        title: "Wedding Details",
        defaultValues: {
            theme: "wedding",
            language: "english" as Language,
            religion: "hindu" as Religion,
        },
        fields: [
            { name: "groomName", label: "Groom Name", type: "text", required: true },
            { name: "brideName", label: "Bride Name", type: "text", required: true },
            { name: "date", label: "Wedding Date", type: "date", required: true },
            { name: "time", label: "Time", type: "time", required: true },
            { name: "venue", label: "Venue", type: "text", required: true },
            { name: "familyDetails", label: "Family Details", type: "textarea" },
            { name: "rsvpContact", label: "RSVP Contact", type: "text" },
            {
                name: "language",
                label: "Language",
                type: "select",
                options: [
                    { label: "English", value: "english" },
                    { label: "Hindi", value: "hindi" },
                    { label: "Urdu", value: "urdu" },
                ],
            },
            {
                name: "religion",
                label: "Religion",
                type: "select",
                options: [
                    { label: "Hindu", value: "hindu" },
                    { label: "Muslim", value: "muslim" },
                    { label: "Christian", value: "christian" },
                    { label: "Sikh", value: "sikh" },
                ],
            },
        ],
    },

    mundan: {
        title: "Mundan Ceremony",
        defaultValues: {
            theme: "mundan",
            language: "hindi",
            religion: "hindu",
        },
        fields: [
            { name: "childName", label: "Child Name", type: "text", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "venue", label: "Venue", type: "text" },
        ],
    },

    festival: {
        title: "Festival Invitation",
        defaultValues: {
            theme: "festival",
            language: "english",
        },
        fields: [
            { name: "festivalName", label: "Festival Name", type: "text" },
            { name: "date", label: "Date", type: "date" },
            { name: "message", label: "Message", type: "textarea" },
        ],
    },

    religious: {
        title: "Religious Event",
        defaultValues: {
            theme: "religious",
        },
        fields: [
            { name: "eventName", label: "Event Name", type: "text" },
            { name: "date", label: "Date", type: "date" },
            { name: "venue", label: "Venue", type: "text" },
        ],
    },

    sokh_sabha: {
        title: "Sokh Sabha",
        defaultValues: {
            theme: "sokh_sabha",
        },
        fields: [
            { name: "speaker", label: "Speaker Name", type: "text" },
            { name: "topic", label: "Topic", type: "text" },
            { name: "date", label: "Date", type: "date" },
        ],
    },
};
