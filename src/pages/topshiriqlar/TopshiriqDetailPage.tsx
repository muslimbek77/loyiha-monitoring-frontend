import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Badge, Button, Spin, Divider, Empty } from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  kechikkan: {
    icon: <ExclamationCircleOutlined />,
    antColor: "red",
    bg: "from-red-500 to-rose-600",
  },
  jarayonda: {
    icon: <ClockCircleOutlined />,
    antColor: "blue",
    bg: "from-blue-500 to-indigo-600",
  },
  tasdiqlashda: {
    icon: <ClockCircleOutlined />,
    antColor: "gold",
    bg: "from-amber-500 to-orange-500",
  },
  bajarildi: {
    icon: <CheckCircleOutlined />,
    antColor: "green",
    bg: "from-emerald-500 to-green-600",
  },
};

const getBandLabel = (value) =>
  String(value).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 text-slate-400 text-base flex-shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 font-medium break-words ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-slate-400 italic">—</span>}
      </p>
    </div>
  </div>
);

// ─── Days Badge ───────────────────────────────────────────────────────────────
const DaysBadge = ({ days, done }) => {
  if (done)
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
        <CheckCircleOutlined /> Bajarilgan
      </span>
    );
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
        <ExclamationCircleOutlined /> {Math.abs(days)} kun kechikdi
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
      <ClockCircleOutlined /> {days} kun qoldi
    </span>
  );
};

