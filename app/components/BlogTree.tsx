
'use client';

import { useState } from 'react';
import { DbTopic } from '@/lib/supabase';

// --- Types for Local Tree State ---
type ViewLevel = 'root' | 'mid' | 'leaf';

interface TreeNode {
    id: string;
    label: string;
    count: number;
    children?: TreeNode[];
    topics?: Partial<DbTopic>[]; // Leaf nodes have topics
}

// --- Mock Data Structure (Walkthrough Aligned) ---
const BLOG_TREE_DATA: TreeNode[] = [
    {
        id: 'p1', label: 'PHASE 1: Hashboard Not Detected', count: 80, children: [
            {
                id: 'p1-c1', label: '⚡ ANTMINER', count: 20, children: [
                    {
                        id: 'p1-c1-s1', label: '📂 S-Series', count: 9, topics: [
                            { id: 1, title: 'Antminer S21 Pro Hashboard Not Detected', status: 'pending' },
                            { id: 2, title: 'Antminer S21 Hydro "0 ASIC Chip" Error', status: 'pending' },
                            { id: 3, title: 'Antminer S19 XP Hashboard Missing', status: 'done' },
                        ]
                    },
                    { id: 'p1-c1-s2', label: '📂 T-Series', count: 2, topics: [] },
                    { id: 'p1-c1-s3', label: '📂 L-Series', count: 3, topics: [] },
                ]
            },
            { id: 'p1-c2', label: '⚡ WHATSMINER', count: 15, children: [] },
            { id: 'p1-c3', label: '⚡ AVALON', count: 5, children: [] },
        ]
    },
    { id: 'p2', label: 'PHASE 2: Repair Insights', count: 30, children: [] },
    { id: 'p3', label: 'PHASE 3: Seasonal & Environmental', count: 10, children: [] },
    { id: 'p4', label: 'PHASE 4: Repair Decisions', count: 10, children: [] },
];

export default function BlogTree({ onSelectTopic }: { onSelectTopic: (topic: string) => void }) {
    const [level, setLevel] = useState<ViewLevel>('root');
    const [breadcrumbs, setBreadcrumbs] = useState<TreeNode[]>([]);
    const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);

    const activeItems = currentNode ? currentNode.children || [] : BLOG_TREE_DATA;
    const activeTopics = currentNode?.topics || [];

    const handleDrillDown = (node: TreeNode) => {
        setBreadcrumbs([...breadcrumbs, node]);
        setCurrentNode(node);
        setLevel(node.topics ? 'leaf' : 'mid');
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            setBreadcrumbs([]);
            setCurrentNode(null);
            setLevel('root');
        } else {
            const newCrumbs = breadcrumbs.slice(0, index + 1);
            setBreadcrumbs(newCrumbs);
            setCurrentNode(newCrumbs[newCrumbs.length - 1]);
            setLevel(newCrumbs[newCrumbs.length - 1].topics ? 'leaf' : 'mid');
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header & Breadcrumbs */}
            <div className="card">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span
                        className="cursor-pointer hover:text-blue-600 font-semibold"
                        onClick={() => handleBreadcrumbClick(-1)}
                    >
                        🏠 Root
                    </span>
                    {breadcrumbs.map((node, i) => (
                        <div key={node.id} className="flex items-center gap-2">
                            <span>/</span>
                            <span
                                className={`cursor-pointer hover:text-blue-600 ${i === breadcrumbs.length - 1 ? 'font-bold text-gray-900' : ''}`}
                                onClick={() => handleBreadcrumbClick(i)}
                            >
                                {node.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid View for Phases/Categories */}
            {level !== 'leaf' && (
                <div className="grid-2 md:grid-3">
                    {activeItems.map(node => (
                        <div
                            key={node.id}
                            className="card cursor-pointer hover:border-blue-400 transition-colors group"
                            onClick={() => handleDrillDown(node)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                                    {level === 'root' ? '📁' : '⚡'}
                                </span>
                                <span className="badge badge-gray">{node.count} articles</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{node.label}</h3>
                            {node.children && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {node.children.length} Categories
                                </p>
                            )}
                        </div>
                    ))}
                    {/* Add New Placeholder */}
                    <div className="card border-dashed border-2 flex items-center justify-center cursor-pointer hover:bg-gray-50 opacity-60 hover:opacity-100">
                        <span className="text-gray-400 font-medium">+ Add New</span>
                    </div>
                </div>
            )}

            {/* Topic List View (Leaf Level) */}
            {level === 'leaf' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">📝 Topics in {currentNode?.label}</h3>
                        <button className="btn btn-primary text-sm">+ Add Topic</button>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600">#</th>
                                <th className="p-3 font-semibold text-slate-600">Topic Title</th>
                                <th className="p-3 font-semibold text-slate-600">Status</th>
                                <th className="p-3 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTopics.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No topics found.</td></tr>
                            ) : (
                                activeTopics.map((topic, idx) => (
                                    <tr key={topic.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="p-3 text-slate-500">{idx + 1}</td>
                                        <td className="p-3 font-medium text-slate-800">{topic.title}</td>
                                        <td className="p-3">
                                            <span className={`badge ${topic.status === 'done' ? 'badge-green' : 'badge-amber'}`}>
                                                {topic.status?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            {topic.status === 'pending' ? (
                                                <button
                                                    className="btn btn-secondary text-xs py-1"
                                                    onClick={() => onSelectTopic(topic.title || '')}
                                                >
                                                    📤 Send to Research
                                                </button>
                                            ) : (
                                                <button className="btn btn-secondary text-xs py-1">✅ View</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
