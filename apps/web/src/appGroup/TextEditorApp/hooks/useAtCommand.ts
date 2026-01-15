import { useState } from 'react';
import { textEditorService } from '../services/textEditorService.js';
import { TextEditorIntent } from '@gem/shared';


export function useAtCommand() {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCommand = (fullText: string) => {
    const lines = fullText.split('\n');
    const lastLine = lines[lines.length - 1];

    // Detect "// Prompt" pattern
    if (lastLine.trim().startsWith('//')) {
      return {
        intent: 'continue' as TextEditorIntent,
        args: lastLine.replace('//', '').trim(),
        triggerType: 'slash' as const,
        fullMatch: lastLine
      };
    }

    return null;
  };

  const executeCommand = async (fullContent: string) => {
    const cmd = parseCommand(fullContent);
    if (!cmd) return null;

    setIsProcessing(true);
    try {
      // Get content excluding the trigger
      const lastTriggerIdx = fullContent.lastIndexOf(cmd.fullMatch);
      const contextText = fullContent.slice(0, lastTriggerIdx).trim();

      const result = await textEditorService.query({
        intent: cmd.intent,
        text: cmd.triggerType === 'slash' ? cmd.args : contextText,
        language: undefined,
        tone: undefined,
      });

      return result;
    } catch (error) {
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return { executeCommand, parseCommand, isProcessing };
}