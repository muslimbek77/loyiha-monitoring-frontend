import { formatDate } from "@/shared/components/const/CustomUI";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MessageOutlined,
  PaperClipOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { IzohlarSection } from "./AddIzohForm";
import { Link } from "react-router-dom";

interface Izoh {
  id: number;
  topshiriq: number;
  muallif: number;
  muallif_fio: string;
  matn: string;
  fayl: string;
  created_at: string;
}

interface Topshiriq {
  id: number;
  bayonnoma: number;
  bayonnoma_raqami: string;
  ijrochi_boshqarma: number;
  ijrochi_boshqarma_nomi: string;
  ijrochi_xodim: number;
  ijrochi_xodim_fio: string;
  band_raqami: number;
  mazmun: string;
  muddat: string;
  holat: string;
  holat_display: string;
  bajarildi: boolean;
  bajarildi_sana: string | null;
  izoh: string;
  natija: string;
  is_kechikkan: boolean;
  qolgan_kunlar: number;
  izohlar: Izoh[];
  created_at: string;
  updated_at: string;
}

export function getProgressColor(val: number): string {
  if (val === 100) return "#10b981";
  if (val >= 60) return "#6366f1";
  if (val >= 30) return "#f59e0b";
  return "#ef4444";
}

export function getHolatConfig(holat: string): {
  color: string;
  bg: string;
  label: string;
  icon: React.ReactNode;
} {
  switch (holat) {
    case "bajarildi":
      return {
        color: "#10b981",
        bg: "#ecfdf5",
        label: "Bajarildi",
        icon: <CheckCircleOutlined />,
      };
    case "jarayonda":
      return {
        color: "#6366f1",
        bg: "#eef2ff",
        label: "Jarayonda",
        icon: <ClockCircleOutlined />,
      };
    case "kechikkan":
      return {
        color: "#ef4444",
        bg: "#fef2f2",
        label: "Kechikkan",
        icon: <WarningOutlined />,
      };
    default:
      return {
        color: "#64748b",
        bg: "#f8fafc",
        label: "Yangi",
        icon: <ExclamationCircleOutlined />,
      };
  }
}

export const getInitials = (name?: string) => {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
};

// ─── Sub-components ───────────────────────────────────────────────────────────

export const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 text-sm">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
        {label}
      </p>
      <div className="text-sm text-slate-800 font-medium">{value}</div>
    </div>
  </div>
);

export const IzohCard = ({ izoh }: { izoh: Izoh }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
        {getInitials(izoh.muallif_fio)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-semibold text-slate-800">
            {izoh.muallif_fio}
          </span>
          <span className="text-xs text-slate-400 shrink-0">
            {formatDate(izoh.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mb-0">
          {izoh.matn}
        </p>
        {izoh.fayl && (
          <Link
            to={`${izoh.fayl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            <PaperClipOutlined /> Fayl
          </Link>
        )}
      </div>
    </div>
  </div>
);

export const TopshiriqCard = ({
  t,
  index,
}: {
  t: Topshiriq;
  index: number;
}) => {
  const holatCfg = getHolatConfig(t.holat);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600">
            {index + 1}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0">
              Band #{t.band_raqami}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t.bayonnoma_raqami}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {t.is_kechikkan && (
            <span
              title="Muddat o'tib ketgan"
              className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500"
            >
              <WarningOutlined /> Kechikkan
            </span>
          )}
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
            style={{
              color: holatCfg.color,
              background: holatCfg.bg,
              borderColor: holatCfg.color + "33",
            }}
          >
            {holatCfg.icon} {t.holat_display}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        <p className="text-sm text-slate-800 font-medium leading-relaxed mb-4">
          {t.mazmun}
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
              Ijrochi xodim
            </p>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">
                {getInitials(t.ijrochi_xodim_fio)}
              </div>
              <span className="text-slate-700 font-medium">
                {t.ijrochi_xodim_fio}
              </span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
              Boshqarma
            </p>
            <span className="text-slate-700 font-medium">
              {t.ijrochi_boshqarma_nomi}
            </span>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
              Muddat
            </p>
            <div className="flex items-center gap-1">
              <CalendarOutlined className="text-amber-400" />
              <span className="text-slate-700 font-medium">
                {formatDate(t.muddat)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
              Qolgan kunlar
            </p>
            <span
              className="font-bold"
              style={{
                color:
                  t.qolgan_kunlar < 0
                    ? "#ef4444"
                    : t.qolgan_kunlar <= 3
                      ? "#f59e0b"
                      : "#10b981",
              }}
            >
              {t.qolgan_kunlar < 0
                ? `${Math.abs(t.qolgan_kunlar)} kun o'tdi`
                : `${t.qolgan_kunlar} kun`}
            </span>
          </div>
        </div>

        {t.bajarildi && (
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-100">
            <CheckCircleOutlined className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700">
              Bajarildi: {t.bajarildi_sana ? formatDate(t.bajarildi_sana) : "—"}
            </span>
          </div>
        )}

        {t.natija && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Natija
            </p>
            <p className="text-sm text-slate-700 leading-relaxed bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
              {t.natija}
            </p>
          </div>
        )}

        {t.izoh && (
          <div className="mt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Izoh
            </p>
            <p className="text-sm text-slate-600 italic">{t.izoh}</p>
          </div>
        )}

        {/* Izohlar (comments) */}

        <IzohlarSection topshiriqId={t.id} initialIzohlar={t.izohlar ?? []} />
      </div>
    </div>
  );
};
