import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Landmark,
  ClipboardList,
  CheckSquare,
  Users,
  MessageSquare,
  Pin,
} from "lucide-react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";

type Permission =
  | "canManageUsers"
  | "canCreate"
  | "canUpdate"
  | "canDelete"
  | "canRead"
  | "canSeeUsers"
  | "canManageUsers";

const navItems: {
  label: string;
  path: string;
  icon: any;
  permission?: Permission;
}[] = [
  {
    label: "Bosh sahifa",
    path: "/",
    icon: LayoutDashboard,
    permission: "canManageUsers",
  },
  { label: "Boshqarma", path: "/boshqarma", icon: Landmark },
  { label: "Obyektlar", path: "/obyekt", icon: Building2 },
  { label: "Hujjatlar", path: "/hujjatlar", icon: FileText },
  { label: "Bayonnomalar", path: "/bayonnomalar", icon: ClipboardList },
  { label: "Topshiriqlar", path: "/topshiriqlar", icon: CheckSquare },

  // {
  //   label: "Jarimalar",
  //   path: "/jarimalar",
  //   icon: Banknote,
  //   permission: "canManageUsers",
  // },
  { label: "Chat xonalar", path: "/chats", icon: MessageSquare },
  { label: "Talablar", path: "/talablar", icon: Pin },
  {
    label: "Xodimlar",
    path: "/users",
    icon: Users,
    permission: "canManageUsers",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { can } = usePermissions();

  const visibleItems = navItems.filter(
    (item) => !item.permission || can(item.permission),
  );

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-slate-200/70 bg-slate-950 text-slate-100 lg:sticky lg:top-0 lg:flex lg:flex-col">
      {/* Top Section */}
      <div className="flex-1 px-4 py-6">
        {/* Logo */}
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-bold text-white shadow-[0_14px_28px_rgba(56,189,248,0.35)]">
            LM
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                Monitoring
              </p>
              <span className="text-base font-semibold tracking-tight text-white">
                Loyiha boshqaruvi
              </span>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-300/80">
            Barcha ish jarayonlari, hujjatlar va topshiriqlarni yagona paneldan boshqaring.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {visibleItems.map(({ label, path, icon: Icon }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);

            return (
              <Link
                key={path}
                to={path}
                className={`
                  relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-150
                  ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-white shadow-[inset_0_0_0_1px_rgba(125,211,252,0.24)]"
                      : "text-slate-300/70 hover:bg-white/6 hover:text-white"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-sm bg-sky-400" />
                )}
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    isActive ? "bg-white/10 text-sky-200" : "bg-white/5 text-slate-300"
                  }`}
                >
                  <Icon size={18} className="opacity-90" />
                </span>
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-5">
        <div className="text-xs text-slate-400">© 2026 Loyiha Monitoring</div>
        <div className="mt-1 text-[11px] font-semibold tracking-wide text-sky-300">
          Ko'prikqurilish AJ
        </div>
      </footer>
    </aside>
  );
};

export default Sidebar;
