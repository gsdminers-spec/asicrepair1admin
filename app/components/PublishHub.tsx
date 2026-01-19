
'use client';

import { useState, useEffect } from 'react';
import { fetchPublishQueue, updateSchedule, publishNow, cancelSchedule } from '@/lib/publishActions';
import { PublishItem, Article } from '@/lib/supabase';

type QueueItem = PublishItem & { articles: Article };

export default function PublishHub() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateInputs, setDateInputs] = useState<Record<string, { date: string, time: string }>>({});

    useEffect(() => {
        loadQueue();
    }, []);

    const loadQueue = async () => {
        setLoading(true);
        const data = await fetchPublishQueue();
        setQueue(data);
        // Pre-fill existing dates
        const inputs: Record<string, { date: string, time: string }> = {};
        data.forEach(item => {
            inputs[item.id] = {
                date: item.scheduled_date || '',
                time: item.scheduled_time || ''
            };
        });
        setDateInputs(inputs);
        setLoading(false);
    };

    const scheduledItems = queue.filter(q => q.status === 'scheduled');
    const pendingItems = queue.filter(q => q.status !== 'scheduled' && q.status !== 'published');

    const handleUpdateInput = (id: string, field: 'date' | 'time', val: string) => {
        setDateInputs(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: val }
        }));
    };

    const handleSchedule = async (id: string) => {
        const input = dateInputs[id];
        if (!input?.date || !input?.time) {
            alert('Please select both date and time.');
            return;
        }
        const result = await updateSchedule(id, input.date, input.time);
        if (result.success) {
            loadQueue();
        } else {
            alert(result.error || 'Failed to schedule');
        }
    };

    const handlePublishNow = async (item: QueueItem) => {
        if (confirm('Publish this article immediately?')) {
            const result = await publishNow(item.id, item.article_id);
            if (result.success) {
                alert('Article published successfully!');
                loadQueue();
            } else {
                alert(result.error || 'Failed to publish');
            }
        }
    };

    const handleCancelSchedule = async (item: QueueItem) => {
        const result = await cancelSchedule(item.id, item.article_id);
        if (result.success) {
            loadQueue();
        } else {
            alert(result.error || 'Failed to cancel');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">⏳ Loading publish queue...</div>;
    }

    return (
        <div className="grid md:grid-cols-2 gap-6 h-full items-start">

            {/* Left Col: Ready to Publish */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">📤 Ready to Schedule ({pendingItems.length})</h3>
                </div>

                {pendingItems.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                        No articles ready. Move articles from the Articles page.
                    </div>
                )}

                {pendingItems.map(item => (
                    <div key={item.id} className="card border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-800 mb-1">{item.articles?.title || 'Untitled'}</h4>
                        <p className="text-xs text-slate-500 mb-4">{item.articles?.category || 'Uncategorized'}</p>

                        <div className="bg-slate-50 p-3 rounded-md mb-3 grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Date</label>
                                <input
                                    type="date"
                                    className="form-input text-xs py-1"
                                    value={dateInputs[item.id]?.date || ''}
                                    onChange={e => handleUpdateInput(item.id, 'date', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 block mb-1">Time</label>
                                <input
                                    type="time"
                                    className="form-input text-xs py-1"
                                    value={dateInputs[item.id]?.time || ''}
                                    onChange={e => handleUpdateInput(item.id, 'time', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                className="btn btn-secondary text-xs"
                                onClick={() => handleSchedule(item.id)}
                            >
                                ⏰ Schedule
                            </button>
                            <button
                                className="btn btn-primary text-xs"
                                onClick={() => handlePublishNow(item)}
                            >
                                🚀 Publish Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Col: Scheduled Queue */}
            <div className="flex flex-col gap-4 bg-slate-100 p-4 rounded-xl min-h-[500px]">
                <h3 className="font-bold text-slate-700 text-lg mb-2">⏳ Scheduled Queue ({scheduledItems.length})</h3>

                {scheduledItems.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        Queue is empty.
                    </div>
                )}

                {scheduledItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center group">
                        <div>
                            <h4 className="font-semibold text-slate-800 text-sm">{item.articles?.title || 'Untitled'}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="badge badge-green text-[10px]">SCHEDULED</span>
                                <span className="text-xs text-slate-500">
                                    {item.scheduled_date} @ {item.scheduled_time}
                                </span>
                            </div>
                        </div>
                        <button
                            className="text-gray-300 hover:text-red-500 transition-colors px-2"
                            title="Cancel Schedule"
                            onClick={() => handleCancelSchedule(item)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
}
