import { textEditorService } from '../services/textEditorService.js';
import { TextEditorIntent } from '@gem/shared';

export type AIActionType = 'rewrite' | 'summarize' | 'grammar' | 'translate';

export interface AIActionParams {
    command: AIActionType;
    text: string;
    targetLanguage?: string;
    customPrompt?: string;
    tone?: string;
    context?: string;
}

export const invokeAIAction = async (params: AIActionParams): Promise<string> => {
    const { command, text, targetLanguage, customPrompt, tone = 'neutral', context = 'editor' } = params;

    // Use customPrompt as override, otherwise build standard prompt
    let fullPrompt = '';
    if (customPrompt) {
        fullPrompt = customPrompt;
    } else {
        const promptPrefixMap: Record<AIActionType, string> = {
            rewrite: 'Rewrite the following text to be more clear and engaging:',
            summarize: 'Summarize the following text while keeping key points:',
            grammar: 'Fix the grammar and spelling in the following text:',
            translate: `Translate the following text to ${targetLanguage}:`
        };
        fullPrompt = `${promptPrefixMap[command]}\n\n"${text}"`;
    }

    try {
        const result = await textEditorService.query({
            intent: command === 'summarize' ? 'summarize' : 'continue',
            text: fullPrompt,
            language: targetLanguage,
            tone: tone,
        });

        return result;
    } catch (error) {
        console.error('AI Action failed:', error);
        throw error;
    }
};
