import React from 'react';

export const StandardDocument = ({ data, title }: { data: any, title: string }) => {
    if (!data || !data.content) return null;

    return (
        <div className="standard-document" style={{
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000',
            lineHeight: '1.6',
            padding: '40px',
            fontSize: '12pt'
        }}>
            <h1 style={{ textAlign: 'center', fontSize: '18pt', marginBottom: '30px', textTransform: 'uppercase' }}>{title}</h1>
            <div style={{ whiteSpace: 'pre-wrap' }}>
                {data.content}
            </div>
        </div>
    );
};
