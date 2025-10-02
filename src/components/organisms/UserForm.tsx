import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import { User } from '@/lib/usersApi';
import styles from './UserForm.module.css';

export interface UserFormProps {
  user?: User;
  title: string;
  onSubmit: (userData: Pick<User, 'email' | 'name'> & { phone?: string | null }) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  title,
  onSubmit,
  onCancel,
  mode,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 安全な文字列変換関数
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return '';
  };

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        email: safeString(user.email),
        name: safeString(user.name),
        phone: safeString(user.phone || '')
      });
    } else if (mode === 'create') {
      // 新規作成時は空の状態で開始
      setFormData({
        email: '',
        name: '',
        phone: ''
      });
    }
  }, [user, mode]);

  const validate = () => {
    const newErr: Record<string, string> = {};

    if (!formData.email) {
      newErr.email = '必須';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErr.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.name) {
      newErr.name = '必須';
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const userData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone || null
      };

      try {
        await onSubmit(userData);
      } catch (error) {
        // エラーは親コンポーネントで処理
        console.error('Form submission error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2>{title}</h2>

      <div className={styles.grid}>
        <FormField
          fieldName="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={v => handleChange('email', v)}
          required
          error={errors.email}
        />
        <FormField
          fieldName="name"
          label="Name"
          value={formData.name}
          onChange={v => handleChange('name', v)}
          required
          error={errors.name}
        />
        <FormField
          fieldName="phone"
          label="Phone"
          value={formData.phone}
          onChange={v => handleChange('phone', v)}
          error={errors.phone}
        />
      </div>

      <div className={styles.actions}>
        <Button
          label="保存"
          variant="primary"
          size="large"
          type="submit"
          disabled={loading}
        />
        <Button
          label="キャンセル"
          variant="secondary"
          size="large"
          type="button"
          onClick={onCancel}
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default UserForm;