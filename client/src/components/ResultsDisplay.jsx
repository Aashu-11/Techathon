import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Activity, FileText, Settings, Cpu } from 'lucide-react';

const componentLabel = (value) => {
    if (value === null || value === undefined) return "Unknown";
    const v = String(value).trim();
    if (v === "0") return "Healthy";
    if (v === "1") return "HPC Degradation";
    if (v === "2") return "Fan Degradation";
    if (/^Healthy/i.test(v)) return "Healthy";
    if (/^HPC/i.test(v)) return "HPC Degradation";
    if (/^Fan/i.test(v)) return "Fan Degradation";
    return v;
};

const Card = ({ title, icon: Icon, children, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-panel p-6 ${className}`}
    >
        <div className="card-header">
            <Icon size={20} className="card-icon" />
            <h3>{title}</h3>
        </div>
        {children}
    </motion.div>
);

const RiskIndicator = ({ level, score }) => {
    const colors = {
        HIGH: "text-red-500",
        MEDIUM: "text-yellow-500",
        LOW: "text-green-500"
    };

    const bgColors = {
        HIGH: "bg-red-500",
        MEDIUM: "bg-yellow-500",
        LOW: "bg-green-500"
    };

    return (
        <div className="flex flex-col gap-3 py-3">
            <div className="flex items-center justify-between">
                <span className="text-xs tracking-[0.18em] uppercase text-secondary">Overall Risk</span>
                <span className={`text-sm font-semibold ${colors[level] || "text-slate-300"}`}>
                    {level || "UNKNOWN"}
                </span>
            </div>
            <div className="metric-bar">
                <div
                    className="metric-bar-fill"
                    style={{ width: `${Math.min((score || 0) * 100, 100)}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-xs text-secondary">
                <span>Score: {((score || 0) * 100).toFixed(1)}%</span>
                <span className="opacity-80">0% safe · 100% critical</span>
            </div>
        </div>
    );
};

const SimpleSparkline = ({ values }) => {
    if (!values || values.length === 0) return null;
    const max = Math.max(...values.map((v) => Math.abs(v))) || 1;
    return (
        <div className="sparkline">
            {values.map((v, idx) => (
                <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="sparkline-bar"
                    style={{ height: `${10 + (Math.abs(v) / max) * 28}%` }}
                />
            ))}
        </div>
    );
};

