import React, { useState, useEffect, useRef } from 'react';

interface Props {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    initialLeftWidth?: number;
    minLeftWidth?: number;
    maxLeftWidth?: number;
}

const ResizableLayout: React.FC<Props> = ({
    leftPanel,
    rightPanel,
    initialLeftWidth = 400,
    minLeftWidth = 250,
    maxLeftWidth = 800
}) => {
    const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = e.clientX - containerRect.left;

            if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
                setLeftWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, minLeftWidth, maxLeftWidth]);

    const startResizing = () => {
        setIsResizing(true);
    };

    return (
        <div ref={containerRef} style={styles.container}>
            <div style={{ ...styles.leftPanel, width: leftWidth }}>
                {leftPanel}
            </div>
            <div
                style={{
                    ...styles.divider,
                    backgroundColor: isResizing ? 'var(--primary)' : 'var(--border)'
                }}
                onMouseDown={startResizing}
            >
                <div style={styles.handle} />
            </div>
            <div style={styles.rightPanel}>
                {rightPanel}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        background: 'var(--background)',
    },
    leftPanel: {
        height: '100%',
        overflowY: 'auto' as const,
        position: 'relative' as const,
        zIndex: 1,
    },
    divider: {
        width: '4px',
        cursor: 'col-resize',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'relative' as const,
    },
    handle: {
        width: '1px',
        height: '32px',
        background: 'rgba(0,0,0,0.1)',
    },
    rightPanel: {
        flex: 1,
        height: '100%',
        overflowY: 'auto' as const,
        background: 'var(--surface)',
        position: 'relative' as const,
        zIndex: 1,
    }
};

export default ResizableLayout;
