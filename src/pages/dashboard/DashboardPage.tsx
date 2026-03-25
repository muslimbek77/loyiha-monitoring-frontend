import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Spin, Alert } from "antd";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

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
  eng_yomon_boshqarma: string;
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

const SECTIONS = [
  {
    key: "obyektlar",
    label: "Obyektlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      {
        title: "Jami obyektlar",
        value: s.jami_obyektlar,
        variant: "neutral",
        href: "/obyekt",
      },
      {
        title: "Muammoli obyektlar",
        value: s.muammoli_obyektlar,
        variant: "danger",
        href: "/obyekt?filter=muammoli",
      },
      {
        title: "Tugatilgan obyektlar",
        value: s.tugatilgan_obyektlar,
        variant: "success",
        href: "/obyekt?filter=tugatilgan",
      },
    ],
  },
  {
    key: "hujjatlar",
    label: "Hujjatlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      {
        title: "Jami hujjatlar",
        value: s.jami_hujjatlar,
        variant: "neutral",
        href: "/hujjatlar",
      },
      {
        title: "Kutilmoqda",
        value: s.kutilmoqda_hujjatlar,
        variant: "warning",
        href: "/hujjatlar?filter=kutilmoqda",
      },
      {
        title: "Kechikkan hujjatlar",
        value: s.kechikkan_hujjatlar,
        variant: "danger",
        href: "/hujjatlar?filter=kechikkan",
      },
    ],
  },
  {
    key: "topshiriqlar",
    label: "Topshiriqlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      {
        title: "Jami topshiriqlar",
        value: s.jami_topshiriqlar,
        variant: "neutral",
        href: "/topshiriqlar",
      },
      {
        title: "Bajarilgan",
        value: s.bajarilgan_topshiriqlar,
        variant: "success",
        href: "/topshiriqlar?filter=bajarilgan",
      },
      {
        title: "Kechikkan topshiriqlar",
        value: s.kechikkan_topshiriqlar,
        variant: "danger",
        href: "/topshiriqlar?filter=kechikkan",
      },
    ],
  },
  {
    key: "jarimalar",
    label: "Jarimalar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      {
        title: "Jami jarimalar",
        value: s.jami_jarimalar,
        variant: "neutral",
        href: "/jarimalar",
      },
      {
        title: "Bu oy jarimalar (ball)",
        value: s.bu_oy_jarimalar,
        variant: "danger",
        href: "/jarimalar?filter=bu_oy",
      },
      {
        title: "Eng yomon boshqarma",
        value: s.eng_yomon_boshqarma,
        variant: "warning",
        href: "/boshqarma",
      },
    ],
  },
];

const variantConfig: Record<
  string,
  {
    valueCls: string;
    badgeCls: string;
    badgeLabel: string;
    border: string;
    leftBar: string;
  }
> = {
  neutral: {
    valueCls: "text-slate-800",
    badgeCls: "bg-slate-100 text-slate-500",
    badgeLabel: "Jami",
    border: "border-slate-200",
    leftBar: "bg-slate-300",
  },
  danger: {
    valueCls: "text-rose-600",
    badgeCls: "bg-rose-50 text-rose-500",
    badgeLabel: "Xavfli",
    border: "border-slate-200",
    leftBar: "bg-rose-400",
  },
  success: {
    valueCls: "text-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-600",
    badgeLabel: "Yaxshi",
    border: "border-slate-200",
    leftBar: "bg-emerald-400",
  },
  warning: {
    valueCls: "text-amber-600",
    badgeCls: "bg-amber-50 text-amber-600",
    badgeLabel: "Ehtiyot",
    border: "border-slate-200",
    leftBar: "bg-amber-400",
  },
};

