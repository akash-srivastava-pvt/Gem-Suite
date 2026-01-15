import React, { useMemo, useState } from 'react';
import { CITY_DATA } from '../data/cities.js';

/* ---------- TYPES ---------- */

export type CitySelection = {
  state: string;
  city: string;
  attractions: string[];
};

type Props = {
  value: CitySelection[];
  onChange: (v: CitySelection[]) => void;
};

/* ---------- COMPONENT ---------- */

import { theme } from '../../../theme.js';

export const CityAttractions = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  /* ---------- FLATTEN STATE → CITY LIST ---------- */
  const options = useMemo(() => {
    return Object.entries(CITY_DATA).flatMap(([state, cities]) =>
      cities.map(c => ({
        state,
        city: c.name
      }))
    );
  }, []);

  /* ---------- FILTER SEARCH ---------- */
  const filtered = options.filter(o =>
    `${o.city} ${o.state}`.toLowerCase().includes(query.toLowerCase())
  );

  /* ---------- ADD CITY (ATTRACTIONS AUTO ATTACHED) ---------- */
  const addCity = (state: string, city: string) => {
    if (value.some(v => v.state === state && v.city === city)) return;

    const cityObj = CITY_DATA[state]?.find(c => c.name === city);
    if (!cityObj) return;

    onChange([
      ...value,
      {
        state,
        city,
        attractions: [...cityObj.attractions]
      }
    ]);
    setQuery('');
  };

  /* ---------- REMOVE CITY ---------- */
  const removeCity = (state: string, city: string) => {
    onChange(value.filter(v => !(v.state === state && v.city === city)));
  };

  /* ---------- UI ---------- */
  return (
    <div style={styles.box}>
      <label style={styles.label}>Selected Cities</label>

      <div style={{ position: 'relative' }}>
        <input
          placeholder="e.g. Mumbai, New York..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            ...styles.input,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            boxShadow: isFocused ? '0 0 0 2px rgba(0,0,0,0.02)' : 'none'
          }}
        />

        {query && (
          <div style={styles.dropdown}>
            {filtered.length > 0 ? filtered.map(o => (
              <div
                key={`${o.state}-${o.city}`}
                style={styles.option}
                onClick={() => addCity(o.state, o.city)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.hoverOverlay)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span style={{ fontWeight: 600 }}>{o.city}</span>, <span style={{ color: theme.colors.textSecondary }}>{o.state}</span>
              </div>
            )) : (
              <div style={{ ...styles.option, color: theme.colors.textSecondary, cursor: 'default' }}>No cities found</div>
            )}
          </div>
        )}
      </div>

      <div style={styles.chipWrap}>
        {value.map(v => (
          <div key={`${v.state}-${v.city}`} style={styles.chip}>
            <span style={{ fontSize: '12px', fontWeight: 500 }}>{v.city}</span>
            <button
              onClick={() => removeCity(v.state, v.city)}
              style={styles.removeBtn}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------- STYLES ---------- */

const styles = {
  box: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: theme.colors.textSecondary
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: '13px',
    outline: 'none',
    transition: theme.transitions.default,
    backgroundColor: theme.colors.background
  },
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.hover,
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    padding: '4px'
  },
  option: {
    padding: '6px 10px',
    cursor: 'pointer',
    borderRadius: theme.borderRadius.sm,
    fontSize: '13px',
    transition: 'background-color 0.1s'
  },
  chipWrap: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px'
  },
  chip: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.surface,
    padding: '4px 10px',
    borderRadius: '100px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    boxShadow: theme.shadows.card
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '12px',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  }
};
