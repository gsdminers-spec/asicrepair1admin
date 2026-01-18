
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
    const [keyFindings, setKeyFindings] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!topic) return;
        setLoading(true);
        setKeyFindings([]);
        setAiSummary('');

        try {
            const res = await fetch('/api/scraper/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: topic }),
            });

            const data = await res.json();
            if (data.success) {
                setResults(data.results || []);

                // Mock Key Findings (would come from AI analysis in production)
                setKeyFindings([
                    'Common causes: EEPROM failure, chip damage, voltage rail issues',
                    'Voltage range: 0.31V - 0.32V × chip groups',
                    'Test equipment: PicoBT, PT3 tester recommended',
                    'Thermal paste degradation often overlooked',
                ]);

                setAiSummary(`The ${topic} issue typically stems from EEPROM corruption, damaged ASIC chips, or voltage rail failures. Diagnosis requires specialized equipment like PicoBT or PT3 testers. Common repair procedures include reflashing EEPROM, replacing failed chips, and checking voltage regulators.`);
            }
        } catch (e) {
            console.error('Search failed', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAll = () => {
        const content = `
Topic: ${topic}

Key Findings:
${keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

AI Summary:
${aiSummary}

Sources:
${results.map((r, i) => `${i + 1}. ${r.title} - ${r.url}`).join('\n')}
    `.trim();
        navigator.clipboard.writeText(content);
        alert('Research data copied to clipboard!');
    };

    const handleSearchAgain = () => {
        setResults([]);
        setKeyFindings([]);
        setAiSummary('');
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Search Input Area */}
            <div className="card">
                <label className="block text-sm font-semibold text-slate-700 mb-2">🔬 Research Topic</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Enter topic (e.g., Antminer S19 Pro Hashboard Not Detected)"
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

            {/* Results Area */}
            {results.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">

                    {/* Left Col: Key Findings + Sources */}
                    <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

                        {/* KEY FINDINGS BOX */}
                        <div className="card bg-amber-50 border-amber-200">
                            <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                                📊 Key Findings
                            </h3>
                            <ul className="space-y-2">
                                {keyFindings.map((finding, i) => (
                                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                                        <span className="text-amber-600">•</span>
                                        {finding}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* SOURCES */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                📚 Sources ({results.length} found)
                            </h3>
                            <ResearchViewer results={results} />
                        </div>
                    </div>

                    {/* Right Col: AI Summary & Actions */}
                    <div className="flex flex-col gap-4">
                        {/* AI Summary Card */}
                        <div className="card bg-indigo-50 border-indigo-100 flex-1">
                            <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                🧠 AI Summary
                            </h3>
                            <div className="text-sm text-indigo-800 leading-relaxed">
                                {aiSummary}
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="card bg-slate-800 text-white border-none">
                            <h3 className="text-sm font-bold mb-3 text-slate-200">Actions</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="btn w-full bg-slate-700 hover:bg-slate-600 text-white border-none text-sm"
                                    onClick={handleSearchAgain}
                                >
                                    🔄 Search Again
                                </button>
                                <button
                                    className="btn w-full bg-slate-700 hover:bg-slate-600 text-white border-none text-sm"
                                    onClick={handleCopyAll}
                                >
                                    📋 Copy All Research
                                </button>
                                <button
                                    className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none text-sm"
                                    onClick={() => onNavigateToPrompt?.({ topic, results, aiSummary })}
                                >
                                    ➡️ Push to Prompt Studio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {results.length === 0 && !loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400 py-20">
                        <span className="text-5xl block mb-4">🔬</span>
                        <p className="text-lg">Enter a topic above to start research</p>
                        <p className="text-sm mt-2">Data will be gathered from across the web</p>
                    </div>
                </div>
            )}
        </div>
    );
}
