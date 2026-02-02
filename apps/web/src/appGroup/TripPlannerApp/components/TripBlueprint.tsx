import React, { useState } from 'react';
import { theme } from '../../../theme.js';
import { TripStateMap } from './TripStateMap.jsx';

interface TripBlueprintProps {
    data: any;
    onNavigate?: (day: number) => void;
}

export const TripBlueprint: React.FC<TripBlueprintProps> = ({ data, onNavigate }) => {
    const [view, setView] = useState<'flow' | 'map'>('flow');
    if (!data || !data.itinerary) return null;

    const { itinerary = [], summary = {} } = data;

    // Extract unique consecutive cities and their day ranges
    const cityNodes: any[] = [];
    itinerary.forEach((day: any) => {
        const lastNode = cityNodes[cityNodes.length - 1];
        if (lastNode && lastNode.city === day.city) {
            lastNode.endDay = day.day;
            lastNode.days.push(day.day);
        } else {
            cityNodes.push({
                city: day.city,
                state: day.state,
                startDay: day.day,
                endDay: day.day,
                days: [day.day],
                travel: day.travel, // Travel to this city
                attractions: day.attractions || []
            });
        }
    });

    const handleNodeClick = (day: number) => {
        if (onNavigate) {
            onNavigate(day);
            return;
        }
        const element = document.getElementById(`day-${day}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.style.outline = `2px solid ${theme.colors.primary}`; // Visual highlight
            setTimeout(() => { element.style.outline = 'none'; }, 2000);
        }
    };

    const containerStyle: React.CSSProperties = {
        padding: '24px',
        background: 'var(--surface)',
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.border}`,
        marginBottom: '24px',
        animation: 'blueprintFadeIn 0.5s ease-out',
    };

    const flowContainerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        minWidth: 'max-content',
        padding: '40px 20px',
    };

    const nodeStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2,
    };

    const circleStyle: React.CSSProperties = {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: theme.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '20px',
        boxShadow: `0 0 0 4px var(--surface), 0 0 0 8px ${theme.colors.primary}22`,
        marginBottom: '16px',
        transition: 'all 0.3s ease',
    };

    const labelStyle: React.CSSProperties = {
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 600,
        color: theme.colors.text,
        maxWidth: '120px',
    };

    const subLabelStyle: React.CSSProperties = {
        fontSize: '11px',
        color: theme.colors.textSecondary,
        marginTop: '2px',
    };

    const connectorStyle: React.CSSProperties = {
        width: '100px',
        height: '2px',
        backgroundColor: theme.colors.border,
        position: 'relative',
        margin: '0 -10px 45px -10px',
        zIndex: 1,
    };

    const travelIconStyle: React.CSSProperties = {
        position: 'absolute',
        top: '-15px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'var(--surface)',
        padding: '4px 8px',
        borderRadius: '12px',
        border: `1px solid ${theme.colors.border}`,
        fontSize: '12px',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    };

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: theme.colors.primary }}>Journey Blueprint</h2>
                <div style={{ display: 'flex', gap: '8px', background: 'var(--background)', padding: '4px', borderRadius: theme.borderRadius.md }}>
                    <button
                        onClick={() => setView('flow')}
                        style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: theme.borderRadius.sm,
                            cursor: 'pointer',
                            backgroundColor: view === 'flow' ? theme.colors.primary : 'transparent',
                            color: view === 'flow' ? 'white' : theme.colors.textSecondary,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Route Flow
                    </button>
                    <button
                        onClick={() => setView('map')}
                        style={{
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: 'none',
                            borderRadius: theme.borderRadius.sm,
                            cursor: 'pointer',
                            backgroundColor: view === 'map' ? theme.colors.primary : 'transparent',
                            color: view === 'map' ? 'white' : theme.colors.textSecondary,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        State Map
                    </button>
                </div>
            </div>

            {view === 'map' ? (
                <div style={{ animation: 'blueprintFadeIn 0.4s ease-out' }}>
                    <TripStateMap data={data} />
                </div>
            ) : (
                <div className="blueprint-scroll-container">
                    <style>{`
                    @keyframes blueprintFadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .blueprint-scroll-container {
                        overflow-x: auto;
                        padding-bottom: 20px;
                    }
                    .blueprint-node:hover {
                        transform: translateY(-8px);
                    }
                    .blueprint-node:hover .node-circle {
                        box-shadow: 0 0 0 4px var(--surface), 0 0 0 12px ${theme.colors.primary}44 !important;
                        background-color: ${theme.colors.primary};
                    }
                    @media (max-width: 768px) {
                        .blueprint-flow {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            min-width: auto !important;
                            padding: 20px !important;
                        }
                        .blueprint-connector {
                            width: 2px !important;
                            height: 60px !important;
                            margin: -10px 0 -10px 27px !important;
                        }
                        .blueprint-node {
                            flex-direction: row !important;
                            gap: 20px;
                            align-items: center !important;
                        }
                        .blueprint-travel-icon {
                            top: 50% !important;
                            left: 20px !important;
                            transform: translateY(-50%) rotate(90deg) !important;
                            background: var(--background) !important;
                        }
                        .node-label {
                            text-align: left !important;
                        }
                    }
                `}</style>
                    <div style={flowContainerStyle} className="blueprint-flow">
                        {cityNodes.map((node, index) => (
                            <React.Fragment key={index}>
                                <div
                                    style={nodeStyle}
                                    className="blueprint-node"
                                    onClick={() => handleNodeClick(node.startDay)}
                                >
                                    <div style={circleStyle} className="node-circle">
                                        {index + 1}
                                    </div>
                                    <div style={labelStyle} className="node-label">
                                        <div>{node.city}</div>
                                        <div style={subLabelStyle}>
                                            {node.startDay === node.endDay
                                                ? `Day ${node.startDay}`
                                                : `Days ${node.startDay}-${node.endDay}`}
                                        </div>
                                    </div>
                                </div>

                                {index < cityNodes.length - 1 && (
                                    <div style={connectorStyle} className="blueprint-connector">
                                        <div style={travelIconStyle} className="blueprint-travel-icon">
                                            <span>{node.travel?.mode === 'Flight' ? '✈️' :
                                                node.travel?.mode === 'Train' ? '🚂' :
                                                    node.travel?.mode === 'Bus' ? '🚌' : '🚗'}</span>
                                            <span style={{ fontSize: '10px' }}>{cityNodes[index + 1].travel?.duration || 'Travel'}</span>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
