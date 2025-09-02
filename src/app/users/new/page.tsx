'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usersApi } from '@/lib/usersApi';
import { ApiError } from '@/lib/apiClient';

export default function NewUserPage() {
  const [email, setEmail] = useState('');
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg]     = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await usersApi.create({ email, name, phone: phone || null });
      router.push('/users');
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 409) setMsg('そのメールは既に使われています');
      else setMsg(err.message ?? 'エラーが発生しました');
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: '2rem auto' }}>
      <h1>ユーザー作成</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <label>Email <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Name  <input required value={name} onChange={e=>setName(e.target.value)} /></label>
        <label>Phone <input value={phone} onChange={e=>setPhone(e.target.value)} /></label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">作成</button>
          <Link href="/users">キャンセル</Link>
        </div>
      </form>
      {msg && <p style={{ color: 'crimson', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
