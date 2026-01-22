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

    event:{
        title: "Event Details",
        defaultValues: {
            language: "english" as Language,
            religion: "inclusive of all religions" as Religion,
        },
        fields: [
            { name: "theme", label: "Theme", type: "select", options: [
                { label: "Birthday", value: "birthday" },
                { label: "Festival", value: "festival" },
                { label: "Religious", value: "religious" },
                { label: "Technical Event", value: "technical_event" },
                { label: "Social Event", value: "social_event" },
                { label: "College Event", value: "college_event" },
            ]},
            { name: "eventName", label: "Event Name", type: "text", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "venue", label: "Venue", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea", required: true },
            { name: "RSVP Contact", label: "RSVP Contact", type: "text", required: true },
        ],
    },

    greetings:{
        title: "Greetings Card",
        defaultValues: {
            theme: "birthday",
            language: "english" as Language,
            religion: "inclusive of all religions" as Religion,
        },
        fields: [
            { name: "theme", label: "Theme", type: "select", options: [
                { label: "Birthday", value: "birthday" },
                { label: "Festival", value: "festival" },
                { label: "Religious", value: "religious" },
            ]},
            { name: "greeting", label: "Greeting", type: "text", required: true },
            { name: "date", label: "Date", type: "date", required: true },
            { name: "fromName ", label: "From Name", type: "text", required: true },
        ],
    }
};
