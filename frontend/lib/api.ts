const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = "Something went wrong";
    try {
      const err = await res.json();
      detail = err.detail || JSON.stringify(err);
    } catch {}
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Wishlist {
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

export interface Item {
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

export interface WishlistWithItems extends Wishlist {
  items: Item[];
  owner_name: string;
}

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ access_token: string; token_type: string; user: User }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) },
      false
    ),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
      false
    ),

  me: () => request<User>("/auth/me"),
};

// Wishlists API
export const wishlistApi = {
  list: () => request<Wishlist[]>("/wishlists/"),

  create: (data: {
    title: string;
    description?: string;
    cover_emoji?: string;
    is_public?: boolean;
  }) => request<Wishlist>("/wishlists/", { method: "POST", body: JSON.stringify(data) }),

  get: (slug: string) => request<WishlistWithItems>(`/wishlists/${slug}`, {}, false),

  update: (
    slug: string,
    data: { title?: string; description?: string; cover_emoji?: string; is_public?: boolean }
  ) =>
    request<Wishlist>(`/wishlists/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (slug: string) =>
    request<void>(`/wishlists/${slug}`, { method: "DELETE" }),
};

// Items API
export const itemApi = {
  add: (
    slug: string,
    data: {
      name: string;
      url?: string;
      price?: number;
      image_url?: string;
      description?: string;
      priority?: number;
      is_group_gift?: boolean;
      target_amount?: number;
    }
  ) =>
    request<Item>(`/wishlists/${slug}/items/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    slug: string,
    itemId: string,
    data: Partial<{
      name: string;
      url: string;
      price: number;
      image_url: string;
      description: string;
      priority: number;
      is_group_gift: boolean;
      target_amount: number;
    }>
  ) =>
    request<Item>(`/wishlists/${slug}/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (slug: string, itemId: string) =>
    request<void>(`/wishlists/${slug}/items/${itemId}`, { method: "DELETE" }),
};

// Reservations API
export const reservationApi = {
  reserve: (slug: string, itemId: string, data: { reserver_name: string; reserver_email?: string }) =>
    request<{ id: string; item_id: string; reserver_name: string; created_at: string }>(
      `/wishlists/${slug}/items/${itemId}/reserve/`,
      { method: "POST", body: JSON.stringify(data) },
      false
    ),

  cancel: (slug: string, itemId: string) =>
    request<void>(`/wishlists/${slug}/items/${itemId}/reserve/`, { method: "DELETE" }, false),
};

// Contributions API
export const contributionApi = {
  contribute: (
    slug: string,
    itemId: string,
    data: { contributor_name: string; contributor_email?: string; amount: number }
  ) =>
    request<{ id: string; item_id: string; contributor_name: string; amount: number; created_at: string }>(
      `/wishlists/${slug}/items/${itemId}/contribute/`,
      { method: "POST", body: JSON.stringify(data) },
      false
    ),
};

// Scraper API
export const scraperApi = {
  scrape: (url: string) =>
    request<{ name?: string; price?: number; image_url?: string; description?: string }>(
      "/scrape/",
      { method: "POST", body: JSON.stringify({ url }) },
      false
    ),
};
