import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Spin } from "antd";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  MapPinned,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useAuth } from "@/features/auth/hooks/useAuth";

type DashboardStats = {
  jami_obyektlar: number;
  muammoli_obyektlar: number;
  tugatilgan_obyektlar: number;
  jami_hujjatlar: number;
  kutilmoqda_hujjatlar: number;
  kechikkan_hujjatlar: number;
  jami_topshiriqlar: number;
  bajarilgan_topshiriqlar: number;
  kechikkan_topshiriqlar: number;
  jami_jarimalar: number;
  bu_oy_jarimalar: number;
  eng_yomon_boshqarma: string | null;
  eng_yomon_boshqarma_id?: number | null;
  ai_xulosa: string;
};

type ReytingItem = {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting: number;
  jarimalar_soni: number;
  topshiriqlar_bajarilish: number;
};

type XaritaItem = {
  id: number;
  nomi: string;
  manzil: string;
  holat: string;
  bajarilish_foizi: number;
  rang: string;
};

type MoliyaStats = {
  jami_shartnoma: number;
  jami_sarflangan: number;
  qoldiq: number;
};

type AIHisobot = {
  id: number;
  sana: string;
  turi: string;
  turi_display: string;
  xulosa: string;
  created_at: string;
};

const PROJECT_GOALS = [
  {
    title: "Jarayonlarni yagona panelda boshqarish",
    description:
      "Obyekt, hujjat, topshiriq va jarimalarni bir tizimda kuzatib, qaror qabul qilishni tezlashtiradi.",
    icon: Building2,
  },
  {
    title: "Muammolarni erta aniqlash",
    description:
      "Kechikkan topshiriq, muammoli obyekt va kutilayotgan hujjatlar risklar sifatida darhol ko'rsatiladi.",
    icon: ShieldAlert,
  },
  {
    title: "Ijro intizomini oshirish",
    description:
      "Boshqarmalar reytingi va ijro foizlari orqali javobgarlik va monitoring kuchayadi.",
    icon: TrendingUp,
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reyting, setReyting] = useState<ReytingItem[]>([]);
  const [xarita, setXarita] = useState<XaritaItem[]>([]);
  const [moliya, setMoliya] = useState<MoliyaStats | null>(null);
  const [latestAiHisobot, setLatestAiHisobot] = useState<AIHisobot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();
  const canManageAi = user?.lavozim === "rais" || user?.lavozim === "rais_orinbosari";

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, reytingRes, xaritaRes, moliyaRes, aiHisobotRes] =
        await Promise.allSettled([
          api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS),
          api.get<ReytingItem[]>(API_ENDPOINTS.DASHBOARD.REYTING),
          api.get<XaritaItem[]>(API_ENDPOINTS.DASHBOARD.XARITA),
          api.get<MoliyaStats>(API_ENDPOINTS.DASHBOARD.MOLIYA),
          api.get(API_ENDPOINTS.DASHBOARD.AI_HISOBOTLAR, {
            params: { page_size: 1 },
          }),
        ]);

      if (statsRes.status !== "fulfilled") {
        throw statsRes.reason;
      }

      setStats(statsRes.value.data);

      if (reytingRes.status === "fulfilled") {
        setReyting(
          [...reytingRes.value.data].sort((a, b) => b.reyting - a.reyting),
        );
      }

      if (xaritaRes.status === "fulfilled") {
        setXarita(xaritaRes.value.data);
      }

      if (moliyaRes.status === "fulfilled") {
        setMoliya(moliyaRes.value.data);
      } else {
        setMoliya(null);
      }

      if (aiHisobotRes.status === "fulfilled") {
        const items = aiHisobotRes.value.data?.results ?? aiHisobotRes.value.data ?? [];
        setLatestAiHisobot(Array.isArray(items) ? items[0] ?? null : null);
      } else {
        setLatestAiHisobot(null);
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("Bosh sahifa ma'lumotlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleGenerateAi = async () => {
    try {
      setAiLoading(true);
      await api.post(API_ENDPOINTS.DASHBOARD.AI_HISOBOT_GENERATE);
      await fetchDashboard();
    } catch (generateError) {
      console.error(generateError);
    } finally {
      setAiLoading(false);
    }
  };

  const kpiCards = useMemo(() => {
    if (!stats) return [];

    const taskProgress = stats.jami_topshiriqlar
      ? Math.round((stats.bajarilgan_topshiriqlar / stats.jami_topshiriqlar) * 100)
      : 0;

    return [
      {
        title: "Faol monitoring obyektlari",
        value: formatNumber(stats.jami_obyektlar),
        tone: "sky",
        description: `${stats.tugatilgan_obyektlar} ta obyekt yakunlangan`,
        action: "/obyekt",
        icon: Building2,
      },
      {
        title: "Nazorat talab qilayotgan hujjatlar",
        value: formatNumber(stats.kutilmoqda_hujjatlar),
        tone: "amber",
        description: `${stats.kechikkan_hujjatlar} ta hujjat muddatdan o'tgan`,
        action: "/hujjatlar",
        icon: FileText,
      },
      {
        title: "Ijro intizomi",
        value: `${taskProgress}%`,
        tone: taskProgress >= 70 ? "emerald" : "rose",
        description: `${stats.bajarilgan_topshiriqlar}/${stats.jami_topshiriqlar} topshiriq bajarilgan`,
        action: "/topshiriqlar",
        icon: ClipboardCheck,
      },
      {
        title: "Jarima bosimi",
        value: formatNumber(stats.bu_oy_jarimalar),
        tone: stats.bu_oy_jarimalar > 0 ? "rose" : "slate",
        description: "Joriy oy bo'yicha jarima ballari",
        action: "/jarimalar",
        icon: ShieldAlert,
      },
    ];
  }, [stats]);

  const obyektInsight = useMemo(() => {
    const total = xarita.length;
    if (!total) {
      return {
        active: 0,
        problematic: 0,
        completed: 0,
        averageProgress: 0,
      };
    }

    const completed = xarita.filter((item) => item.holat === "tugatilgan").length;
    const problematic = xarita.filter((item) => item.holat === "muammoli").length;
    const averageProgress = Math.round(
      xarita.reduce((sum, item) => sum + (item.bajarilish_foizi || 0), 0) / total,
    );

    return {
      active: total,
      problematic,
      completed,
      averageProgress,
    };
  }, [xarita]);

  if (loading) {
    return (
      <div className="app-loader">
        <div className="app-loader__ring" />
        <p className="text-sm text-slate-500">Bosh sahifa yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="page-surface p-6">
        <Alert
          message="Bosh sahifa ochilmadi"
          description={error || "Dashboard statistikasi topilmadi."}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="page-surface overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div>
            <p className="page-kicker">Loyiha monitoring markazi</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Loyihalarning holati, risklari va ijro natijalarini yagona bosh sahifada ko'rsatish
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Ushbu panelning maqsadi obyektlar, hujjatlar, topshiriqlar, boshqarma reytingi va jarimalar bo'yicha real vaziyatni bir qarashda ko'rsatishdir. API ma'lumotlari foydalanuvchi qaror qabul qilishi oson bo'ladigan bloklarga ajratildi.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PROJECT_GOALS.map((goal) => {
                const Icon = goal.icon;
                return (
                  <div key={goal.title} className="section-card p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="mt-4 text-base font-semibold text-slate-900">
                      {goal.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {goal.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section-card bg-slate-950 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/80">
                  Operativ holat
                </p>
                <h2 className="mt-1 text-lg font-semibold">
                  Monitoring xulosasi
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <SummaryRow
                label="Muammoli obyektlar"
                value={formatNumber(stats.muammoli_obyektlar)}
              />
              <SummaryRow
                label="Kechikkan hujjatlar"
                value={formatNumber(stats.kechikkan_hujjatlar)}
              />
              <SummaryRow
                label="Kechikkan topshiriqlar"
                value={formatNumber(stats.kechikkan_topshiriqlar)}
              />
              <SummaryRow
                label="Eng past reytingli boshqarma"
                value={stats.eng_yomon_boshqarma || "-"}
              />
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                AI tavsiya
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-200/90">
                {stats.ai_xulosa}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            tone={card.tone}
            icon={card.icon}
            onClick={() => navigate(card.action)}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="section-card p-6">
          <div className="page-header mb-6">
            <p className="page-kicker">Jarayon xaritasi</p>
            <h2 className="page-title text-2xl">Loyihaning asosiy oqimlari</h2>
            <p className="page-subtitle">
              API’dan kelayotgan obyekt, hujjat va topshiriq ko'rsatkichlari loyiha maqsadiga xizmat qiladigan asosiy uchta monitoring yo'nalishini beradi.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ProcessCard
              title="1. Obyektlar holati"
              value={`${obyektInsight.averageProgress}%`}
              description={`${obyektInsight.active} ta obyekt, ${obyektInsight.problematic} tasi risk holatda`}
              tone="sky"
              actionLabel="Obyektlarni ko'rish"
              onClick={() => navigate("/obyekt")}
            />
            <ProcessCard
              title="2. Hujjat intizomi"
              value={formatNumber(stats.jami_hujjatlar)}
              description={`${stats.kutilmoqda_hujjatlar} ta ko'rib chiqilishi kerak`}
              tone="amber"
              actionLabel="Hujjatlar bo'limi"
              onClick={() => navigate("/hujjatlar")}
            />
            <ProcessCard
              title="3. Ijro nazorati"
              value={formatNumber(stats.jami_topshiriqlar)}
              description={`${stats.bajarilgan_topshiriqlar} ta topshiriq bajarilgan`}
              tone="emerald"
              actionLabel="Topshiriqlar bo'limi"
              onClick={() => navigate("/topshiriqlar")}
            />
          </div>

          <div className="mt-6 rounded-3xl bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Boshqaruv tavsiyasi
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">
                  Risk yuqori joylarga avval reaksiya bering
                </h3>
              </div>
              {stats.eng_yomon_boshqarma_id ? (
                <button
                  onClick={() => navigate(`/boshqarma/${stats.eng_yomon_boshqarma_id}`)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Riskli boshqarma
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Muammoli obyektlar, kechikkan topshiriqlar va jarimalar bir joyda ko'rsatilgani sababli bosh sahifa endi nazorat emas, qaror qabul qilish paneli vazifasini bajaradi.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="section-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="page-kicker">AI monitoring</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Sun'iy tahlil holati
                </h2>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Dashboard AI xulosasi
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {stats.ai_xulosa}
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  So'nggi AI hisobot
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => fetchDashboard()}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Yangilash
                  </button>
                  {canManageAi ? (
                    <button
                      onClick={handleGenerateAi}
                      disabled={aiLoading}
                      className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                    >
                      {aiLoading ? "Generatsiya..." : "AI hisobot yaratish"}
                    </button>
                  ) : null}
                </div>
              </div>
              {latestAiHisobot ? (
                <>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 font-semibold text-violet-600">
                      {latestAiHisobot.turi_display}
                    </span>
                    <span>{formatDate(latestAiHisobot.sana)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {latestAiHisobot.xulosa}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Backend AI endpoint ishlayapti, lekin saqlangan hisobot hali topilmadi yoki joriy foydalanuvchi uchun qaytmadi.
                </p>
              )}
            </div>
          </div>

          <div className="section-card p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="page-kicker">Boshqarmalar reytingi</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Ijro samaradorligi
                </h2>
              </div>
              <button
                onClick={() => navigate("/boshqarma")}
                className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
              >
                Barchasini ko'rish
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {reyting.slice(0, 5).map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/boshqarma/${item.id}`)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50/40"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.nomi}
                    </p>
                    <p className="text-xs text-slate-500">
                      Jarima: {item.jarimalar_soni} • Ijro:{" "}
                      {item.topshiriqlar_bajarilish}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {item.reyting.toFixed(1)}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      reyting
                    </p>
                  </div>
                </button>
              ))}

              {!reyting.length && (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Reyting ma'lumotlari topilmadi.
                </div>
              )}
            </div>
          </div>

          <div className="section-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="page-kicker">Moliyaviy ko'rinish</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">
                  Kuzatuvchi uchun jamlanma
                </h2>
              </div>
            </div>

            {moliya ? (
              <div className="mt-6 grid gap-3">
                <FinanceRow label="Jami shartnoma" value={formatCurrency(moliya.jami_shartnoma)} />
                <FinanceRow label="Jami sarflangan" value={formatCurrency(moliya.jami_sarflangan)} />
                <FinanceRow label="Qoldiq" value={formatCurrency(moliya.qoldiq)} highlight />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm leading-6 text-slate-500">
                Bu blok faqat ruxsat berilgan foydalanuvchilar uchun moliyaviy API ma'lumotlari mavjud bo'lsa ko'rsatiladi.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const KpiCard = ({
  title,
  value,
  description,
  tone,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  tone: "sky" | "amber" | "emerald" | "rose" | "slate";
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) => {
  const toneClass = {
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[tone];

  return (
    <button
      onClick={onClick}
      className="section-card flex w-full items-start justify-between gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {title}
        </p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
    </button>
  );
};

const ProcessCard = ({
  title,
  value,
  description,
  tone,
  actionLabel,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  tone: "sky" | "amber" | "emerald";
  actionLabel: string;
  onClick: () => void;
}) => {
  const toneClass = {
    sky: "from-sky-500/10 to-sky-500/0 border-sky-100",
    amber: "from-amber-500/10 to-amber-500/0 border-amber-100",
    emerald: "from-emerald-500/10 to-emerald-500/0 border-emerald-100",
  }[tone];

  return (
    <div className={`rounded-3xl border bg-gradient-to-br ${toneClass} p-5`}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <button
        onClick={onClick}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

const SummaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <span className="text-sm text-slate-300">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const FinanceRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-3">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`text-sm font-semibold ${highlight ? "text-emerald-700" : "text-slate-900"}`}>
      {value}
    </span>
  </div>
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatNumber = (value: number | string) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value || 0));

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default DashboardPage;
