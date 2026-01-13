import { useState } from 'react';
import { textEditorService} from '../services/textEditorService.js';
import { TextEditorIntent } from '@gem/shared';


export function useAtCommand() {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseCommand = (fullText: string) => {
    const lines = fullText.split('\n');
    const lastLine = lines[lines.length - 1];
    const lastWord = lastLine.split(/\s/).pop() || "";

    // 1. Detect "// Prompt" pattern
    if (lastLine.trim().startsWith('//')) {
      return {
        intent: 'continue' as TextEditorIntent,
        args: lastLine.replace('//', '').trim(),
        triggerType: 'slash' as const,
        fullMatch: lastLine
      };
    }

    // 2. Detect "@command" pattern
    if (lastWord.startsWith('@')) {
      const match = lastWord.match(/^@(translate|rewrite|summarize|fix)(.*)$/i);
      if (match) {
        return {
          intent: (match[1].toLowerCase() === 'fix' ? 'grammar' : match[1].toLowerCase()) as TextEditorIntent,
          args: match[2].trim(),
          triggerType: 'at' as const,
          fullMatch: lastWord
        };
      }
    }
    return null;
  };

  const executeCommand = async (fullContent: string) => {
    const cmd = parseCommand(fullContent);
    if (!cmd) return null;

    setIsProcessing(true);
    try {
      // Get content excluding the trigger
      const lastTriggerIdx = fullContent.lastIndexOf(cmd.triggerType === 'slash' ? '//' : '@');
      const contextText = fullContent.slice(0, lastTriggerIdx).trim();

      const result = await textEditorService.query({
        intent: cmd.intent,
        // If it's a slash prompt, use the prompt text. If @, use the document context.
        text: cmd.triggerType === 'slash' ? cmd.args : contextText, 
        language: cmd.intent === 'translate' ? cmd.args : undefined,
        tone: cmd.intent === 'rewrite' ? cmd.args : undefined,
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