
export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

export interface PromptData {
    topic: string;
    results?: SearchResult[];
    aiSummary?: string;
}
