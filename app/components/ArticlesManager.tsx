
'use client';

import { useState, useEffect } from 'react';
import { fetchArticles, moveToPublish } from '@/lib/articleActions';
import { Article } from '@/lib/supabase';
import { Skeleton, TableRowSkeleton } from './ui/Skeleton';

export default function ArticlesManager({ onNavigateToPublish }: { onNavigateToPublish: () => void }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        const data = await fetchArticles();
        setArticles(data);
        setLoading(false);
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        alert('Article content copied to clipboard!');
    };

    const handlePublishClick = async (article: Article) => {
        const result = await moveToPublish(article.id);
        if (result.success) {
            alert(`${article.title} moved to Publish Hub!`);
            loadArticles(); // Refresh to update status
            onNavigateToPublish();
        } else {
            alert(result.error || 'Failed to move to publish');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="card p-0 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-600">Loading Articles...</div>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">

            {viewingArticle ? (
                // DETAIL VIEW
                <div className="flex flex-col h-full">
                    <button
                        className="btn btn-secondary self-start mb-4 no-print"
                        onClick={() => setViewingArticle(null)}
                    >
                        ← Back to List
                    </button>

                    <div className="card h-full flex flex-col p-6">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">{viewingArticle.title}</h2>
                                <span className="text-sm text-slate-500">
                                    {viewingArticle.category || 'Uncategorized'} • {formatDate(viewingArticle.created_at)}
                                </span>
                            </div>
                            <div className="flex gap-2 no-print">
                                <button className="btn btn-secondary" onClick={handlePrint}>🖨️ PDF</button>
                                <button className="btn btn-secondary" onClick={() => handleCopy(viewingArticle.content)}>📋 Copy</button>
                                {viewingArticle.status !== 'scheduled' && viewingArticle.status !== 'published' && (
                                    <button className="btn btn-primary" onClick={() => handlePublishClick(viewingArticle)}>🚀 Move to Publish</button>
                                )}
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
                    {articles.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No articles yet. Save articles from Claude Output to see them here.
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">#</th>
                                    <th className="p-4 font-semibold text-slate-600">Title</th>
                                    <th className="p-4 font-semibold text-slate-600">Category</th>
                                    <th className="p-4 font-semibold text-slate-600">Status</th>
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
                                            <span className="badge badge-blue">{article.category || 'Uncategorized'}</span>
                                        </td>
                                        <td className="p-4">
                                            {article.status === 'published' && <span className="badge badge-green">Published</span>}
                                            {article.status === 'scheduled' && <span className="badge badge-blue">Scheduled</span>}
                                            {article.status === 'ready' && <span className="badge badge-gray">Ready</span>}
                                            {article.status === 'draft' && <span className="badge badge-gray">Draft</span>}
                                        </td>
                                        <td className="p-4 text-slate-500">{formatDate(article.created_at)}</td>
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
                                            {article.status !== 'scheduled' && article.status !== 'published' && (
                                                <button
                                                    className="text-green-600 hover:text-green-800 font-medium ml-2"
                                                    onClick={() => handlePublishClick(article)}
                                                    title="Move to Publish Hub"
                                                >
                                                    🚀 Publish
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
