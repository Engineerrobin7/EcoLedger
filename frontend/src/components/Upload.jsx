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
                className="text-muted-p"
                style={{ marginBottom: '3rem' }}
            >
                Incorporate business activity data for automated carbon classification and methodology-aligned calculation.
            </motion.p>

            <motion.div
                className="card upload-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <form onSubmit={handleSubmit}>
                    <motion.div
                        className="upload-drop-zone"
                        whileHover={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                        whileTap={{ scale: 0.99 }}
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
                                    <UploadIcon size={48} color="var(--primary)" className="upload-icon" />
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
                            className="upload-success-alert"
                        >
                            <CheckCircle2 size={20} />
                            <span>{message}</span>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="upload-error-alert"
                        >
                            <AlertCircle size={20} />
                            <span>{message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div
                className="upload-standards-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h3 className="upload-standards-header">
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--primary)' }}></div>
                    Ingestion Integrity Standards
                </h3>
                <div className="standards-grid">
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
