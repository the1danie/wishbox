import client from './client';

export interface UserOut {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    created_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
    user: UserOut;
}

export const authApi = {
    register: (name: string, email: string, password: string) =>
        client.post<Token>('/auth/register', { name, email, password }),

    login: (email: string, password: string) =>
        client.post<Token>('/auth/login', { email, password }),

    me: () => client.get<UserOut>('/auth/me'),
};
