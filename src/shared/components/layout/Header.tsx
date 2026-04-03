import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCircle2 } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    if (initials) return initials;
    return name[0]?.toUpperCase() ?? "U";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-slate-50/80 backdrop-blur-xl">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="page-kicker">Boshqaruv paneli</p>
            <h1 className="truncate text-lg font-semibold text-slate-900">
              Loyiha monitoring tizimi
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-semibold text-white shadow-sm transition-transform group-hover:scale-105">
                {getInitials(user?.fio)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-sky-600">
                  {user?.fio || "Foydalanuvchi"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.lavozim_display || "Profilni ko'rish"}
                </p>
              </div>
              <UserCircle2 className="hidden h-4 w-4 text-slate-400 transition-colors group-hover:text-sky-600 sm:block" />
            </button>

            <button
              onClick={async () => {
                await logout();
                navigate("/auth/login");
              }}
              className="group flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
