import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Target, Zap,
    Leaf, ArrowUpRight, Activity, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Globe from './Globe'; // Import the new Globe component

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// ... (CustomTooltip component remains unchanged)

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            }}>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div>
                    <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>
                        {payload[0].value} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#94a3b8' }}>tCO2e</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('Welcome back');
    const [generatingReport, setGeneratingReport] = useState(false);

    const handleGenerateReport = async () => {
        setGeneratingReport(true);
        try {
            const element = document.getElementById('dashboard-content');
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#0f172a', // Capture dark theme background
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`EcoLedger_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

            alert("Report generated successfully!");
        } catch (error) {
            console.error("PDF Generation Error:", error);
            alert("Failed to generate report.");
        } finally {
            setGeneratingReport(false);
        }
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning, Team');
        else if (hour < 18) setGreeting('Good afternoon, Team');
        else setGreeting('Good evening, Team');

        const fetchData = async () => {
            try {
                // Simulating a more "organic" loading time for feel
                await new Promise(r => setTimeout(r, 800));
                const res = await axios.get('/api/summary');
                setData(res.data);
            } catch (err) {
                console.warn("Using fallback data.");
                setData({
                    total_co2e: 124.5,
                    category_distribution: [
                        { name: 'Energy', value: 45 },
                        { name: 'Transport', value: 30 },
                        { name: 'Operations', value: 15 },
                        { name: 'Supply', value: 10 }
                    ],
                    trend_data: [
                        { date: 'Mon', co2e: 22 },
                        { date: 'Tue', co2e: 28 },
                        { date: 'Wed', co2e: 24 },
                        { date: 'Thu', co2e: 30 },
                        { date: 'Fri', co2e: 20 },
                        { date: 'Sat', co2e: 15 },
                        { date: 'Sun', co2e: 10 }
                    ],
                    hotspots: [
                        { description: 'Server Farm A', co2e: 45.2, impact: 'High' },
                        { description: 'Logistics Fleet', co2e: 32.8, impact: 'High' },
                        { description: 'HQ HVAC', co2e: 18.5, impact: 'Medium' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="loader-ring"></div>
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}
            >
                SYNCHRONIZING ENVIRONMENT...
            </motion.p>
        </div>
    );

    const safeTotal = typeof data?.total_co2e === 'number' ? data.total_co2e : parseFloat(data?.total_co2e) || 0;
    const safeTrends = Array.isArray(data?.trend_data) ? data.trend_data : [];
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });


    return (
        <div id="dashboard-content" className="dashboard-content" style={{ paddingBottom: '3rem' }}>
            {/* Header Section */}
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--primary)' }}
                    >
                        <img src={logo} alt="EcoLedger Logo" style={{ height: '24px', width: 'auto' }} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>ECOLEDGER OS</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}
                    >
                        {greeting}.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}
                    >
                        Here's your environmental impact overview for <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{dateStr}</span>.
                    </motion.p>
                </div>

                {/* Visual Wow Factor: The Globe */}
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '250px',
                    width: '300px',
                    height: '300px',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}>
                    <div style={{ pointerEvents: 'auto' }}>
                        <Globe />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                        cursor: generatingReport ? 'not-allowed' : 'pointer',
                        opacity: generatingReport ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {generatingReport ? (
                        <>
                            Generate Report <span className="loader-ring" style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent' }}></span>
                        </>
                    ) : (
                        'Generate Report'
                    )}
                </motion.button>
            </header >

            {/* Main Content Grid */}
            < div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>

                {/* Hero Chart Section */}
                < motion.div
                    className="card hero-chart"
                    style={{ gridColumn: 'span 8', padding: '2rem', display: 'flex', flexDirection: 'column' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Emission Trends</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Weekly carbon footprint analysis</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                                Live Data
                            </span>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={safeTrends}>
                                <defs>
                                    <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontFamily="Inter"
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    fontFamily="Inter"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}t`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="co2e"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="url(#gradientColor)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div >

                {/* Right Side Stats Column */}
                < div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Primary KPI */}
                    < motion.div
                        className="card"
                        style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(30, 41, 59, 0.7) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                            <Activity size={20} />
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>CURRENT FOOTPRINT</span>
                        </div>
                        <div style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.5rem' }}>
                            {safeTotal.toFixed(1)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>tCO2e Total</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                                <TrendingDown size={14} />
                                <span>12% vs last month</span>
                            </div>
                        </div>
                    </motion.div >

                    {/* Secondary KPIs Visualized */}
                    < motion.div
                        className="card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Efficiency Metrics</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { label: 'Energy Intensity', val: 'Low', color: '#10b981' },
                                { label: 'Data Confidence', val: '94%', color: '#3b82f6' },
                                { label: 'Audit Status', val: 'Ready', color: '#f59e0b' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.label}</span>
                                    <span style={{ fontWeight: 600, color: item.color }}>{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div >
                </div >

                {/* Bottom Section: Hotspots & Breakdown */}
                < motion.div
                    className="card"
                    style={{ gridColumn: 'span 6' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Priority Hotspots</h3>
                        <ArrowUpRight size={18} color="var(--text-muted)" />
                    </div>
                    <div className="hotspot-list">
                        {(data?.hotspots || []).map((h, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem 0',
                                borderBottom: i !== (data?.hotspots.length - 1) ? '1px solid var(--border)' : 'none'
                            }}>
                                <div style={{
                                    width: 40, height: 40,
                                    borderRadius: '10px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginRight: '1rem'
                                }}>
                                    <Target size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{h.description}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High Impact Area</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700 }}>{h.co2e.toFixed(1)}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>tCO2e</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div >

                <motion.div
                    className="card"
                    style={{ gridColumn: 'span 6' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <h3 style={{ marginBottom: '1rem' }}>Resource Allocation</h3>
                    <div style={{ display: 'flex', height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.category_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(data?.category_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                            {(data?.category_distribution || []).map((entry, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{entry.name}</span>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, marginLeft: 'auto' }}>{entry.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div >
        </div >
    );
};

export default Dashboard;

