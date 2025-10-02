// app/users/[id]/edit/page.tsx
'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserForm from '@/components/organisms/UserForm';
import { useUser, useUserForm, useUserOperations } from '@/hook';

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  // ユーザー情報の取得
  const { user, error: userError, isLoading: userLoading } = useUser(id as string);

  // フォーム状態管理
  const { formData, errors, handleChange, validate, getSubmitData } = useUserForm({
    initialUser: user,
    mode: 'edit'
  });

  // ユーザー更新操作
  const { updateUser, isLoading, error, clearError } = useUserOperations({
    onSuccess: () => {
      router.push('/users');
    },
    onError: (error) => {
      if (error.status === 409) {
        setMsg('そのメールは既に使われています');
      } else {
        setMsg(error.message ?? '更新に失敗しました');
      }
    }
  });

  const handleSubmit = async (userData: { email: string; name: string; phone?: string | null }) => {
    if (validate()) {
      await updateUser(id as string, userData);
    }
  };

  const handleCancel = () => {
    router.push('/users');
  };

  if (userLoading) return <main style={{ maxWidth: 640, margin: '2rem auto' }}><p>読み込み中…</p></main>;
  if (userError) return <main style={{ maxWidth: 640, margin: '2rem auto' }}><p>ユーザーの取得に失敗しました</p></main>;
  if (!user) return <main style={{ maxWidth: 640, margin: '2rem auto' }}><p>ユーザーが見つかりません</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto' }}>
      <UserForm
        user={user}
        title="ユーザー編集"
        mode="edit"
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isLoading}
      />
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
