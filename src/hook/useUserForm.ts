import { useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/usersApi';

export interface UserFormData {
  email: string;
  name: string;
  phone: string;
}

export interface UseUserFormOptions {
  initialUser?: User;
  mode: 'create' | 'edit';
}

export const useUserForm = (options: UseUserFormOptions) => {
  const { initialUser, mode } = options;

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 安全な文字列変換関数
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return '';
  };

  // 初期値の設定
  useEffect(() => {
    if (initialUser && mode === 'edit') {
      setFormData({
        email: safeString(initialUser.email),
        name: safeString(initialUser.name),
        phone: safeString(initialUser.phone || '')
      });
    } else if (mode === 'create') {
      setFormData({
        email: '',
        name: '',
        phone: ''
      });
    }
  }, [initialUser, mode]);

  // バリデーション
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = '必須';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    if (!formData.name) {
      newErrors.name = '必須';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // フィールド変更ハンドラー
  const handleChange = useCallback((field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  // フォームリセット
  const reset = useCallback(() => {
    setFormData({
      email: '',
      name: '',
      phone: ''
    });
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // 送信データの準備
  const getSubmitData = useCallback(() => {
    return {
      email: formData.email,
      name: formData.name,
      phone: formData.phone || null
    };
  }, [formData]);

  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    validate,
    handleChange,
    reset,
    getSubmitData,
    isValid: Object.keys(errors).length === 0 && formData.email && formData.name
  };
}; 