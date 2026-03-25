import { useState, useEffect, useRef } from "react";
import {
  Card,
  Tag,
  Skeleton,
  Avatar,
  Typography,
  Divider,
  Timeline,
  Button,
  Tooltip,
  Input,
  Upload,
  message,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  SyncOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  MessageOutlined,
  PaperClipOutlined,
  TagOutlined,
  SendOutlined,
  PlusOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "@/shared/components/const/CustomUI";
import api from "@/services/api/axios";
import type { UploadFile } from "antd/es/upload/interface";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

interface Izoh {
  id: number;
  talab: number;
  muallif: number;
  muallif_fio: string;
  matn: string;
  fayl: string | null;
  created_at: string;
}

interface TalabDetail {
  id: number;
  sorovchi: number;
  sorovchi_fio: string;
  sorovchi_boshqarma: number;
  sorovchi_boshqarma_nomi: string;
  ijrochi_boshqarma: number;
  ijrochi_boshqarma_nomi: string;
  ijrochi: number;
  ijrochi_fio: string;
  kategoriya: number;
  kategoriya_nomi: string;
  mavzu: string;
  mazmun: string;
  status: string;
  status_display: string;
  muddat: string;
  is_kechikkan: boolean;
  javob: string | null;
  fayl: string | null;
  bajarildi_sana: string | null;
  izohlar: Izoh[];
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
    glow: string;
  }
> = {
  bajarildi: {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    icon: <CheckCircleFilled />,
    glow: "shadow-green-100",
  },
  jarayonda: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: <SyncOutlined spin />,
    glow: "shadow-amber-100",
  },
  qabul_qilindi: {
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: <CheckCircleFilled />,
    glow: "shadow-blue-100",
  },
  kutilmoqda: {
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    icon: <ClockCircleOutlined />,
    glow: "shadow-gray-100",
  },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const fmtTime = (d: string) =>
  new Date(d).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const initials = (fio: string) =>
  fio
    ?.split(" ")
    ?.slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarColor = (id: number) => {
  const colors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f59e0b",
    "#10b981",
    "#6366f1",
  ];
  return colors[id % colors.length];
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-3">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-sm text-slate-700 font-medium">{value}</div>
    </div>
  </div>
);

