import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, ArrowUpRight, CheckCircle } from 'lucide-react';

const Insights = () => {
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        axios.get('/api/insights').then(res => setRecommendations(res.data));
    }, []);

    return (
        <div className="insights-view">
            <h1 style={{ marginBottom: '1rem' }}>Sustainability Intelligence</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Data-driven recommendations to accelerate your decarbonization journey. Guided by Pareto logic and methodology standards.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {recommendations.map((rec, i) => (
                    <div key={i} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{
                            backgroundColor: rec.impact === 'High' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            color: rec.impact === 'High' ? 'var(--primary)' : 'var(--warning)',
                            border: `1px solid ${rec.impact === 'High' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                        }}>
                            <Lightbulb size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>{rec.title}</h3>
                                <span className={`status-badge status-${rec.impact.toLowerCase()}`}>{rec.impact} Impact</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{rec.suggestion}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-primary" style={{
                                    padding: '0.6rem 1.2rem',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    Strategy Brief <ArrowUpRight size={14} />
                                </button>
                                <button style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-muted)',
                                    padding: '0.6rem 1.2rem',
                                    borderRadius: '12px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer'
                                }}>
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '3rem', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%)' }}>
                <h3>Decarbonization Roadmap</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>Priority sequence based on 2024 operational forecasts.</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', left: '0', right: '0', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                    {['Q1: Baseline', 'Q2: Optimization', 'Q3: Procurement', 'Q4: Verification'].map((step, i) => (
                        <div key={i} style={{ textAlign: 'center', position: 'relative', flex: 1, zIndex: 1 }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: i === 0 ? 'var(--primary)' : 'var(--bg-dark)',
                                border: '2px solid var(--border)',
                                margin: '0 auto 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: i === 0 ? 'white' : 'var(--text-muted)'
                            }}>
                                {i === 0 ? <CheckCircle size={16} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: i === 0 ? '#fff' : 'var(--text-muted)' }}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Insights;
