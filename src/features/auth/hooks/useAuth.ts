// src/features/auth/hooks/useAuth.js
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateUser,
  } = useAuthStore();

  // Use ref to track if we've already fetched
  const hasFetchedRef = useRef(false);

  // Auto-fetch user on mount if token exists
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");

    // Only fetch if we have a token, no user, and haven't fetched yet
    if (storedToken && !user && !hasFetchedRef.current && !isLoading) {
      hasFetchedRef.current = true;
      fetchUser();
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchUser,
    updateUser,
  };
};