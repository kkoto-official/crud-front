'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usersApi, User } from '@/lib/usersApi';
import { ApiError } from '@/lib/apiClient';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [msg, setMsg]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setUser(await usersApi.get(id)); }
      catch (e: any) { setMsg(e.message || '取得に失敗しました'); }
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMsg(null);
    try {
      await usersApi.update(id, {
        email: user.email,
        name: user.name,
        phone: user.phone ?? null,
      });
      router.push('/users');
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setMsg('そのメールは既に使われています');
      else setMsg(err.message ?? '更新に失敗しました');
    }
  };

  if (!user) return <main style={{ maxWidth: 640, margin: '2rem auto' }}><p>読み込み中…</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto' }}>
      <h1>ユーザー編集</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>Email <input required type="email" value={user.email} onChange={e=>setUser({ ...user, email: e.target.value })} /></label>
        <label>Name  <input required value={user.name} onChange={e=>setUser({ ...user, name: e.target.value })} /></label>
        <label>Phone <input value={user.phone ?? ''} onChange={e=>setUser({ ...user, phone: e.target.value })} /></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">更新</button>
          <Link href="/users">戻る</Link>
        </div>
      </form>
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
