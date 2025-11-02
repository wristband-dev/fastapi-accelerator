import { useState, useEffect } from 'react';
import frontendApiClient from '@/client/frontend-api-client';
import { Player } from '@/models/game';

interface TenantUser {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
}

// Cache to avoid repeated API calls
const userCache = new Map<string, TenantUser>();
let usersCachePromise: Promise<TenantUser[]> | null = null;

const fetchTenantUsers = async (): Promise<TenantUser[]> => {
  // Return existing promise if already fetching
  if (usersCachePromise) {
    return usersCachePromise;
  }

  usersCachePromise = frontendApiClient
    .get('/users')
    .then(response => {
      const users = response.data || [];
      // Populate cache
      users.forEach((user: TenantUser) => {
        userCache.set(user.id, user);
      });
      usersCachePromise = null; // Reset for future calls
      return users;
    })
    .catch(err => {
      console.error('Error fetching tenant users:', err);
      usersCachePromise = null;
      return [];
    });

  return usersCachePromise;
};

const getUserDisplayName = (user: TenantUser): string => {
  if (user.givenName && user.familyName) {
    return `${user.givenName} ${user.familyName}`;
  }
  if (user.givenName) {
    return user.givenName;
  }
  return user.email;
};

export const usePlayerName = (player: Player): string => {
  const [displayName, setDisplayName] = useState(player.name);

  useEffect(() => {
    const lookupName = async () => {
      // If no userId, use stored name (guest player)
      if (!player.userId) {
        setDisplayName(player.name);
        return;
      }

      // Check cache first
      if (userCache.has(player.userId)) {
        const user = userCache.get(player.userId)!;
        setDisplayName(getUserDisplayName(user));
        return;
      }

      // Fetch users if not in cache
      try {
        await fetchTenantUsers();
        
        // Check cache again after fetch
        if (userCache.has(player.userId)) {
          const user = userCache.get(player.userId)!;
          setDisplayName(getUserDisplayName(user));
        } else {
          // User not found (maybe deleted), fall back to stored name
          setDisplayName(player.name);
        }
      } catch (err) {
        // On error, fall back to stored name
        setDisplayName(player.name);
      }
    };

    lookupName();
  }, [player.userId, player.name]);

  return displayName;
};

export const usePlayerNames = (players: Player[]): Map<string, string> => {
  const [nameMap, setNameMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const lookupNames = async () => {
      const newMap = new Map<string, string>();

      // Separate registered and guest players
      const registeredPlayers = players.filter(p => p.userId);
      const guestPlayers = players.filter(p => !p.userId);

      // Guest players use stored names
      guestPlayers.forEach(player => {
        newMap.set(player.id, player.name);
      });

      // If no registered players, we're done
      if (registeredPlayers.length === 0) {
        setNameMap(newMap);
        return;
      }

      try {
        // Fetch all users once
        await fetchTenantUsers();

        // Look up each registered player
        registeredPlayers.forEach(player => {
          if (player.userId && userCache.has(player.userId)) {
            const user = userCache.get(player.userId)!;
            newMap.set(player.id, getUserDisplayName(user));
          } else {
            // Fall back to stored name
            newMap.set(player.id, player.name);
          }
        });
      } catch (err) {
        // On error, fall back to stored names for all
        registeredPlayers.forEach(player => {
          newMap.set(player.id, player.name);
        });
      }

      setNameMap(newMap);
    };

    lookupNames();
  }, [players]);

  return nameMap;
};

