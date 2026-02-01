import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronRight, Info, ExternalLink } from 'lucide-react';

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = () => {
        setLoading(true);
        axios.get('/api/activities')
            .then(res => {
                setActivities(res.data);
                setLoading(false);
            });
    };

    const handleSelect = (id) => {
        axios.get(`/api/explain/${id}`)
            .then(res => setSelectedActivity(res.data));
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading activity ledger...</div>;

    return (
        <div className="activities-view">
            <h1 style={{ marginBottom: '1rem' }}>Emissions Ledger</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                A transparent record of all business activities, their classified emission categories, and validated CO2e results.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: selectedActivity ? '1.5fr 1fr' : '1fr', gap: '2rem' }}>
                <div className="card">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>CO₂e (kg)</th>
                                <th>Confidence</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {activities.map((a) => (
                                <tr key={a.id} onClick={() => handleSelect(a.id)} style={{ cursor: 'pointer' }}>
                                    <td>{new Date(a.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: 500 }}>{a.description}</td>
                                    <td><span className="status-badge" style={{ background: '#f5f5f5', color: '#333' }}>{a.activity_type}</span></td>
                                    <td>{a.co2e.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge status-${a.confidence_score.toLowerCase()}`}>
                                            {a.confidence_score}
                                        </span>
                                    </td>
                                    <td><ChevronRight size={16} color="#ccc" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedActivity && (
                    <div className="card" style={{ borderLeft: '4px solid var(--primary)', position: 'sticky', top: '2rem', alignSelf: 'start' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <h3>Calculation Traceability</h3>
                            <button onClick={() => setSelectedActivity(null)} style={{ background: 'none', color: '#999' }}>✕</button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '0.5rem' }}>Business Activity</label>
                            <p style={{ fontWeight: 600 }}>{selectedActivity.description}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>{selectedActivity.quantity} {selectedActivity.unit}</p>
                        </div>

                        <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem' }}>Emission Factor:</span>
                                <span style={{ fontWeight: 600 }}>{selectedActivity.details?.emission_factor}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                                Source: {selectedActivity.details?.factor_source}
                            </div>
                            <div style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>
                                {selectedActivity.details?.formula}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '0.5rem' }}>Decision Support</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                <Info size={16} />
                                <span style={{ fontSize: '0.9rem' }}>Confidence: {selectedActivity.confidence_score}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#666', mt: '0.25rem' }}>
                                Based on {selectedActivity.confidence_score === 'High' ? 'direct metering' : 'standard industry averages'}.
                            </p>
                        </div>

                        <h2 style={{ fontSize: '2rem', color: 'var(--primary)', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                            {selectedActivity.co2e.toFixed(3)} <span style={{ fontSize: '1rem', fontWeight: 400 }}>MT CO2e</span>
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activities;
