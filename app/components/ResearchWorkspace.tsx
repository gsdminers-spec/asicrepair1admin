
'use client';

import { useState } from 'react';
import ResearchViewer from './ResearchViewer';
import { SearchResult } from '@/lib/types';

interface ResearchWorkspaceProps {
    initialTopic?: string;
    onNavigateToPrompt?: (data: { topic: string, results: SearchResult[], aiSummary: string }) => void;
}

export default function ResearchWorkspace({ initialTopic = '', onNavigateToPrompt }: ResearchWorkspaceProps) {
    const [topic, setTopic] = useState(initialTopic);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [aiSummary, setAiSummary] = useState('');

    const handleSearch = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch('/api/scraper/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: topic }),
            });

            const data = await res.json();
            if (data.success) {
                setResults(data.results || []);
                setAiSummary("AI Summary functionality connected to API.");
            }
        } catch (e) {
            console.error('Search failed', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Search Input Area */}
            <div className="card">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Research Topic</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Enter topic (e.g., Antminer S19 Pro Hashboard Repair)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="btn btn-primary min-w-[120px]"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? '🔍 Searching...' : '🔍 Search'}
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Left Col: Results List */}
                <div className="md:col-span-2 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">📊 Search Results ({results.length})</h3>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border-2 border-dashed rounded-lg bg-slate-50">
                            No results yet. Enter a topic above.
                        </div>
                    ) : (
                        <ResearchViewer results={results} />
                    )}
                </div>

                {/* Right Col: AI & Actions */}
                <div className="flex flex-col gap-4">
                    {/* AI Summary Card */}
                    <div className="card bg-indigo-50 border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            🧠 AI Summary
                        </h3>
                        {aiSummary ? (
                            <div className="text-sm text-indigo-800 leading-relaxed">
                                {aiSummary}
                            </div>
                        ) : (
                            <div className="text-sm text-indigo-400 italic">
                                Run search to generate summary...
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="card mt-auto bg-slate-800 text-white border-none">
                        <h3 className="text-sm font-bold mb-3 text-slate-200">Next Steps</h3>
                        <p className="text-xs text-slate-400 mb-4">
                            Push collected research data to the Prompt Studio to generate a Claude prompt.
                        </p>
                        <button
                            className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                            disabled={results.length === 0}
                            onClick={() => topic && onNavigateToPrompt?.({ topic, results, aiSummary })}
                        >
                            ➡️ Push to Prompt Studio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
