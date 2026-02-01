import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload as UploadIcon, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';

const Upload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus('idle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
            setMessage(res.data.message);
            setTimeout(() => {
                if (onUploadSuccess) onUploadSuccess();
            }, 1500);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.detail || 'Upload failed. Please check CSV formatting.');
        }
    };

    return (
        <div className="upload-view">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '1rem' }}
            >
                Structured Data Ingestion
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}
            >
                Incorporate business activity data for automated carbon classification and methodology-aligned calculation.
            </motion.p>

            <motion.div
                className="card"
                style={{ maxWidth: '600px', margin: '0 auto' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <form onSubmit={handleSubmit}>
                    <motion.div
                        whileHover={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        whileTap={{ scale: 0.99 }}
                        style={{
                            border: '2px dashed var(--border)',
                            borderRadius: 'var(--radius)',
                            padding: '4rem 2rem',
                            textAlign: 'center',
                            backgroundColor: 'rgba(255,255,255,0.01)',
                            marginBottom: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => document.getElementById('csv-input').click()}
                    >
                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <UploadIcon size={48} color="var(--primary)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
                                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Click to select or drag & drop CSV</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                        Required: date, description, quantity, unit
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="selected"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <FileText size={48} color="var(--secondary)" style={{ marginBottom: '1.5rem' }} />
                                    <p style={{ fontWeight: 600, color: '#fff' }}>{file.name}</p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>File selected and ready for analysis</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input
                            id="csv-input"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="btn-primary"
                        disabled={!file || status === 'uploading'}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                    >
                        {status === 'uploading' ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Analyzing & Processing...
                            </>
                        ) : 'Initiate Engine Processing'}
                    </motion.button>
                </form>

                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#10b981',
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            <CheckCircle2 size={20} />
                            <span>{message}</span>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                color: '#ef4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                style={{ marginTop: '5rem' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--primary)' }}></div>
                    Ingestion Integrity Standards
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                    {[
                        { title: 'Validation', desc: 'Automated check of required reporting columns.' },
                        { title: 'Normalization', desc: 'Character encoding and unit-of-measure standardization.' },
                        { title: 'Fingerprinting', desc: 'Deduplication logic using unique activity signatures.' }
                    ].map((item, i) => (
                        <div key={i}>
                            <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default Upload;
