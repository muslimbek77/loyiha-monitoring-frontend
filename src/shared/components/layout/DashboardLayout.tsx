// src/shared/components/layout/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  return (
   <div className="flex h-screen overflow-hidden">
  <Sidebar />

  <div className="flex flex-col flex-1 overflow-hidden">
    <Header />

    <main className="flex-1 overflow-auto p-6 min-h-0">
      <Outlet />
    </main>
  </div>
</div>
  );
};

export default DashboardLayout;
