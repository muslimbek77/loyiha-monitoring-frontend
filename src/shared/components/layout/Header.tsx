import { Badge, Empty, Popover, Spin, Tag } from "antd";
import { Bell, FileText, LogOut, UserCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";

const Header = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const summary = useNotificationStore((state) => state.summary);
  const notifLoading = useNotificationStore((state) => state.isLoading);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    if (initials) return initials;
    return name[0]?.toUpperCase() ?? "U";
  };

  const notifications = useMemo(
    () => [
      ...(summary?.sections.chat.items ?? []),
      ...(summary?.sections.talablar.items ?? []),
      ...(summary?.sections.topshiriqlar.items ?? []),
      ...(summary?.sections.hujjatlar.items ?? []),
    ].slice(0, 12),
    [summary],
  );

  const notificationPanel = useMemo(
    () => (
      <div className="w-[320px] max-w-[calc(100vw-48px)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Bildirishnomalar</p>
          <Tag color="blue" className="mr-0 rounded-full">
            {summary?.total_unread ?? 0}
          </Tag>
        </div>

        {notifLoading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Yangi bildirishnoma yo'q"
          />
        ) : (
          <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
            {notifications.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                    {item.title}
                  </p>
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">
                    {item.description}
                  </p>
                  <Tag color={item.tone} className="mr-0 shrink-0 rounded-full text-[10px]">
                    {item.section}
                  </Tag>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    ),
    [navigate, notifLoading, notifications],
  );

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
            <Popover
              content={notificationPanel}
              trigger="click"
              placement="bottomRight"
              arrow={false}
            >
              <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-600 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <Badge count={summary?.total_unread ?? 0} size="small" offset={[2, -2]}>
                  <Bell className="h-5 w-5" />
                </Badge>
              </button>
            </Popover>

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
