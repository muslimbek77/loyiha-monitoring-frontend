import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spin,
} from "antd";
import {
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  MessageOutlined,
  PaperClipOutlined,
  WarningOutlined,
  CheckSquareOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { formatDate } from "@/shared/components/const/CustomUI";
import {
  getHolatConfig,
  getInitials,
  getProgressColor,
  InfoRow,
  TopshiriqCard,
} from "./Const";
import BayonnomaEditModal from "./BayonnomaEditModal";
import TopshiriqQoshishModal from "./TopshiriqQushishModal";
import Can from "@/shared/components/guards/Can";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface BayonnomaSingle {
  id: number;
  raqami: string;
  sana: string;
  mavzu: string;
  fayl: string;
  yaratuvchi: number;
  yaratuvchi_fio: string;
  ishtirokchilar: string;
  izoh: string;
  topshiriqlar: Topshiriq[];
  topshiriqlar_soni: number;
  bajarilgan_soni: number;
  bajarilish_foizi: number;
  created_at: string;
  updated_at: string;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BayonnomaSinglePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<BayonnomaSingle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get<BayonnomaSingle>(
          API_ENDPOINTS.BAYONNOMALAR.DETAIL(id!),
        );
        setData(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-400 shadow-sm">
          Bayonnoma topilmadi
        </div>
      </div>
    );
  }

  const progressColor = getProgressColor(data.bajarilish_foizi);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 rounded-xl">
      {/* ── Back button + breadcrumb ── */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center cursor-pointer gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <ArrowLeftOutlined /> Orqaga
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Bayonnomalar</span>
          <span>/</span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
            {data.raqami}
          </span>
        </div>

        <Can action="canCreate">
          <button
            className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
            onClick={() => setEditOpen(true)}
          >
            <EditOutlined className="text-indigo-500  cursor-pointer hover:text-indigo-700" />{" "}
            Tahrirlash
          </button>
        </Can>
      </div>

      {/* ── Hero header ── */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden relative">
        {/* decorative accent */}
        <div
          className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl"
          style={{
            background: `linear-gradient(to bottom, ${progressColor}, ${progressColor}88)`,
          }}
        />

        <div className="pl-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-blue-50 px-3 py-0.5 text-sm font-bold text-blue-600">
                  {data.raqami}
                </span>
                <span className="text-xs text-slate-400">
                  <CalendarOutlined className="mr-1" />
                  {formatDate(data.sana)}
                </span>
              </div>
              <h1
                className="mb-1 text-3xl font-extrabold leading-snug text-slate-900"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {data.mavzu}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  {data.yaratuvchi_fio ? (
                    getInitials(data.yaratuvchi_fio)
                  ) : (
                    <UserOutlined />
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  Yaratuvchi:{" "}
                  <strong className="text-slate-700">
                    {data.yaratuvchi_fio}
                  </strong>
                </p>
              </div>
            </div>

            {/* Progress ring area */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="relative flex h-24 w-24 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(${progressColor} ${data.bajarilish_foizi}%, #e2e8f0 ${data.bajarilish_foizi}% 100%)`,
                }}
              >
                <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full bg-white">
                  <span
                    className="text-base font-black"
                    style={{ color: progressColor }}
                  >
                    {data.bajarilish_foizi}%
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold mt-1 text-slate-400 uppercase tracking-wider">
                Bajarilish
              </span>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <CheckSquareOutlined className="text-indigo-400" />
              <div>
                <p className="text-xs text-slate-400 mb-0">Jami topshiriqlar</p>
                <p className="text-base font-bold text-slate-800 leading-none">
                  {data.topshiriqlar_soni}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <CheckCircleOutlined className="text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400 mb-0">Bajarilgan</p>
                <p className="text-base font-bold text-emerald-600 leading-none">
                  {data.bajarilgan_soni}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-4 py-2.5">
              <ClockCircleOutlined className="text-amber-400" />
              <div>
                <p className="text-xs text-slate-400 mb-0">Bajarilmagan</p>
                <p className="text-base font-bold text-amber-500 leading-none">
                  {data.topshiriqlar_soni - data.bajarilgan_soni}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start">
        {/* LEFT: Details panel */}
        <div className="w-72 shrink-0">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Bayonnoma ma'lumotlari
            </p>
            <div className="my-3 h-px bg-slate-100" />

            <InfoRow
              icon={<UserOutlined />}
              label="Yaratuvchi"
              value={data.yaratuvchi_fio}
            />
            <div className="h-px bg-slate-100" />
            <InfoRow
              icon={<CalendarOutlined />}
              label="Sana"
              value={formatDate(data.sana)}
            />
            <div className="h-px bg-slate-100" />
            <InfoRow
              icon={<TeamOutlined />}
              label="Ishtirokchilar"
              value={
                data.ishtirokchilar ? (
                  <span className="whitespace-pre-wrap">
                    {data.ishtirokchilar}
                  </span>
                ) : (
                  <span className="text-slate-300 italic">Ko'rsatilmagan</span>
                )
              }
            />

            {data.izoh && (
              <>
                <div className="h-px bg-slate-100" />
                <InfoRow
                  icon={<MessageOutlined />}
                  label="Izoh"
                  value={
                    <span className="italic text-slate-600">{data.izoh}</span>
                  }
                />
              </>
            )}

            {data.fayl && (
              <>
                <div className="h-px bg-slate-100" />
                <InfoRow
                  icon={<LinkOutlined />}
                  label="Fayl"
                  value={
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={data.fayl}
                      download
                      className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 text-sm"
                    >
                      <PaperClipOutlined /> Yuklash
                    </a>
                  }
                />
              </>
            )}

            <div className="h-px bg-slate-100" />
            <InfoRow
              icon={<ClockCircleOutlined />}
              label="Yaratilgan"
              value={
                <span className="text-xs">{formatDate(data.created_at)}</span>
              }
            />
            <div className="h-px bg-slate-100" />
            <InfoRow
              icon={<ClockCircleOutlined />}
              label="Yangilangan"
              value={
                <span className="text-xs">{formatDate(data.updated_at)}</span>
              }
            />
          </div>

          {/* Holat summary */}
          {data.topshiriqlar.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Holat taqsimoti
              </p>
              {["bajarildi", "jarayonda", "yangi", "kechikkan"].map((h) => {
                const count = data.topshiriqlar.filter(
                  (t) => t.holat === h,
                ).length;
                if (!count) return null;
                const cfg = getHolatConfig(h);
                return (
                  <div
                    key={h}
                    className="flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: cfg.color }}>
                        {cfg.icon}
                      </span>
                      <span className="text-xs font-medium text-slate-600">
                        {cfg.label}
                      </span>
                    </div>
                    <span
                      className="inline-flex min-w-[22px] items-center justify-center rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: cfg.color }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Topshiriqlar list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquareOutlined className="text-indigo-500 text-base" />
              <span className="font-bold text-slate-800">Topshiriqlar</span>
              <span className="ml-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-600">
                {data.topshiriqlar.length}
              </span>
            </div>

            {/* ← NEW button */}

            <Can action="canCreate">
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <PlusOutlined /> Topshiriq qo'shish
              </button>
            </Can>
          </div>

          {data.topshiriqlar.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <CheckSquareOutlined className="text-4xl text-slate-300 mb-3" />
              <p className="text-slate-400">Topshiriqlar mavjud emas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.topshiriqlar.map((t, i) => (
                <TopshiriqCard key={t.id} t={t} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TopshiriqQoshishModal
        open={addOpen}
        bayonnomaId={data.id}
        bayonnomaRaqami={data.raqami}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          // Re-fetch to get updated topshiriqlar list
          api
            .get<BayonnomaSingle>(API_ENDPOINTS.BAYONNOMALAR.DETAIL(id!))
            .then((res) => setData(res.data));
        }}
      />

      <BayonnomaEditModal
        open={editOpen}
        bayonnoma={data}
        onClose={() => setEditOpen(false)}
        onSuccess={(updated) =>
          setData((prev) => (prev ? { ...prev, ...updated } : prev))
        }
      />
    </div>
  );
};

export default BayonnomaSinglePage;
