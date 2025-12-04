import React, { useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const InputForm = ({ onAnalyze, isLoading }) => {
    // Default sample data (FD001 sample)
    const defaultObservation = "-0.0007, -0.0004, 100.0, 518.67, 641.82, 1589.70, 1400.60, 14.62, 21.61, 554.36, 2388.06, 9046.19, 1.30, 47.47, 521.66, 2388.02, 8138.62, 8.4195, 0.03, 392, 2388, 100.00, 39.06, 23.4190";

    const [input, setInput] = useState(defaultObservation);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert string to array of floats
        try {
            const observation = input.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
            if (observation.length === 0) {
                alert("Please enter valid sensor data.");
                return;
            }
            onAnalyze(observation);
        } catch (err) {
            alert("Invalid format. Please use comma-separated numbers.");
        }
    };

    const handleReset = () => {
        setInput(defaultObservation);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6"
        >
            <div className="flex justify-between items-start mb-5 gap-4">
                <div>
                    <div className="chip mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Realtime CMAPSS Snapshot
                    </div>
                    <h2 className="text-xl font-semibold text-white">Sensor Observation</h2>
                    <p className="text-xs text-secondary mt-1">
                        Paste or edit 24 comma-separated sensor readings from the engine.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleReset}
                    className="ghost text-xs"
                >
                    <RotateCcw size={14} /> Reset sample
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-stack">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="sensor-input"
                    placeholder="e.g. -0.0007, -0.0004, 100.0, ... (24 values total)"
                />

                <div className="flex items-center justify-between text-[0.7rem] text-secondary">
                    <span className="subtle">Tip: keep a CSV snippet from your pipeline and paste here for quick what-if analysis.</span>
                    <span className="subtle">Expected length: 24 features</span>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`primary text-sm ${isLoading ? 'is-loading' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <div className="spinner" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Play size={18} />
                                Run Agentic Analysis
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default InputForm;
