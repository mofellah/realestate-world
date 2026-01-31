/**
 * useAuth Hook
 * Manage authentication state (current user, loading)
 */

import { useState, useEffect } from "react";
import type { UserWithRoles } from "@boilerplate/types";
import { tokenStorage } from "@/utils/token-storage";
import { decodeJWT } from "@/utils/jwt-decode";

interface UseAuthReturn {
  user: UserWithRoles | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize user from stored token
    const token = tokenStorage.getAccessToken();
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        // Create a UserWithRoles object from JWT payload
        const user: UserWithRoles = {
          id: decoded.sub,
          email: decoded.email,
          name: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          roles: [],
          permissions: [],
        };
        setUser(user);
      }
    }
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