const TalablarSinglePage = () => {
  const [data, setData] = useState<TalabDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Izoh form state
  const [izohMatn, setIzohMatn] = useState("");
  const [izohFayl, setIzohFayl] = useState<File | null>(null);
  const [izohFaylName, setIzohFaylName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { id } = useParams();

  const fetchTalab = async () => {
    try {
      setLoading(true);
      const res = await api.get(`talablar/${id}/`);
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch talab details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalab();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIzohFayl(file);
      setIzohFaylName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setIzohFayl(null);
    setIzohFaylName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleIzohSubmit = async () => {
    if (!izohMatn.trim()) {
      message.warning("Izoh matni kiritilishi shart");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("matn", izohMatn.trim());
      if (izohFayl) {
        formData.append("fayl", izohFayl);
      }

      await api.post(`talablar/${id}/izoh_qoshish/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Izoh muvaffaqiyatli qo'shildi");
      setIzohMatn("");
      setIzohFayl(null);
      setIzohFaylName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh data to show new comment
      await fetchTalab();
    } catch (error) {
      console.error("Failed to add izoh:", error);
      message.error("Izoh qo'shishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!data) return null;

  const cfg = statusConfig[data.status] ?? statusConfig.kutilmoqda;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          className="border-slate-200 py-2!  rounded-xl! text-slate-500 hover:text-blue-500 hover:border-blue-300"
          size="middle"
          onClick={() => navigate(-1)}
        >
          Orqaga
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Tag
            icon={cfg.icon}
            style={{
              color: cfg.color,
              background: cfg.bg,
              borderColor: cfg.border,
              borderRadius: 20,
              padding: "3px 12px",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {data.status_display}
          </Tag>
          {data.is_kechikkan && (
            <Tag
              icon={<ExclamationCircleFilled />}
              color="error"
              className="rounded-full ml-1"
              style={{
                borderRadius: 20,
                padding: "3px 12px",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Kechikkan
            </Tag>
          )}
        </div>
      </div>

      {/* Title card */}
      <Card
        className="border-0! shadow-md! mb-5 overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <div className="">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-100 flex items-center justify-center flex-shrink-0">
              <FileTextOutlined className="text-blue-500 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                  {data.kategoriya_nomi}
                </span>
              </div>
              <Title level={4} className="mb-1! text-slate-800! font-bold!">
                {data.mavzu}
              </Title>
              <Text className="text-slate-400 text-xs">
                Yaratildi: {fmtTime(data.created_at)}
              </Text>
            </div>
          </div>

          <Divider className="my-4! border-slate-100!" />

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Talab mazmuni
            </div>
            <Paragraph className="mb-0! text-slate-600 text-sm leading-relaxed">
              {data.mazmun}
            </Paragraph>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        {/* Left: details */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Participants */}
          <Card
            className="border-slate-200! shadow-sm!"
            title={
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <TeamOutlined className="text-indigo-400" />
                Ishtirokchilar
              </span>
            }
            bodyStyle={{ padding: "8px 20px 16px" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                {
                  label: "So'rovchi",
                  fio: data.sorovchi_fio,
                  boshqarma: data.sorovchi_boshqarma_nomi,
                  id: data.sorovchi,
                  accent: "#3b82f6",
                },
                {
                  label: "Ijrochi",
                  fio: data.ijrochi_fio,
                  boshqarma: data.ijrochi_boshqarma_nomi,
                  id: data.ijrochi,
                  accent: "#8b5cf6",
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100"
                >
                  <Avatar
                    size={42}
                    style={{
                      backgroundColor: p.accent,
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {initials(p.fio)}
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      {p.label}
                    </div>
                    <div className="text-sm font-semibold text-slate-700 leading-tight truncate">
                      {p.fio}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {p.boshqarma}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Javob (response) */}
          {data.javob && (
            <Card
              className="border-green-200! shadow-sm!"
              bodyStyle={{ padding: "16px 20px" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <SendOutlined className="text-green-600 text-xs" />
                </div>
                <span className="text-sm font-semibold text-green-700">
                  Ijrochi javobi
                </span>
                {data.bajarildi_sana && (
                  <span className="ml-auto text-xs text-slate-400">
                    {fmtTime(data.bajarildi_sana)}
                  </span>
                )}
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                <Paragraph className="mb-0! text-green-800 text-sm">
                  {data.javob}
                </Paragraph>
              </div>
              {data.fayl && (
                <div className="mt-3 flex items-center gap-2 text-xs text-blue-500 hover:text-blue-600 cursor-pointer">
                  <PaperClipOutlined />
                  <span>Biriktirma faylni ko'rish</span>
                </div>
              )}
            </Card>
          )}

          {/* Izohlar */}
          <Card
            className="border-slate-200! shadow-sm!"
            title={
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <MessageOutlined className="text-blue-400" />
                Izohlar
                <span className="ml-1 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.izohlar.length}
                </span>
              </span>
            }
            bodyStyle={{ padding: "8px 20px 20px" }}
          >
            {data.izohlar.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Hozircha izohlar yo'q
              </div>
            ) : (
              <Timeline
                className="mt-4"
                items={data.izohlar.map((izoh) => ({
                  children: (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 ml-1 mb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-600">
                          {izoh.muallif_fio}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {fmtTime(izoh.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 m-0">{izoh.matn}</p>
                      {izoh.fayl && (
                        <a
                          href={izoh.fayl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 cursor-pointer"
                        >
                          <PaperClipOutlined />
                          <span>Fayl</span>
                        </a>
                      )}
                    </div>
                  ),
                }))}
              />
            )}

            {/* ── Add Izoh Form ── */}
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 pt-4 pb-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Izoh qo'shish
                </div>
                <TextArea
                  value={izohMatn}
                  onChange={(e) => setIzohMatn(e.target.value)}
                  placeholder="Izoh matnini kiriting..."
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  className="rounded-lg! border-slate-200! text-sm resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-100 gap-3">
                {/* File attachment */}
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={submitting}
                  />
                  {izohFaylName ? (
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg px-2.5 py-1 text-xs font-medium max-w-[200px]">
                      <PaperClipOutlined className="flex-shrink-0" />
                      <span className="truncate">{izohFaylName}</span>
                      <button
                        onClick={handleRemoveFile}
                        disabled={submitting}
                        className="flex-shrink-0 text-blue-400 hover:text-red-500 transition-colors ml-0.5"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={submitting}
                      className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PaperClipOutlined />
                      <span>Fayl biriktirish</span>
                    </button>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="primary"
                  icon={submitting ? <LoadingOutlined /> : <SendOutlined />}
                  onClick={handleIzohSubmit}
                  loading={submitting}
                  disabled={!izohMatn.trim()}
                  size="small"
                  className="rounded-lg! font-medium! flex-shrink-0"
                  style={{
                    background: izohMatn.trim() ? "#3b82f6" : undefined,
                    borderColor: izohMatn.trim() ? "#3b82f6" : undefined,
                  }}
                >
                  Yuborish
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: meta */}
        <div className="flex flex-col gap-5">
          <Card
            className="border-slate-200! shadow-sm!"
            title={
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <TagOutlined className="text-violet-400" />
                Talab tafsiloti
              </span>
            }
            bodyStyle={{ padding: "0 16px 12px" }}
          >
            <InfoRow
              icon={<TagOutlined />}
              label="Kategoriya"
              value={
                <span className="bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-md text-xs font-medium">
                  {data.kategoriya_nomi}
                </span>
              }
            />
            <Divider className="my-0! border-slate-100!" />
            <InfoRow
              icon={<CalendarOutlined />}
              label="Yaratilgan sana"
              value={formatDate(data.created_at)}
            />
            <Divider className="my-0! border-slate-100!" />
            <InfoRow
              icon={<CalendarOutlined />}
              label="Muddat"
              value={
                <span
                  className={
                    data.is_kechikkan
                      ? "text-red-500 font-semibold"
                      : "text-slate-700"
                  }
                >
                  {formatDate(data.muddat)}
                  {data.is_kechikkan && (
                    <span className="ml-1.5 text-[10px] bg-red-50 border border-red-200 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                      Kechikkan
                    </span>
                  )}
                </span>
              }
            />
            {data.bajarildi_sana && (
              <>
                <Divider className="my-0! border-slate-100!" />
                <InfoRow
                  icon={<CheckCircleFilled className="text-green-500" />}
                  label="Bajarilgan sana"
                  value={
                    <span className="text-green-600 font-semibold">
                      {formatDate(data.bajarildi_sana)}
                    </span>
                  }
                />
              </>
            )}
            <Divider className="my-0! border-slate-100!" />
            <InfoRow
              icon={<UserOutlined />}
              label="So'rovchi bo'lim"
              value={data.sorovchi_boshqarma_nomi}
            />
            <Divider className="my-0! border-slate-100!" />
            <InfoRow
              icon={<TeamOutlined />}
              label="Ijrochi bo'lim"
              value={data.ijrochi_boshqarma_nomi}
            />
          </Card>

          {/* Activity */}
          <Card
            className="border-slate-200! shadow-sm!"
            title={
              <span className="text-sm font-semibold text-slate-600">
                Faoliyat
              </span>
            }
            bodyStyle={{ padding: "8px 16px 16px" }}
          >
            <div className="space-y-3 mt-2">
              {[
                {
                  label: "Talab yaratildi",
                  date: data.created_at,
                  color: "bg-blue-400",
                },
                ...(data.bajarildi_sana
                  ? [
                      {
                        label: "Bajarildi deb belgilandi",
                        date: data.bajarildi_sana,
                        color: "bg-green-400",
                      },
                    ]
                  : []),
                {
                  label: "Oxirgi yangilanish",
                  date: data.updated_at,
                  color: "bg-slate-300",
                },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ev.color}`}
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-600">
                      {ev.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {fmtTime(ev.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TalablarSinglePage;
