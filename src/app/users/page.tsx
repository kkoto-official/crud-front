// app/users/page.tsx
'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { usersApi, UsersListResponse, User } from '@/lib/usersApi';
import { API_BASE, ApiError } from '@/lib/apiClient';
import { useCallback } from 'react';

export default function UsersPage() {
  const { data, error, isLoading, mutate } = useSWR<UsersListResponse>(
    ['users.list', {}],
    () => usersApi.list(),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const toArray = (d?: UsersListResponse) =>
    Array.isArray(d) ? d : d?.items ?? [];

  const items: User[] = toArray(data);

  const onDelete = useCallback(async (id: string) => {
    if (!confirm('削除しますか？')) return;
    await usersApi.remove(id);
    mutate();
  }, [mutate]);

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto' }}>
      <h1>ユーザー一覧</h1>
      <div style={{ marginBottom: 12 }}>
        <Link href="/users/new">➕ 新規作成</Link>
      </div>

      {/* --- エラー詳細の表示強化 --- */}
      {error && (
        <div style={{ border: '1px solid #f3b', padding: 12, marginBottom: 16, background: '#fff0f6' }}>
          <p style={{ color: '#a1034e', margin: 0, fontWeight: 700 }}>
            エラー: {(error as any)?.message ?? String(error)}
          </p>
          {error instanceof ApiError && (
            <div style={{ marginTop: 8, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              <div>status: {error.status}</div>
              <div>body: {typeof error.body === 'string' ? error.body : JSON.stringify(error.body, null, 2)}</div>
            </div>
          )}
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button onClick={() => mutate()}>&#x21bb; 再読み込み</button>
            <a href={`${API_BASE}/users`} target="_blank" rel="noreferrer">APIを直接開く</a>
          </div>
        </div>
      )}

      {isLoading && <p>読み込み中…</p>}

      {!isLoading && !error && (
        <table border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th>ID</th><th>Email</th><th>Name</th><th>Phone</th><th>操作</th></tr>
          </thead>
          <tbody>
            {items.map(u => (
              <tr key={u.id}>
                <td style={{ fontFamily: 'monospace' }}>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.phone ?? ''}</td>
                <td>
                  <Link href={`/users/${u.id}/edit`}>編集</Link>{' '}
                  <button onClick={() => onDelete(u.id)}>削除</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>ユーザーはまだありません</td></tr>
            )}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        API Base: <code>{API_BASE}</code>
      </p>
    </main>
  );
}
