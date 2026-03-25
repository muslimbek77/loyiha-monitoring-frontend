// src/app/router.jsx
import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";

// Layouts
import AuthLayout from "../shared/components/layout/AuthLayout";
import DashboardLayout from "../shared/components/layout/DashboardLayout";

// Guards
import ProtectedRoute from "../shared/components/guards/ProtectedRoute";
import PublicRoute from "../shared/components/guards/PublicRoute";
import NotFoundPage from "../pages/NotFoundPage";
import HujjatlarPage from "@/pages/hujjatlar/HujjatlarPage";
import HujjatSinglePage from "@/pages/hujjatlar/HujjatSinglePage";
import BoshqarmaPage from "@/pages/boshqarma/BoshqarmaPage";
import ObyektPage from "@/pages/obyektlar/ObyektPage";
import ObyektSinglePage from "@/pages/obyektlar/ObyektSinglePage";
import BayonnomalarPage from "@/pages/bayonnomalar/BayonnomalarPage";
import TopshiriqlarPage from "@/pages/topshiriqlar/TopshiriqlarPage";
import BayonnomaSinglePage from "@/pages/bayonnomalar/BayonnomaSinglePage";
import XodimlarPage from "@/pages/xodimlar/XodimlarPage";
import XodimlarSinglePage from "@/pages/xodimlar/XodimlarSinglePage";
import BoshqarmaSinglePage from "@/pages/boshqarma/BoshqarmaSinglePage";
import ChatXonalarPage from "@/pages/chatXonalar/ChatXonalarPage";
import ChatXonalarSinglePage from "@/pages/chatXonalar/ChatXonalarSinglePage";
import TopshiriqDetailPage from "@/pages/topshiriqlar/TopshiriqDetailPage";
import JarimalarPage from "@/pages/jarimalar/JarimalarPage";
import JarimalarSinglePage from "@/pages/jarimalar/JarimalarSinglePage";
import Talablar from "@/pages/talablar/TalablarPage";
import TalablarSinglePage from "@/pages/talablar/TalablarSinglePage";
import KategoriyalarPage from "@/pages/kategoriyalar/KategoriyalarPage";
import RoleGuard from "@/shared/components/guards/RoleGuard";
import UnauthorizedPage from "@/pages/UnauthorizedPage";

// Lazy load pages
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="loading-spinner">Loading...</div>
  </div>
);

export const router = createBrowserRouter([
  // Public routes (auth)
  {
    path: "auth",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: "login",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={<PageLoader />}>
            <RegisterPage />
          </Suspense>
        ),
      },
    ],
  },

  // Protected routes with DashboardLayout (sidebar, header, footer)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </RoleGuard>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: "hujjatlar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HujjatlarPage />
          </Suspense>
        ),
      },
      {
        path: "hujjatlar/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HujjatSinglePage />
          </Suspense>
        ),
      },
      {
        path: "boshqarma",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BoshqarmaPage />
          </Suspense>
        ),
      },
      {
        path: "boshqarma/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BoshqarmaSinglePage />
          </Suspense>
        ),
      },
      {
        path: "bayonnomalar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BayonnomalarPage />
          </Suspense>
        ),
      },
      {
        path: "bayonnomalar/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BayonnomaSinglePage />
          </Suspense>
        ),
      },
      {
        path: "topshiriqlar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TopshiriqlarPage />
          </Suspense>
        ),
      },
      {
        path: "topshiriqlar/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TopshiriqDetailPage />
          </Suspense>
        ),
      },

      {
        path: "obyekt",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ObyektPage />
          </Suspense>
        ),
      },
      {
        path: "obyekt/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ObyektSinglePage />
          </Suspense>
        ),
      },

      {
        path: "users",
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            <Suspense fallback={<PageLoader />}>
              <XodimlarPage />
            </Suspense>
          </RoleGuard>
        ),
      },

      {
        path: "users/:id",
        element: (
          <RoleGuard action="canManageUsers" redirectTo="/unauthorized">
            <Suspense fallback={<PageLoader />}>
              <XodimlarSinglePage />
            </Suspense>
          </RoleGuard>
        ),
      },

      {
        path: "chats",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatXonalarPage />
          </Suspense>
        ),
      },
      {
        path: "chats/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChatXonalarSinglePage />
          </Suspense>
        ),
      },
      {
        path: "/jarimalar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <JarimalarPage />
          </Suspense>
        ),
      },
      {
        path: "/jarimalar/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <JarimalarSinglePage />
          </Suspense>
        ),
      },
      {
        path: "/talablar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Talablar />
          </Suspense>
        ),
      },
      {
        path: "/talablar/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <TalablarSinglePage />
          </Suspense>
        ),
      },

      {
        path: "settings",
        element: (
          <Suspense fallback={<PageLoader />}>
            <div>Settings Page</div>
          </Suspense>
        ),
      },
      {
        path: "kategoriyalar",
        element: (
          <Suspense fallback={<PageLoader />}>
            <KategoriyalarPage />
          </Suspense>
        ),
      },

      {
        path: "unauthorized",
        element: (
          <Suspense fallback={<PageLoader />}>
            <UnauthorizedPage />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
