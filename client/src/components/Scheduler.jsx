import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Headset, Bell, CalendarClock, CheckCircle2, Loader2, Volume2 } from 'lucide-react';

const mockApi = {
    getSlots: () =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 'SCH-001', day: 'Mon', date: 'Mar 10', time: '09:30', advisor: 'Priya S.', bay: 'Bay 3', type: 'Maintenance', available: true },
                    { id: 'SCH-002', day: 'Mon', date: 'Mar 10', time: '14:00', advisor: 'James R.', bay: 'Bay 1', type: 'Diagnostics', available: true },
                    { id: 'SCH-003', day: 'Tue', date: 'Mar 11', time: '11:15', advisor: 'Elena M.', bay: 'Bay 2', type: 'Repair', available: true },
                    { id: 'SCH-004', day: 'Tue', date: 'Mar 11', time: '16:00', advisor: 'Priya S.', bay: 'Bay 4', type: 'Maintenance', available: false },
                    { id: 'SCH-005', day: 'Wed', date: 'Mar 12', time: '10:45', advisor: 'Samir K.', bay: 'Bay 5', type: 'Diagnostics', available: true },
                    { id: 'SCH-006', day: 'Wed', date: 'Mar 12', time: '15:30', advisor: 'James R.', bay: 'Bay 1', type: 'Maintenance', available: true },
                ]);
            }, 450);
        }),
    confirmBooking: (slot) =>
        new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    bookingId: `${slot.id}-CONF`,
                    eta: `${slot.day} ${slot.date} at ${slot.time}`,
                });
            }, 650);
        }),
};

