import useSWR from 'swr';
import { usersApi, User } from '@/lib/usersApi';

export interface UseUserOptions {
  revalidateOnFocus?: boolean;
  shouldRetryOnError?: boolean;
}

export const useUser = (id: string, options: UseUserOptions = {}) => {
  const {
    revalidateOnFocus = false,
    shouldRetryOnError = false
  } = options;

  const { data, error, isLoading, mutate } = useSWR<User>(
    id ? ['users.get', id] : null,
    () => usersApi.get(id),
    { 
      revalidateOnFocus, 
      shouldRetryOnError 
    }
  );

  return {
    user: data,
    error,
    isLoading,
    mutate,
    notFound: error?.status === 404
  };
}; 