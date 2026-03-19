// src/hooks/usePermissions.ts
import { PERMISSIONS } from "../../../permissions";
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? "viewer";
  const perms = PERMISSIONS[role] ?? PERMISSIONS.viewer;

  return {
    can: (action) => !!perms[action],
    role,
  };
}
