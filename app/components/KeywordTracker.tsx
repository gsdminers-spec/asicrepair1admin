'use client';
import { useState } from 'react';

interface KeywordData {
    id: number;
    keyword: string;
    volume: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    articles: number; // Count of articles targeting this
    status: 'Targeted' | 'Missing' | 'Ranking';
}

export default function KeywordTracker() {
    const [keywords, setKeywords] = useState<KeywordData[]>([
        { id: 1, keyword: 'antminer s19 pro repair india', volume: '1.2k', difficulty: 'Medium', articles: 3, status: 'Ranking' },
        { id: 2, keyword: 'whatsminer m30s overheating', volume: '800', difficulty: 'Easy', articles: 1, status: 'Targeted' },
        { id: 3, keyword: 'asic miner repair delhi', volume: '2.5k', difficulty: 'Hard', articles: 0, status: 'Missing' },
        { id: 4, keyword: 'hashboard repair cost', volume: '500', difficulty: 'Medium', articles: 2, status: 'Ranking' },
        { id: 5, keyword: 'avalon 1246 error codes', volume: '300', difficulty: 'Easy', articles: 0, status: 'Missing' },
    ]);

    const [newKw, setNewKw] = useState('');

    const addKeyword = () => {
        if (!newKw) return;
        setKeywords([...keywords, {
            id: Date.now(),
            keyword: newKw,
            volume: '-',
            difficulty: 'Medium',
            articles: 0,
            status: 'Missing'
        }]);
        setNewKw('');
    };

    return (
        <div className="card">
            <div className="page-header">
                <h2 className="card-title">🔑 Keyword Tracker</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        className="form-input"
                        placeholder="Add target keyword..."
                        value={newKw}
                        onChange={(e) => setNewKw(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={addKeyword}>+ Track</button>
                </div>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--success)' }}>2</div>
                    <div className="stat-label">Ranking Top 10</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>2</div>
                    <div className="stat-label">Missing Content</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>5</div>
                    <div className="stat-label">Total Keywords</div>
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>Keyword</th>
                        <th>Vol (Est)</th>
                        <th>Difficulty</th>
                        <th>Articles</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {keywords.map(kw => (
                        <tr key={kw.id}>
                            <td style={{ fontWeight: 'bold' }}>{kw.keyword}</td>
                            <td>{kw.volume}</td>
                            <td>
                                <span style={{
                                    color: kw.difficulty === 'Easy' ? 'var(--success)' :
                                        kw.difficulty === 'Medium' ? 'var(--warning)' : 'var(--danger)'
                                }}>
                                    {kw.difficulty}
                                </span>
                            </td>
                            <td>{kw.articles}</td>
                            <td>
                                <span className={`status-badge ${kw.status === 'Ranking' ? 'ready' :
                                        kw.status === 'Missing' ? 'draft' : 'pending'
                                    }`}>
                                    {kw.status === 'Ranking' ? '🏆 Ranking' : kw.status}
                                </span>
                            </td>
                            <td>
                                {kw.status === 'Missing' ? (
                                    <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>Generate Article</button>
                                ) : (
                                    <button className="btn btn-secondary" style={{ padding: '2px 8px', fontSize: '0.8rem' }}>View</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
