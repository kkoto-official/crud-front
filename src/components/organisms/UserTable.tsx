import React from 'react';
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

  return (
    <table className={styles.table} border={1} cellPadding={8} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
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
            <td colSpan={5} style={{ textAlign: 'center', padding: 20 }}>
              ユーザーはまだありません
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UserTable;