// ─── Chat Comment Box ─────────────────────────────────────────────────────────
const ChatCommentBox = ({ taskData, onSuccess }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await api.post(
        `${API_ENDPOINTS.TOPSHIRIQLAR.LIST}${taskData.id}/izoh_qoshish/`,
        {
          bayonnoma: taskData.bayonnoma,
          ijrochi_boshqarma: taskData.ijrochi_boshqarma,
          ijrochi_xodim: taskData.ijrochi_xodim,
          band_raqami: taskData.band_raqami,
          mazmun: taskData.mazmun,
          muddat: taskData.muddat,
          holat: taskData.holat,
          bajarildi: taskData.bajarildi,
          natija: taskData.natija || "",
          matn: trimmed,
        },
      );
      setText("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "24px";
        textareaRef.current.focus();
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const canSend = text.trim().length > 0 && !submitting;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-slate-100">
      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0 mb-0.5">
        <UserOutlined style={{ fontSize: 13 }} />
      </div>

      {/* Textarea bubble */}
      <div
        className={`flex-1 flex items-end gap-2 bg-slate-50 border rounded-2xl px-3.5 py-2 transition-all duration-150 ${
          text
            ? "border-indigo-400 ring-2 ring-indigo-50 bg-white"
            : "border-slate-200"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Izoh yozing…   Enter — yuborish · Shift+Enter — yangi qator"
          rows={1}
          disabled={submitting}
          className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none leading-relaxed py-0.5 max-h-[120px] overflow-y-auto"
          style={{ height: "24px" }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
          canSend
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200 hover:scale-105 cursor-pointer"
            : "bg-slate-100 text-slate-300 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TopshiriqDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${API_ENDPOINTS.TOPSHIRIQLAR.LIST}${id}/`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Scroll to bottom of messages when comments update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.izohlar?.length]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Empty description="Topshiriq topilmadi" />
      </div>
    );

  const holat = data.holat_ui ?? data.holat;
  const holatLabel = data.holat_ui_display ?? data.holat_display;
  const cfg = statusConfig[holat] || statusConfig.jarayonda;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ── Hero Header ── */}
      <div className={`bg-gradient-to-r ${cfg.bg} shadow-lg rounded-t-xl`}>
        <div className="max-w-7xl mx-auto px-6 pt-5 pb-8">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-5 border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 bg-white/10"
            ghost
          >
            Orqaga
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Topshiriq
                </span>
              </div>
              <h1 className="text-2xl max-h-[300px] overflow-y-auto sm:text-3xl font-bold text-white leading-snug w-[90%]">
                {data.mazmun}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag
                  icon={cfg.icon}
                  className="border-0 text-white text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {holatLabel}
                </Tag>
                <DaysBadge days={data.qolgan_kunlar} done={data.bajarildi} />
              </div>
            </div>
            <div className="sm:text-right flex-shrink-0">
              <p className="text-white/60 text-xs uppercase tracking-wide">
                Bayonnoma raqami
              </p>
              <p className="font-mono text-white text-2xl font-bold">
                {data.bayonnoma_raqami}
              </p>
              <p className="text-white/60 text-xs mt-1">
                Band №{" "}
                <span className="text-white font-semibold">
                  {getBandLabel(data.band_raqami)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 pb-10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="md:col-span-2 space-y-5">
            {/* Main info */}
            <Card
              className="rounded-2xl border border-slate-200 shadow-sm"
              title={
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <InfoCircleOutlined className="text-indigo-500" /> Asosiy
                  ma'lumotlar
                </span>
              }
            >
              <InfoRow
                icon={<FileTextOutlined />}
                label="Bayonnoma raqami"
                value={data.bayonnoma_raqami}
                mono
              />
              <InfoRow
                icon={<BankOutlined />}
                label="Ijrochi boshqarma"
                value={data.ijrochi_boshqarma_nomi}
              />
              <InfoRow
                icon={<UserOutlined />}
                label="Ijrochi xodim"
                value={data.ijrochi_xodim_fio}
              />
              <InfoRow
                icon={<CalendarOutlined />}
                label="Muddat"
                value={data.muddat}
              />
              <InfoRow
                icon={<CalendarOutlined />}
                label="Yaratilgan sana"
                value={new Date(data.created_at).toLocaleString("uz-UZ")}
              />
              {data.bajarildi_sana && (
                <InfoRow
                  icon={<CheckCircleOutlined />}
                  label="Bajarilgan sana"
                  value={new Date(data.bajarildi_sana).toLocaleString("uz-UZ")}
                />
              )}
            </Card>

            {/* Natija & Izoh */}
            {(data.natija || data.izoh) && (
              <Card
                className="rounded-2xl mt-5! border border-slate-200 shadow-sm"
                title={
                  <span className="text-slate-700 font-semibold flex items-center gap-2">
                    <CommentOutlined className="text-indigo-500" /> Natija va
                    izoh
                  </span>
                }
              >
                {data.natija && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                      Natija
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                      {data.natija}
                    </p>
                  </div>
                )}
                {data.izoh && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                      Izoh
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                      {data.izoh}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* ── Chat-style comments ── */}
            <div className="rounded-2xl mt-5 border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-white">
                <CommentOutlined className="text-indigo-500" />
                <span className="text-slate-700 font-semibold text-sm">
                  Chatting
                </span>
                <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.izohlar?.length || 0}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto max-h-[400px] px-4 py-4 space-y-4 bg-slate-50/50">
                {data.izohlar && data.izohlar.length > 0 ? (
                  <>
                    {data.izohlar.map((izoh) => (
                      <div key={izoh.id} className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                          {izoh.muallif_fio
                            ? izoh.muallif_fio.charAt(0).toUpperCase()
                            : "?"}
                        </div>

                        {/* Message bubble */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {izoh.muallif_fio || "Noma'lum"}
                            </span>
                            {izoh.created_at && (
                              <span className="text-xs text-slate-400">
                                {new Date(izoh.created_at).toLocaleString(
                                  "uz-UZ",
                                )}
                              </span>
                            )}
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm inline-block max-w-full">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                              {izoh.matn || izoh.text || izoh.izoh || (
                                <span className="text-slate-400 italic">
                                  Izoh matni yo'q
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <CommentOutlined
                        className="text-slate-400"
                        style={{ fontSize: 22 }}
                      />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                      Hali izohlar yo'q
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Birinchi izohni qoldiring!
                    </p>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <ChatCommentBox taskData={data} onSuccess={fetchDetail} />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5!">
            <Card
              className="rounded-2xl border border-slate-200 shadow-sm"
              bodyStyle={{ padding: "20px" }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">
                Holat
              </p>
              <Tag
                icon={cfg.icon}
                color={cfg.antColor}
                className="text-sm font-semibold px-3 py-1! rounded-lg w-full flex items-center justify-center gap-2"
              >
                {holatLabel}
              </Tag>

              <Divider className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Bajarildi</span>
                  <Badge
                    status={data.bajarildi ? "success" : "default"}
                    text={
                      <span
                        className={`text-xs font-semibold ${data.bajarildi ? "text-green-600" : "text-slate-400"}`}
                      >
                        {data.bajarildi ? "Ha" : "Yo'q"}
                      </span>
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Kechikkan</span>
                  <Badge
                    status={data.is_kechikkan ? "error" : "success"}
                    text={
                      <span
                        className={`text-xs font-semibold ${data.is_kechikkan ? "text-red-600" : "text-green-600"}`}
                      >
                        {data.is_kechikkan ? "Ha" : "Yo'q"}
                      </span>
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Qolgan kunlar</span>
                  {data.bajarildi ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircleOutlined />
                      Bajarilgan
                    </span>
                  ) : (
                    <span
                      className={`text-xs font-bold ${data.qolgan_kunlar < 0 ? "text-red-600" : "text-blue-600"}`}
                    >
                      {Math.abs(data.qolgan_kunlar)} kun
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopshiriqDetailPage;
