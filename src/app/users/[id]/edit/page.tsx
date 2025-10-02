'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usersApi, User } from '@/lib/usersApi';
import { ApiError } from '@/lib/apiClient';
import UserForm from '@/components/organisms/UserForm';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try { 
        setUser(await usersApi.get(id)); 
      }
      catch (e: any) { 
        setMsg(e.message || '取得に失敗しました'); 
      }
    })();
  }, [id]);

  const handleSubmit = async (userData: { email: string; name: string; phone?: string | null }) => {
    setLoading(true);
    setMsg(null);
    try {
      await usersApi.update(id, userData);
      router.push('/users');
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setMsg('そのメールは既に使われています');
      else setMsg(err.message ?? '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  if (!user) return <main style={{ maxWidth: 640, margin: '2rem auto' }}><p>読み込み中…</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto' }}>
      <UserForm
        title="ユーザー編集"
        user={user}
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
