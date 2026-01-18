
'use client';

import { useState } from 'react';
import { BLOG_TREE_DATA, Phase, Category, Subcategory, Topic, getPhaseStats } from '@/lib/blogTreeData';

interface BlogTreeProps {
    onSelectTopic?: (topic: string) => void;
}

type View = 'phases' | 'categories' | 'subcategories' | 'topics';

export default function BlogTree({ onSelectTopic }: BlogTreeProps) {
    const [view, setView] = useState<View>('phases');
    const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

    // CRUD Modal State
    const [showMenu, setShowMenu] = useState(false);
    const [modalAction, setModalAction] = useState<'add' | 'rename' | 'delete' | null>(null);
    const [modalInput, setModalInput] = useState('');

    // --- Navigation ---
    const goToPhases = () => {
        setView('phases');
        setSelectedPhase(null);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
    };

    const goToCategories = (phase: Phase) => {
        setSelectedPhase(phase);
        setView('categories');
    };

    const goToSubcategories = (category: Category) => {
        setSelectedCategory(category);
        setView('subcategories');
    };

    const goToTopics = (subcategory: Subcategory) => {
        setSelectedSubcategory(subcategory);
        setView('topics');
    };

    // --- Breadcrumb ---
    const renderBreadcrumb = () => (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <button className="hover:text-indigo-600" onClick={goToPhases}>🌳 Blog Tree</button>
            {selectedPhase && (
                <>
                    <span>/</span>
                    <button className="hover:text-indigo-600" onClick={() => { setView('categories'); setSelectedCategory(null); setSelectedSubcategory(null); }}>
                        {selectedPhase.name}
                    </button>
                </>
            )}
            {selectedCategory && (
                <>
                    <span>/</span>
                    <button className="hover:text-indigo-600" onClick={() => { setView('subcategories'); setSelectedSubcategory(null); }}>
                        {selectedCategory.name}
                    </button>
                </>
            )}
            {selectedSubcategory && (
                <>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">{selectedSubcategory.name}</span>
                </>
            )}
        </div>
    );

    // --- CRUD Actions (Placeholder) ---
    const handleCrudAction = (action: 'add' | 'rename' | 'delete', target: string) => {
        setModalAction(action);
        setModalInput('');
        alert(`[Demo] ${action.toUpperCase()} ${target} — This would open a modal in production.`);
        setShowMenu(false);
    };

    // --- Hamburger Menu ---
    const renderHamburgerMenu = (level: string) => (
        <div className="relative">
            <button
                className="p-2 hover:bg-slate-100 rounded text-slate-500"
                onClick={() => setShowMenu(!showMenu)}
            >
                ☰
            </button>
            {showMenu && (
                <div className="absolute right-0 top-10 bg-white border shadow-lg rounded-lg z-50 w-48">
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm" onClick={() => handleCrudAction('add', level)}>
                        ➕ Add {level}
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm" onClick={() => handleCrudAction('rename', level)}>
                        ✏️ Rename {level}
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600" onClick={() => handleCrudAction('delete', level)}>
                        🗑️ Delete {level}
                    </button>
                </div>
            )}
        </div>
    );

    // --- PHASES VIEW ---
    if (view === 'phases') {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📁 Content Roadmap (4 Phases)</h2>
                    {renderHamburgerMenu('Phase')}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {BLOG_TREE_DATA.map(phase => {
                        const stats = getPhaseStats(phase);
                        return (
                            <div
                                key={phase.id}
                                className="card hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-indigo-500"
                                onClick={() => goToCategories(phase)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">📁 {phase.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{phase.description}</p>
                                    </div>
                                    <span className="text-2xl">→</span>
                                </div>
                                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                    <span className="bg-slate-100 px-2 py-1 rounded">{stats.articles} Articles</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{stats.categories} Categories</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- CATEGORIES VIEW ---
    if (view === 'categories' && selectedPhase) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📁 {selectedPhase.name}: {selectedPhase.description}</h2>
                    {renderHamburgerMenu('Category')}
                </div>

                <div className="flex flex-col gap-4">
                    {selectedPhase.categories.map(cat => {
                        const articleCount = cat.subcategories.reduce((sum, sub) => sum + sub.topics.length, 0);
                        return (
                            <div
                                key={cat.id}
                                className="card hover:shadow-md cursor-pointer transition-all flex justify-between items-center"
                                onClick={() => goToSubcategories(cat)}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⚡</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{cat.name}</h4>
                                        <span className="text-xs text-slate-500">{articleCount} articles • {cat.subcategories.length} sub-categories</span>
                                    </div>
                                </div>
                                <span className="text-slate-400">→</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- SUBCATEGORIES VIEW ---
    if (view === 'subcategories' && selectedCategory) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">⚡ {selectedCategory.name}</h2>
                    {renderHamburgerMenu('Sub-category')}
                </div>

                <div className="flex flex-col gap-3">
                    {selectedCategory.subcategories.map(sub => (
                        <div
                            key={sub.id}
                            className="card hover:shadow-md cursor-pointer transition-all flex justify-between items-center py-3"
                            onClick={() => goToTopics(sub)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📂</span>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{sub.name}</h4>
                                    <span className="text-xs text-slate-500">{sub.topics.length} articles</span>
                                </div>
                            </div>
                            <span className="text-slate-400">→</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- TOPICS VIEW ---
    if (view === 'topics' && selectedSubcategory) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📂 {selectedSubcategory.name}</h2>
                    {renderHamburgerMenu('Topic')}
                </div>

                <div className="card p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 w-10">#</th>
                                <th className="p-3 font-semibold text-slate-600">Topic Title</th>
                                <th className="p-3 font-semibold text-slate-600 w-24">Status</th>
                                <th className="p-3 font-semibold text-slate-600 text-right w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {selectedSubcategory.topics.map((topic, idx) => (
                                <tr key={topic.id} className="hover:bg-slate-50">
                                    <td className="p-3 text-slate-400">{idx + 1}</td>
                                    <td className="p-3 font-medium text-slate-800">{topic.title}</td>
                                    <td className="p-3">
                                        {topic.status === 'done' && <span className="badge badge-green">Done</span>}
                                        {topic.status === 'pending' && <span className="badge badge-gray">Pending</span>}
                                        {topic.status === 'in-progress' && <span className="badge badge-blue">In Progress</span>}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        {topic.status === 'done' ? (
                                            <button className="text-green-600 text-xs font-medium">✅ View Article</button>
                                        ) : (
                                            <button
                                                className="btn btn-primary text-xs py-1 px-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectTopic?.(topic.title);
                                                }}
                                            >
                                                📤 Send to Research
                                            </button>
                                        )}
                                        <button
                                            className="text-slate-400 hover:text-slate-600 text-xs"
                                            onClick={(e) => { e.stopPropagation(); handleCrudAction('rename', 'Topic'); }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="text-red-400 hover:text-red-600 text-xs"
                                            onClick={(e) => { e.stopPropagation(); handleCrudAction('delete', 'Topic'); }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return null;
}
