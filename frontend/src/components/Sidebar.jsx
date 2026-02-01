import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Upload, List, BarChart3, Info, Lightbulb, Hexagon } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Intelligence', icon: <LayoutDashboard size={20} /> },
        { id: 'upload', label: 'Data Ingestion', icon: <Upload size={20} /> },
        { id: 'activities', label: 'Activity Ledger', icon: <List size={20} /> },
        { id: 'scenario', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { id: 'insights', label: 'Insights', icon: <Lightbulb size={20} /> },
        { id: 'methodology', label: 'Engine', icon: <Info size={20} /> },
    ];

    return (
        <div className="sidebar">
            <div className="logo-container">
                <div className="status-badge status-high" style={{ padding: '0.5rem' }}>
                    <Hexagon size={24} fill="currentColor" strokeWidth={1} />
                </div>
                <h1 className="logo-text">EcoLedger</h1>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => (
                    <motion.a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveTab(item.id);
                        }}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </motion.a>
                ))}
            </nav>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                    SYSTEM OPERATIONAL
                </div>
                v1.2.4 ENTERPRISE AI
            </div>
        </div>
    );
};

export default Sidebar;