// Returns color classes based on reyting score
const getReytingColor = (reyting: number) => {
  if (reyting >= 80)
    return {
      bar: "bg-emerald-400",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  if (reyting >= 50)
    return { bar: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50" };
  return { bar: "bg-rose-400", text: "text-rose-600", bg: "bg-rose-50" };
};

const getRankIcon = (index: number) => {
  if (index === 0) return { emoji: "🥇", cls: "text-yellow-500" };
  if (index === 1) return { emoji: "🥈", cls: "text-slate-400" };
  if (index === 2) return { emoji: "🥉", cls: "text-amber-600" };
  return null;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reyting, setReyting] = useState<ReytingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reytingLoading, setReytingLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
        setStats(res.data);
      } catch (error) {
        console.error("Statistika olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReyting = async () => {
      try {
        const res = await api.get("/analytics/reyting/");
        // Sort descending by reyting score
        const sorted = [...res.data].sort((a, b) => b.reyting - a.reyting);
        setReyting(sorted);
      } catch (error) {
        console.error("Reyting olishda xatolik:", error);
      } finally {
        setReytingLoading(false);
      }
    };

    fetchStats();
    fetchReyting();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert message="Ma'lumot topilmadi" type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Monitoring tizimi
        </p>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Boshqaruv paneli
        </h1>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-400">{section.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {section.label}
              </span>
              <div className="flex-1 h-px bg-slate-200 ml-1" />
            </div>
            <Row gutter={[14, 14]}>
              {section.cards(stats).map((card) => (
                <Col xs={24} md={8} key={card.title}>
                  <StatCard
                    title={card.title}
                    value={card.value}
                    variant={card.variant}
                    href={card.href}
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))}

        {/* Reyting */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Boshqarmalar reytingi
            </span>
            <div className="flex-1 h-px bg-slate-200 ml-1" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {reytingLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spin />
              </div>
            ) : reyting.length === 0 ? (
              <div className="p-5 text-center text-slate-400 text-sm">
                Ma'lumot topilmadi
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50">
                  <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    #
                  </div>
                  <div className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Boshqarma
                  </div>
                  <div className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Reyting
                  </div>
                  <div className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                    Jarimalar
                  </div>
                </div>

                {/* Table rows */}
                {reyting.map((item, index) => {
                  const colors = getReytingColor(item.reyting);
                  const rankIcon = getRankIcon(index);
                  return (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/boshqarma/${item.id}`)}
                      className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                    >
                      {/* Rank */}
                      <div className="col-span-1 flex items-center">
                        {rankIcon ? (
                          <span className="text-base leading-none">
                            {rankIcon.emoji}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="col-span-4">
                        <p className="text-sm font-medium text-slate-700 leading-tight">
                          {item.nomi}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {item.qisqa_nomi}
                        </p>
                      </div>

                      {/* Reyting bar */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                              style={{
                                width: `${Math.min(item.reyting, 100)}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold tabular-nums ${colors.text} min-w-[36px] text-right`}
                          >
                            {item.reyting.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Jarimalar */}
                      <div className="col-span-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                            item.jarimalar_soni > 0
                              ? "bg-rose-50 text-rose-500"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {item.jarimalar_soni}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Xulosa */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              AI Xulosa
            </span>
            <div className="flex-1 h-px bg-slate-200 ml-1" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex gap-3 items-center">
              <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {stats.ai_xulosa}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  variant = "neutral",
  href,
}: {
  title: string;
  value: number | string;
  variant?: string;
  href?: string;
}) => {
  const navigate = useNavigate();
  const cfg = variantConfig[variant] ?? variantConfig.neutral;

  const handleClick = () => {
    if (href) navigate(href);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative bg-white rounded-2xl border ${cfg.border}
        px-5 pt-5 pb-5 shadow-sm overflow-hidden
        hover:shadow-md transition-all duration-200
        ${href ? "cursor-pointer hover:scale-[1.02] active:scale-[0.99]" : ""}
      `}
    >
      <div
        className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${cfg.leftBar}`}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 leading-snug max-w-[65%]">
          {title}
        </p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeCls}`}
        >
          {cfg.badgeLabel}
        </span>
      </div>

      <p className={`text-3xl font-bold tabular-nums ${cfg.valueCls}`}>
        {value}
      </p>

      {href && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-3.5 h-3.5 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
