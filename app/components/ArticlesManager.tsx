
'use client';

import { useState } from 'react';

interface Article {
    id: number;
    title: string;
    category: string;
    date: string;
    content: string; // Mock content storage
}

// Mock Data matching Walkthrough
const MOCK_ARTICLES: Article[] = [
    {
        id: 1,
        title: 'S19 Pro Hashboard Not Detected',
        category: 'Phase 1',
        date: '01/18/2026',
        content: '# S19 Pro Hashboard Not Detected\n\nSymptoms: Kernel log shows 0 ASIC chips...'
    },
    {
        id: 2,
        title: 'M50S Hashboard Error',
        category: 'Phase 1',
        date: '01/17/2026',
        content: '# WhatsMiner M50S Hashboard Error\n\nError 202 specifically relates to...'
    },
    {
        id: 3,
        title: 'Thermal Shutdown Guide',
        category: 'Phase 2',
        date: '01/16/2026',
        content: '# Thermal Shutdown Guide\n\nEnsure intake temps are below 35C...'
    },
];

export default function ArticlesManager({ onNavigateToPublish }: { onNavigateToPublish: () => void }) {
    const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        alert('Article content copied to clipboard!');
    };

    const handlePublishClick = (article: Article) => {
        // In real app, this would pass data to PublishHub context/state
        // For now, we simulate navigation + alert
        alert(`Ready to schedule: ${article.title}`);
        onNavigateToPublish();
    };

    return (
        <div className="flex flex-col h-full gap-6">

            {/* Header / Actions? */}

            {viewingArticle ? (
                // DETAIL VIEW
                <div className="flex flex-col h-full">
                    <button
                        className="btn btn-secondary self-start mb-4"
                        onClick={() => setViewingArticle(null)}
                    >
                        ← Back to List
                    </button>

                    <div className="card h-full flex flex-col p-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{viewingArticle.title}</h2>
                                <span className="text-sm text-slate-500">{viewingArticle.category} • {viewingArticle.date}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary" onClick={() => handleCopy(viewingArticle.content)}>📋 Copy</button>
                                <button className="btn btn-primary" onClick={() => handlePublishClick(viewingArticle)}>🚀 Publish</button>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-50 rounded">
                            <pre className="whitespace-pre-wrap font-mono text-sm">{viewingArticle.content}</pre>
                        </div>
                    </div>
                </div>
            ) : (
                // TABLE VIEW
                <div className="card p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">#</th>
                                <th className="p-4 font-semibold text-slate-600">Title</th>
                                <th className="p-4 font-semibold text-slate-600">Category</th>
                                <th className="p-4 font-semibold text-slate-600">Date</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {articles.map((article, index) => (
                                <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 text-slate-400">{index + 1}</td>
                                    <td className="p-4 font-medium text-slate-800">{article.title}</td>
                                    <td className="p-4 text-slate-500">
                                        <span className="badge badge-blue">{article.category}</span>
                                    </td>
                                    <td className="p-4 text-slate-500">{article.date}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                            onClick={() => setViewingArticle(article)}
                                            title="View Preview"
                                        >
                                            👁️ View
                                        </button>
                                        <button
                                            className="text-slate-400 hover:text-slate-600"
                                            onClick={() => handleCopy(article.content)}
                                            title="Copy markdown"
                                        >
                                            📋
                                        </button>
                                        <button
                                            className="text-green-600 hover:text-green-800 font-medium ml-2"
                                            onClick={() => handlePublishClick(article)}
                                            title="Move to Publish Hub"
                                        >
                                            🚀 Publish
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