const BarGraph = ({
    title,
    subtitle,
    data,
    maxValue,
    unit = "",
    valueFormatter,
    variant = "rul",
}) => {
    const hasData = data && data.length > 0 && data.some((item) => item.value != null);
    if (!hasData) {
        return (
            <div className="graph-card">
                <div className="graph-header">
                    <div>
                        <span className="graph-title">{title}</span>
                        {subtitle && <p className="graph-subtitle">{subtitle}</p>}
                    </div>
                    <span className="mini-pill">Graph</span>
                </div>
                <div className="chart-placeholder">Awaiting predictions</div>
            </div>
        );
    }

    const safeMax = maxValue || Math.max(...data.map((item) => Math.max(0, item.value || 0)), 1);

    return (
        <div className="graph-card">
            <div className="graph-header">
                <div>
                    <span className="graph-title">{title}</span>
                    {subtitle && <p className="graph-subtitle">{subtitle}</p>}
                </div>
                <span className="mini-pill">Graph</span>
            </div>
            <div className="graph-bars">
                {data.map((item) => {
                    const value = Math.max(0, item.value || 0);
                    const height = Math.min(100, (value / safeMax) * 100);
                    const formattedValue = valueFormatter
                        ? valueFormatter(value)
                        : `${value.toFixed(0)}${unit}`;

                    return (
                        <div key={item.label} className="graph-bar">
                            <div
                                className={`graph-bar-fill ${variant}`}
                                style={{ height: `${height}%` }}
                            />
                            <span className="graph-bar-value">{formattedValue}</span>
                            <span className="graph-bar-label">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ResultsDisplay = ({ results }) => {
    if (!results) return null;

    const { risk_assessment, diagnosis, maintenance_schedule, final_report, predictions } = results;
    const fd001 = predictions?.fd001;
    const fd002 = predictions?.fd002;
    const fd003 = predictions?.fd003;

    const rulValues = [
        fd001?.rul ?? 0,
        fd002?.rul ?? 0,
        fd003?.rul ?? 0,
    ];

    const voiceAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const predictionEntries = [
        { label: "FD001", data: fd001 },
        { label: "FD002", data: fd002 },
        { label: "FD003", data: fd003 },
    ];

    const rulGraphData = predictionEntries
        .filter((p) => p.data)
        .map((p) => ({ label: p.label, value: p.data?.rul ?? 0 }));

    const failureGraphData = predictionEntries
        .filter((p) => p.data)
        .map((p) => ({
            label: p.label,
            value: (p.data?.failure_probability || 0) * 100,
        }));

    const componentGraphData = fd003?.component_probs
        ? Object.entries(fd003.component_probs)
            .map(([comp, prob]) => ({
                label: componentLabel(comp),
                value: prob * 100,
            }))
            .sort((a, b) => b.value - a.value)
        : [];

    const hasPredictionData = predictionEntries.some((p) => p.data);

    const summaryScript = useMemo(() => {
        if (!predictions) return 'No predictions available.';
        const p1 = fd001?.rul != null ? `FD001 at ${fd001.rul.toFixed(0)} cycles` : 'FD001 no signal';
        const p2 = fd002?.rul != null ? `FD002 at ${fd002.rul.toFixed(0)} cycles` : 'FD002 no signal';
        const p3 = fd003?.rul != null ? `FD003 at ${fd003.rul.toFixed(0)} cycles` : 'FD003 no signal';
        const predictionLine = `Predicted remaining life: ${p1}, ${p2}, and ${p3}.`;
        const scheduleLine = maintenance_schedule?.maintenance_window
            ? `Scheduling guidance: ${maintenance_schedule.maintenance_window} window with ${maintenance_schedule.recommended_actions?.length || 0} recommended actions.`
            : 'No scheduling guidance available.';
        return `${predictionLine} ${scheduleLine}`;
    }, [predictions, fd001, fd002, fd003, maintenance_schedule]);

    const speakSummary = () => {
        if (!voiceAvailable) return;
        const utterance = new SpeechSynthesisUtterance(summaryScript);
        utterance.rate = 1.02;
        utterance.pitch = 1;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk & Ensemble Agent */}
            <Card title="Risk & Ensemble Agent" icon={AlertTriangle} className="lg:col-span-1">
                <RiskIndicator
                    level={risk_assessment?.risk_level}
                    score={risk_assessment?.risk_score}
                />

                <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div className="stat-tile">
                        <span className="stat-label">Ensemble RUL</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-mono text-white">
                                {risk_assessment?.avg_rul?.toFixed(0)}
                            </span>
                            <span className="text-[0.7rem] text-secondary">cycles</span>
                        </div>
                    </div>
                    <div className="stat-tile">
                        <span className="stat-label">Diagnostic Confidence</span>
                        <span className="text-2xl font-mono text-white">
                            {diagnosis?.confidence != null
                                ? `${(diagnosis.confidence * 100).toFixed(0)}%`
                                : "N/A"}
                        </span>
                    </div>
                </div>

                <div className="mt-5">
                    <span className="text-xs text-secondary block mb-2">Model RUL Spread (FD001 / FD002 / FD003)</span>
                    <SimpleSparkline values={rulValues} />
                </div>
            </Card>

            {/* Prediction Agent (per-model) */}
            <Card title="Prediction Agent (Models)" icon={Cpu} className="lg:col-span-2">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-secondary text-sm">Graphical RUL and failure probability</span>
                    <button
                        type="button"
                        className="ghost text-xs"
                        onClick={speakSummary}
                        disabled={!voiceAvailable}
                    >
                        Speak summary (predictions → scheduling)
                    </button>
                </div>
                {hasPredictionData ? (
                    <div className="chart-grid">
                        {predictionEntries.map((item) => {
                            const rul = item.data?.rul ?? 0;
                            const failure = (item.data?.failure_probability || 0) * 100;
                            const normalizedRul = Math.min(Math.max(rul, 0), 250);
                            const rulWidth = Math.min(100, Math.max((normalizedRul / 250) * 100, item.data ? 6 : 0));
                            const failWidth = Math.min(100, Math.max(failure, item.data ? 6 : 0));
                            return (
                                <div key={item.label} className="chart-card">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-secondary text-xs tracking-[0.16em] uppercase">{item.label}</span>
                                        <span className="mini-pill">RUL / P(fail)</span>
                                    </div>
                                    <div className="chart-row">
                                        <span className="chart-label">RUL</span>
                                        <div className="chart-bar">
                                            <div
                                                className="chart-fill rul"
                                                style={{ width: `${rulWidth}%` }}
                                            />
                                        </div>
                                        <span className="chart-value">{item.data?.rul != null ? `${rul.toFixed(0)} cy` : '—'}</span>
                                    </div>
                                    <div className="chart-row">
                                        <span className="chart-label">P(fail)</span>
                                        <div className="chart-bar">
                                            <div
                                                className="chart-fill fail"
                                                style={{ width: `${failWidth}%` }}
                                            />
                                        </div>
                                        <span className="chart-value">{failure.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="chart-placeholder">
                        Visual analytics will appear once predictions are available.
                    </div>
                )}
                {hasPredictionData && (
                    <div className="graph-section">
                        <BarGraph
                            title="Remaining Useful Life"
                            subtitle="Model comparison (cycles)"
                            data={rulGraphData}
                            unit=" cy"
                            variant="rul"
                        />
                        <BarGraph
                            title="Failure Probability"
                            subtitle="Instantaneous risk per model"
                            data={failureGraphData}
                            maxValue={100}
                            valueFormatter={(v) => `${v.toFixed(1)}%`}
                            variant="fail"
                        />
                        {componentGraphData.length > 0 && (
                            <BarGraph
                                title="FD003 Component Likelihood"
                                subtitle="Probabilities from classification head"
                                data={componentGraphData}
                                maxValue={100}
                                valueFormatter={(v) => `${v.toFixed(0)}%`}
                                variant="component"
                            />
                        )}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {predictionEntries.map((item) => (
                        <div
                            key={item.label}
                            className="stat-card"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-secondary text-[0.7rem] tracking-[0.16em] uppercase">
                                    {item.label}
                                </span>
                                <span className="mini-pill">
                                    RUL + P(fail)
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-mono text-white">
                                    {item.data?.rul != null ? item.data.rul.toFixed(0) : "–"}
                                </span>
                                <span className="text-[0.65rem] text-secondary">cycles</span>
                            </div>
                            <div className="metric-bar mt-1.5">
                                <div
                                    className="metric-bar-fill"
                                    style={{
                                        width: `${Math.min((item.data?.failure_probability || 0) * 100, 100)}%`,
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[0.65rem] text-secondary pt-0.5">
                                <span>P(failure): {((item.data?.failure_probability || 0) * 100).toFixed(1)}%</span>
                                <span className="opacity-70">
                                    {item.data?.rul != null ? `RUL ${item.data.rul.toFixed(0)}` : "No signal"}
                                </span>
                            </div>
                            {item.label === "FD003" && fd003?.component_probs && (
                                <div className="mt-1 pt-1 border-t border-slate-700/40">
                                    <span className="text-[0.65rem] text-secondary block mb-1">
                                        Component probabilities:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Object.entries(fd003.component_probs)
                                            .sort((a, b) => b[1] - a[1])
                                            .map(([comp, prob]) => (
                                                <span
                                                    key={comp}
                                                    className="tag"
                                                >
                                                    {componentLabel(comp)}: {(prob * 100).toFixed(0)}%
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Diagnosis Agent */}
            <Card title="Diagnosis Agent" icon={Activity} className="lg:col-span-1">
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="text-secondary text-xs block mb-1">Probable Component</span>
                        <div className="text-lg font-medium text-white flex items-center gap-2">
                            <Settings size={16} />
                            {componentLabel(diagnosis?.probable_component || "General")}
                        </div>
                        {diagnosis?.predicted_component && (
                            <p className="text-[0.7rem] text-secondary mt-0.5">
                                Model prediction: {componentLabel(diagnosis.predicted_component)}
                            </p>
                        )}
                    </div>

                    <div>
                        <span className="text-secondary text-xs block mb-1">Anomalies Detected</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {diagnosis?.anomalies?.length > 0 ? (
                                diagnosis.anomalies.map((anomaly, idx) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <span
                                        key={idx}
                                        className="tag alert"
                                    >
                                        {anomaly}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500 italic text-xs">None detected</span>
                            )}
                        </div>
                    </div>

                    {diagnosis?.reason && (
                        <div className="mt-2">
                            <span className="text-secondary text-xs block mb-1">Agent explanation</span>
                            <p className="text-xs subtle leading-relaxed">
                                {diagnosis.reason}
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Scheduling Agent */}
            <Card title="Scheduling Agent" icon={Clock} className="lg:col-span-1">
                <div
                    className={`
          p-4 rounded-xl border mb-4 text-center font-semibold text-sm tracking-wide
          ${maintenance_schedule?.maintenance_window === 'IMMEDIATE'
            ? 'bg-red-900/30 border-red-400/60 text-red-200'
            : maintenance_schedule?.maintenance_window === 'SOON'
                ? 'bg-amber-900/30 border-amber-400/60 text-amber-100'
                : 'bg-emerald-900/25 border-emerald-400/60 text-emerald-100'}
        `}
                >
                    {maintenance_schedule?.maintenance_window || 'ROUTINE'} ACTION REQUIRED
                </div>
                <div className="space-y-2 text-sm">
                    {maintenance_schedule?.recommended_actions?.map((action, idx) => (
                        <div key={action} className="flex items-start gap-2 text-slate-200 text-xs">
                            <CheckCircle size={14} className="mt-0.5 text-[var(--accent-secondary)] shrink-0" />
                            <span>{action}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Explanation Agent (LLM report) */}
            <Card title="Explanation / Report Agent" icon={FileText} className="lg:col-span-3">
                <div className="report-box">
                    {final_report?.narrative || "No report generated."}
                </div>
            </Card>
        </div>
    );
};

export default ResultsDisplay;
