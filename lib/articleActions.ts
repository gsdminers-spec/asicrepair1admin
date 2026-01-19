import { supabase } from './supabase';
import { Topic, Article } from './supabase';

// Fetch pending topics for the Claude Output dropdown
export async function fetchPendingTopics(): Promise<Topic[]> {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .in('status', ['pending', 'in-progress'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pending topics:', error);
        return [];
    }
    return data || [];
}

// Save article from Claude Output and update topic status
export async function saveArticle(topicId: string, title: string, content: string, category?: string): Promise<{ success: boolean; articleId?: string; error?: string }> {
    // 1. Insert article
    const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .insert({
            topic_id: topicId,
            title,
            content,
            category,
            status: 'ready'
        })
        .select()
        .single();

    if (articleError) {
        console.error('Error saving article:', articleError);
        return { success: false, error: articleError.message };
    }

    // 2. Update topic status to 'done'
    const { error: topicError } = await supabase
        .from('topics')
        .update({ status: 'done' })
        .eq('id', topicId);

    if (topicError) {
        console.error('Error updating topic status:', topicError);
        // Article was saved, but topic status failed - partial success
    }

    // Log user activity
    await import('./logger').then(l => l.logActivity('CREATE', 'Article', `Created article: ${title}`));

    return { success: true, articleId: articleData.id };
}

// Fetch all articles
export async function fetchArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data || [];
}

// Move article to publish queue
export async function moveToPublish(articleId: string): Promise<{ success: boolean; error?: string }> {
    // Check if already in queue
    const { data: existing } = await supabase
        .from('publish_queue')
        .select('id')
        .eq('article_id', articleId)
        .single();

    if (existing) {
        return { success: false, error: 'Article already in publish queue' };
    }

    // Set default scheduled date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { error } = await supabase
        .from('publish_queue')
        .insert({
            article_id: articleId,
            scheduled_date: tomorrow.toISOString().split('T')[0],
            scheduled_time: '09:00:00',
            status: 'scheduled'
        });

    if (error) {
        console.error('Error moving to publish:', error);
        return { success: false, error: error.message };
    }

    // Update article status
    await supabase.from('articles').update({ status: 'scheduled' }).eq('id', articleId);

    // Log activity
    await import('./logger').then(l => l.logActivity('UPDATE', 'Article', `Moved article to publish queue: ${articleId}`));

    return { success: true };
}
