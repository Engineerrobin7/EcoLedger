import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, TrendingDown, Target, Zap,
    Leaf, ArrowUpRight, Activity, Calendar, BarChart
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
            // 1. Capture Dashboard Snapshot
            const element = document.getElementById('dashboard-content');
            // Hide the generate button temporarily for the screenshot
            const btn = document.getElementById('generate-btn');
            if (btn) btn.style.display = 'none';

            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#0B1120', // Match deep dark theme
                useCORS: true,
                logging: false,
                windowWidth: 1400 // Force wide capture
            });

            if (btn) btn.style.display = 'flex'; // Restore button

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // --- PAGE 1: PROFESSIONAL COVER SHEET ---
            // Dark Background for Cover
            pdf.setFillColor(11, 17, 32); // #0B1120
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Logo & Branding
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(28);
            pdf.setTextColor(45, 212, 191); // Teal Accent
            pdf.text("ECOLEDGER OS", 20, 40);

            pdf.setFontSize(12);
            pdf.setTextColor(148, 163, 184); // Muted text
            pdf.text("ENTERPRISE SUSTAINABILITY REPORT", 20, 50);

            // Report Title
            pdf.setFontSize(36);
            pdf.setTextColor(255, 255, 255);
            pdf.text("Carbon Impact", 20, 100);
            pdf.text("Assessment", 20, 115);

            // Date & ID
            const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            pdf.setFontSize(14);
            pdf.setTextColor(45, 212, 191);
            pdf.text(`Generated: ${date}`, 20, 140);
            pdf.text(`Report ID: EL-${Date.now().toString().slice(-6)}`, 20, 150);

            // Footer
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text("Confidential & Proprietary - Powered by EcoLedger AI", 20, pageHeight - 20);

            // --- PAGE 2: DASHBOARD VISUALS ---
            pdf.addPage();
            // Dark Background for Content Page
            pdf.setFillColor(11, 17, 32);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Header
            pdf.setFontSize(16);
            pdf.setTextColor(255, 255, 255);
            pdf.text("Executive Dashboard Overview", 20, 20);

            // Dashboard Image
            const imgWidth = pageWidth - 20; // 10mm margin each side
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);

            // Save
            pdf.save(`EcoLedger_Executive_Report_${new Date().toISOString().slice(0, 10)}.pdf`);

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

                // If DB is empty, force fallback to Demo Data for "Wow" factor
                if (!res.data || (res.data.total_co2e === 0 && res.data.trend_data.length === 0)) {
                    throw new Error("Empty Data");
                }

                setData(res.data);
            } catch (err) {
                console.log("Loading Demo Data (Backend empty or offline).");
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
            {/* Top Bar (New feature) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <input
                        type="text"
                        placeholder="Search reports, teams..."
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            color: 'var(--text-main)',
                            width: '100%',
                            fontSize: '0.9rem'
                        }}
                    />
                    <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
                        <div style={{ cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></div>
                        <div style={{ cursor: 'pointer' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></div>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)', border: '2px solid #fff' }}></div>
                </div>
            </div>

            {/* Page Header */}
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Carbon Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>A clear snapshot of your organization's carbon impact.</p>

                {/* Visual Wow Factor: The Globe (Integrated) */}
                <div style={{
                    position: 'absolute',
                    top: '-120px',
                    right: '-20px',
                    width: '500px',
                    height: '500px',
                    zIndex: 0,
                    opacity: 1,
                    pointerEvents: 'auto', // Enable interaction
                    filter: 'drop-shadow(0 0 50px rgba(45, 212, 191, 0.2))'
                }}>
                    <div style={{ width: '100%', height: '100%', transform: 'scale(1.2)' }}>
                        <Globe />
                    </div>
                </div>
            </div>

            {/* KPI Row (New 3-Column Layout) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Total Emissions */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                            <BarChart size={24} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Emissions</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {safeTotal.toFixed(1)} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 400 }}>tCO2e</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Across all tracked sources</div>
                </motion.div>

                {/* Monthly Change */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                            <Activity size={24} color="#F472B6" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Change</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem', color: '#F472B6' }}>
                        -12%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compared to last month</div>
                </motion.div>

                {/* Reduction Progress */}
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                            <Leaf size={24} color="var(--secondary)" />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reduction Goal</span>
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                        38%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toward your annual goal</div>
                </motion.div>
            </div>

            {/* Main Content Grid (Charts) */}
            <div className="grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Emission Breakdown (Area Chart) */}
                <div className="card" style={{ gridColumn: 'span 8', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3>Emission Breakdown</h3>
                        <select style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={safeTrends}>
                                <defs>
                                    <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}t`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="co2e" stroke="var(--primary)" strokeWidth={3} fill="url(#gradientColor)" activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>tCO2e Total</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                            <TrendingDown size={14} />
                            <span>12% vs last month</span>
                        </div>
                    </div>
                </div>

                {/* By Source (Donut Chart) */}
                <div className="card" style={{ gridColumn: 'span 4', padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h3>By Source</h3>
                        <div style={{ cursor: 'pointer' }}>...</div>
                    </div>
                    <div style={{ height: '250px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.category_distribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(data?.category_distribution || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{safeTotal.toFixed(0)}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>tCO2e</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                        {(data?.category_distribution || []).map((entry, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[index % COLORS.length] }}></div>
                                <span style={{ color: 'var(--text-muted)' }}>{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity (New Feature) */}
            <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { title: 'Cloud data synced', desc: 'AWS emissions updated', time: '02 hours ago', icon: 'cloud' },
                        { title: 'Travel booking detected', desc: 'New flight added to Business Travel', time: '03 hours ago', icon: 'plane' },
                        { title: 'Team member added', desc: 'Sarah Chan joined Engineering', time: '05 hours ago', icon: 'user' }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                    {/* Quick icon map */}
                                    {item.icon === 'cloud' && <Activity size={18} />}
                                    {item.icon === 'plane' && <ArrowUpRight size={18} />}
                                    {item.icon === 'user' && <Leaf size={18} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 500 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Action Report Button */}
            <motion.button
                id="generate-btn"
                onClick={handleGenerateReport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: '3rem',
                    right: '3rem',
                    padding: '1rem 2rem',
                    backgroundColor: 'var(--primary)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    boxShadow: '0 10px 25px -5px rgba(45, 212, 191, 0.5)',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                {generatingReport ? 'Generating...' : 'Generate New Report'}
            </motion.button>
        </div>
    );
};

export default Dashboard;

