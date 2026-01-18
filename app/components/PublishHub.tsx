
'use client';

import { useState } from 'react';

// --- Types ---
interface ScheduledArticle {
    id: number;
    title: string;
    category: string;
    scheduledDate?: string;
    scheduledTime?: string;
    status: 'ready' | 'scheduled' | 'published';
}

const MOCK_READY: ScheduledArticle[] = [
    { id: 1, title: 'S19 Pro Hashboard Not Detected', category: 'Phase 1 > Antminer > S-Series', status: 'ready' },
    { id: 2, title: 'M50S Hashboard Error', category: 'Phase 1 > WhatsMiner', status: 'ready' },
    { id: 3, title: 'Thermal Shutdown Guide', category: 'Phase 2 > General', status: 'ready' },
];

const MOCK_SCHEDULED: ScheduledArticle[] = [
    { id: 4, title: 'S21 Hydro Setup', category: 'Phase 1 > Antminer', scheduledDate: '2026-01-22', scheduledTime: '09:00', status: 'scheduled' },
];

export default function PublishHub() {
    const [articles, setArticles] = useState<ScheduledArticle[]>([...MOCK_READY, ...MOCK_SCHEDULED]);
    const [dateInputs, setDateInputs] = useState<Record<number, { date: string, time: string }>>({});

    const readyArticles = articles.filter(a => a.status === 'ready');
    const scheduledArticles = articles.filter(a => a.status === 'scheduled');

    // --- Actions ---

    const handleUpdateInput = (id: number, field: 'date' | 'time', val: string) => {
        setDateInputs(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: val }
        }));
    };

    const handleSchedule = (id: number) => {
        const input = dateInputs[id];
        if (!input?.date || !input?.time) {
            alert('Please select both date and time.');
            return;
        }
        setArticles(prev => prev.map(a =>
            a.id === id ? { ...a, status: 'scheduled', scheduledDate: input.date, scheduledTime: input.time } : a
        ));
    };

    const handlePublishNow = (id: number) => {
        if (confirm('Publish this article immediately?')) {
            setArticles(prev => prev.map(a =>
                a.id === id ? { ...a, status: 'published' } : a
            ));
        }
    };

    const handleCancelSchedule = (id: number) => {
        setArticles(prev => prev.map(a =>
            a.id === id ? { ...a, status: 'ready', scheduledDate: undefined, scheduledTime: undefined } : a
        ));
    };

    return (
        <div className="grid md:grid-cols-2 gap-6 h-full items-start">

            {/* Left Col: Ready to Publish */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">📤 Ready to Publish ({readyArticles.length})</h3>
                </div>

                {readyArticles.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                        No articles ready. Check the Articles page.
                    </div>
                )}

                {readyArticles.map(article => (
                    <div key={article.id} className="card border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-800 mb-1">{article.title}</h4>
                        <p className="text-xs text-slate-500 mb-4">{article.category}</p>

                        <div className="bg-slate-50 p-3 rounded-md mb-3 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Date</label>
                                <input
                                    type="date"
                                    className="form-input text-xs py-1"
                                    value={dateInputs[article.id]?.date || ''}
                                    onChange={e => handleUpdateInput(article.id, 'date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Time</label>
                                <input
                                    type="time"
                                    className="form-input text-xs py-1"
                                    value={dateInputs[article.id]?.time || ''}
                                    onChange={e => handleUpdateInput(article.id, 'time', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                className="btn btn-secondary text-xs"
                                onClick={() => handleSchedule(article.id)}
                            >
                                ⏰ Schedule
                            </button>
                            <button
                                className="btn btn-primary text-xs"
                                onClick={() => handlePublishNow(article.id)}
                            >
                                🚀 Publish Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Col: Scheduled Queue */}
            <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-xl min-h-[500px]">
                <h3 className="font-bold text-slate-700 text-lg mb-2">⏳ Scheduled Queue ({scheduledArticles.length})</h3>

                {scheduledArticles.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        Queue is empty.
                    </div>
                )}

                {scheduledArticles.map(article => (
                    <div key={article.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center group">
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm">{article.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="badge badge-green text-[10px]">SCHEDULED</span>
                                <span className="text-xs text-slate-500">
                                    {article.scheduledDate} @ {article.scheduledTime}
                                </span>
                            </div>
                        </div>
                        <button
                            className="text-gray-300 hover:text-red-500 transition-colors px-2"
                            title="Cancel Schedule"
                            onClick={() => handleCancelSchedule(article.id)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
