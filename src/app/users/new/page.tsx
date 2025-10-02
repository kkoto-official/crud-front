'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi } from '@/lib/usersApi';
import { ApiError } from '@/lib/apiClient';
import UserForm from '@/components/organisms/UserForm';

export default function NewUserPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (userData: { email: string; name: string; phone?: string | null }) => {
    setLoading(true);
    setMsg(null);
    try {
      await usersApi.create(userData);
      router.push('/users');
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setMsg('そのメールは既に使われています');
      else setMsg(err.message ?? 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto' }}>
      <UserForm
        title="新規ユーザー作成"
        mode="create"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
