import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
// @ts-ignore
import html2pdf from 'html2pdf.js';

export const exportToPdf = (element: HTMLElement) => {
    const opt = {
        margin: 0.75,
        filename: 'gem-likhit-doc.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
};

export const exportToDocx = async (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const nodes = Array.from(doc.body.childNodes);

    const children: any[] = [];

    const processNode = (node: Node): any => {
        if (node.nodeType === Node.TEXT_NODE) {
            return new TextRun({ text: node.textContent || '' });
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const textRuns: TextRun[] = [];

            // Simple recursive text run builder for common inline styles
            const buildTextRuns = (element: HTMLElement, styles: any = {}) => {
                const currentStyles = { ...styles };
                if (element.tagName === 'STRONG' || element.tagName === 'B') currentStyles.bold = true;
                if (element.tagName === 'EM' || element.tagName === 'I') currentStyles.italics = true;
                if (element.tagName === 'U') currentStyles.underline = {};

                Array.from(element.childNodes).forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        textRuns.push(new TextRun({ text: child.textContent || '', ...currentStyles }));
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        buildTextRuns(child as HTMLElement, currentStyles);
                    }
                });
            };

            if (['P', 'H1', 'H2', 'H3', 'LI'].includes(el.tagName)) {
                buildTextRuns(el);
                let heading: any = undefined;
                if (el.tagName === 'H1') heading = "Heading1";
                if (el.tagName === 'H2') heading = "Heading2";
                if (el.tagName === 'H3') heading = "Heading3";

                return new Paragraph({
                    children: textRuns,
                    heading: heading,
                    bullet: el.tagName === 'LI' && el.parentElement?.tagName === 'UL' ? { level: 0 } : undefined,
                    numbering: el.tagName === 'LI' && el.parentElement?.tagName === 'OL' ? { reference: 'my-numbering', level: 0 } : undefined,
                });
            }

            if (el.tagName === 'UL' || el.tagName === 'OL') {
                Array.from(el.childNodes).forEach(child => {
                    const p = processNode(child);
                    if (p) children.push(p);
                });
                return null;
            }
        }
        return null;
    };

    nodes.forEach(node => {
        const p = processNode(node);
        if (p) children.push(p);
    });

    const docx = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch
                }
            },
            children: children,
        }],
    });

    const blob = await Packer.toBlob(docx);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gem-likhit-doc.docx';
    link.click();
};

export const importFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return result.value; // Returns HTML
};

export const downloadGemDoc = (content: string, filename: string = 'document.gemdoc') => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
};
