import React, { useState, useEffect } from 'react';
import * as TiptapReact from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { FontFamily } from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Image } from '@tiptap/extension-image';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import { EditorToolbar } from './EditorToolbar.js';
import { invokeAIAction, AIActionType } from '../services/aiActions.js';
import { FontSize } from '../utils/fontSize.js';
import { Indent } from '../utils/indent.js';
import { Page, PaginationDocument, Pagination } from '../utils/PaginationExtension.js';
import {
    Sparkles, Type, FileText,
    Check, X, RefreshCw, Wand2, Languages,
    Bold, Italic, Globe, AlignLeft, RefreshCcw, Loader2, ArrowUp, ArrowDown
} from 'lucide-react';

const { useEditor, EditorContent } = TiptapReact;
const BubbleMenu = (TiptapReact as any).BubbleMenu || (TiptapReact as any).TiptapBubbleMenu;

const LANGUAGES = [
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Russian', code: 'ru' },
    { name: 'Arabic', code: 'ar' },
    { name: 'Portuguese', code: 'pt' }
];

const wrapWithPages = (content: any) => {
    if (!content) return { type: 'document', content: [{ type: 'page', content: [{ type: 'paragraph' }] }] };
    if (typeof content === 'string') {
        const trimmed = content.trim();
        if (!trimmed) return { type: 'document', content: [{ type: 'page', content: [{ type: 'paragraph' }] }] };
        if (trimmed.includes('page-node')) return content;
        return `<div class="page-node">${content}</div>`;
    }
    if (content && typeof content === 'object' && content.type === 'doc') {
        if (content.content && content.content[0]?.type === 'page') return { ...content, type: 'document' };
        return {
            type: 'document',
            content: [{ type: 'page', content: content.content || [] }]
        };
    }
    return content;
};

