import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        indent: {
            indent: () => ReturnType;
            outdent: () => ReturnType;
        };
    }
}

export const Indent = Extension.create({
    name: 'indent',

    addOptions() {
        return {
            types: ['paragraph', 'heading', 'listItem'],
            indentSize: 24,
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    indent: {
                        default: 0,
                        parseHTML: element => parseInt(element.style.paddingLeft, 10) / this.options.indentSize || 0,
                        renderHTML: attributes => {
                            if (!attributes.indent) {
                                return {};
                            }

                            return {
                                style: `padding-left: ${attributes.indent * this.options.indentSize}px`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            indent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const indent = (node.attrs.indent || 0) + 1;
                        tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
            outdent: () => ({ tr, state, dispatch }) => {
                const { selection } = state;
                tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
                    if (this.options.types.includes(node.type.name)) {
                        const indent = Math.max((node.attrs.indent || 0) - 1, 0);
                        tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
                    }
                });
                if (dispatch) dispatch(tr);
                return true;
            },
        };
    },
});
