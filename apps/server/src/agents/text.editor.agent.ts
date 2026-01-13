import { TextEditorInput } from "@gem/shared";

export function buildTextEditorPrompt({ intent, text, language, tone }: TextEditorInput) {

  const baseSystem = `
You are Likhit AI, an intelligent writing assistant.
Audience: journalists, teachers, students, lawyers.
Follow these rules:
- Preserve meaning unless asked to change
- Be concise and professional
- No emojis
`;

  switch (intent) {
    case "grammar":
      return `
${baseSystem}
Task: Fix grammar and clarity without changing meaning.

Text:
${text}
`;

    case "rewrite":
      return `
${baseSystem}
Task: Rewrite the text.
Tone: ${tone ?? "neutral"}

Text:
${text}
`;

    case "autocomplete":
      return `
${baseSystem}
Task: Complete the unfinished sentence naturally.

Text:
${text}
`;

    case "continue":
      return `
${baseSystem}
Task: Continue writing in the same style.

Text:
${text}
`;

    case "translate":
      return `
${baseSystem}
Task: Translate the text into ${language}.

Text:
${text}
`;

    case "summarize":
      return `
${baseSystem}
Task: Summarize clearly.

Text:
${text}
`;

    default:
      throw new Error("Unknown Likhit intent");
  }
}
