import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usersApi, User } from '@/lib/usersApi';
import { ApiError } from '@/lib/apiClient';

export interface UseUserOperationsOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
  redirectTo?: string;
}

export const useUserOperations = (options: UseUserOperationsOptions = {}) => {
  const { onSuccess, onError, redirectTo = '/users' } = options;
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ユーザー作成
  const createUser = useCallback(async (userData: Pick<User, 'email' | 'name'> & { phone?: string | null }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.create(userData);
      onSuccess?.();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (e) {
      const err = e as ApiError;
      const errorMessage = err.status === 409 
        ? 'そのメールは既に使われています' 
        : err.message ?? 'エラーが発生しました';
      
      setError(errorMessage);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, redirectTo, router]);

  // ユーザー更新
  const updateUser = useCallback(async (id: string, userData: Partial<Pick<User, 'email' | 'name' | 'phone'>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.update(id, userData);
      onSuccess?.();
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (e) {
      const err = e as ApiError;
      const errorMessage = err.status === 409 
        ? 'そのメールは既に使われています' 
        : err.message ?? '更新に失敗しました';
      
      setError(errorMessage);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, redirectTo, router]);

  // ユーザー削除
  const deleteUser = useCallback(async (id: string) => {
    if (!confirm('削除しますか？')) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.remove(id);
      onSuccess?.();
    } catch (e) {
      const err = e as ApiError;
      const errorMessage = err.message ?? '削除に失敗しました';
      
      setError(errorMessage);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    clearError
  };
}; 