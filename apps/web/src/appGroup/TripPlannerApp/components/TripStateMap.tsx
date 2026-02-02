import React, { useMemo } from 'react';
import { theme } from '../../../theme.js';

interface CityNode {
    name: string;
    state: string;
    day: number[];
    coords: { x: number; y: number };
    travel?: { mode: string; duration: string };
}

interface TripStateMapProps {
    data: any;
}

// Simplified state coordinates for India (0-100 range for X and Y)
// These represent approximate center points for states on a 100x100 grid
const STATE_COORDS: Record<string, { x: number, y: number }> = {
    'Andaman and Nicobar Islands': { x: 92, y: 78 },
    'Andhra Pradesh': { x: 45, y: 70 },
    'Arunachal Pradesh': { x: 90, y: 25 },
    'Assam': { x: 82, y: 35 },
    'Bihar': { x: 62, y: 38 },
    'Chandigarh': { x: 38, y: 22 },
    'Chhattisgarh': { x: 55, y: 55 },
    'Dadra and Nagar Haveli': { x: 18, y: 60 },
    'Daman and Diu': { x: 15, y: 62 },
    'Delhi': { x: 40, y: 30 },
    'Goa': { x: 22, y: 75 },
    'Gujarat': { x: 15, y: 50 },
    'Haryana': { x: 38, y: 28 },
    'Himachal Pradesh': { x: 42, y: 18 },
    'Jammu and Kashmir': { x: 38, y: 10 },
    'Jharkhand': { x: 65, y: 48 },
    'Karnataka': { x: 28, y: 78 },
    'Kerala': { x: 32, y: 90 },
    'Ladakh': { x: 45, y: 8 },
    'Lakshadweep': { x: 15, y: 92 },
    'Madhya Pradesh': { x: 45, y: 50 },
    'Maharashtra': { x: 25, y: 62 },
    'Manipur': { x: 88, y: 45 },
    'Meghalaya': { x: 78, y: 40 },
    'Mizoram': { x: 86, y: 50 },
    'Nagaland': { x: 92, y: 38 },
    'Odisha': { x: 65, y: 58 },
    'Puducherry': { x: 48, y: 82 },
    'Punjab': { x: 32, y: 22 },
    'Rajasthan': { x: 20, y: 35 },
    'Sikkim': { x: 70, y: 32 },
    'Tamil Nadu': { x: 42, y: 88 },
    'Telangana': { x: 42, y: 65 },
    'Tripura': { x: 84, y: 48 },
    'Uttar Pradesh': { x: 48, y: 35 },
    'Uttarakhand': { x: 50, y: 22 },
    'West Bengal': { x: 72, y: 45 },
};

// Simplified India Path (just the outline for the background)
const INDIA_OUTLINE = "M40,5 L50,8 L55,10 L60,15 L58,20 L55,25 L50,30 L45,35 L48,40 L55,45 L65,48 L70,45 L75,40 L80,35 L85,30 L90,25 L95,20 L98,25 L95,30 L90,35 L85,40 L88,45 L85,50 L82,55 L80,60 L75,65 L70,70 L72,75 L75,80 L70,85 L65,90 L60,95 L55,98 L50,95 L45,92 L40,90 L35,95 L30,98 L25,95 L22,90 L25,85 L28,80 L25,75 L20,70 L15,65 L10,60 L5,55 L8,50 L12,45 L15,40 L12,35 L10,30 L5,25 L8,20 L12,15 L20,10 L30,8 Z";

