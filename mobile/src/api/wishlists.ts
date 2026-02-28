import client from './client';

export interface WishlistOut {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    cover_emoji?: string;
    slug: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    item_count: number;
}

export interface ContributionInfo {
    contributor_name: string;
    created_at: string;
}

export interface ItemOut {
    id: string;
    wishlist_id: string;
    name: string;
    url?: string;
    price?: number;
    image_url?: string;
    description?: string;
    priority: number;
    is_group_gift: boolean;
    target_amount?: number;
    is_deleted: boolean;
    created_at: string;
    is_reserved: boolean;
    total_contributed: number;
    contributors_count: number;
    contributors: ContributionInfo[];
}

export interface WishlistWithItems extends WishlistOut {
    items: ItemOut[];
    owner_name: string;
}

export const wishlistApi = {
    list: () => client.get<WishlistOut[]>('/wishlists/'),

    create: (data: { title: string; description?: string; cover_emoji?: string; is_public?: boolean }) =>
        client.post<WishlistOut>('/wishlists/', data),

    get: (slug: string) => client.get<WishlistWithItems>(`/wishlists/${slug}`),

    update: (slug: string, data: Partial<{ title: string; description: string; cover_emoji: string; is_public: boolean }>) =>
        client.patch<WishlistOut>(`/wishlists/${slug}`, data),

    delete: (slug: string) => client.delete(`/wishlists/${slug}`),
};
