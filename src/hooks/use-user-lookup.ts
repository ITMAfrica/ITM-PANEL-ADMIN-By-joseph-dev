'use client';

import { useCallback, useMemo } from 'react';
import { useUsers } from './use-users';

export function useUserLookup(tenantId: string) {
  const { data: users = [] } = useUsers(tenantId);

  const lookup = useMemo(() => {
    const map = new Map<string, { name: string; initials: string }>();
    for (const u of users) {
      map.set(u.id, {
        name: u.name,
        initials: u.name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      });
    }
    return map;
  }, [users]);

  const getUserName = useCallback(
    (id: string) => lookup.get(id)?.name ?? 'Inconnu',
    [lookup]
  );

  const getUserInitials = useCallback(
    (id: string) => lookup.get(id)?.initials ?? '??',
    [lookup]
  );

  return { users, getUserName, getUserInitials };
}
