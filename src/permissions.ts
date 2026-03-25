// src/config/permissions.js

export const ROLES = {
  //   SUPERADMIN: "superadmin",
  MANAGER: "manager",
  BOSHQARMA: "boshqarma",
  VIEWER: "viewer",
  XODIM: "xodim",
  rais: "rais",
};

export const PERMISSIONS = {
  rais: {
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
    canManageUsers: true,
  },
  rais_orinbosari: {
    canCreate: false,
    canCreateTopshiriq: false,
    canCreateBayonnoma: false,
    canRead: true,
    canUpdate: true,
    canDelete: false,
    canManageUsers: true,
    canSeeUsers: false,
  },
  pto: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
  },
  boshqarma: {
    canCreate: true,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
  },
  viewer: {
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canManageUsers: false,
  },
};
