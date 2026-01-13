import React from "react";
import { TextEditorMain } from "./components/TextEditorMain.jsx";
import "./styles/editor.css";

/**
 * Likhit AI - Exported for Gem ShellApp integration.
 */
export const TextEditorApp: React.FC = () => {
  return (
    <div className="likhit-app-container">
      <TextEditorMain />
    </div>
  );
};