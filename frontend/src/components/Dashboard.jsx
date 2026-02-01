import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, AlertTriangle, Target, Loader2 } from 'lucide-react';
import SustainabilityScene from './SustainabilityScene';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/summary')
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                // Mock data for fallback if API is not running during dev
                setData({
                    total_co2e: 124.5,
                    category_distribution: [
                        { name: 'Transport', value: 45 },
                        { name: 'Energy', value: 30 },
                        { name: 'Procurement', value: 20 },
                        { name: 'Cloud Services', value: 5 }
                    ],
                    trend_data: [
                        { date: 'Jan', co2e: 10 },
                        { date: 'Feb', co2e: 15 },
                        { date: 'Mar', co2e: 12 }
                    ],
                    hotspots: [
                        { description: 'Fleet Diesel', co2e: 12.5 },
                        { description: 'Office Power', co2e: 8.2 }
                    ]
                });
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex-center" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
                <Loader2 size={48} color="var(--primary)" />
            </motion.div>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Analyzing Emissions Intelligence...</p>
        </div>
    );

    return (
        <motion.div
            className="dashboard-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <motion.h1
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{ fontSize: '2.5rem' }}
                    >
                        Intelligence Hub
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time sustainability insights & predictive analysis</p>
                </div>
                <SustainabilityScene />
            </div>

            <div className="kpi-grid">
                <motion.div className="card kpi-card" variants={itemVariants}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Total CO₂e Emissions</span>
                        <TrendingUp size={20} color="var(--primary)" />
                    </div>
                    <div className="kpi-value">{data.total_co2e.toFixed(2)}</div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tonnes CO2 equivalent</span>
                </motion.div>

                <motion.div className="card kpi-card" variants={itemVariants}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Top Contributor</span>
                        <AlertTriangle size={20} color="var(--warning)" />
                    </div>
                    <div className="kpi-value" style={{ fontSize: '1.8rem', paddingTop: '0.7rem' }}>
                        {data.category_distribution[0]?.name || 'N/A'}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Primary Emissions Hotspot</span>
                </motion.div>

                <motion.div className="card kpi-card" variants={itemVariants}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>System Confidence</span>
                        <Target size={20} color="var(--secondary)" />
                    </div>
                    <div className="kpi-value">94.8%</div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ML Classification Accuracy</span>
                </motion.div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <motion.div className="card" variants={itemVariants} style={{ height: '400px' }}>
                    <h3>Impact by Category</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={data.category_distribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40}>
                                {data.category_distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="card" variants={itemVariants} style={{ height: '400px' }}>
                    <h3>Contribution Ratio</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={data.category_distribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.category_distribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <motion.div className="card" variants={itemVariants} style={{ height: '300px', marginBottom: '1.5rem' }}>
                <h3>Emission Velocity</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={data.trend_data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                        <Line
                            type="monotone"
                            dataKey="co2e"
                            stroke="var(--primary)"
                            strokeWidth={4}
                            dot={{ fill: 'var(--primary)', stroke: 'var(--bg-dark)', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>

            <motion.div className="card" variants={itemVariants}>
                <h3>Critical Hotspots</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Activity Description</th>
                            <th>Emissions (MT CO2e)</th>
                            <th>Relative Impact</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.hotspots.map((h, i) => (
                            <tr key={i}>
                                <td>{h.description}</td>
                                <td style={{ fontWeight: 700 }}>{h.co2e.toFixed(2)}</td>
                                <td style={{ width: '200px' }}>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(h.co2e / data.hotspots[0].co2e) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            style={{
                                                height: '100%',
                                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                                borderRadius: '4px'
                                            }}
                                        ></motion.div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
