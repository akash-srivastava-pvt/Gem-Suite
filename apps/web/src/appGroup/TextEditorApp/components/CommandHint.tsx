import React from 'react';

export const CommandHint: React.FC<{ isProcessing: boolean }> = ({ isProcessing }) => {
  return (
    <div className="command-hint">
      {isProcessing ? "AI is thinking..." : "Press Enter to run command"}
    </div>
  );
};