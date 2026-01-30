import React from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Heading1, Heading2, Heading3,
    Undo, Redo, Table as TableIcon,
    Image as ImageIcon, Trash2, Outdent, Indent, Highlighter
} from 'lucide-react';

interface EditorToolbarProps {
    editor: any | null;
    onAIAction?: (action: string) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, onAIAction }) => {
    if (!editor) return null;

    const fontFamilies = ['Inter', 'serif', 'monospace', 'Georgia', 'Arial'];
    const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

    return (
        <div className="editor-toolbar">
            <div className="toolbar-group">
                <button onClick={() => editor.chain().focus().undo().run()} className="toolbar-btn" title="Undo"><Undo size={18} /></button>
                <button onClick={() => editor.chain().focus().redo().run()} className="toolbar-btn" title="Redo"><Redo size={18} /></button>
            </div>

            <div className="toolbar-group">
                <select
                    className="toolbar-select"
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                >
                    {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
            </div>

            <div className="toolbar-group">
                <select
                    className="toolbar-select"
                    onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                    value={editor.getAttributes('textStyle').fontSize || '16px'}
                >
                    {fontSizes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
                    title="H1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
                    title="H2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`toolbar-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
                    title="H3"
                >
                    <Heading3 size={18} />
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
                    title="Underline (Ctrl+U)"
                >
                    <Underline size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`toolbar-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
                    title="Highlight"
                >
                    <Highlighter size={18} />
                </button>
                <input
                    type="color"
                    onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="toolbar-btn"
                    title="Text Color"
                    style={{ width: '24px', height: '24px', padding: 0, border: 'none' }}
                />
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
                    title="Align Left"
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
                    title="Align Center"
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
                    title="Align Right"
                >
                    <AlignRight size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
                    title="Align Justify"
                >
                    <AlignJustify size={18} />
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().outdent().run()}
                    className="toolbar-btn"
                    title="Decrease Indent"
                >
                    <Outdent size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().indent().run()}
                    className="toolbar-btn"
                    title="Increase Indent"
                >
                    <Indent size={18} />
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => {
                        const url = window.prompt('URL');
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}
                    className="toolbar-btn"
                    title="Insert Image"
                >
                    <ImageIcon size={18} />
                </button>
                <button
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                    className="toolbar-btn"
                    title="Insert Table"
                >
                    <TableIcon size={18} />
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    className="toolbar-btn"
                    title="Clear Formatting"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