export const TripStateMap: React.FC<TripStateMapProps> = ({ data }) => {
    if (!data || !data.itinerary) return null;

    const { itinerary = [] } = data;

    // Process itinerary to find unique cities and their active states
    const activeStates = new Set<string>();
    const cityNodes: CityNode[] = [];

    itinerary.forEach((day: any) => {
        if (day.state) activeStates.add(day.state);

        const existingCity = cityNodes.find(n => n.name === day.city);
        if (existingCity) {
            existingCity.day.push(day.day);
        } else {
            // Use state coords as a base, then jitter slightly if multiple cities in same state
            const stateBase = STATE_COORDS[day.state] || { x: 50, y: 50 };
            const sameStateCount = cityNodes.filter(n => n.state === day.state).length;

            cityNodes.push({
                name: day.city,
                state: day.state,
                day: [day.day],
                travel: day.travel,
                coords: {
                    x: stateBase.x + (sameStateCount * 4) - 2, // Slight jitter
                    y: stateBase.y + (sameStateCount * 2) - 1
                }
            });
        }
    });

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1.1',
        background: 'var(--background)',
        borderRadius: theme.borderRadius.md,
        padding: '20px',
        overflow: 'hidden',
        border: `1px solid ${theme.colors.border}`,
    };

    return (
        <div style={containerStyle}>
            <h3 style={{ fontSize: '14px', marginBottom: '16px', color: theme.colors.textSecondary }}>State-Level Blueprint</h3>
            <svg viewBox="0 0 100 110" style={{ width: '100%', height: 'calc(100% - 30px)' }}>
                {/* Background Shadow/Glow */}
                <path
                    d={INDIA_OUTLINE}
                    fill="var(--surface)"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                />

                {/* Highlight Active States */}
                {Array.from(activeStates).map(state => {
                    const coords = STATE_COORDS[state];
                    if (!coords) return null;
                    return (
                        <circle
                            key={state}
                            cx={coords.x}
                            cy={coords.y}
                            r="8"
                            fill={`${theme.colors.primary}11`}
                            stroke={`${theme.colors.primary}44`}
                            strokeWidth="0.5"
                            strokeDasharray="1 1"
                        />
                    );
                })}

                {/* Connections between cities */}
                {cityNodes.map((node, i) => {
                    if (i === 0) return null;
                    const prev = cityNodes[i - 1];
                    const midX = (prev.coords.x + node.coords.x) / 2;
                    const midY = (prev.coords.y + node.coords.y) / 2;
                    // Find transport mode for this leg
                    const travelMode = node.travel?.mode || 'Drive';
                    const icon = travelMode === 'Flight' ? '✈️' :
                        travelMode === 'Train' ? '🚂' :
                            travelMode === 'Bus' ? '🚌' : '🚗';

                    return (
                        <g key={`conn-${i}`}>
                            <line
                                x1={prev.coords.x}
                                y1={prev.coords.y}
                                x2={node.coords.x}
                                y2={node.coords.y}
                                stroke={theme.colors.primary}
                                strokeWidth="0.8"
                                strokeDasharray="2 2"
                                opacity="0.6"
                            />
                            <text
                                x={midX}
                                y={midY}
                                fontSize="3"
                                textAnchor="middle"
                                alignmentBaseline="middle"
                            >
                                {icon}
                            </text>
                        </g>
                    );
                })}

                {/* City Nodes */}
                {cityNodes.map((node, i) => (
                    <g key={i}>
                        <circle
                            cx={node.coords.x}
                            cy={node.coords.y}
                            r="2"
                            fill={theme.colors.primary}
                            style={{ transition: 'all 0.3s ease' }}
                        />
                        <text
                            x={node.coords.x}
                            y={node.coords.y - 4}
                            fontSize="3"
                            fontWeight="700"
                            textAnchor="middle"
                            fill={theme.colors.text}
                        >
                            {node.name}
                        </text>
                        <text
                            x={node.coords.x}
                            y={node.coords.y + 6}
                            fontSize="2"
                            textAnchor="middle"
                            fill={theme.colors.textSecondary}
                        >
                            Day {node.day.join(', ')}
                        </text>
                    </g>
                ))}
            </svg>
            <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                fontSize: '10px',
                color: theme.colors.textSecondary,
                fontStyle: 'italic'
            }}>
                * Schematic representation of journey across states
            </div>
        </div>
    );
};
