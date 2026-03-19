// src/shared/components/guards/Can.tsx
import type { ReactNode } from "react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { PERMISSIONS } from "@/permissions";

type Permission = keyof typeof PERMISSIONS.rais;

type CanProps = {
  action: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

export default function Can({ action, children, fallback = null }: CanProps) {
  const { can } = usePermissions();
  return can(action) ? <>{children}</> : <>{fallback}</>;
}
