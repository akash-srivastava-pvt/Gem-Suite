/**
 * Gem Vitya - Main Application Component
 * Personal Finance AI Assistant for Indians
 */

import React, { useState, useEffect } from 'react';
import './GemVitya.css';
import EBahikhataTab from './tabs/EBahikhataTab.js';
import TaxSimulatorTab from './tabs/TaxSimulatorTab.js';
import FinanceDashboardTab from './tabs/FinanceDashboardTab.js';

type TabType = 'bahikhata' | 'tax' | 'dashboard';

interface GemVityaProps {
  apiBaseURL?: string;
}

export const GemVitya: React.FC<GemVityaProps> = ({ apiBaseURL = '/api/v1/gem-vitya' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('bahikhata');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('gem-vitya-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('gem-vitya-theme', newDarkMode ? 'dark' : 'light');
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className={`gem-vitya ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="gv-header">
        <div className="gv-header-content">
          <div className="gv-branding">
            <div className="gv-logo">💎</div>
            <h1>Gem Vitya</h1>
            <p className="gv-tagline">Your Personal Finance AI Assistant</p>
          </div>
          
          <div className="gv-header-actions">
            <button 
              className="gv-theme-toggle"
              onClick={toggleTheme}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="gv-tabs-nav">
        <button
          className={`gv-tab-button ${activeTab === 'bahikhata' ? 'active' : ''}`}
          onClick={() => setActiveTab('bahikhata')}
        >
          <span className="gv-tab-icon">📊</span>
          <span className="gv-tab-label">e-Bahikhata</span>
        </button>
        
        <button
          className={`gv-tab-button ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          <span className="gv-tab-icon">📋</span>
          <span className="gv-tab-label">Tax Simulator</span>
        </button>
        
        <button
          className={`gv-tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="gv-tab-icon">📈</span>
          <span className="gv-tab-label">Finance Dashboard</span>
        </button>
      </nav>

      {/* Tab Content */}
      <main className="gv-content">
        {activeTab === 'bahikhata' && (
          <EBahikhataTab apiBaseURL={apiBaseURL} />
        )}
        
        {activeTab === 'tax' && (
          <TaxSimulatorTab apiBaseURL={apiBaseURL} />
        )}
        
        {activeTab === 'dashboard' && (
          <FinanceDashboardTab apiBaseURL={apiBaseURL} />
        )}
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="gv-loading-overlay">
          <div className="gv-spinner"></div>
          <p>Processing...</p>
        </div>
      )}

      {/* Footer */}
      <footer className="gv-footer">
        <p>🇮🇳 Gem Vitya v1.0 - Made with ❤️ for Indian Personal Finance</p>
        <p className="gv-disclaimer">
          Disclaimer: This is a demonstration tool. Please consult a qualified Chartered Accountant for actual tax matters.
        </p>
      </footer>
    </div>
  );
};

export default GemVitya;
