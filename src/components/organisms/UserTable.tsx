import React, { useEffect, useState } from 'react';
import { User } from '@/lib/usersApi';
import Button from '@/components/atoms/Button';
import styles from './UserTable.module.css';

export interface UserTableProps {
  users: User[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
  // 安全な文字列変換関数
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return '';
  };

  const MAX_IMAGE_RETRIES = 10;
  const IMAGE_RETRY_DELAY_MS = 1200;

  // 画像読み込みエラーを管理する状態
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [imageSrcs, setImageSrcs] = useState<Record<string, string>>({});
  const [retryCounts, setRetryCounts] = useState<Record<string, number>>({});

  // 画像読み込みエラーを処理
  const handleImageError = (userId: string, baseUrl: string) => {
    setRetryCounts(prev => {
      const current = prev[userId] ?? 0;
      const next = current + 1;

      if (next <= MAX_IMAGE_RETRIES) {
        setTimeout(() => {
          const cacheBustedUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
          setImageSrcs(prevSrcs => ({ ...prevSrcs, [userId]: cacheBustedUrl }));
        }, IMAGE_RETRY_DELAY_MS);
        return { ...prev, [userId]: next };
      }

      console.warn('Image load failed after retries:', baseUrl);
      setImageErrors(prevErrors => new Set(prevErrors).add(userId));
      return { ...prev, [userId]: next };
    });
  };

  useEffect(() => {
    const nextSrcs: Record<string, string> = {};
    for (const user of users) {
      if (user.imageUrl) {
        nextSrcs[user.id] = safeString(user.imageUrl);
      }
    }
    setImageSrcs(nextSrcs);
    setRetryCounts({});
    setImageErrors(new Set());
  }, [users]);

  return (
    <table className={styles.table} border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th>画像</th>
          <th>ID</th>
          <th>Email</th>
          <th>Name</th>
          <th>Phone</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td className={styles.imageCell}>
              {user.imageUrl && !imageErrors.has(user.id) ? (
                <img
                  src={imageSrcs[user.id] ?? safeString(user.imageUrl)}
                  alt={`${safeString(user.name)}の画像`}
                  className={styles.imageThumb}
                  onError={(e) => {
                    const baseUrl = safeString(user.imageUrl);
                    // S3反映遅延の可能性があるため、即時ログは出さない
                    handleImageError(user.id, baseUrl);
                  }}
                  onLoad={() => {
                    setImageErrors(prev => {
                      if (!prev.has(user.id)) return prev;
                      const next = new Set(prev);
                      next.delete(user.id);
                      return next;
                    });
                    setRetryCounts(prev => {
                      if (prev[user.id] === undefined) return prev;
                      const next = { ...prev };
                      delete next[user.id];
                      return next;
                    });
                  }}
                  loading="lazy"
                />
              ) : (
                <span className={styles.imagePlaceholder}>—</span>
              )}
            </td>
            <td style={{ fontFamily: 'monospace' }}>{safeString(user.id)}</td>
            <td>{safeString(user.email)}</td>
            <td>{safeString(user.name)}</td>
            <td>{safeString(user.phone || '')}</td>
            <td>
              <Button label="編集" onClick={() => onEdit(user.id)} variant="primary" size="small" />
              {/* &nbsp; */}
              <Button label="削除" onClick={() => onDelete(user.id)} variant="danger" size="small" />
            </td>
          </tr>
        ))}
        {users.length === 0 && (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>
              ユーザーはまだありません
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UserTable;