import client from './client';
import { ItemOut } from './wishlists';

export const itemsApi = {
    add: (slug: string, data: {
        name: string;
        url?: string;
        price?: number;
        image_url?: string;
        description?: string;
        priority?: number;
        is_group_gift?: boolean;
        target_amount?: number;
    }) => client.post<ItemOut>(`/wishlists/${slug}/items/`, data),

    update: (slug: string, itemId: string, data: Partial<{
        name: string;
        url: string;
        price: number;
        image_url: string;
        description: string;
        priority: number;
        is_group_gift: boolean;
        target_amount: number;
    }>) => client.patch<ItemOut>(`/wishlists/${slug}/items/${itemId}`, data),

    remove: (slug: string, itemId: string) =>
        client.delete(`/wishlists/${slug}/items/${itemId}`),
};
