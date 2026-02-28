import client from './client';

export interface ReservationOut {
    id: string;
    item_id: string;
    reserver_name: string;
    created_at: string;
}

export const reservationsApi = {
    reserve: (slug: string, itemId: string, data: { reserver_name: string; reserver_email?: string }) =>
        client.post<ReservationOut>(`/wishlists/${slug}/items/${itemId}/reserve/`, data),

    cancel: (slug: string, itemId: string) =>
        client.delete(`/wishlists/${slug}/items/${itemId}/reserve/`),
};
