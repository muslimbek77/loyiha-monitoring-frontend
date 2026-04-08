// src/shared/components/guards/RoleGuard.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { PERMISSIONS } from "@/permissions";

type Permission = keyof typeof PERMISSIONS.rais;

type RoleGuardProps = {
  action: Permission;
  children: ReactNode;
  redirectTo?: string;
};

export default function RoleGuard({
  children,
  action,
  redirectTo = "/unauthorized",
}: RoleGuardProps) {
  const { user } = useAuth();
  const role = user?.lavozim ?? "viewer";
  const perms = user?.permissions ?? PERMISSIONS[role] ?? PERMISSIONS.viewer;
  // console.log(user);

  if (!perms[action]) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
