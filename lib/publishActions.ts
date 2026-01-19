import { supabase } from './supabase';
import { PublishItem, Article } from './supabase';
import { marked } from 'marked';

// Fetch publish queue with article details
export async function fetchPublishQueue(): Promise<(PublishItem & { articles: Article })[]> {
    const { data, error } = await supabase
        .from('publish_queue')
        .select(`
            *,
            articles (*)
        `)
        .order('scheduled_date', { ascending: true });

    if (error) {
        console.error('Error fetching publish queue:', error);
        return [];
    }
    return (data || []) as (PublishItem & { articles: Article })[];
}

// Update schedule for a publish queue item
export async function updateSchedule(id: string, date: string, time: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('publish_queue')
        .update({
            scheduled_date: date,
            scheduled_time: time,
            status: 'scheduled'
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating schedule:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Publish immediately
export async function publishNow(queueId: string, articleId: string): Promise<{ success: boolean; error?: string }> {
    // Update publish_queue status
    const { error: queueError } = await supabase
        .from('publish_queue')
        .update({ status: 'published' })
        .eq('id', queueId);

    if (queueError) {
        console.error('Error updating queue:', queueError);
        return { success: false, error: queueError.message };
    }

    // Update article status
    const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .update({
            status: 'published',
            publish_date: new Date().toISOString()
        })
        .eq('id', articleId)
        .select('*')
        .single();

    if (articleError || !articleData) {
        console.error('Error updating article:', articleError);
        return { success: false, error: articleError?.message || 'Article not found' };
    }

    // --- SYNC TO PUBLIC BLOG ---
    try {

        // Generate Slug (simple slugify)
        const slug = articleData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        // Convert Markdown to HTML
        const contentHtml = marked.parse(articleData.content || '');

        const { error: syncError } = await supabase
            .from('blog_articles')
            .upsert({
                title: articleData.title,
                slug: slug,
                content: articleData.content,
                content_html: contentHtml,
                category: articleData.category || 'Uncategorized',
                is_published: true,
                published_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (syncError) {
            console.error('Error syncing to public blog:', syncError);
            return { success: false, error: 'Published locally but failed to sync to public site: ' + syncError.message };
        }

    } catch (err) {
        console.error('Error in sync process:', err);
        return { success: false, error: 'Published locally but sync failed.' };
    }

    if (articleError) {
        console.error('Error updating article:', articleError);
        // Queue was updated but article failed - partial success
    }

    return { success: true };
}

// Cancel scheduling
export async function cancelSchedule(queueId: string, articleId: string): Promise<{ success: boolean; error?: string }> {
    // Delete from queue
    const { error: queueError } = await supabase
        .from('publish_queue')
        .delete()
        .eq('id', queueId);

    if (queueError) {
        console.error('Error deleting from queue:', queueError);
        return { success: false, error: queueError.message };
    }

    // Update article status back to ready
    await supabase.from('articles').update({ status: 'ready' }).eq('id', articleId);

    return { success: true };
}
