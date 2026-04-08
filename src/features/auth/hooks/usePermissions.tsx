// src/hooks/usePermissions.ts
import { PERMISSIONS } from "../../../permissions";
import { useAuth } from "./useAuth";

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.lavozim ?? "viewer";
  const perms =
    user?.permissions ??
    PERMISSIONS[role] ??
    PERMISSIONS.xodim ??
    PERMISSIONS.viewer;

  return {
    can: (action) => !!perms[action],
    role,
  };
}
