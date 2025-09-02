// 共通のAPIクライアント。認証やリトライ、ロギングをここに集約できます。
export const API_BASE =
process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
status: number;
body: unknown;
constructor(message: string, status: number, body: unknown) {
  super(message);
  this.status = status;
  this.body = body;
}
}

type ApiInit = RequestInit & {
// 将来 Authorization などを自動付与する場合の拡張ポイント
auth?: boolean;
};

export async function apiFetch<T>(path: string, init?: ApiInit): Promise<T> {
const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

const res = await fetch(url, {
  ...init,
  headers: {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
    // ...(init?.auth ? { Authorization: `Bearer ${token}` } : {}),
  },
  // SSG/SSRと競合しないように、CSRでは基本 no-store を推奨
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
return body as T;
}
