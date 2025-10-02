// app/users/page.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE, ApiError } from '@/lib/apiClient';
import { useCallback } from 'react';
import Button from '@/components/atoms/Button';
import UserTable from '@/components/organisms/UserTable';
import { useUsers, useUserOperations } from '@/hook';

export default function UsersPage() {
  const router = useRouter();
  
  // ユーザー一覧の取得
  const { users, error, isLoading, mutate } = useUsers({
    revalidateOnFocus: false,
    shouldRetryOnError: false
  });

  // ユーザー削除操作
  const { deleteUser, isLoading: isDeleting } = useUserOperations({
    onSuccess: () => mutate(), // 削除成功後に一覧を再取得
    onError: (error) => {
      console.error('削除エラー:', error);
    }
  });

  const onEdit = useCallback((id: string) => {
    router.push(`/users/${id}/edit`);
  }, [router]);

  const onDelete = useCallback(async (id: string) => {
    await deleteUser(id);
  }, [deleteUser]);

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
            <Button label="↻ 再読み込み" onClick={() => mutate()} variant="secondary" size="small" />
            <a href={`${API_BASE}/users`} target="_blank" rel="noreferrer">APIを直接開く</a>
          </div>
        </div>
      )}

      {isLoading && <p>読み込み中…</p>}

      {!isLoading && !error && (
        <UserTable
          users={users}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        API Base: <code>{API_BASE}</code>
      </p>
    </main>
  );
}
