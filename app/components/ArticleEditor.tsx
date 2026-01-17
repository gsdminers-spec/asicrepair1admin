'use client';
import { useState } from 'react';
import SeoAnalyzer from './SeoAnalyzer';

interface ArticleEditorProps {
    onBack: () => void;
}

export default function ArticleEditor({ onBack }: ArticleEditorProps) {
    const [title, setTitle] = useState('Antminer S19 Pro Hashboard Not Detected Guide');
    const [content, setContent] = useState(`# Antminer S19 Pro Hashboard Not Detected Guide

If your Antminer S19 Pro hashboard is not detected, it can be a major issue for your mining operation. This guide will help you troubleshoot.

## Symptoms of Undetected Hashboard
The main symptom is the kernel log showing "chain 0 found 0 asic". This means...
  `);
    const [keyword, setKeyword] = useState('hashboard not detected');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', height: 'calc(100vh - 100px)' }}>
            {/* Editor Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="page-header">
                        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary">💾 Save Draft</button>
                            <button className="btn btn-primary">🚀 Publish</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Article Title</label>
                        <input
                            className="form-input"
                            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Content (Markdown)</label>
                        <textarea
                            className="form-textarea"
                            style={{ flex: 1, resize: 'none', height: '100%', fontFamily: 'monospace' }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <div className="card">
                    <h3 className="card-title">🎯 Target Keyword</h3>
                    <input
                        className="form-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter target keyword..."
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <SeoAnalyzer content={content} title={title} targetKeyword={keyword} />

                <div className="card">
                    <h3 className="card-title">🖼️ Media</h3>
                    <div style={{ height: '100px', border: '2px dashed var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', color: 'var(--text-muted)' }}>
                        Drag & Drop Images
                    </div>
                </div>
            </div>
        </div>
    );
}
