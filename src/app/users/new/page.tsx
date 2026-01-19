// app/users/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from '@/components/organisms/UserForm';
import { useUserOperations } from '@/hook';
import { usersApi } from '@/lib/usersApi';

export default function NewUserPage() {
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  // ユーザー作成操作
  const { createUser, isLoading, error, clearError } = useUserOperations({
    onSuccess: () => {
      router.push('/users');
    },
    onError: (error) => {
      if (error.status === 409) {
        setMsg('そのメールは既に使われています');
      } else {
        setMsg(error.message ?? 'エラーが発生しました');
      }
    }
  });

  const handleSubmit = async (
    userData: { email: string; name: string; phone?: string | null },
    imageFile: File | null,
    _removeImage: boolean
  ) => {
    let imageUrl: string | null = null;
    if (imageFile) {
      const res = await usersApi.uploadImage(imageFile);
      imageUrl = res.imageUrl;
    }
    await createUser({ ...userData, imageUrl });
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
        loading={isLoading}
      />
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
