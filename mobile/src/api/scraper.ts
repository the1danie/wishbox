import client from './client';

export interface ScrapeResult {
    name?: string;
    price?: number;
    image_url?: string;
    description?: string;
}

export const scraperApi = {
    scrapeUrl: (url: string) =>
        client.post<ScrapeResult>('/scrape/', { url }),
};
