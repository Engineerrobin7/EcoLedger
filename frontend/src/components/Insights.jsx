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
                            backgroundColor: rec.impact === 'High' ? '#e8f5e9' : '#fff3e0',
                            padding: '1rem',
                            borderRadius: 'var(--radius)',
                            color: rec.impact === 'High' ? 'var(--primary)' : '#ef6c00'
                        }}>
                            <Lightbulb size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3 style={{ marginBottom: '0.5rem' }}>{rec.title}</h3>
                                <span className={`status-badge status-${rec.impact.toLowerCase()}`}>{rec.impact} Impact</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{rec.suggestion}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button style={{
                                    background: 'none',
                                    border: '1px solid var(--primary)',
                                    color: 'var(--primary)',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    View Business Case <ArrowUpRight size={14} />
                                </button>
                                <button style={{
                                    background: 'none',
                                    border: '1px solid #ddd',
                                    color: '#666',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.85rem'
                                }}>
                                    Mark as Planned
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '2rem', backgroundColor: 'var(--primary-dark)', color: 'white' }}>
                <h3>Quarterly Decarbonization Roadmap</h3>
                <p style={{ opacity: 0.8, marginTop: '0.5rem', marginBottom: '1.5rem' }}>Your path to Net Zero based on 2024 projections.</p>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {['Q1: Baseline', 'Q2: Energy Opt', 'Q3: Supply Chain', 'Q4: Review'].map((step, i) => (
                        <div key={i} style={{ textAlign: 'center', position: 'relative', flex: 1 }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: i === 0 ? 'var(--success)' : 'rgba(255,255,255,0.2)',
                                margin: '0 auto 0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {i === 0 ? <CheckCircle size={16} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.8rem' }}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Insights;
