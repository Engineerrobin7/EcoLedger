import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Zap, RefreshCw } from 'lucide-react';

const Scenario = () => {
    const [activities, setActivities] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [newType, setNewType] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        axios.get('/api/activities').then(res => {
            setActivities(res.data);
            if (res.data.length > 0) setSelectedId(res.data[0].id);
        });
    }, []);

    const runSimulation = () => {
        axios.post('/api/scenario', {
            activity_id: parseInt(selectedId),
            new_type: newType || null
        }).then(res => setResult(res.data));
    };

    return (
        <div className="scenario-view">
            <h1 style={{ marginBottom: '1rem' }}>Scenario Comparison & What-If Analysis</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Simulate alternative operational strategies to quantify potential emission reductions before implementing changes.
            </p>

            <div className="card" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Baseline Activity</label>
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: ' var(--radius)', border: '1px solid var(--border)' }}
                        >
                            {activities.map(a => (
                                <option key={a.id} value={a.id}>{a.description} ({a.co2e.toFixed(2)} kg)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Proposed Alternative</label>
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: ' var(--radius)', border: '1px solid var(--border)' }}
                        >
                            <option value="">Maintain Current (Modify Quantity)</option>
                            <option value="Energy">Switch to Renewable Energy</option>
                            <option value="Transport">Optimize Transport Logistics</option>
                            <option value="Cloud Services">Green Hosting Solution</option>
                        </select>
                    </div>
                </div>
                <button className="btn-primary" onClick={runSimulation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={18} />
                    Run Simulation
                </button>
            </div>

            {result && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div className="card" style={{ textAlign: 'center' }}>
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>BASELINE EMISSIONS</span>
                        <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{result.original_co2e.toFixed(2)}</h2>
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>kg CO2e</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRight size={48} color="var(--primary)" />
                    </div>

                    <div className="card" style={{ textAlign: 'center', border: '2px solid var(--success)' }}>
                        <span style={{ color: '#999', fontSize: '0.8rem' }}>SIMULATED EMISSIONS</span>
                        <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--success)' }}>
                            {result.simulated_co2e.toFixed(2)}
                        </h2>
                        <div style={{
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}>
                            -{result.reduction_percentage.toFixed(1)}% Reduction
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '3rem' }}>
                <h3>Simulation Methodology</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Simulations are computed by applying alternate emission factors from the EcoLedger validation database.
                    Results represent theoretical maximum reductions based on standard operational adjustments.
                </p>
            </div>
        </div>
    );
};

export default Scenario;
