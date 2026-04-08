import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import AuthLayout from "../shared/components/layout/AuthLayout";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import NotFoundPage from "../pages/NotFoundPage";
import PublicRoute from "../shared/components/guards/PublicRoute";
import ProtectedRoute from "../shared/components/guards/ProtectedRoute";
import RoleGuard from "../shared/components/guards/RoleGuard";
import PageLoader from "@/shared/components/layout/PageLoader";
import RouteErrorFallback from "@/shared/components/layout/RouteErrorFallback";

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const HujjatlarPage = lazy(() => import("../pages/hujjatlar/HujjatlarPage"));
const HujjatSinglePage = lazy(
  () => import("../pages/hujjatlar/HujjatSinglePage"),
);
const BoshqarmaPage = lazy(() => import("../pages/boshqarma/BoshqarmaPage"));
const BoshqarmaSinglePage = lazy(
  () => import("../pages/boshqarma/BoshqarmaSinglePage"),
);
const ObyektPage = lazy(() => import("../pages/obyektlar/ObyektPage"));
const ObyektDetailPage = lazy(
  () => import("../pages/obyektlar/ObyektDetailPage"),
);
const ObyektEditPage = lazy(
  () => import("../pages/obyektlar/ObyektEditPage"),
);
const BayonnomalarPage = lazy(
  () => import("../pages/bayonnomalar/BayonnomalarPage"),
);
const BayonnomaSinglePage = lazy(
  () => import("../pages/bayonnomalar/BayonnomaSinglePage"),
);
const TopshiriqlarPage = lazy(
  () => import("../pages/topshiriqlar/TopshiriqlarPage"),
);
const TopshiriqDetailPage = lazy(
  () => import("../pages/topshiriqlar/TopshiriqDetailPage"),
);
const XodimlarPage = lazy(() => import("../pages/xodimlar/XodimlarPage"));
const XodimlarSinglePage = lazy(
  () => import("../pages/xodimlar/XodimlarSinglePage"),
);
const LavozimlarPage = lazy(
  () => import("../pages/lavozimlar/LavozimlarPage"),
);
const ChatXonalarPage = lazy(
  () => import("../pages/chatXonalar/ChatXonalarPage"),
);
const ChatXonalarSinglePage = lazy(
  () => import("../pages/chatXonalar/ChatXonalarSinglePage"),
);
const JarimalarPage = lazy(() => import("../pages/jarimalar/JarimalarPage"));
const JarimalarSinglePage = lazy(
  () => import("../pages/jarimalar/JarimalarSinglePage"),
);
const TalablarPage = lazy(() => import("../pages/talablar/TalablarPage"));
const TalablarSinglePage = lazy(
  () => import("../pages/talablar/TalablarSinglePage"),
);
const UnauthorizedPage = lazy(() => import("../pages/UnauthorizedPage"));

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "auth",
    errorElement: <RouteErrorFallback />,
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "login", element: withSuspense(<LoginPage />) },
      { path: "register", element: withSuspense(<RegisterPage />) },
    ],
  },
  {
    path: "/",
    errorElement: <RouteErrorFallback />,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/boshqarma">
            {withSuspense(<DashboardPage />)}
          </RoleGuard>
        ),
      },
      { path: "profile", element: withSuspense(<ProfilePage />) },
      { path: "hujjatlar", element: withSuspense(<HujjatlarPage />) },
      { path: "hujjatlar/:id", element: withSuspense(<HujjatSinglePage />) },
      { path: "boshqarma", element: withSuspense(<BoshqarmaPage />) },
      {
        path: "boshqarma/:id",
        element: (
          <RoleGuard action="canCreate" redirectTo="/unauthorized">
            {withSuspense(<BoshqarmaSinglePage />)}
          </RoleGuard>
        ),
      },
      { path: "bayonnomalar", element: withSuspense(<BayonnomalarPage />) },
      {
        path: "bayonnomalar/:id",
        element: withSuspense(<BayonnomaSinglePage />),
      },
      { path: "topshiriqlar", element: withSuspense(<TopshiriqlarPage />) },
      {
        path: "topshiriqlar/:id",
        element: withSuspense(<TopshiriqDetailPage />),
      },
      { path: "obyekt", element: withSuspense(<ObyektPage />) },
      { path: "obyekt/:id", element: withSuspense(<ObyektDetailPage />) },
      { path: "obyekt/:id/edit", element: withSuspense(<ObyektEditPage />) },
      {
        path: "users",
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            {withSuspense(<XodimlarPage />)}
          </RoleGuard>
        ),
      },
      {
        path: "users/:id",
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            {withSuspense(<XodimlarSinglePage />)}
          </RoleGuard>
        ),
      },
      {
        path: "lavozimlar",
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            {withSuspense(<LavozimlarPage />)}
          </RoleGuard>
        ),
      },
      { path: "chats", element: withSuspense(<ChatXonalarPage />) },
      {
        path: "chats/:id",
        element: withSuspense(<ChatXonalarSinglePage />),
      },
      { path: "jarimalar", element: withSuspense(<JarimalarPage />) },
      {
        path: "jarimalar/:id",
        element: withSuspense(<JarimalarSinglePage />),
      },
      { path: "talablar", element: withSuspense(<TalablarPage />) },
      {
        path: "talablar/:id",
        element: withSuspense(<TalablarSinglePage />),
      },
      { path: "settings", element: withSuspense(<div>Settings Page</div>) },
      {
        path: "unauthorized",
        element: withSuspense(<UnauthorizedPage />),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
