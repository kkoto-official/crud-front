import React, { useState, useEffect } from 'react';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import { User } from '@/lib/usersApi';
import styles from './UserForm.module.css';

export interface UserFormProps {
  user?: User;
  title: string;
  onSubmit: (
    userData: Pick<User, 'email' | 'name'> & { phone?: string | null },
    imageFile: File | null,
    removeImage: boolean
  ) => Promise<void>;
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);

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
      setInitialImageUrl(user.imageUrl ?? null);
    } else if (mode === 'create') {
      // 新規作成時は空の状態で開始
      setFormData({
        email: '',
        name: '',
        phone: ''
      });
      setInitialImageUrl(null);
    }
    setImageFile(null);
    setRemoveImage(false);
  }, [user, mode]);

  useEffect(() => {
    if (imageFile) {
      const objectUrl = URL.createObjectURL(imageFile);
      setImagePreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setImagePreviewUrl(removeImage ? null : initialImageUrl);
  }, [imageFile, removeImage, initialImageUrl]);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setRemoveImage(false);
    }
  };

  const handleClearImageFile = () => {
    setImageFile(null);
  };

  const handleToggleRemoveImage = (checked: boolean) => {
    setRemoveImage(checked);
    if (checked) {
      setImageFile(null);
    }
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
        await onSubmit(userData, imageFile, removeImage);
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

      <div className={styles.imageField}>
        <label className={styles.imageLabel}>画像</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className={styles.imageInput}
        />
        <div className={styles.imagePreviewWrapper}>
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="プレビュー" className={styles.imagePreview} />
          ) : (
            <div className={styles.imagePreviewEmpty}>画像なし</div>
          )}
        </div>
        <div className={styles.imageActions}>
          {imageFile && (
            <Button
              label="選択解除"
              variant="secondary"
              size="small"
              type="button"
              onClick={handleClearImageFile}
            />
          )}
          {mode === 'edit' && initialImageUrl && !imageFile && (
            <label className={styles.removeImageLabel}>
              <input
                type="checkbox"
                checked={removeImage}
                onChange={e => handleToggleRemoveImage(e.target.checked)}
              />
              画像を削除する
            </label>
          )}
        </div>
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