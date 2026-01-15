import React from 'react';

export const StandardLaTeX = ({ data }: { data: any }) => {
    if (!data) return null;

    return (
        <div className="latex-template" style={{
            fontFamily: '"Computer Modern", "Latin Modern Roman", serif',
            color: '#000',
            lineHeight: '1.4',
            padding: '0'
        }}>
            <header style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '24pt', fontWeight: 'normal', textTransform: 'uppercase' }}>{data.name}</h1>
                <div style={{ fontSize: '10pt' }}>
                    {data.contacts?.map((c: any, i: number) => (
                        <span key={i}>
                            {c.value} {i < data.contacts.length - 1 ? ' | ' : ''}
                        </span>
                    ))}
                </div>
                <div style={{ fontSize: '10pt' }}>
                    {data.links?.map((l: any, i: number) => (
                        <span key={i}>
                            {l.value} {i < data.links.length - 1 ? ' | ' : ''}
                        </span>
                    ))}
                </div>
            </header>

            {data.summary && (
                <section style={{ marginBottom: '15px' }}>
                    <h2 style={{ borderBottom: '1px solid #000', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Summary</h2>
                    <p style={{ margin: '3px 0', fontSize: '10.5pt' }}>{data.summary}</p>
                </section>
            )}

            <section style={{ marginBottom: '15px' }}>
                <h2 style={{ borderBottom: '1px solid #000', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Work Experience</h2>
                {data.work_experience?.map((work: any, i: number) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{work.title}, {work.organization}</span>
                            <span>{work.duration}</span>
                        </div>
                        <ul style={{ margin: '3px 0', paddingLeft: '20px', fontSize: '10.5pt' }}>
                            {work.highlights?.map((h: string, j: number) => (
                                <li key={j}>{h}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            {data.projects?.length > 0 && (
                <section style={{ marginBottom: '15px' }}>
                    <h2 style={{ borderBottom: '1px solid #000', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Projects</h2>
                    {data.projects?.map((proj: any, i: number) => (
                        <div key={i} style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: 'bold' }}>{proj.name}</div>
                            <p style={{ margin: '3px 0', fontSize: '10.5pt' }}>{proj.description}</p>
                        </div>
                    ))}
                </section>
            )}

            <section style={{ marginBottom: '15px' }}>
                <h2 style={{ borderBottom: '1px solid #000', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Education</h2>
                {data.education?.map((edu: any, i: number) => (
                    <div key={i} style={{ marginBottom: '5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{edu.degree}, {edu.institution}</span>
                            <span>{edu.year}</span>
                        </div>
                        <p style={{ margin: '2px 0', fontSize: '10.5pt' }}>{edu.details}</p>
                    </div>
                ))}
            </section>

            <section style={{ marginBottom: '15px' }}>
                <h2 style={{ borderBottom: '1px solid #000', fontSize: '14pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' }}>Skills</h2>
                <div style={{ fontSize: '10.5pt' }}>
                    {data.skills?.map((s: string, i: number) => (
                        <span key={i}>{s}{i < data.skills.length - 1 ? ', ' : ''}</span>
                    ))}
                </div>
            </section>
        </div>
    );
};
