
'use client';

import { useState } from 'react';

interface Keyword {
    id: number;
    phrase: string;
    volume: 'high' | 'medium' | 'low';
    model: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
}

const MOCK_KEYWORDS: Keyword[] = [
    { id: 1, phrase: 's19 pro hashboard repair', volume: 'high', model: 'S19 Pro', category: 'Hashboard', status: 'approved' },
    { id: 2, phrase: 'whatsminer m30s error 202', volume: 'medium', model: 'M30S', category: 'PSU', status: 'pending' },
    { id: 3, phrase: 'avalon miner not starting', volume: 'low', model: 'Avalon', category: 'General', status: 'rejected' },
    { id: 4, phrase: 'antminer l7 temp sensor', volume: 'medium', model: 'L7', category: 'Sensor', status: 'pending' },
];

export default function KeywordTracker() {
    const [keywords, setKeywords] = useState<Keyword[]>(MOCK_KEYWORDS);
    const [newKeyword, setNewKeyword] = useState('');

    const handleAdd = () => {
        if (!newKeyword) return;
        const newItem: Keyword = {
            id: Date.now(),
            phrase: newKeyword,
            volume: 'medium', // Default
            model: 'General',
            category: 'Unsorted',
            status: 'pending'
        };
        setKeywords([newItem, ...keywords]);
        setNewKeyword('');
    };

    const updateStatus = (id: number, status: Keyword['status']) => {
        setKeywords(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    };

    return (
        <div className="flex flex-col gap-6">

            {/* Add Bar */}
            <div className="card">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-slate-700 block mb-1">Add New Keyword</label>
                        <input
                            className="form-input"
                            placeholder="Type keyword phrase..."
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        />
                    </div>
                    <button className="btn btn-primary mb-[1px]" onClick={handleAdd}>+ Add</button>
                </div>
            </div>

            {/* List */}
            <div className="card p-0 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Keyword Phrase</th>
                            <th className="p-4 font-semibold text-slate-600">Model/Cat</th>
                            <th className="p-4 font-semibold text-slate-600">Volume</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {keywords.map(k => (
                            <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{k.phrase}</td>
                                <td className="p-4 text-slate-500">
                                    <div className="flex flex-col text-xs">
                                        <span>{k.model}</span>
                                        <span className="text-slate-400">{k.category}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`badge ${k.volume === 'high' ? 'badge-green' :
                                            k.volume === 'medium' ? 'badge-blue' : 'badge-gray'
                                        }`}>
                                        {k.volume.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {k.status === 'approved' && <span className="text-green-600 font-bold text-xs">✅ APPROVED</span>}
                                    {k.status === 'rejected' && <span className="text-red-500 font-bold text-xs">❌ REJECTED</span>}
                                    {k.status === 'pending' && <span className="text-amber-500 font-bold text-xs">⏳ PENDING</span>}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {k.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-secondary text-xs px-2 py-1 text-green-700 hover:bg-green-50 border-green-200"
                                                onClick={() => updateStatus(k.id, 'approved')}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-secondary text-xs px-2 py-1 text-red-700 hover:bg-red-50 border-red-200"
                                                onClick={() => updateStatus(k.id, 'rejected')}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {k.status !== 'pending' && (
                                        <button
                                            className="text-xs text-slate-400 underline hover:text-blue-500"
                                            onClick={() => updateStatus(k.id, 'pending')}
                                        >
                                            Reset
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