const Scheduler = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState({ status: 'idle', detail: null });
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [notifications, setNotifications] = useState([
        { id: 'NTF-001', title: 'Inspection recap', detail: 'Cooling loop inspection completed. No leaks detected.', time: 'Today • 10:05' },
        { id: 'NTF-002', title: 'Reminder', detail: '48-hour reminder will be sent after booking is confirmed.', time: 'Scheduled' },
    ]);

    useEffect(() => {
        mockApi.getSlots().then((data) => {
            setSlots(data);
            setLoading(false);
        });
    }, []);

    const handleSelect = (slot) => {
        if (!slot.available) return;
        setSelectedSlot(slot);
        setBooking({ status: 'idle', detail: null });
    };

    const handleConfirm = async () => {
        if (!selectedSlot) return;
        setBooking({ status: 'pending', detail: null });
        const result = await mockApi.confirmBooking(selectedSlot);
        if (result.success) {
            const bookedSlot = selectedSlot;
            setSlots((prev) =>
                prev.map((s) => (s.id === bookedSlot.id ? { ...s, available: false } : s))
            );
            const note = {
                id: result.bookingId,
                title: 'Booking confirmed',
                detail: `Technician: ${bookedSlot.advisor}. Arrive ${result.eta}.`,
                time: 'Just now',
            };
            setNotifications((prev) => [note, ...prev]);
            setBooking({ status: 'confirmed', detail: { ...result, slot: bookedSlot } });
            setSelectedSlot(null);
        } else {
            setBooking({ status: 'error', detail: null });
        }
    };

    const voiceAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

    const speak = (text) => {
        if (!voiceAvailable) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.02;
        utterance.pitch = 0.98;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    const availabilitySummary = useMemo(() => {
        if (!slots.length) return 'No availability loaded yet.';
        const next = slots.filter((s) => s.available);
        if (!next.length) return 'No appointment slots available right now.';
        const lead = next.slice(0, 3).map((s) => `${s.day} ${s.date} at ${s.time} with ${s.advisor}`).join('; ');
        return `Here are the next openings: ${lead}. Tell me which slot to reserve and I will confirm it.`;
    }, [slots]);

    const confirmationSummary = useMemo(() => {
        if (booking.status !== 'confirmed' || !booking.detail?.slot) return 'No booking confirmed yet.';
        const slot = booking.detail.slot;
        return `Your appointment is confirmed for ${booking.detail.eta} with ${slot.advisor} in ${slot.bay}. We will send reminders 48 hours and 2 hours before the visit.`;
    }, [booking]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6"
        >
            <div className="module-heading">
                <div className="flex items-center gap-2">
                    <Headset size={18} className="card-icon" />
                    <div>
                        <div className="chip mb-1">Service Center Scheduler</div>
                        <h2 className="text-xl text-white">Voice-led booking & reminders</h2>
                    </div>
                </div>
                <div className="pill">
                    <Bell size={14} />
                    App notifications armed
                </div>
            </div>

            <div className="scheduler-grid">
                <div className="voice-panel">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-secondary">
                            <Headset size={16} />
                            Virtual Service Agent
                        </div>
                        <button
                            type="button"
                            className="ghost text-xs"
                            onClick={() => speak(availabilitySummary)}
                            disabled={!voiceAvailable}
                        >
                            <Volume2 size={14} /> Play availability
                        </button>
                    </div>
                    <p className="subtle mb-3">Ask the agent to read out openings or your confirmed booking. Speech output uses the browser speech API.</p>
                    <div className="voice-box">
                        <h4>Availability briefing</h4>
                        <p>{availabilitySummary}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <span className="text-secondary text-xs">After booking, the agent can read back the confirmation.</span>
                        <button
                            type="button"
                            className="ghost text-xs"
                            onClick={() => speak(confirmationSummary)}
                            disabled={!voiceAvailable || booking.status !== 'confirmed'}
                        >
                            <Volume2 size={14} /> Play confirmation
                        </button>
                    </div>
                    {!voiceAvailable && (
                        <div className="alert-box mt-2">
                            Browser speech synthesis is unavailable. Voice playback is disabled.
                        </div>
                    )}
                </div>

                <div className="slots-column">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-secondary">
                            <CalendarClock size={16} />
                            Available appointment slots
                        </div>
                        <span className="text-[0.7rem] subtle">Select a slot, then confirm</span>
                    </div>
                    {loading ? (
                        <div className="loading-panel">
                            <Loader2 className="spinner" />
                            Fetching slots...
                        </div>
                    ) : (
                        <div className="slot-grid">
                            {slots.map((slot) => {
                                const isSelected = selectedSlot?.id === slot.id;
                                return (
                                    <button
                                        type="button"
                                        key={slot.id}
                                        className={`slot-card ${!slot.available ? 'slot-disabled' : ''} ${isSelected ? 'slot-active' : ''}`}
                                        onClick={() => handleSelect(slot)}
                                    >
                                        <div className="slot-row">
                                            <div>
                                                <div className="slot-time">{slot.time}</div>
                                                <div className="slot-day">{slot.day} • {slot.date}</div>
                                            </div>
                                            <span className="mini-pill">{slot.type}</span>
                                        </div>
                                        <div className="slot-meta">
                                            <span>Advisor: {slot.advisor}</span>
                                            <span>{slot.bay}</span>
                                        </div>
                                        <div className="slot-status">
                                            {slot.available ? 'Available' : 'Waitlist only'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="flex items-center justify-end mt-3">
                        <button
                            type="button"
                            className="primary"
                            onClick={handleConfirm}
                            disabled={!selectedSlot || booking.status === 'pending'}
                        >
                            {booking.status === 'pending' ? (
                                <>
                                    <Loader2 className="spinner" />
                                    Confirming...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    Confirm booking
                                </>
                            )}
                        </button>
                    </div>
                    {booking.status === 'confirmed' && booking.detail?.slot && (
                        <div className="success-banner">
                            <CheckCircle2 size={16} />
                            {`Scheduled for ${booking.detail.eta} with ${booking.detail.slot.advisor}. Booking ID: ${booking.detail.bookingId}`}
                        </div>
                    )}
                </div>

                <div className="notifications-column">
                    <div className="flex items-center gap-2 text-secondary mb-2">
                        <Bell size={16} />
                        Owner notifications
                    </div>
                    <div className="notif-stack">
                        {notifications.map((note) => (
                            <div key={note.id} className="notif-card">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-semibold">{note.title}</span>
                                    <span className="mini-pill">App</span>
                                </div>
                                <p className="subtle mb-1">{note.detail}</p>
                                <span className="text-[0.7rem] text-secondary">{note.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Scheduler;
