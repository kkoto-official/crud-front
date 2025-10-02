import useSWR from 'swr';
import { usersApi, UsersListResponse, User, ListUsersParams } from '@/lib/usersApi';

export interface UseUsersOptions {
  params?: ListUsersParams;
  revalidateOnFocus?: boolean;
  shouldRetryOnError?: boolean;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  const {
    params = {},
    revalidateOnFocus = false,
    shouldRetryOnError = false
  } = options;

  const { data, error, isLoading, mutate } = useSWR<UsersListResponse>(
    ['users.list', params],
    () => usersApi.list(params),
    { 
      revalidateOnFocus, 
      shouldRetryOnError 
    }
  );

  const toArray = (d?: UsersListResponse): User[] =>
    Array.isArray(d) ? d : d?.items ?? [];

  const users: User[] = toArray(data);

  return {
    users,
    data,
    error,
    isLoading,
    mutate,
    isEmpty: users.length === 0
  };
}; 