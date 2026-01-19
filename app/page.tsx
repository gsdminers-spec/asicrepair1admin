
'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, supabase } from '@/lib/supabase';
import { PromptData } from '@/lib/types';
import { Skeleton } from './components/ui/Skeleton';

// Components
import BlogTree from './components/BlogTree';
import ResearchWorkspace from './components/ResearchWorkspace';
import PromptStudio from './components/PromptStudio';
import ClaudeOutput from './components/ClaudeOutput';
import PublishHub from './components/PublishHub';
import KeywordTracker from './components/KeywordTracker';
import ArticlesManager from './components/ArticlesManager';

// --- Types ---
type Page = 'dashboard' | 'tree' | 'research' | 'generate' | 'claude' | 'articles' | 'publish' | 'keywords';

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    created_at: string;
    target: string;
}

export default function Home() {
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Data Passing State (Research -> Prompt)
    const [promptData, setPromptData] = useState<PromptData | null>(null);

    // Dashboard Stats
    const [stats, setStats] = useState({
        articlesCreated: 0,
        pendingTopics: 0,
        readyToPublish: 0,
        published: 0
    });

    // Activity Logs
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    // Fetch stats & logs on mount
    useEffect(() => {
        getDashboardStats().then(setStats);
        fetchActivityLogs();
    }, []);

    const fetchActivityLogs = async () => {
        setLoadingLogs(true);
        const { data } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setActivityLogs(data);
        setLoadingLogs(false);
    };

    // --- Handlers ---
    // Handle Logout
    const handleLogout = async () => {
        if (confirm('Are you sure you want to logout?')) {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
        }
    };

    const navigateTo = (page: Page) => {
        setActivePage(page);
        setMobileMenuOpen(false);
    };

    const handlePushToPrompt = (data: PromptData) => {
        setPromptData(data);
        setActivePage('generate');
    };

    const menuItems = [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'tree', icon: '🌳', label: 'Blog Tree' },
        { id: 'research', icon: '🔬', label: 'Research' },
        { id: 'generate', icon: '✨', label: 'Generate Prompt' },
        { id: 'claude', icon: '📋', label: 'Claude Output' },
        { id: 'articles', icon: '📝', label: 'Articles' },
        { id: 'publish', icon: '🚀', label: 'Publish Hub' },
        { id: 'keywords', icon: '🔑', label: 'Keywords' },
    ];

    return (
        <div className="app-container">
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 right-4 z-50">
                <button
                    className="bg-slate-800 text-white p-2 rounded shadow-lg"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="brand-section">
                    <span>⚡ ASIC ADMIN</span>
                </div>
                <nav className="nav-menu">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => navigateTo(item.id as Page)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-700">
                    <button
                        className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 p-2 rounded transition-colors"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>

                <div className="p-4 border-t border-slate-700">
                    <div className="text-xs text-slate-400 mb-2">System Status</div>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Online v2.2 (Secured)
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">

                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">
                        {menuItems.find(m => m.id === activePage)?.label}
                    </h1>
                </div>

                {/* Content Render */}

                {activePage === 'dashboard' && (
                    <div className="flex flex-col gap-6">
                        {/* Stats Grid */}
                        <div className="grid-2 md:grid-4">
                            <div className="card border-l-4 border-l-blue-500">
                                <div className="text-sm text-slate-500">Articles Created</div>
                                <div className="text-3xl font-bold mt-1">{stats.articlesCreated}</div>
                            </div>
                            <div className="card border-l-4 border-l-amber-500">
                                <div className="text-sm text-slate-500">Pending Topics</div>
                                <div className="text-3xl font-bold mt-1">{stats.pendingTopics}</div>
                            </div>
                            <div className="card border-l-4 border-l-purple-500">
                                <div className="text-sm text-slate-500">Ready to Publish</div>
                                <div className="text-3xl font-bold mt-1">{stats.readyToPublish}</div>
                            </div>
                            <div className="card border-l-4 border-l-green-500">
                                <div className="text-sm text-slate-500">Published Live</div>
                                <div className="text-3xl font-bold mt-1">{stats.published}</div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="card">
                                <h3 className="card-title mb-4">Quick Navigation</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="btn btn-secondary text-left" onClick={() => navigateTo('research')}>
                                        🔬 Start Research
                                    </button>
                                    <button className="btn btn-secondary text-left" onClick={() => navigateTo('publish')}>
                                        🚀 Scheduled Posts
                                    </button>
                                    <button className="btn btn-secondary text-left" onClick={() => navigateTo('keywords')}>
                                        🔑 Review Keywords
                                    </button>
                                    <button className="btn btn-secondary text-left" onClick={() => navigateTo('claude')}>
                                        📋 Paste Article
                                    </button>
                                </div>
                            </div>
                            <div className="card bg-slate-50 border-dashed">
                                <h3 className="card-title text-slate-400 mb-4">System Activity</h3>
                                <div className="space-y-3">
                                    {loadingLogs ? (
                                        <>
                                            <Skeleton className="h-5 w-full" />
                                            <Skeleton className="h-5 w-3/4" />
                                            <Skeleton className="h-5 w-5/6" />
                                        </>
                                    ) : activityLogs.length === 0 ? (
                                        <div className="text-sm text-slate-400">No activity recorded yet.</div>
                                    ) : (
                                        activityLogs.map(log => (
                                            <div key={log.id} className="text-sm text-slate-500 flex gap-2 overflow-hidden">
                                                <span className="text-slate-400 shrink-0">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="truncate">{log.details}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activePage === 'tree' && (
                    <BlogTree onSelectTopic={(t) => {
                        setPromptData({ topic: t }); // Pre-fill topic
                        navigateTo('research');
                    }} />
                )}

                {activePage === 'research' && (
                    <ResearchWorkspace
                        initialTopic={promptData?.topic}
                        onNavigateToPrompt={handlePushToPrompt}
                    />
                )}

                {activePage === 'generate' && (
                    <PromptStudio initialData={promptData} />
                )}

                {activePage === 'claude' && <ClaudeOutput />}

                {activePage === 'articles' && (
                    <ArticlesManager onNavigateToPublish={() => navigateTo('publish')} />
                )}

                {activePage === 'publish' && <PublishHub />}

                {activePage === 'keywords' && <KeywordTracker />}

            </main>
        </div>
    );
}
