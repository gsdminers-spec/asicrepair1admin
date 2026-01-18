
'use client';

import { useState } from 'react';

// --- Types ---
interface Keyword {
    id: number;
    phrase: string;
    volume: 'high' | 'medium' | 'low';
    model: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    // Extended Details
    repairIntent?: boolean;
    adminNotes?: string;
    rawVolumeHint?: string;
}

const MOCK_KEYWORDS: Keyword[] = [
    {
        id: 1,
        phrase: 's19 pro hashboard repair',
        volume: 'high',
        model: 'Antminer S19 Pro',
        category: 'Hashboard',
        status: 'approved',
        repairIntent: true,
        rawVolumeHint: 'High (API: 1.2k/mo)',
        adminNotes: 'Priority - common issue in India'
    },
    {
        id: 2,
        phrase: 'whatsminer m30s error 202',
        volume: 'medium',
        model: 'M30S',
        category: 'PSU',
        status: 'pending',
        repairIntent: true,
        rawVolumeHint: 'Medium (API: 450/mo)',
        adminNotes: ''
    },
    {
        id: 3,
        phrase: 'avalon miner not starting',
        volume: 'low',
        model: 'Avalon',
        category: 'General',
        status: 'rejected',
        repairIntent: false,
        rawVolumeHint: 'Low (API: 50/mo)',
        adminNotes: 'Too generic'
    },
];

export default function KeywordTracker() {
    const [keywords, setKeywords] = useState<Keyword[]>(MOCK_KEYWORDS);
    const [newKeyword, setNewKeyword] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleAdd = () => {
        if (!newKeyword) return;
        const newItem: Keyword = {
            id: Date.now(),
            phrase: newKeyword,
            volume: 'medium',
            model: 'General',
            category: 'Unsorted',
            status: 'pending',
            repairIntent: false,
            adminNotes: ''
        };
        setKeywords([newItem, ...keywords]);
        setNewKeyword('');
    };

    const updateStatus = (id: number, status: Keyword['status']) => {
        setKeywords(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    };

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
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
                            <th className="p-4 font-semibold text-slate-600 w-10"></th>
                            <th className="p-4 font-semibold text-slate-600">Keyword Phrase</th>
                            <th className="p-4 font-semibold text-slate-600">Model/Cat</th>
                            <th className="p-4 font-semibold text-slate-600">Volume</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {keywords.map(k => (
                            <>
                                <tr
                                    key={k.id}
                                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedId === k.id ? 'bg-slate-50' : ''}`}
                                    onClick={() => toggleExpand(k.id)}
                                >
                                    <td className="p-4 text-slate-400 text-center">
                                        {expandedId === k.id ? '▼' : '▶'}
                                    </td>
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
                                </tr>

                                {/* EXPANDED DETAILS */}
                                {expandedId === k.id && (
                                    <tr className="bg-slate-50">
                                        <td colSpan={5} className="p-4 pl-12 border-b border-slate-100 shadow-inner">
                                            <div className="grid md:grid-cols-2 gap-6 text-sm">
                                                <div>
                                                    <div className="mb-2"><strong className="text-slate-600">Keyword:</strong> {k.phrase}</div>
                                                    <div className="mb-2"><strong className="text-slate-600">ASIC Model:</strong> {k.model}</div>
                                                    <div className="mb-2"><strong className="text-slate-600">Failure Category:</strong> {k.category}</div>
                                                </div>
                                                <div>
                                                    <div className="mb-2">
                                                        <strong className="text-slate-600">Repair Intent:</strong>{' '}
                                                        {k.repairIntent ? '✅ Hardware failure implied' : '❌ Informational only'}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong className="text-slate-600">Search Volume:</strong> {k.rawVolumeHint || 'N/A'}
                                                    </div>
                                                    <div className="mb-4">
                                                        <strong className="text-slate-600 block mb-1">Admin Notes:</strong>
                                                        <div className="bg-white p-2 border rounded text-slate-600 italic">
                                                            &quot;{k.adminNotes || 'No notes'}&quot;
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                                                        <button
                                                            className="btn bg-white border border-slate-300 hover:bg-slate-50 text-slate-600"
                                                            onClick={() => updateStatus(k.id, 'rejected')}
                                                        >
                                                            ❌ Reject
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => updateStatus(k.id, 'approved')}
                                                        >
                                                            ✅ Approve
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
