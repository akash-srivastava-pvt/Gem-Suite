import { Node, Extension, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { Node as PMNode } from '@tiptap/pm/model';

// A4 Height in pixels (roughly 1123px at 96dpi)
const PAGE_HEIGHT = 1123;
const MARGIN = 96; // 1 inch
const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - (MARGIN * 2);

export const Page = Node.create({
    name: 'page',
    group: 'block',
    content: 'block+',
    defining: true,
    draggable: false,

    parseHTML() {
        return [{ tag: 'div.page-node' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { class: 'page-node' }), 0];
    },
});

export const PaginationDocument = Node.create({
    name: 'document',
    topNode: true,
    content: 'page+',
});

export const Pagination = Extension.create({
    name: 'pagination',

    addProseMirrorPlugins() {
        const extension = this; // Capture extension context if needed, but we'll use a local function

        return [
            new Plugin({
                key: new PluginKey('pagination'),
                view() {
                    let timer: any = null;

                    const handlePagination = (view: EditorView) => {
                        const { state, dispatch } = view;
                        const { doc } = state;
                        let tr = state.tr;
                        let hasChanged = false;

                        // Iterate through all pages
                        const pages: { node: PMNode, pos: number }[] = [];
                        doc.forEach((node, pos) => {
                            if (node.type.name === 'page') {
                                pages.push({ node, pos });
                            }
                        });

                        for (let i = 0; i < pages.length; i++) {
                            const { node, pos } = pages[i];
                            const dom = view.nodeDOM(pos) as HTMLElement;
                            if (!dom) continue;

                            const children = Array.from(dom.children) as HTMLElement[];
                            let cumulativeHeight = 0;
                            let splitIndex = -1;

                            for (let j = 0; j < children.length; j++) {
                                const child = children[j];
                                const style = window.getComputedStyle(child);
                                const h = child.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);

                                if (cumulativeHeight + h > MAX_CONTENT_HEIGHT && j > 0) {
                                    splitIndex = j;
                                    break;
                                }
                                cumulativeHeight += h;
                            }

                            if (splitIndex !== -1) {
                                const nodesToMove: PMNode[] = [];
                                for (let j = splitIndex; j < node.childCount; j++) {
                                    nodesToMove.push(node.child(j));
                                }

                                const startMovePos = tr.mapping.map(pos) + 1;
                                let moveOffset = 0;
                                for (let j = 0; j < splitIndex; j++) {
                                    moveOffset += node.child(j).nodeSize;
                                }

                                const actualStartMove = startMovePos + moveOffset;
                                const endMovePos = tr.mapping.map(pos) + node.nodeSize - 1;

                                const nextNodePos = tr.mapping.map(pos) + node.nodeSize;
                                const nextNode = tr.doc.nodeAt(nextNodePos);

                                if (nextNode && nextNode.type.name === 'page') {
                                    tr.insert(nextNodePos + 1, nodesToMove);
                                } else {
                                    const newPage = state.schema.nodes.page.create(null, nodesToMove);
                                    tr.insert(nextNodePos, newPage);
                                }

                                tr.delete(actualStartMove, endMovePos);
                                hasChanged = true;
                                break;
                            }

                            if (i < pages.length - 1) {
                                const nextPage = pages[i + 1];
                                if (nextPage.node.childCount > 0) {
                                    const firstNodeNext = nextPage.node.child(0);
                                    const nextDom = view.nodeDOM(nextPage.pos) as HTMLElement;
                                    if (nextDom && nextDom.children[0]) {
                                        const firstChildNextDom = nextDom.children[0] as HTMLElement;
                                        const nextStyle = window.getComputedStyle(firstChildNextDom);
                                        const nextH = firstChildNextDom.offsetHeight + parseFloat(nextStyle.marginTop) + parseFloat(nextStyle.marginBottom);

                                        if (cumulativeHeight + nextH < MAX_CONTENT_HEIGHT - 40) {
                                            const targetPos = tr.mapping.map(pos) + node.nodeSize - 1;
                                            const srcStart = tr.mapping.map(nextPage.pos) + 1;
                                            const srcEnd = srcStart + firstNodeNext.nodeSize;

                                            tr.insert(targetPos, firstNodeNext);
                                            tr.delete(srcStart, srcEnd);
                                            hasChanged = true;
                                            break;
                                        }
                                    }
                                } else if (pages.length > 1) {
                                    const pPos = tr.mapping.map(nextPage.pos);
                                    tr.delete(pPos, pPos + nextPage.node.nodeSize);
                                    hasChanged = true;
                                    break;
                                }
                            }
                        }

                        if (hasChanged) {
                            dispatch(tr);
                        }
                    };

                    return {
                        update: (view: EditorView, prevState: any) => {
                            if (view.state.doc.eq(prevState.doc)) return;

                            if (timer) clearTimeout(timer);
                            timer = setTimeout(() => {
                                handlePagination(view);
                            }, 200);
                        }
                    };
                },
            }),
        ];
    },
});
