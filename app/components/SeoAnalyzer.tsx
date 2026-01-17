'use client';
import { useState, useEffect } from 'react';

interface SeoCheck {
    id: string;
    label: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
}

interface SeoProps {
    content: string;
    title: string;
    targetKeyword: string;
}

export default function SeoAnalyzer({ content, title, targetKeyword }: SeoProps) {
    const [score, setScore] = useState(0);
    const [checks, setChecks] = useState<SeoCheck[]>([]);

    useEffect(() => {
        analyzeSeo();
    }, [content, title, targetKeyword]);

    const analyzeSeo = () => {
        let newChecks: SeoCheck[] = [];
        let calculatedScore = 100;
        const lowerContent = content.toLowerCase();
        const lowerTitle = title.toLowerCase();
        const keyword = targetKeyword.toLowerCase();

        // 1. Keyword in Title
        if (lowerTitle.includes(keyword)) {
            newChecks.push({ id: 'title-kw', label: 'Keyword in Title', status: 'pass', message: 'Great! Keyword found in title.' });
        } else {
            newChecks.push({ id: 'title-kw', label: 'Keyword in Title', status: 'fail', message: `Add "${targetKeyword}" to the title.` });
            calculatedScore -= 20;
        }

        // 2. Title Length
        if (title.length >= 40 && title.length <= 60) {
            newChecks.push({ id: 'title-len', label: 'Title Length', status: 'pass', message: 'Perfect length (40-60 chars).' });
        } else if (title.length < 40) {
            newChecks.push({ id: 'title-len', label: 'Title Length', status: 'warning', message: 'Title is too short. Aim for 40-60 chars.' });
            calculatedScore -= 5;
        } else {
            newChecks.push({ id: 'title-len', label: 'Title Length', status: 'warning', message: 'Title is too long. Google may cut it off.' });
            calculatedScore -= 5;
        }

        // 3. Keyword Density
        const wordCount = content.split(' ').length;
        const keywordCount = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
        const density = (keywordCount / wordCount) * 100;

        if (density >= 1 && density <= 3) {
            newChecks.push({ id: 'density', label: 'Keyword Density', status: 'pass', message: `Good density: ${density.toFixed(1)}%` });
        } else if (density < 1) {
            newChecks.push({ id: 'density', label: 'Keyword Density', status: 'warning', message: `Low density (${density.toFixed(1)}%). Use keyword more.` });
            calculatedScore -= 10;
        } else {
            newChecks.push({ id: 'density', label: 'Keyword Density', status: 'warning', message: `High density (${density.toFixed(1)}%). Risk of stuffing.` });
            calculatedScore -= 10;
        }

        // 4. Content Length
        if (wordCount > 1500) {
            newChecks.push({ id: 'length', label: 'Content Length', status: 'pass', message: `${wordCount} words. Comprehensive!` });
        } else if (wordCount > 1000) {
            newChecks.push({ id: 'length', label: 'Content Length', status: 'pass', message: `${wordCount} words. Good.` });
        } else {
            newChecks.push({ id: 'length', label: 'Content Length', status: 'fail', message: 'Too short (<1000 words). Expand content.' });
            calculatedScore -= 15;
        }

        // 5. Headings
        const h2Count = (content.match(/## /g) || []).length;
        if (h2Count >= 3) {
            newChecks.push({ id: 'structure', label: 'Structure (H2s)', status: 'pass', message: `Good structure with ${h2Count} subsections.` });
        } else {
            newChecks.push({ id: 'structure', label: 'Structure (H2s)', status: 'warning', message: 'Use more H2 headings (##) to break up text.' });
            calculatedScore -= 10;
        }

        setScore(Math.max(0, calculatedScore));
        setChecks(newChecks);
    };

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'var(--success)';
        if (s >= 50) return 'var(--warning)';
        return 'var(--danger)';
    };

    return (
        <div className="card" style={{ borderLeft: `4px solid ${getScoreColor(score)}` }}>
            <div className="card-header">
                <h3 className="card-title">🔍 SEO Score</h3>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: getScoreColor(score) }}>{score}/100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {checks.map(check => (
                    <div key={check.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '6px',
                        borderLeft: check.status === 'pass' ? '3px solid var(--success)' :
                            check.status === 'warning' ? '3px solid var(--warning)' :
                                '3px solid var(--danger)'
                    }}>
                        <span>{check.label}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{check.message}</span>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                <button className="btn btn-secondary" style={{ width: '100%' }}>✨ Auto-Fix Issues (AI)</button>
            </div>
        </div>
    );
}
