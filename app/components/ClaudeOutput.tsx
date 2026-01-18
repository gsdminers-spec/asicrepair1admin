
'use client';

import { useState } from 'react';

// Common Topics Mock Data (would typically fetch 'pending' topics from Supabase)
const MOCK_TOPICS = [
    { id: 1, title: 'Antminer S19 Pro Hashboard Not Detected' },
    { id: 2, title: 'Antminer S21 Hydro "0 ASIC Chip" Error' },
    { id: 3, title: 'WhatsMiner M50S Hashboard Error' },
];

export default function ClaudeOutput() {
    const [selectedTopic, setSelectedTopic] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    const handleSave = async () => {
        if (!selectedTopic || !content) return;
        setStatus('saving');

        // Simulate API save
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log('Saved Article:', { topic: selectedTopic, content });
        setStatus('saved');

        // Reset after delay
        setTimeout(() => {
            setStatus('idle');
            setContent('');
            setSelectedTopic('');
        }, 2000);
    };

    return (
        <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">

            {/* Introduction Card */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Workflow Step: Paste & Save</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                        After generating the article in Claude, copy the Markdown content and paste it here.
                        This will process the article and add it to the database.
                    </p>
                </div>
            </div>

            {/* Step 1: Select Topic */}
            <div className="card">
                <h3 className="card-title mb-4">1. Select Topic Title</h3>
                <select
                    className="form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                >
                    <option value="">-- Choose a Topic --</option>
                    {MOCK_TOPICS.map(t => (
                        <option key={t.id} value={t.title}>{t.title}</option>
                    ))}
                </select>
            </div>

            {/* Step 2: Paste Content */}
            <div className="card flex-1 flex flex-col min-h-[400px]">
                <h3 className="card-title mb-4">2. Paste Final Article (Markdown)</h3>
                <textarea
                    className="form-textarea flex-1 font-mono text-sm leading-relaxed"
                    placeholder="# Article Title\n\nContent goes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* Step 3: Action */}
            <div className="card sticky bottom-4 shadow-xl border-t-2 border-indigo-500">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {content.length > 0 ? `${content.split(' ').length} words detected` : 'Waiting for content...'}
                    </div>
                    <button
                        className={`btn ${status === 'saved' ? 'badge-green text-green-800' : 'btn-primary'} min-w-[200px]`}
                        onClick={handleSave}
                        disabled={!selectedTopic || !content || status === 'saving'}
                    >
                        {status === 'saving' ? '💾 Saving...' : status === 'saved' ? '✅ Saved Successfully!' : '✅ Add to Articles'}
                    </button>
                </div>
            </div>
        </div>
    );
}
