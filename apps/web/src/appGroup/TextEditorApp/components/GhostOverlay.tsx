import React from 'react';

interface GhostOverlayProps {
  content: string;
  suggestion: string;
}

export const GhostOverlay: React.FC<GhostOverlayProps> = ({ content, suggestion }) => {
  return (
    <div className="ghost-layer">
      <span>{content}</span>
      <span className="ghost-text">{suggestion}</span>
    </div>
  );
};