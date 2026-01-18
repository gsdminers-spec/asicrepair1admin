
import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are missing. Database features will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// --- Type Definitions ---

export interface DbArticle {
  id: number;
  title: string;
  topic_id?: number;
  content: string;
  brand: string;
  model: string;
  status: 'ready' | 'draft' | 'pending' | 'published';
  words: number;
  created_at: string;
  published_at?: string;
  category?: string; // For display convenience
}

export interface DbTopic {
  id: number;
  title: string;
  phase: string;
  category: string;
  subcategory?: string;
  status: 'pending' | 'researched' | 'generated' | 'done';
}

export interface DbKeyword {
  id: number;
  phrase: string;
  model: string;
  category: string;
  volume: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

/**
 * Fetches dashboard statistics from Supabase.
 * Returns zeros if connection fails or tables are empty.
 */
export async function getDashboardStats() {
  try {
    const [articlesRes, topicsRes, publishedRes] = await Promise.all([
      supabase.from('articles').select('id', { count: 'exact', head: true }),
      supabase.from('topics').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]);

    return {
      articlesCreated: articlesRes.count || 0,
      pendingTopics: topicsRes.count || 0,
      readyToPublish: (articlesRes.count || 0) - (publishedRes.count || 0),
      published: publishedRes.count || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      articlesCreated: 0,
      pendingTopics: 0,
      readyToPublish: 0,
      published: 0,
    };
  }
}
