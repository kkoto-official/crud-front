import { apiFetch, API_BASE, ApiError } from './apiClient';

// サーバが返す構造に合わせて型を定義（必要に応じて拡張）
export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  imageUrl?: string | null;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

// 将来ページング/検索に拡張しやすい引数
export type ListUsersParams = {
  q?: string;
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'name' | 'email';
  order?: 'ASC' | 'DESC';
};

// バックエンドが { items,total,page,limit } で返す場合に備えた型（今は配列なら配列でOK）
export type UsersListResponse =
  | User[] // いまの実装（配列）
  | { items: User[]; total: number; page: number; limit: number }; // 拡張版にも対応

export const usersApi = {
  // 一覧
  async list(params?: ListUsersParams): Promise<UsersListResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.order) query.set('order', params.order);
    const qs = query.toString();
    return apiFetch<UsersListResponse>(`/users${qs ? `?${qs}` : ''}`);
  },

  // 取得
  get(id: string) {
    return apiFetch<User>(`/users/${id}`);
  },

  // 作成
  create(input: Pick<User, 'email' | 'name'> & { phone?: string | null; imageUrl?: string | null }) {
    return apiFetch<User>(`/users`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  // 更新（部分更新）
  update(id: string, input: Partial<Pick<User, 'email' | 'name' | 'phone' | 'imageUrl'>>) {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  // 画像アップロード
  async uploadImage(file: File, userId?: string): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    if (userId) formData.append('userId', userId);

    const res = await fetch(`${API_BASE}/users/upload-image`, {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    });

    let body: unknown = null;
    const text = await res.text();
    if (text) {
      try { body = JSON.parse(text); } catch { body = text; }
    }

    if (!res.ok) {
      throw new ApiError(
        typeof body === 'string' ? body : `HTTP ${res.status}`,
        res.status,
        body
      );
    }

    return body as { imageUrl: string };
  },

  // 削除
  remove(id: string) {
    return apiFetch<{ deleted: true; id: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
