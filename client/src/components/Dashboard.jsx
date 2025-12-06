import React, { useState } from 'react';
import { Activity, Cpu, AlertTriangle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import InputForm from './InputForm';
import ResultsDisplay from './ResultsDisplay';
import axios from 'axios';

const Dashboard = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async (observation) => {
        setLoading(true);
        setError(null);
        setResults(null);
        try {
            const response = await axios.post('http://localhost:5000/api/analyze', {
                observation: observation
            });
            setResults(response.data);
        } catch (err) {
            console.error("Analysis failed:", err);
            setError(err.response?.data?.error || "Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell">
            <div className="app-shell-inner">
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="chip mb-3">
                                <Activity size={14} />
                                Multi-Agent CMAPSS Orchestrator
                            </div>
                            <motion.h1
                                initial={{ opacity: 0, y: -18 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl md:text-4xl font-bold mb-2 gradient-text"
                            >
                                Predictive Maintenance Command Center
                            </motion.h1>
                            <p className="text-secondary text-sm max-w-xl">
                                Run the full agentic pipeline (Prediction → Diagnosis → Risk → Scheduling → Explanation)
                                against a single engine snapshot and visualize RUL, risk and component health.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3 text-xs text-secondary">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70">
                                <Cpu size={14} className="text-[var(--accent-secondary)]" />
                                <span>CMAPSS Models</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70">
                                <FileText size={14} className="text-pink-400" />
                                <span>LLM Narrative</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid gap-8">
                    <InputForm onAnalyze={handleAnalyze} isLoading={loading} />

                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-4 bg-red-950/50 border border-red-500/60 rounded-xl text-red-100 text-center text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {results && <ResultsDisplay results={results} />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
