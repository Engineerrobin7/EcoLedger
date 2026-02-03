import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lightbulb, ArrowUpRight, CheckCircle, Sparkles, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Insights = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        axios.get('/api/insights').then(res => setRecommendations(res.data));
    }, []);

    const handleGenerateAi = async () => {
        setLoadingAi(true);
        try {
            // Simulate "thinking" time for realism
            await new Promise(r => setTimeout(r, 1500));
            const res = await axios.post('/api/insights/ai');
            setAiAnalysis(res.data.content);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingAi(false);
        }
    };

    return (
        <div className="insights-view">
            <h1 className="insights-header">Sustainability Intelligence</h1>
            <p className="text-muted-p">
                Data-driven recommendations to accelerate your decarbonization journey. Guided by Pareto logic and methodology standards.
            </p>

            {/* AI Advisor Section */}
            <div className="card ai-advisor-card">
                <div className="ai-header">
                    <div className="ai-title-group">
                        <div className="ai-icon-box">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h3 className="ai-title">AI Executive Advisor</h3>
                            <p className="ai-subtitle">Powered by Gemini Enterprise Model</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateAi}
                        disabled={loadingAi}
                        className="btn-primary btn-ai-generate"
                    >
                        {loadingAi ? (
                            <>Thinking...</>
                        ) : (
                            <><Cpu size={16} style={{ marginRight: '0.5rem' }} /> Generate Strategic Analysis</>
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {aiAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="ai-content-box">
                                {aiAnalysis}
                            </div>
                            <div className="ai-meta">
                                <span>Confidence Score: 98.4%</span>
                                <span>•</span>
                                <span>Tokens Used: 482</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="rec-list">
                {recommendations.map((rec, i) => (
                    <div key={i} className="card rec-card">
                        <div className={`rec-icon-box ${rec.impact === 'High' ? 'rec-high-impact' : 'rec-medium-impact'}`}>
                            <Lightbulb size={24} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div className="rec-header">
                                <h3 className="rec-title">{rec.title}</h3>
                                <span className={`status-badge status-${rec.impact.toLowerCase()}`}>{rec.impact} Impact</span>
                            </div>
                            <p className="rec-text">{rec.suggestion}</p>

                            <div className="rec-actions">
                                <button className="btn-primary btn-sm-icon">
                                    Strategy Brief <ArrowUpRight size={14} />
                                </button>
                                <button className="btn-outline">
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card roadmap-card">
                <h3>Decarbonization Roadmap</h3>
                <p className="text-muted-p" style={{ marginTop: '0.5rem' }}>Priority sequence based on 2024 operational forecasts.</p>

                <div className="roadmap-timeline">
                    <div className="roadmap-line"></div>
                    {['Q1: Baseline', 'Q2: Optimization', 'Q3: Procurement', 'Q4: Verification'].map((step, i) => (
                        <div key={i} className="roadmap-step">
                            <div className={`step-circle ${i === 0 ? 'step-active' : 'step-inactive'}`}>
                                {i === 0 ? <CheckCircle size={16} /> : i + 1}
                            </div>
                            <span className={`step-label ${i === 0 ? 'text-white' : 'text-muted'}`} style={{ color: i === 0 ? '#fff' : 'var(--text-muted)' }}>{step}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Insights;
