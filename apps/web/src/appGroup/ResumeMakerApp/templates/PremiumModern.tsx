import React from 'react';

export const PremiumModern = ({ data }: { data: any }) => {
    if (!data) return null;

    return (
        <div className="premium-template" style={{
            fontFamily: '"Inter", sans-serif',
            color: '#1e293b',
            lineHeight: '1.5',
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '20px',
            padding: '0'
        }}>
            {/* Sidebar */}
            <aside style={{ backgroundColor: '#f1f5f9', padding: '20px', borderRadius: '8px' }}>
                <h1 style={{ fontSize: '20pt', fontWeight: '800', lineHeight: '1.2', margin: '0 0 20px 0', color: '#0f172a' }}>{data.name}</h1>

                <section style={{ marginBottom: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '9pt', color: '#64748b', fontWeight: 'bold' }}>Contact</h3>
                    {data.contacts?.map((c: any, i: number) => (
                        <div key={i} style={{ fontSize: '9pt', marginBottom: '5px' }}>
                            <div style={{ fontWeight: 'bold' }}>{c.key}</div>
                            <div style={{ wordBreak: 'break-all' }}>{c.value}</div>
                        </div>
                    ))}
                </section>

                <section style={{ marginBottom: '20px' }}>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '9pt', color: '#64748b', fontWeight: 'bold' }}>Links</h3>
                    {data.links?.map((l: any, i: number) => (
                        <div key={i} style={{ fontSize: '9pt', marginBottom: '5px' }}>
                            <a href={l.value} style={{ color: '#2563eb', textDecoration: 'none' }}>{l.key}</a>
                        </div>
                    ))}
                </section>

                <section>
                    <h3 style={{ textTransform: 'uppercase', fontSize: '9pt', color: '#64748b', fontWeight: 'bold' }}>Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                        {data.skills?.map((s: string, i: number) => (
                            <span key={i} style={{ backgroundColor: '#cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '8.5pt' }}>{s}</span>
                        ))}
                    </div>
                </section>
            </aside>

            {/* Main Content */}
            <main>
                {data.summary && (
                    <section style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '14pt', borderBottom: '2px solid #2563eb', paddingBottom: '3px', marginBottom: '10px' }}>About Me</h2>
                        <p style={{ fontSize: '10pt', color: '#334155' }}>{data.summary}</p>
                    </section>
                )}

                <section style={{ marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '14pt', borderBottom: '2px solid #2563eb', paddingBottom: '3px', marginBottom: '15px' }}>Experience</h2>
                    {data.work_experience?.map((work: any, i: number) => (
                        <div key={i} style={{ marginBottom: '15px' }}>
                            <div style={{ fontWeight: '700', fontSize: '12pt' }}>{work.title}</div>
                            <div style={{ color: '#2563eb', fontWeight: '600', fontSize: '10pt' }}>{work.organization} | {work.duration}</div>
                            <ul style={{ marginTop: '5px', fontSize: '10pt', color: '#334155', paddingLeft: '20px' }}>
                                {work.highlights?.map((h: string, j: number) => (
                                    <li key={j}>{h}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>

                {data.projects?.length > 0 && (
                    <section style={{ marginBottom: '25px' }}>
                        <h2 style={{ fontSize: '14pt', borderBottom: '2px solid #2563eb', paddingBottom: '3px', marginBottom: '15px' }}>Projects</h2>
                        {data.projects?.map((proj: any, i: number) => (
                            <div key={i} style={{ marginBottom: '15px' }}>
                                <div style={{ fontWeight: '700', fontSize: '11pt' }}>{proj.name}</div>
                                <p style={{ marginTop: '5px', fontSize: '10pt', color: '#334155' }}>{proj.description}</p>
                            </div>
                        ))}
                    </section>
                )}

                <section>
                    <h2 style={{ fontSize: '14pt', borderBottom: '2px solid #2563eb', paddingBottom: '3px', marginBottom: '15px' }}>Education</h2>
                    {data.education?.map((edu: any, i: number) => (
                        <div key={i} style={{ marginBottom: '10px' }}>
                            <div style={{ fontWeight: '700' }}>{edu.degree}</div>
                            <div style={{ fontSize: '10pt', color: '#475569' }}>{edu.institution}, {edu.year}</div>
                            <p style={{ fontStyle: 'italic', fontSize: '9pt', marginTop: '3px' }}>{edu.details}</p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};