export const TiptapEditor: React.FC<{
    initialContent?: any;
    onUpdate?: (content: any) => void;
}> = ({ initialContent = '', onUpdate }) => {
    const [isAILoading, setIsAILoading] = useState(false);
    const [aiResult, setAIResult] = useState<string | null>(null);
    const [currentAIAction, setCurrentAIAction] = useState<AIActionType | null>(null);
    const [lastPrompt, setLastPrompt] = useState<string | undefined>(undefined);
    const [stats, setStats] = useState({ words: 0, characters: 0 });
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    const [targetLanguage, setTargetLanguage] = useState('');
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [showContextMenu, setShowContextMenu] = useState(false);

    const editor = useEditor({
        extensions: [
            PaginationDocument,
            StarterKit.configure({ document: false }),
            Pagination,
            Page,
            Underline,
            TextStyle,
            FontFamily,
            FontSize,
            Indent,
            Color,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({ inline: true, allowBase64: true }),
            BubbleMenuExtension,
        ],
        content: wrapWithPages(initialContent),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();
            onUpdate?.(html);
            setStats({
                words: text.trim() ? text.trim().split(/\s+/).length : 0,
                characters: text.length
            });
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter') {
                    const { state } = view;
                    const { selection } = state;
                    const { $from } = selection;
                    const lineStart = $from.start();
                    const lineEnd = $from.end();
                    const lineText = state.doc.textBetween(lineStart, lineEnd);

                    if (lineText.trim().startsWith('//')) {
                        const command = lineText.trim().substring(2).trim();
                        if (command) {
                            handleAIAction('rewrite', command);
                            return true;
                        }
                    }
                }
                return false;
            },
            transformPastedHTML: (html) => {
                if (html.includes('page-node')) {
                    const temp = document.createElement('div');
                    temp.innerHTML = html;
                    const pageNodes = temp.querySelectorAll('.page-node');
                    if (pageNodes.length > 0) {
                        let combined = '';
                        pageNodes.forEach(node => combined += node.innerHTML);
                        return combined;
                    }
                }
                return html;
            }
        }
    });

    useEffect(() => {
        if (editor && initialContent !== undefined) {
            const currentHtml = editor.getHTML();
            const wrappedTarget = wrapWithPages(initialContent);
            const targetHtml = typeof wrappedTarget === 'string' ? wrappedTarget : JSON.stringify(wrappedTarget);
            if (currentHtml.replace(/\s/g, '') !== targetHtml.replace(/\s/g, '')) {
                editor.commands.setContent(wrappedTarget);
            }
        }
    }, [initialContent, editor]);

    const handleAIAction = async (action: AIActionType, customPrompt?: string, lang?: string) => {
        if (!editor) return;

        // If it's a Translate action and no language is selected yet, show the menu
        if (action === 'translate' && !lang && !customPrompt) {
            setShowLanguageSelector(true);
            return;
        }

        const { from, to } = editor.state.selection;
        let selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (!selectedText) {
            const $pos = editor.state.doc.resolve(from);
            selectedText = $pos.parent.textContent;
        }

        if (!selectedText && !customPrompt) return;

        setIsAILoading(true);
        setCurrentAIAction(action);
        setLastPrompt(customPrompt);
        setAIResult(null);
        setShowLanguageSelector(false);
        setShowContextMenu(false);

        try {
            const result = await invokeAIAction({
                command: action,
                text: selectedText,
                customPrompt,
                targetLanguage: lang || targetLanguage
            });
            setAIResult(result);
        } catch (error) {
            console.error('AI Action failed', error);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleAcceptReplace = () => {
        if (!editor || !aiResult) return;
        const { from, to } = editor.state.selection;
        editor.chain().focus().insertContentAt({ from, to }, aiResult).run();
        setAIResult(null);
    };

    const handleAcceptAfter = () => {
        if (!editor || !aiResult) return;
        const { to } = editor.state.selection;
        editor.chain().focus().insertContentAt(to, `\n${aiResult}`).run();
        setAIResult(null);
    };

    const handleAcceptBefore = () => {
        if (!editor || !aiResult) return;
        const { from } = editor.state.selection;
        editor.chain().focus().insertContentAt(from, `${aiResult}\n`).run();
        setAIResult(null);
    };

    const handleRegenerate = () => {
        if (currentAIAction) {
            handleAIAction(currentAIAction, lastPrompt, targetLanguage);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    useEffect(() => {
        const handleClick = () => setShowContextMenu(false);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return (
        <div className="editor-layout">
            <EditorToolbar editor={editor} onAIAction={(action) => handleAIAction(action as AIActionType)} />

            <div className="editor-viewport" onContextMenu={handleContextMenu}>
                <div className="editor-canvas">
                    <EditorContent editor={editor} className="tiptap-editor-content" />

                    {editor && BubbleMenu && (
                        <BubbleMenu
                            editor={editor}
                            tippyOptions={{ duration: 100, zIndex: 1000 }}
                            shouldShow={({ editor: e }: any) => !e.state.selection.empty && !aiResult && !isAILoading}
                        >
                            <div className="ai-command-bar bubble-style">
                                <button onClick={() => handleAIAction('grammar')} className="command-btn"><Check size={14} color="#10b981" /> Grammar</button>
                                <button onClick={() => handleAIAction('rewrite')} className="command-btn"><RefreshCw size={14} color="#3b82f6" /> Rewrite</button>
                                <button onClick={() => handleAIAction('translate')} className="command-btn"><Globe size={14} color="#6366f1" /> Translate</button>
                                <button onClick={() => handleAIAction('summarize')} className="command-btn"><FileText size={14} color="#f59e0b" /> Summarize</button>
                            </div>
                        </BubbleMenu>
                    )}

                    {showContextMenu && (
                        <div className="custom-context-menu" style={{ position: 'fixed', top: menuPosition.y, left: menuPosition.x, zIndex: 1000 }}>
                            <div className="ai-command-bar vertical">
                                <button onClick={() => handleAIAction('grammar')} className="command-btn"><Check size={14} color="#10b981" /> Fix Grammar</button>
                                <button onClick={() => handleAIAction('rewrite')} className="command-btn"><RefreshCw size={14} color="#3b82f6" /> Rewrite Selection</button>
                                <button onClick={() => handleAIAction('translate')} className="command-btn"><Globe size={14} color="#6366f1" /> Translate</button>
                                <button onClick={() => handleAIAction('summarize')} className="command-btn"><FileText size={14} color="#f59e0b" /> Summarize</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Language Selector Modal */}
            {showLanguageSelector && (
                <div className="ai-modal-overlay">
                    <div className="ai-modal-content" style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '350px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Translate to...</h3>
                            <button className="toolbar-btn" onClick={() => setShowLanguageSelector(false)}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.code}
                                    className="toolbar-btn"
                                    style={{ justifyContent: 'center', padding: '10px' }}
                                    onClick={() => {
                                        setTargetLanguage(lang.name);
                                        handleAIAction('translate', undefined, lang.name);
                                    }}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isAILoading && (
                <div className="ai-processing-overlay">
                    <div className="ai-processing-card" style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
                        <Loader2 size={32} className="spinning-sparkle" style={{ animation: 'spin 1s linear infinite' }} />
                        <h3 style={{ marginTop: '16px' }}>Gem AI is thinking...</h3>
                    </div>
                </div>
            )}

            {aiResult && (
                <div className="ai-modal-overlay">
                    <div className="ai-proposal-card" style={{ width: '700px' }}>
                        <div className="proposal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Sparkles size={20} color="#3b82f6" />
                                <h3>AI Proposal</h3>
                            </div>
                            <button className="toolbar-btn" onClick={() => setAIResult(null)}><X size={18} /></button>
                        </div>
                        <div className="proposal-body">
                            <textarea
                                className="ai-editable-box"
                                value={aiResult}
                                onChange={(e) => setAIResult(e.target.value)}
                                style={{
                                    width: '100%', minHeight: '200px', border: '1px solid #e2e8f0',
                                    borderRadius: '8px', padding: '16px', fontSize: '14px', lineHeight: '1.6',
                                    fontFamily: 'inherit', resize: 'vertical', outline: 'none'
                                }}
                            />
                        </div>
                        <div className="proposal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="toolbar-btn" onClick={handleRegenerate} style={{ display: 'flex', gap: '6px' }}>
                                <RefreshCcw size={16} /> Regenerate
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="toolbar-btn" onClick={handleAcceptBefore} title="Add Before"><ArrowUp size={16} /> Before</button>
                                <button className="toolbar-btn" onClick={handleAcceptAfter} title="Add After"><ArrowDown size={16} /> After</button>
                                <button className="ai-btn-primary" onClick={handleAcceptReplace}>Replace Selection</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="editor-stats">
                <span>{stats.words} words</span>
                <span>{stats.characters} characters</span>
            </div>
        </div>
    );
};
