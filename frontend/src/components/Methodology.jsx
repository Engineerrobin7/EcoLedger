import React from 'react';
import { BookOpen, ShieldCheck, Database, Scale } from 'lucide-react';

const Methodology = () => {
    const sections = [
        {
            title: "Calculation Standards",
            icon: <Scale color="var(--primary)" size={24} />,
            content: "EcoLedger follows the GHG Protocol Corporate Accounting and Reporting Standard. All CO2 equivalent (CO2e) computations incorporate the Global Warming Potential (GWP) values from the IPCC Sixth Assessment Report (AR6)."
        },
        {
            title: "Data Sources & Factors",
            icon: <Database color="var(--primary)" size={24} />,
            content: "Primary emission factors are sourced from UK DEFRA (2023), US EPA (v1.5 2023), and the Ecoinvent database. Energy grid intensities are updated annually based on IEA regional projections."
        },
        {
            title: "Confidence Scoring Logic",
            icon: <ShieldCheck color="var(--primary)" size={24} />,
            content: "Confidence is mapped based on data granularity: 'High' for direct metered utility data, 'Medium' for activity-based estimates with secondary sources, and 'Low' for spend-based (EEIO) modeling."
        },
        {
            title: "Audit Transparency",
            icon: <BookOpen color="var(--primary)" size={24} />,
            content: "Every data point in EcoLedger is immutable once finalized for reporting. Full calculation logs (Factor x Formula) are preserved to satisfy SASB, TCFD, and CSRD reporting requirements."
        }
    ];

    return (
        <div className="methodology-view">
            <h1 style={{ marginBottom: '1rem' }}>Methodology & Transparency</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                Detailed disclosure of the scientific and regulatory frameworks underpinning the EcoLedger platform.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {sections.map((sec, i) => (
                    <div key={i} className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            {sec.icon}
                            <h3>{sec.title}</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{sec.content}</p>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: '2rem', backgroundColor: '#fafafa', borderStyle: 'dashed' }}>
                <h3>Limitation Guidance</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    While EcoLedger aims for absolute accuracy, estimations in Scope 3 Supply Chain categories rely on industry averages.
                    Users are encouraged to replace spend-based data with supplier-specific product carbon footprints (PCFs) as they become available.
                </p>
            </div>
        </div>
    );
};

export default Methodology;
