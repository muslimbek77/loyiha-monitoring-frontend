import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, message } from "antd";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import Can from "@/shared/components/guards/Can";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Obyekt {
  id: number;
  nomi: string;
  manzil: string;
  buyurtmachi: string;
  pudratchi: string;
  holat: "rejada" | "jarayonda" | "tugatilgan" | "to'xtatilgan";
  reja_foizi: number;
  bajarilish_foizi: number;
  boshlanish_sanasi: string;
  tugash_sanasi: string;
  shartnoma_summasi: string;
  sarflangan_summa: string;
  masul_xodim: number;
  masul_xodim_fio?: string;
  tavsif: string;
  rasm?: string;
  holat_display?: string;
  hujjatlar_soni?: number;
  is_muammoli?: boolean;
}

interface ObyektYangilik {
  id: number;
  muallif_fio: string;
  matn: string;
  foiz_ozgarish: number;
  created_at: string;
}

interface ObyektHujjat {
  id: number;
  nomi: string;
  holat_display: string;
  fayl_turi: string;
  muddat: string;
  boshqarma_nomi?: string;
  kategoriya_nomi?: string;
  kategoriya_full_path?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLAT_CONFIG = {
  rejada: {
    label: "Rejada",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500",
    bar: "bg-slate-400",
  },
  jarayonda: {
    label: "Jarayonda",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-600",
    bar: "bg-blue-400",
  },
  tugatilgan: {
    label: "Tugatilgan",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-400",
  },
  "to'xtatilgan": {
    label: "To'xtatilgan",
    dot: "bg-rose-400",
    badge: "bg-rose-50 text-rose-500",
    bar: "bg-rose-400",
  },
} as const;

// ─── Small UI helpers ─────────────────────────────────────────────────────────

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 my-7 mt-3">
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
      {label}
    </p>
    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {icon && <span className="text-slate-300 text-xs">{icon}</span>}
      <span>{value || <span className="text-slate-300">—</span>}</span>
    </div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  color,
  trackColor,
}: {
  label: string;
  value: number;
  color: string;
  trackColor: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
    <div className={`h-2.5 rounded-full ${trackColor} overflow-hidden`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
    <div className="flex justify-between text-[10px] text-slate-300 mt-1">
      <span>0%</span>
      <span>100%</span>
    </div>
  </div>
);

const formatSum = (val: string | number) => {
  const n = Number(val || 0);
  if (!n) return "—";
  return n.toLocaleString("ru-RU") + " so'm";
};

const formatDate = (val: string) => {
  if (!val) return "—";
  const [y, m, d] = val.split("-");
  return `${d}.${m}.${y}`;
};

const buildDocumentGroups = (docs: ObyektHujjat[]) => {
  const groups = new Map<
    string,
    Map<string, ObyektHujjat[]>
  >();

  docs.forEach((doc) => {
    const department = doc.boshqarma_nomi || "Boshqarma ko'rsatilmagan";
    const category =
      doc.kategoriya_full_path || doc.kategoriya_nomi || "Papka ko'rsatilmagan";

    if (!groups.has(department)) {
      groups.set(department, new Map<string, ObyektHujjat[]>());
    }

    const categoryMap = groups.get(department)!;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(doc);
  });

  return Array.from(groups.entries()).map(([department, categoryMap]) => ({
    department,
    categories: Array.from(categoryMap.entries()).map(([category, items]) => ({
      category,
      items,
    })),
  }));
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ObyektDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState<Obyekt | null>(null);
  const [loading, setLoading] = useState(true);
  const [yangiliklar, setYangiliklar] = useState<ObyektYangilik[]>([]);
  const [hujjatlar, setHujjatlar] = useState<ObyektHujjat[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [obyektRes, xodimRes, yangilikRes, hujjatRes] = await Promise.all([
          api.get(API_ENDPOINTS.OBYEKTLAR.DETAIL(id!)),
          api
            .get(API_ENDPOINTS.USERS.LIST)
            .catch(() => ({ data: { results: [] } })),
          api
            .get(API_ENDPOINTS.OBYEKTLAR.YANGILIKLAR(id!))
            .catch(() => ({ data: [] })),
          api
            .get(API_ENDPOINTS.HUJJATLAR.OBYEKT_HUJJATLARI, {
              params: { obyekt: id },
            })
            .catch(() => ({ data: [] })),
        ]);

        const d = obyektRes.data;
        const xodimlar: { id: number; fio: string }[] =
          xodimRes.data.results ?? [];
        const masul = xodimlar.find((x) => x.id === d.masul_xodim);
        setData({ ...d, masul_xodim_fio: masul?.fio });
        setYangiliklar(yangilikRes.data.results ?? yangilikRes.data ?? []);
        setHujjatlar(hujjatRes.data.results ?? hujjatRes.data ?? []);
      } catch (err) {
        console.error(err);
        message.error("Ma'lumot yuklanmadi");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-slate-400 text-sm">
        Obyekt topilmadi
      </div>
    );
  }

  const holat = HOLAT_CONFIG[data.holat] ?? HOLAT_CONFIG["rejada"];

  const spendPct =
    data.shartnoma_summasi && data.sarflangan_summa
      ? Math.min(
          Math.round(
            (Number(data.sarflangan_summa) / Number(data.shartnoma_summasi)) *
              100,
          ),
          100,
        )
      : 0;

  // Duration in days
  const daysLeft = (() => {
    if (!data.tugash_sanasi) return null;
    const diff = Math.ceil(
      (new Date(data.tugash_sanasi).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    return diff;
  })();

  const obyektSummary = [
    data.is_muammoli ? "Obyekt monitoring bo'yicha muammoli deb belgilangan." : "Obyekt nazorat ostida.",
    `${data.hujjatlar_soni ?? hujjatlar.length} ta hujjat obyektga biriktirilgan.`,
    daysLeft !== null
      ? daysLeft < 0
        ? `Muddat ${Math.abs(daysLeft)} kun oldin o'tgan.`
        : `${daysLeft} kun muddat qoldi.`
      : "Tugash muddati ko'rsatilmagan.",
  ].join(" ");

  const hujjatGroups = buildDocumentGroups(hujjatlar);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Obyektlar
        </button>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {data.nomi}
            </h1>
            {data.manzil && (
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-sm">
                <EnvironmentOutlined className="text-xs" />
                {data.manzil}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${holat.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${holat.dot}`} />
              {holat.label}
            </span>

            {/* Edit button — wrapped in Can so only authorised users see it */}
            <Can action="canManageUsers">
              <button
                type="button"
                onClick={() => navigate(`/obyekt/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all duration-200 cursor-pointer"
              >
                <EditOutlined className="text-xs" />
                Tahrirlash
              </button>
            </Can>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-0">
        {/* ── Rasm ── */}
        {data.rasm && (
          <>
            <SectionDivider title="Rasm" />
            <div className="rounded-xl overflow-hidden border border-slate-100 max-h-72">
              <img
                src={data.rasm.replace(/^http:/, "https:")}
                alt={data.nomi}
                className="w-full object-cover"
              />
            </div>
          </>
        )}

        {/* ── Asosiy ma'lumotlar ── */}
        <SectionDivider title="Asosiy ma'lumotlar" />
        <div className="grid md:grid-cols-2 gap-5">
          <InfoRow
            label="Buyurtmachi"
            icon={<BankOutlined />}
            value={data.buyurtmachi}
          />
          <InfoRow
            label="Pudratchi"
            icon={<TeamOutlined />}
            value={data.pudratchi}
          />
          <InfoRow
            label="Mas'ul xodim"
            icon={<UserOutlined />}
            value={data.masul_xodim_fio ? `${data.masul_xodim_fio}` : null}
          />
          <InfoRow
            label="Hujjatlar soni"
            icon={<FileTextOutlined />}
            value={data.hujjatlar_soni ?? hujjatlar.length}
          />
          <InfoRow
            label="Manzil"
            icon={<EnvironmentOutlined />}
            value={data.manzil}
          />
        </div>

        <SectionDivider title="Operativ xulosa" />
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
            Obyekt holati bo'yicha xulosa
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{obyektSummary}</p>
        </div>

        {/* ── Muddatlar ── */}
        <SectionDivider title="Muddatlar" />
        <div className="grid md:grid-cols-3 gap-5">
          <InfoRow
            label="Boshlanish sanasi"
            icon={<CalendarOutlined />}
            value={formatDate(data.boshlanish_sanasi)}
          />
          <InfoRow
            label="Tugash sanasi"
            icon={<CalendarOutlined />}
            value={formatDate(data.tugash_sanasi)}
          />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
              Qolgan vaqt
            </p>
            {daysLeft === null ? (
              <span className="text-slate-300 text-sm font-medium">—</span>
            ) : daysLeft < 0 ? (
              <span className="text-sm font-semibold text-rose-500">
                {Math.abs(daysLeft)} kun o'tgan
              </span>
            ) : daysLeft === 0 ? (
              <span className="text-sm font-semibold text-amber-500">
                Bugun
              </span>
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                {daysLeft} kun qoldi
              </span>
            )}
          </div>
        </div>

        {/* ── Bajarilish holati ── */}
        <SectionDivider title="Bajarilish holati" />
        <div className="grid md:grid-cols-2 gap-8">
          <ProgressBar
            label="Bajarilish foizi"
            value={data.bajarilish_foizi}
            color="#3b82f6"
            trackColor="bg-blue-50"
          />
          <ProgressBar
            label="Reja foizi"
            value={data.reja_foizi}
            color="#a855f7"
            trackColor="bg-purple-50"
          />
        </div>

        {/* ── Moliyaviy ko'rsatkichlar ── */}
        <SectionDivider title="Moliyaviy ko'rsatkichlar" />
        <div className="grid md:grid-cols-2 gap-5">
          <InfoRow
            label="Shartnoma summasi"
            value={formatSum(data.shartnoma_summasi)}
          />
          <InfoRow
            label="Sarflangan summa"
            value={formatSum(data.sarflangan_summa)}
          />
        </div>

        {/* Spend progress bar */}
        {Number(data.shartnoma_summasi) > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Sarflangan ulushi
              </p>
              <span className="text-xs font-bold text-blue-500 tabular-nums">
                {spendPct}%
              </span>
            </div>
            <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-700"
                style={{ width: `${spendPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* ── Tavsif ── */}
        {data.tavsif && (
          <>
            <SectionDivider title="Tavsif" />
            <div className="flex gap-2 text-sm text-slate-600 leading-relaxed">
              <FileTextOutlined className="text-slate-300 text-xs mt-0.5 flex-shrink-0" />
              <p>{data.tavsif}</p>
            </div>
          </>
        )}

        <SectionDivider title="So'nggi yangiliklar" />
        {yangiliklar.length ? (
          <div className="space-y-3">
            {yangiliklar.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.muallif_fio}
                  </p>
                  <span className="text-xs text-slate-400">
                    {dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.matn}</p>
                {item.foiz_ozgarish > 0 && (
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    +{item.foiz_ozgarish}% progress
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Obyekt bo'yicha yangiliklar hali mavjud emas.
          </div>
        )}

        <SectionDivider title="Biriktirilgan hujjatlar" />
        {hujjatlar.length ? (
          <div className="space-y-3">
            {hujjatGroups.map((group) => (
              <div
                key={group.department}
                className="rounded-2xl border border-slate-200 overflow-hidden"
              >
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {group.department}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {group.categories.reduce((sum, category) => sum + category.items.length, 0)} ta hujjat
                  </p>
                </div>

                <div className="p-3 space-y-3">
                  {group.categories.map((category) => (
                    <div key={`${group.department}-${category.category}`} className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {category.category}
                        </p>
                        <span className="text-xs text-slate-400">
                          {category.items.length} ta
                        </span>
                      </div>

                      {category.items.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                          className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {doc.nomi}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {doc.fayl_turi} • {formatDate(doc.muddat)}
                            </p>
                          </div>
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                            {doc.holat_display}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            Obyektga biriktirilgan hujjatlar topilmadi.
          </div>
        )}
      </div>
    </div>
  );
};

export default ObyektDetailPage;
