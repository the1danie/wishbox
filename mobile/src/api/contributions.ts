import client from './client';

export interface ContributionOut {
    id: string;
    item_id: string;
    contributor_name: string;
    amount: number;
    created_at: string;
}

export const contributionsApi = {
    contribute: (slug: string, itemId: string, data: { contributor_name: string; contributor_email?: string; amount: number }) =>
        client.post<ContributionOut>(`/wishlists/${slug}/items/${itemId}/contribute/`, data),
};
